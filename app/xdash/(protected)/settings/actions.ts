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

