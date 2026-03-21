import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service Role Key bypasses RLS to count Pruna logs (user_id: null)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const productIds = searchParams.get("product_ids");

    if (!productIds) {
        return NextResponse.json({ counts: {} });
    }

    const ids = productIds.split(",").filter(Boolean);

    const { data } = await supabaseAdmin
        .from("usage_logs")
        .select("product_id")
        .in("product_id", ids)
        .eq("status", 200);

    const counts: Record<string, number> = {};
    data?.forEach(row => {
        if (row.product_id) {
            counts[row.product_id] = (counts[row.product_id] || 0) + 1;
        }
    });

    return NextResponse.json({ counts });
}
