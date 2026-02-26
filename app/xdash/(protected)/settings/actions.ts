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

        const userIds = [...new Set(logs.map(l => l.user_id))].filter(Boolean)
        const { data: profiles } = await supabaseAdmin
            .from('profiles')
            .select('id, full_name, store_name, store_domain')
            .in('id', userIds)

        const profilesMap = new Map(profiles?.map(p => [p.id, p]) || [])

        const enrichedLogs = logs.map(log => {
            let meta = { taskId: "—", result_url: "", credits_used: 0, channel: "Nano Banana", error: "" }
            if (log.error_message && log.error_message.startsWith('{')) {
                try {
                    const parsed = JSON.parse(log.error_message)
                    meta = { ...meta, ...parsed }
                } catch (e) {
                    meta.error = log.error_message
                }
            } else {
                meta.error = log.error_message || ""
                // Fallback for demo logs that might be pending or missing taskId
                if (log.path === '/api/generate-demo') {
                    meta.taskId = "DEMO-LIVE"
                }
            }

            if (!meta.taskId || meta.taskId === "—") {
                if (log.path === '/api/generate-demo') meta.taskId = "DEMO-LIVE"
            }

            return {
                id: log.id,
                created_at: log.created_at,
                status: log.status,
                path: log.path,
                user: profilesMap.get(log.user_id) || {
                    full_name: 'Guest User',
                    store_name: log.path === '/api/generate-demo' ? 'Landing Page Demo' : 'Guest System Login',
                    store_domain: null,
                    email: null
                },
                meta
            }
        })

        return { logs: enrichedLogs }
    } catch (e: any) {
        return { error: e.message }
    }
}
