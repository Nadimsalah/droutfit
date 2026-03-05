import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Supabase Client (Service Role for Admin Access)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Fallback to Anon key if Service key is missing (but warn)
if (!supabaseServiceKey) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY is missing. Rate limiting may fail due to RLS.");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const NANOBANANA_BASE_URL = "https://api.nanobananaapi.ai/api/v1/nanobanana";

async function uploadBase64Image(base64Image: string): Promise<string> {
    if (!supabaseServiceKey) throw new Error("Missing Supabase Service Key for upload");

    // Remove data:image/jpeg;base64, prefix if present
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Generate random filename
    const fileName = `vto_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

    const { data, error } = await supabase.storage
        .from("tryimages")
        .upload(fileName, buffer, {
            contentType: "image/jpeg",
            upsert: true
        });

    if (error) {
        throw new Error("Failed to upload image to storage: " + error.message);
    }

    const { data: urlData } = supabase.storage
        .from("tryimages")
        .getPublicUrl(fileName);

    return urlData.publicUrl;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { prompt, type, numImages, imageUrls, productId, shop } = body;

        const ip = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(',')[0] || (req as any).ip || "unknown";

        let merchantId: string;

        // 1. Try finding by productId
        const { data: product, error: productError } = await supabase
            .from("products")
            .select("user_id")
            .eq("id", productId)
            .single();

        if (!productError && product) {
            merchantId = product.user_id;
        } else if (shop) {
            // 2. Try finding by shop domain
            const { data: profileByShop } = await supabase
                .from("profiles")
                .select("id")
                .eq("store_website", shop)
                .single();

            if (profileByShop) {
                merchantId = profileByShop.id;
            } else {
                // 3. Fallback
                const { data: firstMerchant } = await supabase.from("profiles").select("id").limit(1).single();
                if (!firstMerchant) return NextResponse.json({ error: "System not ready" }, { status: 500 });
                merchantId = firstMerchant.id;
            }
        } else {
            // Fallback
            const { data: firstMerchant } = await supabase.from("profiles").select("id").limit(1).single();
            if (!firstMerchant) return NextResponse.json({ error: "System not ready" }, { status: 500 });
            merchantId = firstMerchant.id;
        }

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("credits, ip_limit")
            .eq("id", merchantId)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: "Merchant profile not found" }, { status: 404 });
        }

        try {
            if ((profile.credits || 0) <= 0) {
                return NextResponse.json(
                    { error: "This merchant has an insufficient credit balance to process try-ons. Please top up in Billing." },
                    { status: 403 }
                );
            }
        } catch (e) {
            console.warn("Credit check failed, bypassing:", e);
        }

        const limit = (profile as any).ip_limit || 5;
        let isAllowedByRateLimit = true;
        try {
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            const { count, error: countError } = await (supabase as any)
                .from("usage_logs")
                .select("*", { count: "exact", head: true })
                .eq("user_id", merchantId)
                .eq("ip_address", ip)
                .gte("created_at", oneDayAgo);

            if (!countError && count !== null && count >= limit) {
                isAllowedByRateLimit = false;
            }
        } catch (e) {
            console.warn("Rate limiting bypass:", e);
        }

        if (!isAllowedByRateLimit) {
            return NextResponse.json({ error: "Daily try-on limit reached for this IP." }, { status: 429 });
        }

        const startTime = Date.now();
        let logEntryId: string | null = null;
        try {
            const { data: logEntry } = await (supabase as any).from("usage_logs").insert([{
                user_id: merchantId,
                method: "POST",
                path: "/api/virtual-try-on",
                status: 202,
                latency: null,
                product_id: productId,
                ...((profile as any).ip_limit ? { ip_address: ip } : {})
            }]).select().single();
            if (logEntry) logEntryId = logEntry.id;
        } catch (e) {
            console.warn("Failed to log usage pending status:", e);
        }

        let resultUrl = null;
        let taskId = "task-" + Date.now();

        try {
            const { data: settingsData } = await supabase.from('system_settings').select('key, value');
            const settings: Record<string, string> = {};
            settingsData?.forEach(s => settings[s.key] = s.value);

            const PREFERRED_AI_PROVIDER = settings.PREFERRED_AI_PROVIDER || 'google';
            const NB_API_KEY = settings.NANOBANANA_API_KEY || process.env.NEXT_PUBLIC_NANOBANANA_API_KEY;
            const GEM_API_KEY = settings.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

            const nbPrompt = settings.NANOBANANA_PROMPT || "high quality fashion photography, realistic lighting";
            const geminiPrompt = settings.GEMINI_PROMPT || "Analyze these images for virtual try-on suitability. Return 'READY'.";

            if (PREFERRED_AI_PROVIDER === 'google') {
                if (!GEM_API_KEY) throw new Error("Google Gemini API Key is missing.");
                console.log("Using Google Gemini Engine...");
                try {
                    const genAI = new GoogleGenerativeAI(GEM_API_KEY);
                    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

                    const [personData, garmentData] = await Promise.all([
                        (async () => {
                            let url = imageUrls[0];
                            if (url.startsWith('//')) url = 'https:' + url;
                            const resp = await fetch(url);
                            const buffer = await resp.arrayBuffer();
                            return { inlineData: { data: Buffer.from(buffer).toString("base64"), mimeType: "image/jpeg" } };
                        })(),
                        (async () => {
                            let url = imageUrls[1];
                            if (url.startsWith('//')) url = 'https:' + url;
                            const resp = await fetch(url);
                            const buffer = await resp.arrayBuffer();
                            return { inlineData: { data: Buffer.from(buffer).toString("base64"), mimeType: "image/jpeg" } };
                        })()
                    ]);

                    const result = await model.generateContent([geminiPrompt, personData, garmentData]);

                    // Extract usage metadata
                    const usage = result.response.usageMetadata;
                    const promptTokens = usage?.promptTokenCount || 0;
                    const candidatesTokens = usage?.candidatesTokenCount || 0;
                    const totalTokens = usage?.totalTokenCount || 0;

                    // Estimate cost (3.1 Pricing): $0.10 per 1M input, $1.00 per 1M output
                    const estimatedCost = (promptTokens * 0.0000001) + (candidatesTokens * 0.000001);

                    // Extract image from response
                    let base64Result = null;
                    if (result.response.candidates && result.response.candidates[0].content.parts) {
                        for (const part of result.response.candidates[0].content.parts) {
                            if (part.inlineData) {
                                base64Result = part.inlineData.data;
                                break;
                            }
                        }
                    }

                    if (base64Result) {
                        console.log(`Google AI Success (2.5-Preview). Tokens: ${totalTokens}. Cost: $${estimatedCost.toFixed(5)}`);
                        resultUrl = await uploadBase64Image(base64Result);
                    } else {
                        const analysisText = result.response.text();
                        console.error("Google AI 2.5 did not return an image. Response text:", analysisText);
                        throw new Error("The AI 2.5 did not generate an image: " + analysisText);
                    }

                    const usageMetadata = {
                        tokens_used: totalTokens,
                        estimated_cost: estimatedCost,
                        prompt_tokens: promptTokens,
                        candidates_tokens: candidatesTokens
                    };

                    // Final log and credits update
                    const newCredits = Math.max(0, (profile.credits || 0) - 1);
                    try {
                        const { data: prodUsage } = await supabase.from('products').select('usage').eq('id', productId).single();
                        await Promise.all([
                            supabase.from('profiles').update({ credits: newCredits }).eq('id', merchantId),
                            supabase.from('products').update({ usage: (prodUsage?.usage || 0) + 1 }).eq('id', productId)
                        ]);
                    } catch (err) { console.error("Updates failed:", err); }

                    if (logEntryId) {
                        await supabase.from("usage_logs").update({
                            status: 200,
                            latency: `${Date.now() - startTime}ms`,
                            error_message: JSON.stringify({
                                taskId,
                                result_url: resultUrl,
                                input_images: imageUrls,
                                credits_used: 1,
                                channel: PREFERRED_AI_PROVIDER,
                                ...usageMetadata
                            })
                        }).eq("id", logEntryId);
                    }

                    return NextResponse.json({ status: "success", result_url: resultUrl, taskId, tokens: totalTokens });

                } catch (gemError) {
                    console.error("Google AI 2.5 Error:", gemError);
                    throw gemError;
                }
            } else if (PREFERRED_AI_PROVIDER === 'nanobanana') {
                if (!NB_API_KEY) throw new Error("NanoBanana API Key is missing.");
                console.log("Using NanoBanana Engine...");
                const taskResponse = await fetch(`${NANOBANANA_BASE_URL}/generate`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${NB_API_KEY}`,
                    },
                    body: JSON.stringify({
                        prompt: prompt || nbPrompt,
                        type: type || "IMAGETOIAMGE",
                        numImages: numImages || 1,
                        imageUrls: imageUrls,
                    }),
                });

                const taskResult = await taskResponse.json();
                if (!taskResponse.ok || taskResult.code !== 200) throw new Error(taskResult.msg || "Failed to submit task");
                taskId = taskResult.data?.taskId || taskResult.taskId;

                let attempts = 0;
                while (attempts < 60) {
                    attempts++;
                    await new Promise(r => setTimeout(r, 5000));
                    const stResp = await fetch(`${NANOBANANA_BASE_URL}/record-info?taskId=${taskId}`, {
                        headers: { "Authorization": `Bearer ${NB_API_KEY}` },
                    });
                    const stData = await stResp.json();
                    const successFlag = stData.data?.successFlag ?? stData.successFlag;
                    if (successFlag === 1) {
                        resultUrl = stData.data?.response?.resultImageUrl || stData.response?.result_url;
                        break;
                    } else if (successFlag === 2 || successFlag === 3) throw new Error(stData.errorMessage || "Generation failed");
                }
            }

            if (!resultUrl) resultUrl = imageUrls[1]; // Final fallback

            if (logEntryId) {
                await supabase.from("usage_logs").update({
                    status: 200,
                    latency: `${Date.now() - startTime}ms`,
                    error_message: JSON.stringify({ taskId, result_url: resultUrl, input_images: imageUrls, credits_used: 1, channel: PREFERRED_AI_PROVIDER })
                }).eq("id", logEntryId);
            }

            const newCredits = Math.max(0, (profile.credits || 0) - 1);
            try {
                const { data: prodUsage } = await supabase.from('products').select('usage').eq('id', productId).single();
                await Promise.all([
                    supabase.from('profiles').update({ credits: newCredits }).eq('id', merchantId),
                    supabase.from('products').update({ usage: (prodUsage?.usage || 0) + 1 }).eq('id', productId)
                ]);
            } catch (err) { console.error("Updates failed:", err); }

            return NextResponse.json({ status: "success", result_url: resultUrl, taskId });

        } catch (error) {
            if (logEntryId) {
                await supabase.from("usage_logs").update({
                    status: 500,
                    latency: `${Date.now() - startTime}ms`,
                    error_message: JSON.stringify({ error: (error as Error).message, taskId, input_images: imageUrls })
                }).eq("id", logEntryId);
            }
            throw error;
        }
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: (error as Error).message || "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("productId");
        const shop = searchParams.get("shop");

        if (!productId && !shop) {
            return NextResponse.json({ error: "Missing productId or shop" }, { status: 400 });
        }

        const ip = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(',')[0] || (req as any).ip || "unknown";

        // 1. Get Merchant ID
        let merchantId: string;

        const { data: product } = await supabase
            .from("products")
            .select("user_id")
            .eq("id", productId)
            .single();

        if (product && product.user_id) {
            merchantId = product.user_id;
        } else if (shop) {
            const { data: profileByShop } = await supabase
                .from("profiles")
                .select("id")
                .eq("store_website", shop)
                .single();

            if (profileByShop) {
                merchantId = profileByShop.id;
            } else {
                const { data: firstMerchant } = await supabase.from("profiles").select("id").limit(1).single();
                if (!firstMerchant) return NextResponse.json({ error: "System not ready" }, { status: 500 });
                merchantId = firstMerchant.id;
            }
        } else {
            const { data: firstMerchant } = await supabase.from("profiles").select("id").limit(1).single();
            if (!firstMerchant) return NextResponse.json({ error: "System not ready" }, { status: 500 });
            merchantId = firstMerchant.id;
        }

        // 2. Get Limits
        const { data: profile } = await supabase
            .from("profiles")
            .select("ip_limit")
            .eq("id", merchantId)
            .single();

        const limit = (profile as any)?.ip_limit || 5;

        // 3. Get Usage
        let used = 0;
        try {
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            const { count } = await (supabase as any)
                .from("usage_logs")
                .select("*", { count: "exact", head: true })
                .eq("user_id", merchantId)
                .eq("ip_address", ip)
                .gte("created_at", oneDayAgo);
            used = count || 0;
        } catch (e) {
            console.warn("Usage check failed, likely missing ip_address column:", e);
        }

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
