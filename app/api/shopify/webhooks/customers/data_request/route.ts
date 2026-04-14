import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyShopifyWebhook } from "@/lib/shopify-webhook";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * MANDATORY SHOPIFY GDPR WEBHOOK: customers/data_request
 *
 * Triggered when a customer requests a copy of their data stored by the app.
 * The app must respond with 200 OK immediately, then fulfill within 30 days.
 *
 * DrOutfit stores NO personally identifiable customer data — only usage logs
 * tied to the merchant's shop domain, not individual customers.
 */
export async function POST(req: NextRequest) {
    // STEP 1: Read raw body first (stream can only be read once)
    const rawBody = Buffer.from(await req.arrayBuffer());

    // STEP 2: Verify HMAC signature — reject anything not from Shopify
    const hmacHeader = req.headers.get("x-shopify-hmac-sha256") ?? "";
    if (!verifyShopifyWebhook(rawBody, hmacHeader)) {
        console.warn("[GDPR] customers/data_request: HMAC verification failed");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // STEP 3: Parse payload
    let payload: any;
    try {
        payload = JSON.parse(rawBody.toString("utf-8"));
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { shop_id, shop_domain, customer, orders_requested } = payload;

    console.log("[GDPR] customers/data_request received:", {
        shop_domain,
        customer_id: customer?.id,
        orders_requested,
    });

    // STEP 4: Log request for audit trail (non-blocking — never fail on DB error)
    supabase.from("compliance_logs").insert([{
        type: "customers/data_request",
        shop_domain: shop_domain ?? null,
        shop_id: shop_id ? String(shop_id) : null,
        customer_id: customer?.id ? String(customer.id) : null,
        payload,
        received_at: new Date().toISOString(),
    }]).then(({ error }) => {
        if (error) console.warn("[GDPR] compliance_logs insert failed:", error.message);
    });

    // STEP 5: Return 200 immediately — Shopify requires this
    return NextResponse.json({ success: true }, { status: 200 });
}
