"use server"

import { createClient } from "@supabase/supabase-js"

export async function signupAction(formData: FormData) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const fullName = formData.get("fullName") as string

    if (!email || !password || !fullName) {
        return { error: "Missing required fields" }
    }

    try {
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
            const supabaseAdmin = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY,
                {
                    auth: {
                        autoRefreshToken: false,
                        persistSession: false
                    }
                }
            )

            const { data, error } = await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true, // Auto-confirm the email
                user_metadata: {
                    full_name: fullName
                }
            })

            if (error) throw error
        } else {
            // Fallback to anon key if service role key is missing
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                    auth: {
                        autoRefreshToken: false,
                        persistSession: false
                    }
                }
            )

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName
                    }
                }
            })

            if (error) throw error
        }

        return { success: true }
    } catch (error: any) {
        console.error("Signup error:", error)
        return { error: error.message }
    }
}
