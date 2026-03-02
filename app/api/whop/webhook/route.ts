import { NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";
// You can use a library to verify the crypto signature from Whop if specified.

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
);

export async function POST(req: Request) {
    try {
        const payload = await req.json();

        // 1. Verify this came from Whop (Webhook Secret / Signature Check)
        // If Whop sends a header like 'x-whop-signature', you should verify it here using crypto
        // (For production, implement signature verification to ensure requests are authentic)

        console.log("Whop Webhook Received:", JSON.stringify(payload, null, 2));

        // Let's assume the payload contains payment_succeeded event
        if (payload.action === 'payment.succeeded' || payload.action === 'membership.went_valid') {

            // Extract the metadata we passed in during checkout-credits
            const metadata = payload.data?.metadata;
            if (!metadata || !metadata.user_id || !metadata.credits) {
                console.error("Missing metadata in Whop payload");
                return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
            }

            const { user_id, credits } = metadata;
            const amount = payload.data?.price || 0;
            const tx_id = payload.data?.id || `whop_${Date.now()}`;

            // Check if transaction already securely processed to prevent duplicate credits
            const { data: existingTx } = await supabaseAdmin
                .from('transactions')
                .select('id')
                .eq('description', `Whop checkout: ${tx_id}`)
                .single();

            if (existingTx) {
                return NextResponse.json({ message: "Transaction already processed" }, { status: 200 });
            }

            // Secure Granting of Credits
            const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('credits')
                .eq('id', user_id)
                .single();

            const newCredits = (profile?.credits || 0) + parseInt(credits);

            await supabaseAdmin.from('profiles').update({ credits: newCredits }).eq('id', user_id);

            // Record Transaction Formally
            await supabaseAdmin.from('transactions').insert([{
                user_id: user_id,
                amount: amount,
                type: 'CREDITS',
                status: 'succeeded',
                description: `Whop checkout: ${tx_id}`
            }]);

            return NextResponse.json({ success: true, message: `Added ${credits} credits to ${user_id}` });
        }

        return NextResponse.json({ message: "Event ignored" });

    } catch (error: any) {
        console.error("Whop webhook error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
