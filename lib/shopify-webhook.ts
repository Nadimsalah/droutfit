import { createHmac, timingSafeEqual } from "crypto";

/**
 * Verifies a Shopify webhook HMAC signature.
 *
 * Shopify signs every webhook with:
 *   X-Shopify-Hmac-Sha256: Base64( HMAC-SHA256(rawBody, SHOPIFY_WEBHOOK_SECRET) )
 *
 * Rules:
 * - MUST read the raw body BEFORE any JSON parsing
 * - MUST use timingSafeEqual to prevent timing attacks
 * - Returns false (not throws) on any failure so callers always get a clean 401
 */
export function verifyShopifyWebhook(rawBody: Buffer, hmacHeader: string): boolean {
    const secret = process.env.SHOPIFY_WEBHOOK_SECRET;

    if (!secret) {
        console.error("[Shopify Webhook] SHOPIFY_WEBHOOK_SECRET env var is not set!");
        return false;
    }

    if (!hmacHeader) {
        console.warn("[Shopify Webhook] Missing X-Shopify-Hmac-Sha256 header.");
        return false;
    }

    try {
        // Compute expected digest
        const digest = createHmac("sha256", secret)
            .update(rawBody)
            .digest("base64");

        const digestBuf = Buffer.from(digest, "utf8");
        const headerBuf = Buffer.from(hmacHeader, "utf8");

        // timingSafeEqual requires same-length buffers — pad if needed
        // (lengths differ = definitely invalid, but we still do constant-time compare)
        if (digestBuf.length !== headerBuf.length) {
            // Do a dummy compare to consume constant time, then return false
            timingSafeEqual(digestBuf, digestBuf);
            return false;
        }

        return timingSafeEqual(digestBuf, headerBuf);
    } catch (err) {
        console.error("[Shopify Webhook] HMAC verification threw:", err);
        return false;
    }
}

/**
 * Reads the raw body from a NextRequest and returns both the Buffer
 * and the parsed JSON. Must be called ONCE — the body stream can only be read once.
 */
export async function parseWebhookBody<T = any>(
    req: Request
): Promise<{ rawBody: Buffer; payload: T }> {
    const rawBody = Buffer.from(await req.arrayBuffer());
    const payload = JSON.parse(rawBody.toString("utf-8")) as T;
    return { rawBody, payload };
}
