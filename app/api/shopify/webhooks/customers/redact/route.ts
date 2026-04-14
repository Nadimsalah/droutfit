import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyShopifyWebhook } from "@/lib/shopify-webhook";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * MANDATORY SHOPIFY GDPR WEBHOOK: customers/redact
 *
 * Triggered when a customer requests deletion of their data from the app.
 * Must respond with 200 OK immediately.
 *
 * DrOutfit does not store PII linked to individual end-customers.
 * Usage logs are tied to the merchant shop, not individual shoppers.
 * We log the request for compliance audit purposes.
 */
export async function POST(req: NextRequest) {
    // STEP 1: Read raw body first (stream can only be read once)
    const rawBody = Buffer.from(await req.arrayBuffer());

    // STEP 2: Verify HMAC signature
    const hmacHeader = req.headers.get("x-shopify-hmac-sha256") ?? "";
    if (!verifyShopifyWebhook(rawBody, hmacHeader)) {
        console.warn("[GDPR] customers/redact: HMAC verification failed");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // STEP 3: Parse payload
    let payload: any;
    try {
        payload = JSON.parse(rawBody.toString("utf-8"));
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { shop_id, shop_domain, customer, orders_to_redact } = payload;

    console.log("[GDPR] customers/redact received:", {
        shop_domain,
        customer_id: customer?.id,
        orders_to_redact,
    });

    // STEP 4: Log for audit trail (non-blocking)
    supabase.from("compliance_logs").insert([{
        type: "customers/redact",
        shop_domain: shop_domain ?? null,
        shop_id: shop_id ? String(shop_id) : null,
        customer_id: customer?.id ? String(customer.id) : null,
        payload,
        received_at: new Date().toISOString(),
    }]).then(({ error }) => {
        if (error) console.warn("[GDPR] compliance_logs insert failed:", error.message);
    });

    // STEP 5: Return 200 immediately
    return NextResponse.json({ success: true }, { status: 200 });
}
