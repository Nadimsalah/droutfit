"use server"

import { createClient } from "@supabase/supabase-js"
import { checkAdminSession } from "@/lib/admin-auth"
import { PricingConfig } from "@/lib/pricing"
import { revalidatePath } from "next/cache"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function updateAllPricingAction(config: PricingConfig) {
    // 1. Double check admin dashboard session
    const isAdmin = await checkAdminSession()
    if (!isAdmin) {
        return { error: "Unauthorized" }
    }

    if (!supabaseServiceKey) {
        return { error: "Security restriction: SUPABASE_SERVICE_ROLE_KEY is missing." }
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    })

    try {
        // Prepare array for multiple upserts
        const updates = Object.entries(config).map(([key, value]) => ({
            key,
            value: value.toString(),
            updated_at: new Date().toISOString()
        }))

        // Run upsert (Supabase handles multiple in one call if passed as array)
        const { error } = await supabaseAdmin
            .from('system_settings')
            .upsert(updates)

        if (error) throw error

        // Force Next.js to clear the cache so the Landing Page immediately shows the new prices
        revalidatePath('/')
        revalidatePath('/xdash/settings')

        return { success: true }
    } catch (error: any) {
        console.error("Pricing update error:", error)
        return { error: error.message }
    }
}

export async function getSystemLogsAction() {
    const isAdmin = await checkAdminSession()
    if (!isAdmin) {
        return { error: "Unauthorized" }
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    })

    try {
        const { data: logs, error } = await supabaseAdmin
            .from('usage_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(300)

        if (error) throw error

        // Fetch profiles for known user_ids
        const userIds = [...new Set(logs.map(l => l.user_id))].filter(Boolean)
        const { data: profiles } = await supabaseAdmin
            .from('profiles')
            .select('id, full_name, store_name, store_domain, email')
            .in('id', userIds)
        const profilesMap = new Map(profiles?.map(p => [p.id, p]) || [])

        // Fetch products for known product_ids (to get the product owner's store)
        const productIds = [...new Set(logs.map(l => l.product_id))].filter(Boolean)
        let productOwnerMap = new Map<string, { store_name: string | null; store_domain: string | null; email: string | null }>()
        if (productIds.length > 0) {
            const { data: products } = await supabaseAdmin
                .from('products')
                .select('id, user_id')
                .in('id', productIds)

            if (products && products.length > 0) {
                const ownerIds = [...new Set(products.map(p => p.user_id))].filter(Boolean)
                const { data: ownerProfiles } = await supabaseAdmin
                    .from('profiles')
                    .select('id, full_name, store_name, store_domain, email')
                    .in('id', ownerIds)
                const ownerMap = new Map(ownerProfiles?.map(p => [p.id, p]) || [])
                products.forEach(prod => {
                    const owner = ownerMap.get(prod.user_id)
                    if (owner) productOwnerMap.set(prod.id, owner)
                })
            }
        }

        const enrichedLogs = logs.map(log => {
            let meta: any = { taskId: "—", result_url: "", credits_used: 0, channel: "Unknown", error: "", provider: null, source: null }
            if (log.error_message && log.error_message.startsWith('{')) {
                try {
                    const parsed = JSON.parse(log.error_message)
                    meta = { ...meta, ...parsed }
                } catch (e) {
                    meta.error = log.error_message
                }
            } else {
                meta.error = log.error_message || ""
            }

            if (!meta.taskId || meta.taskId === "—") {
                if (log.path === '/api/generate-demo') meta.taskId = "LIVE-DEMO"
            }

            // ── Detect platform/source ──
            const bodySource = meta.source || meta.channel || (log.path?.includes('shopify') ? 'shopify' : (log.path?.includes('wordpress') ? 'wordpress' : null));
            let platform = bodySource || "droutfit";
            if (log.path === '/api/generate-demo') platform = "demo"
            else if (!log.user_id && log.product_id && log.path === '/api/virtual-try-on' && !bodySource) platform = "widget"

            // ── Resolve store info ──
            let userInfo = profilesMap.get(log.user_id)
            if (!userInfo && log.product_id) {
                const productOwner = productOwnerMap.get(log.product_id)
                if (productOwner) userInfo = productOwner as any
            }

            const storeLabel = userInfo?.store_name || userInfo?.store_domain || userInfo?.full_name || (meta.shop ? meta.shop.replace('.myshopify.com', '') : null)

            return {
                id: log.id,
                created_at: log.created_at,
                status: log.status,
                path: log.path,
                platform,
                user: userInfo ? {
                    full_name: userInfo.full_name || 'Unknown',
                    store_name: userInfo.store_name || null,
                    store_domain: userInfo.store_domain || null,
                    email: (userInfo as any).email || null,
                } : {
                    full_name: platform === 'demo' ? 'Landing Page Visitor' : (platform === 'shopify' ? 'Shopify Guest' : 'Widget Guest'),
                    store_name: storeLabel,
                    store_domain: meta.shop || null,
                    email: null,
                },
                meta: { ...meta, source: platform }
            }
        })

        return { logs: enrichedLogs }
    } catch (e: any) {
        return { error: e.message }
    }
}

