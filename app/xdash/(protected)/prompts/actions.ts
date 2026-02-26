"use server"

import { createClient } from "@supabase/supabase-js"
import { requireAdmin } from "@/lib/admin-auth"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function updatePromptAction(key: string, value: string) {
    try {
        await requireAdmin()

        if (!supabaseServiceKey) {
            return { error: "Security restriction: SUPABASE_SERVICE_ROLE_KEY is missing." }
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        })

        const { error } = await supabaseAdmin.from('system_settings').upsert({
            key,
            value,
            updated_at: new Date().toISOString()
        })

        if (error) {
            return { error: error.message || "Failed to update prompt" }
        }

        return { success: true }
    } catch (e: any) {
        return { error: "Not authorized or server error." }
    }
}
