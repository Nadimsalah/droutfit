import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client (Service Role for Admin Access)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Fallback to Anon key if Service key is missing (but warn)
if (!supabaseServiceKey) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY is missing. Rate limiting may fail due to RLS.");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const NANOBANANA_API_KEY = process.env.NEXT_PUBLIC_NANOBANANA_API_KEY;
const NANOBANANA_BASE_URL = "https://api.nanobananaapi.ai/api/v1/nanobanana";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { prompt, type, numImages, imageUrls, productId } = body;

        // 1. Get Client IP
        // 1. Get Client IP
        // distinct-id for localhost might be '::1' or '127.0.0.1'
        const ip = req.headers.get("x-forwarded-for")?.split(',')[0] || (req as any).ip || "unknown";

        // 2. Identify Merchant
        if (!productId) {
            return NextResponse.json({ error: "Missing productId" }, { status: 400 });
        }

        const { data: product, error: productError } = await supabase
            .from("products")
            .select("user_id")
            .eq("id", productId)
            .single();

        if (productError || !product) {
            console.error("Product lookup failed:", productError);
            return NextResponse.json({ error: "Invalid product" }, { status: 404 });
        }

        const merchantId = product.user_id;

        // 3. Get Rate Limit Settings
        const { data: profile } = await supabase
            .from("profiles")
            .select("ip_limit")
            .eq("id", merchantId)
            .single();

        const limit = profile?.ip_limit || 5;

        // 4. Check Rate Limit
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count, error: countError } = await supabase
            .from("usage_logs")
            .select("*", { count: "exact", head: true })
            .eq("user_id", merchantId) // Filter by merchant
            .eq("ip_address", ip)     // Filter by IP
            .gte("created_at", oneDayAgo);

        console.log(`[RateLimit Debug] IP: ${ip}, Merchant: ${merchantId}, Limit: ${limit}, Count: ${count}`);

        if (countError) {
            console.error("Rate limit check failed:", countError);
            // Proceed with caution or fail open? Let's fail open for now to avoid blocking users on DB errors
        } else if (count !== null && count >= limit) {
            console.log(`[RateLimit Block] IP ${ip} has reached limit of ${limit}`);

            // Log the blocked attempt
            await supabase.from("usage_logs").insert([{
                user_id: merchantId,
                method: "POST",
                path: "/api/virtual-try-on",
                status: 429, // Too Many Requests
                latency: null,
                ip_address: ip
            }]);

            return NextResponse.json(
                { error: "Daily try-on limit reached for this IP." },
                { status: 429 }
            );
        }

        // 5. Log Usage (Pending)
        // Reserve the slot immediately to prevent race conditions
        const startTime = Date.now();
        const { data: logEntry, error: logError } = await supabase.from("usage_logs").insert([{
            user_id: merchantId,
            method: "POST",
            path: "/api/virtual-try-on",
            status: 202, // 202 Accepted (Pending)
            latency: null,
            ip_address: ip
        }]).select().single();

        if (logError) {
            console.error("Failed to log usage:", logError);
            // We should probably block if logging fails to enforce limits strictly
            // But for now, we'll proceed
        }

        // 6. Call NanoBanana API
        if (!NANOBANANA_API_KEY) {
            // Mock response if no key
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Update log to success
            if (logEntry) {
                await supabase.from("usage_logs").update({
                    status: 200,
                    latency: `${Date.now() - startTime}ms`
                }).eq("id", logEntry.id);
            }

            return NextResponse.json({
                status: "success",
                result_url: imageUrls[1] // Return garment as result
            });
        }

        let taskId: string;

        try {
            // 6a. Submit Task
            const taskResponse = await fetch(`${NANOBANANA_BASE_URL}/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${NANOBANANA_API_KEY}`,
                },
                body: JSON.stringify({
                    prompt: prompt || "virtual try-on garment replacement",
                    type: type || "IMAGETOIAMGE",
                    numImages: numImages || 1,
                    imageUrls: imageUrls, // [face, garment]
                }),
            });

            const taskResult = await taskResponse.json();

            if (!taskResponse.ok || taskResult.code !== 200) {
                throw new Error(taskResult.msg || "Failed to submit generation task");
            }

            taskId = taskResult.data?.taskId || taskResult.taskId;

            // 6b. Poll for Result
            let attempts = 0;
            const maxAttempts = 60; // 5 minutes
            let resultUrl = null;

            while (attempts < maxAttempts) {
                attempts++;
                await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5s

                const statusResponse = await fetch(`${NANOBANANA_BASE_URL}/record-info?taskId=${taskId}`, {
                    headers: { "Authorization": `Bearer ${NANOBANANA_API_KEY}` },
                });
                const statusData = await statusResponse.json();

                const successFlag = statusData.data?.successFlag !== undefined ? statusData.data.successFlag : statusData.successFlag;
                const resData = statusData.data?.response || statusData.response;

                if (successFlag === 1) {
                    resultUrl = resData?.resultImageUrl || resData?.result_url;
                    break;
                } else if (successFlag === 2 || successFlag === 3) {
                    throw new Error(statusData.errorMessage || "Generation failed");
                }
            }

            if (!resultUrl) {
                throw new Error("Generation timed out");
            }

            // 7. Update Usage Log (Success)
            if (logEntry) {
                await supabase.from("usage_logs").update({
                    status: 200,
                    latency: `${Date.now() - startTime}ms`
                }).eq("id", logEntry.id);
            }

            // Increment product usage
            const { data: prodUsage } = await supabase
                .from('products')
                .select('usage')
                .eq('id', productId)
                .single();

            if (prodUsage) {
                await supabase
                    .from('products')
                    .update({ usage: (prodUsage.usage || 0) + 1 })
                    .eq('id', productId);
            }

            return NextResponse.json({
                status: "success",
                result_url: resultUrl,
                taskId
            });

        } catch (error) {
            // Update log to error
            if (logEntry) {
                await supabase.from("usage_logs").update({
                    status: 500,
                    latency: `${Date.now() - startTime}ms`
                }).eq("id", logEntry.id);
            }
            throw error;
        }

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: (error as Error).message || "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("productId");

        if (!productId) {
            return NextResponse.json({ error: "Missing productId" }, { status: 400 });
        }

        const ip = req.headers.get("x-forwarded-for")?.split(',')[0] || (req as any).ip || "unknown";

        // 1. Get Merchant ID
        const { data: product, error: productError } = await supabase
            .from("products")
            .select("user_id")
            .eq("id", productId)
            .single();

        if (productError || !product) {
            return NextResponse.json({ error: "Invalid product" }, { status: 404 });
        }

        const merchantId = product.user_id;

        // 2. Get Limits
        const { data: profile } = await supabase
            .from("profiles")
            .select("ip_limit")
            .eq("id", merchantId)
            .single();

        const limit = profile?.ip_limit || 5;

        // 3. Get Usage
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count } = await supabase
            .from("usage_logs")
            .select("*", { count: "exact", head: true })
            .eq("user_id", merchantId)
            .eq("ip_address", ip)
            .gte("created_at", oneDayAgo);

        console.log(`[RateLimit GET Debug] IP: ${ip}, Merchant: ${merchantId}, Limit: ${limit}, Count: ${count}`);

        const used = count || 0;
        const remaining = Math.max(0, limit - used);

        return NextResponse.json({
            limit,
            used,
            remaining,
            hasAccess: remaining > 0
        });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
