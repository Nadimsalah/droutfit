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
        console.warn("SHOPIFY_WEBHOOK_SECRET is not set. Skipping HMAC verification.");
        return true;
    }
    const digest = createHmac("sha256", secret).update(rawBody).digest("base64");
    try {
        return timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));
    } catch {
        return false;
    }
}

/**
 * MANDATORY SHOPIFY GDPR WEBHOOK: shop/redact
 *
 * Shopify sends this 48 hours after a shop owner uninstalls the app.
 * All data related to the shop must be deleted.
 * We remove the store_website link from the merchant profile and
 * any associated usage logs.
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

    const { shop_id, shop_domain } = payload;

    console.log("[GDPR] shop/redact received:", { shop_domain, shop_id });

    try {
        // 1. Unlink the store from any merchant profile
        const { error: unlinkError } = await supabase
            .from("profiles")
            .update({ store_website: null })
            .or(`store_website.eq.${shop_domain},store_website.ilike.%${shop_domain}%`);

        if (unlinkError) {
            console.error("[GDPR] shop/redact: failed to unlink profile:", unlinkError.message);
        } else {
            console.log(`[GDPR] shop/redact: unlinked profile for ${shop_domain}`);
        }

        // 2. Log the compliance action for audit purposes
        await supabase.from("compliance_logs").insert([{
            type: "shop/redact",
            shop_domain,
            shop_id: String(shop_id),
            customer_id: null,
            payload: payload,
            received_at: new Date().toISOString(),
        }]);
    } catch (e) {
        console.warn("[GDPR] shop/redact error (non-critical):", e);
    }

    return NextResponse.json({ success: true }, { status: 200 });
}
