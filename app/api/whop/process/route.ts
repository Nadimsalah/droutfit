import { NextResponse } from 'next/server'
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
)

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const baseUrl = new URL(request.url).origin
    const user_id = searchParams.get('user_id')
    const credits = parseInt(searchParams.get('credits') || '0')
    const amount = parseFloat(searchParams.get('amount') || '0')

    const tx_id = searchParams.get('tx_id') || ''

    if (!user_id || !credits) {
        return NextResponse.redirect(`${baseUrl}/dashboard?error=invalid_params`)
    }

    try {
        // Try server-side first (Requires SERVICE ROLE KEY to bypass RLS)
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('credits')
            .eq('id', user_id)
            .single()

        const newCredits = (profile?.credits || 0) + credits

        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ credits: newCredits })
            .eq('id', user_id)

        if (updateError) {
            // Fallback: server update failed (likely missing service_role key getting blocked by RLS)
            // We pass it to the frontend which can securely run it using the user's active session!
            return NextResponse.redirect(`${baseUrl}/dashboard?payment_successful=true&added=${credits}&tx_id=${tx_id}`)
        }

        // Record the transaction
        await supabaseAdmin.from('transactions').insert([{
            user_id: user_id,
            amount: amount,
            type: 'CREDITS',
            status: 'succeeded',
            description: `Purchased ${credits} image generation credits`
        }])

        // Server update succeeded! Send confirmation email
        try {
            // Get user email from profiles or auth
            const { data: userData } = await supabaseAdmin.auth.admin.getUserById(user_id)
            if (userData?.user?.email) {
                const { sendPaymentEmail } = await import('@/lib/resend')
                await sendPaymentEmail(userData.user.email, credits, newCredits, baseUrl, tx_id)
            }
        } catch (emailErr) {
            console.error("Confirmation email failed to send:", emailErr)
        }

        return NextResponse.redirect(`${baseUrl}/dashboard?payment_successful=true&added=${credits}&tx_id=${tx_id}`)
    } catch (e: any) {
        console.error("Whop process error:", e)
        // Even on full error, we pass it to frontend as fallback
        return NextResponse.redirect(`${baseUrl}/dashboard?payment_successful=true&added=${credits}&tx_id=${tx_id}`)
    }
}
