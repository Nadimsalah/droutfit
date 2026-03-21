import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        let merchantId = searchParams.get('merchant_id') || searchParams.get('api_key');

        if (!merchantId) {
            return NextResponse.json({ error: "Merchant ID or API Key is required" }, { status: 400 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

        // If it starts with dr_, it's an API Key, resolve to ID
        if (merchantId.startsWith('dr_')) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('api_key', merchantId)
                .single();
            if (!profile) return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
            merchantId = profile.id;
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, credits, store_website')
            .eq('id', merchantId)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        // Fetch recent logs
        const { data: logsData } = await supabase
            .from('usage_logs')
            .select('id, created_at, status, error_message')
            .eq('user_id', merchantId)
            .order('created_at', { ascending: false })
            .limit(10);

        const logs = (logsData || []).map(log => {
            let resultUrl = null;
            if (log.status === 200 && log.error_message) {
                try {
                    const parsed = JSON.parse(log.error_message);
                    resultUrl = parsed.result_url;
                } catch (e) { }
            }
            return {
                id: log.id,
                date: log.created_at,
                status: log.status,
                image: resultUrl
            };
        });

        return NextResponse.json({
            success: true,
            user: {
                id: merchantId,
                email: profile.store_website || "Connected", // Placeholder since email is in auth.users
            },
            credits: profile.credits || 0,
            store_website: profile.store_website,
            logs
        });

    } catch (err: any) {
        console.error("WP Profile API Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
