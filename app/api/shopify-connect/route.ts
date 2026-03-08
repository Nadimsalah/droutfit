import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, shopDomain, accessToken } = body;

        if (!userId || !shopDomain) {
            return NextResponse.json({ error: "Missing userId or shopDomain" }, { status: 400 });
        }

        // Try service role key first (bypasses RLS completely)
        // Fall back to user's access token if service role key isn't a valid JWT
        let supabase;
        if (serviceRoleKey && serviceRoleKey.startsWith("eyJ")) {
            supabase = createClient(supabaseUrl, serviceRoleKey);
        } else if (accessToken) {
            // Use user's own access token — RLS allows users to update their own profile
            supabase = createClient(supabaseUrl, supabaseAnonKey, {
                global: { headers: { Authorization: `Bearer ${accessToken}` } }
            });
        } else {
            supabase = createClient(supabaseUrl, supabaseAnonKey);
        }

        // Remove this shop from any other account (only works with service role or if RLS allows)
        try {
            await supabase.from("profiles").update({ store_website: null }).eq("store_website", shopDomain).neq("id", userId);
        } catch (e) {
            // Ignore if RLS blocks this — at least we can still link to the current user
        }

        // Link store to this user's account
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
        console.error("Shopify connect error:", error);
        return NextResponse.json({ error: (error as Error).message || "Internal error" }, { status: 500 });
    }
}
