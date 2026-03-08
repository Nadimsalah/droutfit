import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service role key to bypass RLS
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const { userId } = await req.json();
        if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

        const [
            { data: profile },
            { count: tryOns },
            { count: products },
            { data: logs }
        ] = await Promise.all([
            supabase.from("profiles").select("id, credits, store_website, plan, email").eq("id", userId).single(),
            supabase.from("usage_logs").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("status", 200),
            supabase.from("products").select("*", { count: "exact", head: true }).eq("user_id", userId),
            supabase.from("usage_logs").select("id, status, created_at, latency").eq("user_id", userId).order("created_at", { ascending: false }).limit(8),
        ]);

        return NextResponse.json({
            profile,
            stats: { tryOns: tryOns || 0, products: products || 0 },
            logs: logs || [],
        });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
