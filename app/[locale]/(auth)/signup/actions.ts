"use server"

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://droutfit.com"

export async function requestOTPAction(email: string) {
    if (!email) return { error: "Email is required" }

    const code = Math.floor(1000 + Math.random() * 9000).toString() // Generate 4 digit code
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

        const supabaseClient = createClient(supabaseUrl, supabaseKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        })

        // Delete old codes for this email
        await supabaseClient.from('verification_codes').delete().eq('email', email)

        // Insert new code
        const { error } = await supabaseClient.from('verification_codes').insert([
            { email, code, expires_at: expiresAt }
        ])

        if (error) {
            console.error("DB Error during OTP insert:", error)
            return { error: `Database Error: ${error.message}` }
        }

        // Send email and check for success
        const { sendOTP } = await import('@/lib/resend')
        const emailResult = await sendOTP(email, code)

        if (!emailResult.success) {
            console.error("Resend Error during OTP send:", emailResult.error)
            const errorMsg = (emailResult.error as any)?.message || "Failed to deliver verification email."
            return { error: `Email Error: ${errorMsg}` }
        }

        return { success: true }
    } catch (error: any) {
        console.error("OTP request error:", error)
        return { error: error.message }
    }
}

export async function signupAction(formData: FormData, otpCode: string) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const fullName = formData.get("fullName") as string

    if (!email || !password || !fullName || !otpCode) {
        return { error: "Missing required fields" }
    }

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

        // 1. Verify OTP (Can use Anon Key if RLS allows)
        const supabaseClient = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        })

        const { data: verification, error: verifyError } = await supabaseClient
            .from('verification_codes')
            .select('*')
            .eq('email', email)
            .eq('code', otpCode)
            .single()

        if (verifyError || !verification) {
            return { error: "Invalid verification code" }
        }

        const isExpired = new Date(verification.expires_at) < new Date()
        if (isExpired) {
            return { error: "Verification code has expired" }
        }

        // 2. Create User
        if (supabaseServiceKey) {
            // Use Admin API for auto-confirm
            const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
                auth: { autoRefreshToken: false, persistSession: false }
            })

            const { error: authError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: { full_name: fullName }
            })

            if (authError) throw authError
        } else {
            // Fallback to standard signup (User will need to click email link if confirmation is on)
            const { error: authError } = await supabaseClient.auth.signUp({
                email,
                password,
                options: { data: { full_name: fullName } }
            })

            if (authError) throw authError
        }

        // 3. Clean up OTP
        await supabaseClient.from('verification_codes').delete().eq('email', email)

        // 4. Send Welcome Email
        try {
            const { sendEmail } = await import('@/lib/resend')
            await sendEmail({
                to: email,
                subject: 'Welcome to DrOutfit! 👕',
                html: `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 40px auto; padding: 48px 32px; background-color: #ffffff; border: 1px solid #eef2f6; border-radius: 24px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.03);">
                        <div style="margin-bottom: 32px;">
                            <img src="https://dvbuiiaymvynzwecefup.supabase.co/storage/v1/object/public/listing-images/logo-black.png" alt="DrOutfit" style="height: 38px; width: auto;" />
                        </div>
                        <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.5px;">Welcome to DrOutfit, ${fullName}!</h1>
                        <p style="color: #64748b; font-size: 15px; line-height: 1.5; margin-bottom: 32px;">
                            We're thrilled to have you on board. DrOutfit is your powerful new tool for virtual try-ons and product visualization.
                        </p>
                        <div style="margin: 30px 0;">
                            <a href="${supabaseUrl}/dashboard" 
                               style="background-color: #2563eb; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;">
                               Go to Dashboard
                            </a>
                        </div>
                        <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin-top: 40px;">
                            Cheers,<br>The DrOutfit Team
                        </p>
                    </div>
                `
            })
        } catch (emailErr) {
            console.error("Welcome email failed to send (non-blocking):", emailErr)
        }

        return { success: true }
    } catch (error: any) {
        console.error("Signup error:", error)
        return { error: error.message }
    }
}
