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

    if (!user_id || !credits) {
        return NextResponse.redirect(`${baseUrl}/dashboard?error=invalid_params`)
    }

    try {
        // Fetch current credits
        const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('credits')
            .eq('id', user_id)
            .single()

        if (error) throw error

        const newCredits = (profile?.credits || 0) + credits

        // Update credits
        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ credits: newCredits })
            .eq('id', user_id)

        if (updateError) throw updateError

        // Redirect to dashboard
        return NextResponse.redirect(`${baseUrl}/dashboard?payment_successful=true&added=${credits}`)
    } catch (e: any) {
        console.error("Whop process error:", e)
        return NextResponse.redirect(`${baseUrl}/dashboard?error=credit_update_failed`)
    }
}
