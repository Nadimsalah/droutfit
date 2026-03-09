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

    // 1. Find user by email using listUsers (as getUserByEmail is restricted or unavailable)
    let targetUser = null
    try {
        console.log("Looking up user by email in Auth list:", email)
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({
            perPage: 1000
        })

        if (listError) throw listError

        targetUser = users.find(u => u.email?.toLowerCase() === email)
        console.log("User lookup result:", targetUser ? "Found ID: " + targetUser.id : "Not Found")
    } catch (e: any) {
        console.error("Critical Auth list error:", e.message)
    }

    // For security, mimic success even if user doesn't exist
    if (!targetUser) {
        console.log("ABORT: No user found for reset request:", email)
        return { success: true }
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    console.log(`READY: Generated code ${code} for ${email}. Expiry: ${expiresAt}`)

    try {
        // Delete old codes
        console.log("Cleaning up old codes for:", email)
        await supabase.from('verification_codes').delete().eq('email', email)

        // Insert new code
        console.log("Inserting new code into verification_codes...")
        const { error: insertError } = await supabase.from('verification_codes').insert([
            { email, code, expires_at: expiresAt }
        ])

        if (insertError) {
            console.error("DB INSERT ERROR:", insertError)
            throw insertError
        }
        console.log("DB SUCCESS: Verification code stored")

        // Send Email and check for success
        console.log("RESEND: Calling sendResetOTP...")
        const emailResult = await sendResetOTP(email, code)

        if (!emailResult.success) {
            console.error("RESEND FAILED:", emailResult.error)
            const errorMsg = (emailResult.error as any)?.message || "Failed to deliver reset email."
            return { error: `Verification System Error: ${errorMsg}` }
        }

        console.log("FLOW COMPLETE: Reset email sent to:", email)
        return { success: true }
    } catch (error: any) {
        console.error("SYSTEM ERROR in requestResetAction:", error.message)
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
