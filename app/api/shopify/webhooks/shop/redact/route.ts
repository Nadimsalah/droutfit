import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyShopifyWebhook } from "@/lib/shopify-webhook";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * MANDATORY SHOPIFY GDPR WEBHOOK: shop/redact
 *
 * Triggered 48 hours after a merchant uninstalls the app.
 * All data associated with the shop MUST be deleted.
 *
 * Actions taken:
 *  1. Unlink the shop from any merchant profile in our DB
 *  2. Delete usage logs associated with this shop domain
 *  3. Log the action for audit compliance
 */
export async function POST(req: NextRequest) {
    // STEP 1: Read raw body first (stream can only be read once)
    const rawBody = Buffer.from(await req.arrayBuffer());

    // STEP 2: Verify HMAC signature
    const hmacHeader = req.headers.get("x-shopify-hmac-sha256") ?? "";
    if (!verifyShopifyWebhook(rawBody, hmacHeader)) {
        console.warn("[GDPR] shop/redact: HMAC verification failed");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // STEP 3: Parse payload
    let payload: any;
    try {
        payload = JSON.parse(rawBody.toString("utf-8"));
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { shop_id, shop_domain } = payload;

    console.log("[GDPR] shop/redact received:", { shop_domain, shop_id });

    // STEP 4: Delete all shop data (non-blocking — fire and forget)
    (async () => {
        try {
            // 4a. Unlink the store_domain from merchant profiles
            const { error: profileErr } = await supabase
                .from("profiles")
                .update({
                    store_domain: null,
                    store_website: null,
                    store_name: null,
                })
                .or(
                    `store_domain.eq.${shop_domain},` +
                    `store_domain.ilike.%${shop_domain}%,` +
                    `store_website.ilike.%${shop_domain}%`
                );

            if (profileErr) {
                console.error("[GDPR] shop/redact: profile unlink error:", profileErr.message);
            } else {
                console.log(`[GDPR] shop/redact: profile unlinked for ${shop_domain}`);
            }

            // 4b. Delete usage logs associated with this shop
            const { error: logsErr } = await supabase
                .from("usage_logs")
                .delete()
                .ilike("error_message", `%"shop":"${shop_domain}"%`);

            if (logsErr) {
                console.warn("[GDPR] shop/redact: usage_logs deletion error:", logsErr.message);
            } else {
                console.log(`[GDPR] shop/redact: usage_logs cleaned for ${shop_domain}`);
            }

            // 4c. Log the compliance action for audit
            await supabase.from("compliance_logs").insert([{
                type: "shop/redact",
                shop_domain: shop_domain ?? null,
                shop_id: shop_id ? String(shop_id) : null,
                customer_id: null,
                payload,
                received_at: new Date().toISOString(),
            }]);
        } catch (err) {
            console.error("[GDPR] shop/redact: unexpected error:", err);
        }
    })();

    // STEP 5: Return 200 immediately — Shopify requires this
    return NextResponse.json({ success: true }, { status: 200 });
}
