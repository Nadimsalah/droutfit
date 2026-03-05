import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
    const { topic, shop, payload, webhookId } = await authenticate.webhook(request);

    // If the authenticate.webhook function returns, the HMAC is valid.
    // It throws a 401 automatically if verification fails.
    console.log(`Webhook received: ${topic} from ${shop} (ID: ${webhookId})`);

    // The shopifyApp object's internal dispatcher handles webhooks registered in shopify.server.js
    // CUSTOMERS_DATA_REQUEST, CUSTOMERS_REDACT, SHOP_REDACT are handled there.

    return new Response(null, { status: 200 });
};
