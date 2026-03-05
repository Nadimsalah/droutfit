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

function isUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { prompt, type, numImages, imageUrls, productId, shop } = body;

        const ip = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(',')[0] || (req as any).ip || "unknown";

        let merchantId: string | null = null;

        // 1. Identify Merchant
        // A. Try finding by productId (internal UUID)
        if (productId && isUUID(productId)) {
            const { data: product } = await supabase
                .from("products")
                .select("user_id")
                .eq("id", productId)
                .single();
            if (product) merchantId = product.user_id;
        }

        // B. Try finding by shop domain (resilient lookup)
        if (!merchantId && shop) {
            const cleanShop = shop.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
            const { data: profiles } = await (supabase as any)
                .from("profiles")
                .select("id, credits")
                .or(`store_website.eq.${shop},store_website.ilike.%${cleanShop}%`)
                .order('credits', { ascending: false })
                .limit(1);

            if (profiles && profiles.length > 0) {
                merchantId = profiles[0].id;
            } else {
                return NextResponse.json({
                    error: "This store is not yet linked to a DrOutfit account. Please open the DrOutfit app in your Shopify admin to initialize your connection."
                }, { status: 404 });
            }
        }

        // C. Fallback for testing/direct API
        if (!merchantId) {
            const { data: firstMerchant } = await supabase.from("profiles").select("id").limit(1).single();
            if (!firstMerchant) return NextResponse.json({ error: "System not ready" }, { status: 500 });
            merchantId = firstMerchant.id;
        }

        // 2. Load Merchant Profile for Limits/Credits
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("credits, ip_limit")
            .eq("id", merchantId)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: "Merchant profile not found" }, { status: 404 });
        }

        if ((profile.credits || 0) <= 0) {
            return NextResponse.json(
                { error: "STORE_LIMIT_REACHED" }, // Consistent error code for frontend
                { status: 403 }
            );
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
                product_id: (productId && isUUID(productId)) ? productId : null,
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
            const GEM_API_KEY = settings.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
            const geminiPrompt = settings.GEMINI_PROMPT || "Analyze these images for virtual try-on suitability. Return 'READY'.";

            if (PREFERRED_AI_PROVIDER === 'google') {
                if (!GEM_API_KEY) throw new Error("Google Gemini API Key is missing.");

                const genAI = new GoogleGenerativeAI(GEM_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Corrected model name

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

                const usage = result.response.usageMetadata;
                const promptTokens = usage?.promptTokenCount || 0;
                const candidatesTokens = usage?.candidatesTokenCount || 0;
                const totalTokens = usage?.totalTokenCount || 0;
                const estimatedCost = (promptTokens * 0.0000001) + (candidatesTokens * 0.000001);

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
                    resultUrl = await uploadBase64Image(base64Result);
                } else {
                    const analysisText = result.response.text();
                    throw new Error("AI did not generate an image: " + analysisText);
                }

                const usageMetadata = { tokens_used: totalTokens, estimated_cost: estimatedCost };

                // Update credits
                const newCredits = Math.max(0, (profile.credits || 0) - 1);
                await supabase.from('profiles').update({ credits: newCredits }).eq('id', merchantId);

                if (productId && isUUID(productId)) {
                    const { data: prodUsage } = await supabase.from('products').select('usage').eq('id', productId).single();
                    await supabase.from('products').update({ usage: (prodUsage?.usage || 0) + 1 }).eq('id', productId);
                }

                if (logEntryId) {
                    await supabase.from("usage_logs").update({
                        status: 200,
                        latency: `${Date.now() - startTime}ms`,
                        error_message: JSON.stringify({ taskId, result_url: resultUrl, ...usageMetadata })
                    }).eq("id", logEntryId);
                }

                return NextResponse.json({ status: "success", result_url: resultUrl, taskId });

            } else {
                throw new Error("AI provider not fully configured");
            }

        } catch (error) {
            if (logEntryId) {
                await supabase.from("usage_logs").update({
                    status: 500,
                    latency: `${Date.now() - startTime}ms`,
                    error_message: JSON.stringify({ error: (error as Error).message, taskId })
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

        let merchantId: string | null = null;

        // 1. Identify Merchant
        if (productId && isUUID(productId)) {
            const { data: product } = await supabase.from("products").select("user_id").eq("id", productId).single();
            if (product) merchantId = product.user_id;
        }

        if (!merchantId && shop) {
            const cleanShop = shop.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
            const { data: profiles } = await (supabase as any)
                .from("profiles")
                .select("id, credits")
                .or(`store_website.eq.${shop},store_website.ilike.%${cleanShop}%`)
                .order('credits', { ascending: false })
                .limit(1);

            if (profiles && profiles.length > 0) {
                merchantId = profiles[0].id;
            }
        }

        if (!merchantId) {
            const { data: firstMerchant } = await supabase.from("profiles").select("id").limit(1).single();
            merchantId = firstMerchant?.id || null;
        }

        if (!merchantId) return NextResponse.json({ error: "Merchant not found" }, { status: 404 });

        // 2. Get Limits
        const { data: profile } = await supabase
            .from("profiles")
            .select("ip_limit, credits")
            .eq("id", merchantId)
            .single();

        const limit = (profile as any)?.ip_limit || 5;
        const totalCredits = (profile as any)?.credits || 0;

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
            console.warn("Usage check failed:", e);
        }

        const remaining = Math.max(0, limit - used);

        return NextResponse.json({
            limit,
            used,
            remaining,
            hasAccess: remaining > 0 && totalCredits > 0,
            totalCredits
        });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
