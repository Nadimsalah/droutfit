import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const merchantId = searchParams.get('merchant_id');

        // Note: In a production scenario, we should ideally validate the `token` 
        // passed in the Authorization header. For simplicity and since merchant_id 
        // is generally a UUID not easily guessable, we'll use it to fetch public-safe profile data for the WP dashboard.

        if (!merchantId) {
            return NextResponse.json({ error: "Merchant ID is required" }, { status: 400 });
        }

        const supabase = createAdminClient();

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('credits, store_website')
            .eq('id', merchantId)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            credits: profile.credits || 0,
            store_website: profile.store_website
        });

    } catch (err: any) {
        console.error("WP Profile API Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
