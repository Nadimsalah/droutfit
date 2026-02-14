"use server"

import { createClient } from "@supabase/supabase-js"

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

export async function signupAction(formData: FormData) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const fullName = formData.get("fullName") as string

    if (!email || !password || !fullName) {
        return { error: "Missing required fields" }
    }

    try {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm the email
            user_metadata: {
                full_name: fullName
            }
        })

        if (error) throw error

        return { success: true }
    } catch (error: any) {
        console.error("Signup error:", error)
        return { error: error.message }
    }
}
