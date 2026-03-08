"use server"

import { createClient } from "@supabase/supabase-js"
import { sendResetOTP } from "@/lib/resend"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function requestResetAction(emailInput: string) {
    if (!emailInput) return { error: "Email is required" }
    const email = emailInput.trim().toLowerCase()
    console.log("Password reset requested for:", email)

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!serviceKey) {
        return { error: "Security restriction: Supabase keys are missing." }
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    })

    // 1. Find user by email
    let targetUser = null
    try {
        const { data: { users }, error } = await supabase.auth.admin.listUsers()
        if (error) throw error
        targetUser = users.find(u => u.email?.toLowerCase() === email)
    } catch (e) {
        console.error("Auth search error:", e)
        return { error: "Failed to search user database" }
    }

    // For security, mimic success even if user doesn't exist
    if (!targetUser) {
        console.log("No user found with email:", email)
        return { success: true }
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    console.log(`Generated code ${code} for ${email}`)

    try {
        // Delete old codes
        await supabase.from('verification_codes').delete().eq('email', email)

        // Insert new code
        const { error: insertError } = await supabase.from('verification_codes').insert([
            { email, code, expires_at: expiresAt }
        ])

        if (insertError) throw insertError
        console.log("Verification code stored in database")

        // Send Email and check for success
        const emailResult = await sendResetOTP(email, code)

        if (!emailResult.success) {
            console.error("EMAIL SENDING FAILED:", emailResult.error)
            const errorMsg = (emailResult.error as any)?.message || "Failed to deliver reset email."
            return { error: `Verification System Error: ${errorMsg}` }
        }

        console.log("Reset email sent successfully to:", email)
        return { success: true }
    } catch (error: any) {
        console.error("Reset request catch block error:", error)
        return { error: error.message }
    }
}

export async function verifyResetOTPAction(email: string, otpCode: string) {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    })

    const { data: verification, error: verifyError } = await supabase
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
        return { error: "Code has expired" }
    }

    return { success: true }
}

export async function resetPasswordAction(formData: FormData, otpCode: string) {
    const email = formData.get("email") as string
    const newPassword = formData.get("password") as string

    if (!email || !newPassword || !otpCode) {
        return { error: "Missing required fields" }
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    })

    // 1. Final OTP Verification
    const { data: verification } = await supabase
        .from('verification_codes')
        .select('*')
        .eq('email', email)
        .eq('code', otpCode)
        .single()

    if (!verification) return { error: "Session expired, please try again" }

    try {
        // 2. Find User ID from Auth system
        const { data: { users } } = await supabase.auth.admin.listUsers()
        const targetUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

        if (!targetUser) throw new Error("User not found")

        // 3. Update Password using Admin API
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            targetUser.id,
            { password: newPassword }
        )

        if (updateError) throw updateError

        // 4. Cleanup
        await supabase.from('verification_codes').delete().eq('email', email)

        return { success: true }
    } catch (error: any) {
        console.error("Reset password error:", error)
        return { error: error.message }
    }
}
