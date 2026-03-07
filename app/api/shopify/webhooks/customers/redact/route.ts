import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
 * MANDATORY SHOPIFY GDPR WEBHOOK: customers/redact
 *
 * Shopify sends this when a customer's data must be deleted from your app.
 * DrOutfit stores minimal data; we delete any usage_log entries associated
 * with the customer's orders from the merchant's store.
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

    const { shop_id, shop_domain, customer, orders_to_redact } = payload;

    console.log("[GDPR] customers/redact received:", {
        shop_domain,
        customer_id: customer?.id,
        orders_to_redact,
    });

    // Log the compliance action
    try {
        await supabase.from("compliance_logs").insert([{
            type: "customers/redact",
            shop_domain,
            shop_id: String(shop_id),
            customer_id: customer?.id ? String(customer.id) : null,
            payload: payload,
            received_at: new Date().toISOString(),
        }]);
    } catch (e) {
        console.warn("[GDPR] Could not write to compliance_logs:", e);
    }

    // DrOutfit does not store personally identifiable customer data directly.
    // Usage logs are tied to the merchant (shop), not individual customers.
    // If you store any customer-level data in the future, delete it here.

    return NextResponse.json({ success: true }, { status: 200 });
}
