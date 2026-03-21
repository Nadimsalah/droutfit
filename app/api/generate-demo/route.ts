import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getOptimalResolution, calculateGeminiCost, getCachedGarment, stripMetadata, enterQueue, leaveQueue } from "@/lib/google-ai-optimizer";
import { generateReplicateVTO } from "@/lib/ai-providers/replicate";
import { generateFalVTO } from "@/lib/ai-providers/falai";
import { generateHFSpaceVTO } from "@/lib/ai-providers/hf-space";
import { generatePrunaVTO } from "@/lib/ai-providers/pruna";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || "");

async function uploadToImgBB(base64Image: string): Promise<string> {
    if (!supabaseServiceKey) throw new Error("Missing Supabase Service Key for upload");

    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const fileName = `demo_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

    const { data, error } = await supabaseAdmin.storage
        .from("tryimages")
        .upload(fileName, buffer, {
            contentType: "image/jpeg",
            upsert: true
        });

    if (error) {
        throw new Error("Failed to upload image to storage: " + error.message);
    }

    const { data: urlData } = supabaseAdmin.storage
        .from("tryimages")
        .getPublicUrl(fileName);

    return urlData.publicUrl;
}

export async function POST(req: NextRequest) {
    const startTime = Date.now();
    try {
        const { userImageUrl, garmentUrl, metadata } = await req.json();
        const isMobile = metadata?.isMobile || false;
        const isHD = metadata?.isHD || false;

        if (!userImageUrl) {
            return NextResponse.json({ error: "Missing user image URL" }, { status: 400 });
        }

        let finalUserImageUrl = userImageUrl;
        if (userImageUrl.startsWith('data:image')) {
            console.log("Uploading demo user image to storage...");
            finalUserImageUrl = await uploadToImgBB(userImageUrl);
        }

        const absoluteGarmentUrl = garmentUrl.startsWith('http')
            ? garmentUrl
            : new URL(garmentUrl, req.nextUrl.origin).toString();

        const ip = req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count } = await supabaseAdmin.from('usage_logs')
            .select('*', { count: 'exact', head: true })
            .eq('ip_address', ip)
            .eq('path', '/api/generate-demo')
            .gte('created_at', oneDayAgo);

        if (count && count >= 10) {
            return NextResponse.json({ error: "Daily free demo limit reached. Please sign up to continue using the service." }, { status: 429 });
        }

        const { data: settingsData } = await supabaseAdmin.from('system_settings').select('key, value');
        const settings: Record<string, string> = {};
        settingsData?.forEach(s => settings[s.key] = s.value);

        const PREFERRED_AI_PROVIDER = "pruna" as string;
        const GEM_API_KEY = settings.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
        const qualityPrompt = "Professional virtual try-on. Replace the person's clothes with the garment image. Map the garment to the person's body shape and pose perfectly. Remove all original clothing parts. Ensure natural blending, photorealistic lighting, and texture preservation. Return ONLY the result.";
        const geminiPrompt = settings.GEMINI_PROMPT || qualityPrompt;

        let resultUrl: string | null = null;
        let usageMetadataRecord = {};
        let resolution = "1024px";

        if (PREFERRED_AI_PROVIDER === 'google') {
            if (!GEM_API_KEY) throw new Error("Google Gemini API Key is missing.");
            
            await enterQueue();
            try {
                const genAI = new GoogleGenerativeAI(GEM_API_KEY);
                const resValue = getOptimalResolution(isMobile, isHD);
                resolution = `${resValue}px`;
                console.log(`>>> [API:generate-demo] Initializing model with resolution: ${resolution}`);
                
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

                const [personData, garmentData] = await Promise.all([
                    (async () => {
                        if (userImageUrl.startsWith('data:')) return { inlineData: { data: stripMetadata(userImageUrl), mimeType: "image/webp" } };
                        const resp = await fetch(finalUserImageUrl, { signal: null } as any);
                        const buffer = await resp.arrayBuffer();
                        return { inlineData: { data: Buffer.from(buffer).toString("base64"), mimeType: "image/jpeg" } };
                    })(),
                    (async () => {
                        const base64 = await getCachedGarment(absoluteGarmentUrl, async (targetUrl) => {
                            const resp = await fetch(targetUrl, { signal: null } as any);
                            const buffer = await resp.arrayBuffer();
                            return Buffer.from(buffer).toString("base64");
                        });
                        return { inlineData: { data: base64, mimeType: "image/jpeg" } };
                    })()
                ]);

                const result = await model.generateContent([geminiPrompt, personData, garmentData]);
                const usage = result.response.usageMetadata;
                const promptTokens = usage?.promptTokenCount || 0;
                const candidatesTokens = usage?.candidatesTokenCount || 0;
                const totalTokens = usage?.totalTokenCount || 0;
                const estimatedCost = calculateGeminiCost(promptTokens, candidatesTokens);

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
                    console.log(`Google AI Success (Demo). Tokens: ${totalTokens}. Est Cost: $${estimatedCost.toFixed(5)}`);
                    resultUrl = await uploadToImgBB(base64Result);
                } else {
                    const analysisText = result.response.text();
                    throw new Error("AI did not generate an image: " + analysisText);
                }

                usageMetadataRecord = {
                    tokens_used: totalTokens,
                    estimated_cost: estimatedCost,
                    prompt_tokens: promptTokens,
                    candidates_tokens: candidatesTokens
                };
            } finally {
                leaveQueue();
            }
        } else if (PREFERRED_AI_PROVIDER === "hfspace") {
            console.log(">>> [API:generate-demo] Using FREE HuggingFace Space (Fallback System)");
            resultUrl = await generateHFSpaceVTO({
                personImageUrl: finalUserImageUrl,
                garmentImageUrl: absoluteGarmentUrl,
                hfToken: settings.HF_TOKEN || process.env.HF_TOKEN
            });
            usageMetadataRecord = { provider: 'hfspace', model: 'idm-vton-free' };
        } else if (PREFERRED_AI_PROVIDER === "replicate") {
            const REPLICATE_API_KEY = settings.REPLICATE_API_KEY || process.env.REPLICATE_API_KEY;
            if (!REPLICATE_API_KEY) throw new Error("Replicate API Key is missing.");

            console.log(">>> [API:generate-demo] Using Replicate VTO");
            resultUrl = await generateReplicateVTO({
                personImageUrl: finalUserImageUrl,
                garmentImageUrl: absoluteGarmentUrl,
                apiKey: REPLICATE_API_KEY,
                hfToken: settings.HF_TOKEN || process.env.HF_TOKEN
            });
            usageMetadataRecord = { provider: 'replicate' };
        } else if (PREFERRED_AI_PROVIDER === "falai") {
            const FAL_API_KEY = settings.FALAI_API_KEY || process.env.FALAI_API_KEY;
            if (!FAL_API_KEY) throw new Error("fal.ai API Key is missing.");

            console.log(">>> [API:generate-demo] Using fal.ai VTO");
            resultUrl = await generateFalVTO({
                personImageUrl: finalUserImageUrl,
                garmentImageUrl: absoluteGarmentUrl,
                apiKey: FAL_API_KEY
            });
            usageMetadataRecord = { provider: 'falai' };
        } else if (PREFERRED_AI_PROVIDER === "pruna") {
            const PRUNA_API_KEY = process.env.PRUNA_API_KEY || "pru_AdE9f0Zx_wZMX8GJzqQjGvcB5CizoY5G";
            console.log(">>> [API:generate-demo] Using Pruna Key:", PRUNA_API_KEY?.substring(0, 10) + "...");
            if (!PRUNA_API_KEY) throw new Error("Pruna API Key is missing.");

            console.log(">>> [API:generate-demo] Using Pruna AI P-API");
            resultUrl = await generatePrunaVTO({
                personImageUrl: finalUserImageUrl,
                garmentImageUrl: absoluteGarmentUrl,
                apiKey: PRUNA_API_KEY
            });
            usageMetadataRecord = { provider: 'pruna', estimated_cost: 0.01 };
        }

        if (!resultUrl) {
            console.warn(">>> [API:generate-demo] No result URL generated, falling back to garment image.");
            resultUrl = absoluteGarmentUrl || "";
        }

        const latency = `${Date.now() - startTime}ms`;
        try {
            await supabaseAdmin.from('usage_logs').insert([{
                user_id: null,
                method: "POST",
                path: "/api/generate-demo",
                status: 200,
                latency: latency,
                ip_address: ip,
                error_message: JSON.stringify({
                    taskId: "LIVE-DEMO",
                    result_url: resultUrl,
                    resolution: resolution,
                    ...usageMetadataRecord
                })
            }]);
        } catch (logErr) {
            console.error("Failed to log demo request:", logErr);
        }

        return NextResponse.json({
            status: "success",
            result_url: resultUrl,
        }, {
            headers: { "X-Model-Used": "gemini-2.5-flash-image" }
        });

    } catch (error) {
        console.error("Demo API Error:", error);
        return NextResponse.json(
            { error: (error as Error).message || "Internal Server Error" },
            { 
                status: 500,
                headers: { "X-Model-Used": "gemini-2.5-flash-image-error" }
            }
        );
    }
}
