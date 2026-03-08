import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service role key to bypass RLS
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const { userId, shopDomain } = await req.json();

        if (!userId || !shopDomain) {
            return NextResponse.json({ error: "Missing userId or shopDomain" }, { status: 400 });
        }

        // 1. Remove this shop from any other profile (ownership takeover)
        await supabase
            .from("profiles")
            .update({ store_website: null })
            .eq("store_website", shopDomain);

        // 2. Link to the requesting user
        const { error } = await supabase
            .from("profiles")
            .update({ store_website: shopDomain })
            .eq("id", userId);

        if (error) {
            console.error("Connect error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, store_website: shopDomain });
    } catch (error) {
        console.error("Shopify connect API Error:", error);
        return NextResponse.json({ error: (error as Error).message || "Internal error" }, { status: 500 });
    }
}
