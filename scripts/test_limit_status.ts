
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Manually parse .env.local
let env: any = {};
try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, "utf-8");
        envConfig.split("\n").forEach((line) => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                env[match[1].trim()] = match[2].trim();
            }
        });
    }
} catch (e) {
    console.error("Failed to load .env.local", e);
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase Service Key or URL");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runTest() {
    console.log("Starting Rate Limit Test...");

    // 1. Get a product
    const { data: product } = await supabase.from("products").select("id, user_id").limit(1).single();
    if (!product) {
        console.error("No products found to test with.");
        return;
    }
    console.log(`Testing with Product ID: ${product.id} (Merchant: ${product.user_id})`);

    // 2. Set strict limit for this merchant for testing
    // console.log("Setting limit to 3...");
    // await supabase.from("profiles").update({ ip_limit: 3 }).eq("id", product.user_id);

    // 3. Make requests to the local API
    const apiUrl = "http://localhost:3000/api/virtual-try-on";
    // We need to use GET to check status cheaply first
    const checkUrl = `${apiUrl}?productId=${product.id}`;

    console.log("Checking current status...");
    const statusRes = await fetch(checkUrl);
    const statusData = await statusRes.json();
    console.log("Current Status:", JSON.stringify(statusData, null, 2));

    // If we want to test blocking, we need to POST
    // But we don't want to actually generate images (waste money/time).
    // The API checks limit BEFORE generation.
    // So if we send a bad request (missing body) it might fail validation first.
    // We need to pass validation up to step 4.

    // Actually, we can just look at the logs in the terminal if we run this.
    // But I can't see terminal logs easily.
    // I relies on the status response.
}

runTest();
