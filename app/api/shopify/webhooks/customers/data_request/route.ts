import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Verifies that the webhook request came from Shopify by comparing
 * the HMAC signature in the header with one computed from the raw body.
 */
function verifyShopifyWebhook(rawBody: Buffer, hmacHeader: string): boolean {
    const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
    if (!secret) {
        console.warn("SHOPIFY_WEBHOOK_SECRET is not set. Cannot verify HMAC.");
        return false;
    }
    const digest = createHmac("sha256", secret).update(rawBody).digest("base64");
    try {
        return timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));
    } catch {
        return false;
    }
}

/**
 * MANDATORY SHOPIFY GDPR WEBHOOK: customers/data_request
 *
 * Shopify sends this when a customer requests a copy of their data
 * stored by the app. The app must respond within 30 days.
 *
 * DrOutfit stores minimal customer data — only try-on usage logs
 * linked to the merchant account (shop), not individual end-customers.
 * This handler logs the request for audit purposes.
 */
export async function POST(req: NextRequest) {
    const rawBody = Buffer.from(await req.arrayBuffer());
    const hmacHeader = req.headers.get("x-shopify-hmac-sha256") || "";

    if (!verifyShopifyWebhook(rawBody, hmacHeader)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload: any = {};
    try {
        payload = JSON.parse(rawBody.toString("utf-8"));
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { shop_id, shop_domain, customer, orders_requested } = payload;

    console.log("[GDPR] customers/data_request received:", {
        shop_domain,
        customer_id: customer?.id,
        orders_requested,
    });

    // Log the compliance request for audit trail
    try {
        await supabase.from("compliance_logs").insert([{
            type: "customers/data_request",
            shop_domain,
            shop_id: String(shop_id),
            customer_id: customer?.id ? String(customer.id) : null,
            payload: payload,
            received_at: new Date().toISOString(),
        }]);
    } catch (e) {
        // Table may not exist yet — log to console but don't fail
        console.warn("[GDPR] Could not write to compliance_logs (table may not exist):", e);
    }

    // Shopify requires a 200 OK response. The actual data export
    // should be fulfilled manually or via a follow-up process.
    return NextResponse.json({ success: true }, { status: 200 });
}
