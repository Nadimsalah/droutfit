"use server"

import { createClient } from "@supabase/supabase-js"
import { checkAdminSession } from "@/lib/admin-auth"
import { revalidatePath } from "next/cache"

// Create a Supabase client with the Service Role Key to bypass RLS
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

export async function deleteUserAction(userId: string) {
    if (!await checkAdminSession()) {
        return { error: "Unauthorized" }
    }

    try {
        // 1. Delete from public.profiles
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', userId)

        if (profileError) throw profileError

        // 2. Delete from auth.users (Requires Service Role)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

        if (authError) throw authError

        revalidatePath('/xdash/users')
        return { success: true }
    } catch (error: any) {
        console.error("Delete user error:", error)
        return { error: error.message }
    }
}

export async function updateUserAction(userId: string, data: { credits?: number, is_subscribed?: boolean }) {
    if (!await checkAdminSession()) {
        return { error: "Unauthorized" }
    }

    try {
        const { error } = await supabaseAdmin
            .from('profiles')
            .update(data)
            .eq('id', userId)

        if (error) throw error

        revalidatePath('/xdash/users')
        return { success: true }
    } catch (error: any) {
        console.error("Update user error:", error)
        return { error: error.message }
    }
}
