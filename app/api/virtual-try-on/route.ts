import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getOptimalResolution, calculateGeminiCost, getCachedGarment, stripMetadata, enterQueue, leaveQueue } from "@/lib/google-ai-optimizer";
import { submitDashScopeVTO, pollDashScopeTask } from "@/lib/ai-providers/dashscope";
import { generateSiliconFlow } from "@/lib/ai-providers/siliconflow";
import { generateReplicateVTO } from "@/lib/ai-providers/replicate";
import { generateFalVTO } from "@/lib/ai-providers/falai";
import { generateHFSpaceVTO } from "@/lib/ai-providers/hf-space";
import { generatePrunaVTO } from "@/lib/ai-providers/pruna";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey || "");

export async function POST(req: NextRequest) {
    const startTime = Date.now();
    const ip = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(',')[0] || (req as any).ip || "unknown";

    // --- CRITICAL EARLY LOGGING ---
    // Create entry BEFORE parsing body to ensure we see the attempt
    const initialLog = await supabase.from("usage_logs").insert([{
        user_id: null,
        method: "POST",
        path: "/api/virtual-try-on",
        ip_address: ip,
        status: 102,
        error_message: "Processing initiated..."
    }]).select();
    const logEntryId = initialLog.data?.[0]?.id;

    try {
        const body = await req.json();
        const { prompt, type, numImages, imageUrls, productId, shop, metadata } = body;
        const isMobile = metadata?.isMobile || false;
        const isHD = metadata?.isHD || false;
        
        // Update log with product_id if available
        if (logEntryId && productId) {
            await supabase.from("usage_logs").update({ product_id: productId }).eq("id", logEntryId);
        }
        const resultUrl = null;
        const taskId = "task-" + Date.now();

        await enterQueue();
        try {
            const { data: settingsData } = await supabase.from('system_settings').select('key, value');
            const settings: Record<string, string> = {};
            settingsData?.forEach(s => settings[s.key] = s.value);

            const PREFERRED_PROVIDER = "pruna" as string;
            let resultImages: string[] = [];

            if (PREFERRED_PROVIDER === "hfspace") {
                console.log(">>> [API:virtual-try-on] Using FREE HuggingFace IDM-VTON Space");
                const resultUrlHF = await generateHFSpaceVTO({
                    personImageUrl: imageUrls[0].startsWith('//') ? 'https:' + imageUrls[0] : imageUrls[0],
                    garmentImageUrl: imageUrls[1].startsWith('//') ? 'https:' + imageUrls[1] : imageUrls[1],
                    hfToken: settings.HF_TOKEN || process.env.HF_TOKEN
                });
                resultImages = [resultUrlHF];

                if (logEntryId) {
                    await supabase.from("usage_logs").update({
                        status: 200,
                        latency: `${Date.now() - startTime}ms`,
                        error_message: JSON.stringify({ provider: 'hfspace', model: 'idm-vton-free' })
                    }).eq("id", logEntryId);
                }
            } else if (PREFERRED_PROVIDER === "falai") {
                const FAL_API_KEY = settings.FALAI_API_KEY || process.env.FALAI_API_KEY;
                if (!FAL_API_KEY) throw new Error("fal.ai API Key is missing.");

                console.log(">>> [API:virtual-try-on] Using fal.ai flux-klein-9b VTO");
                const resultUrlFal = await generateFalVTO({
                    personImageUrl: imageUrls[0].startsWith('//') ? 'https:' + imageUrls[0] : imageUrls[0],
                    garmentImageUrl: imageUrls[1].startsWith('//') ? 'https:' + imageUrls[1] : imageUrls[1],
                    apiKey: FAL_API_KEY
                });
                resultImages = [resultUrlFal];

                if (logEntryId) {
                    await supabase.from("usage_logs").update({
                        status: 200,
                        latency: `${Date.now() - startTime}ms`,
                        error_message: JSON.stringify({ provider: 'falai', model: 'flux-klein-9b-vto' })
                    }).eq("id", logEntryId);
                }
            } else if (PREFERRED_PROVIDER === "replicate") {
                const REP_API_KEY = settings.REPLICATE_API_KEY || process.env.REPLICATE_API_KEY;
                if (!REP_API_KEY) throw new Error("Replicate API Key is missing.");

                console.log(">>> [API:virtual-try-on] Using Replicate IDM-VTON - Open Source VTO");

                const resultUrlRep = await generateReplicateVTO({
                    personImageUrl: imageUrls[0].startsWith('//') ? 'https:' + imageUrls[0] : imageUrls[0],
                    garmentImageUrl: imageUrls[1].startsWith('//') ? 'https:' + imageUrls[1] : imageUrls[1],
                    hfToken: settings.HF_TOKEN || process.env.HF_TOKEN,
                    apiKey: REP_API_KEY
                });
                resultImages = [resultUrlRep];

                if (logEntryId) {
                    await supabase.from("usage_logs").update({
                        status: 200,
                        latency: `${Date.now() - startTime}ms`,
                        error_message: JSON.stringify({ provider: 'replicate', model: 'idm-vton' })
                    }).eq("id", logEntryId);
                }
            } else if (PREFERRED_PROVIDER === "siliconflow") {
                const SF_API_KEY = settings.SILICONFLOW_API_KEY || process.env.SILICONFLOW_API_KEY;
                if (!SF_API_KEY) throw new Error("SiliconFlow API Key is missing.");

                const sfModel = settings.SILICONFLOW_MODEL || 'black-forest-labs/FLUX.1-schnell';
                console.log(`>>> [API:virtual-try-on] Using SiliconFlow Model: ${sfModel}`);

                // T2I approach: describe the try-on in a detailed text prompt
                const sfPrompt = `Photorealistic fashion photograph of a person wearing the exact garment shown in a clothing product image. The clothing must be realistic with natural fabric draping and matching lighting. High quality, professional fashion photo, full body shot.`;
                const resultUrlSF = await generateSiliconFlow({
                    model: sfModel,
                    prompt: sfPrompt,
                    imageUrls: imageUrls,
                    apiKey: SF_API_KEY
                });
                resultImages = [resultUrlSF];

                if (logEntryId) {
                    await supabase.from("usage_logs").update({
                        status: 200,
                        latency: `${Date.now() - startTime}ms`,
                        error_message: JSON.stringify({ provider: 'siliconflow', model: sfModel })
                    }).eq("id", logEntryId);
                }
            } else if (PREFERRED_PROVIDER === "pruna") {
                const PRUNA_API_KEY = process.env.PRUNA_API_KEY || "pru_AdE9f0Zx_wZMX8GJzqQjGvcB5CizoY5G";
                console.log(">>> [API:virtual-try-on] Using Pruna Key:", PRUNA_API_KEY?.substring(0, 10) + "...");
                if (!PRUNA_API_KEY) throw new Error("Pruna API Key is missing.");

                console.log(">>> [API:virtual-try-on] Using Pruna AI P-API");
                const resultUrlPruna = await generatePrunaVTO({
                    personImageUrl: imageUrls[0].startsWith('//') ? 'https:' + imageUrls[0] : imageUrls[0],
                    garmentImageUrl: imageUrls[1].startsWith('//') ? 'https:' + imageUrls[1] : imageUrls[1],
                    apiKey: PRUNA_API_KEY
                });
                resultImages = [resultUrlPruna];

                if (logEntryId) {
                    const detectSource = shop ? 'shopify' : (metadata?.channel || 'widget');
                    await supabase.from("usage_logs").update({
                        status: 200,
                        latency: `${Date.now() - startTime}ms`,
                        error_message: JSON.stringify({ 
                            provider: 'pruna', 
                            model: 'p-image-edit', 
                            estimated_cost: 0.01, 
                            result_url: resultUrlPruna,
                            source: detectSource,
                            channel: detectSource,
                            shop: shop || null
                        })
                    }).eq("id", logEntryId);
                }
            } else if (PREFERRED_PROVIDER === "dashscope") {
                const DS_API_KEY = settings.DASHSCOPE_API_KEY || process.env.DASHSCOPE_API_KEY;
                if (!DS_API_KEY) throw new Error("DashScope API Key is missing.");

                console.log(">>> [API:virtual-try-on] Using Chinese Provider: Alibaba DashScope");
                const taskIdDS = await submitDashScopeVTO({
                    modelImage: imageUrls[0],
                    garmentImage: imageUrls[1],
                    apiKey: DS_API_KEY
                });
                const resultUrlDS = await pollDashScopeTask(taskIdDS, DS_API_KEY);
                resultImages = [resultUrlDS];

                if (logEntryId) {
                    await supabase.from("usage_logs").update({
                        status: 200,
                        latency: `${Date.now() - startTime}ms`,
                        error_message: JSON.stringify({ 
                            taskId: taskIdDS, 
                            provider: 'dashscope'
                        })
                    }).eq("id", logEntryId);
                }
            } else {
                // GOOGLE FALLBACK
                const GEM_API_KEY = settings.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
                if (!GEM_API_KEY) throw new Error("Google Gemini API Key is missing.");

                const genAI = new GoogleGenerativeAI(GEM_API_KEY);
                const resValue = getOptimalResolution(isMobile, isHD);
                const resolutionStr = `${resValue}px`;
                const modelName = settings.GEMINI_MODEL || "gemini-1.5-flash";
                console.log(`>>> [API:virtual-try-on] Using Google Model: ${modelName}, Resolution: ${resolutionStr}`);
                
                const model = genAI.getGenerativeModel({ model: modelName });

                const [personData, garmentData] = await Promise.all([
                    (async () => {
                        let url = imageUrls[0];
                        if (url.startsWith('data:')) return { inlineData: { data: stripMetadata(url), mimeType: "image/webp" } };
                        if (url.startsWith('//')) url = 'https:' + url;
                        const resp = await fetch(url, { signal: null } as any);
                        const buffer = await resp.arrayBuffer();
                        return { inlineData: { data: Buffer.from(buffer).toString("base64"), mimeType: "image/webp" } };
                    })(),
                    (async () => {
                        const url = imageUrls[1].startsWith('//') ? 'https:' + imageUrls[1] : imageUrls[1];
                        const base64 = await getCachedGarment(url, async (targetUrl) => {
                            const resp = await fetch(targetUrl, { signal: null } as any);
                            const buffer = await resp.arrayBuffer();
                            return Buffer.from(buffer).toString("base64");
                        });
                        return { inlineData: { data: base64, mimeType: "image/jpeg" } };
                    })()
                ]);

                const qualityPrompt = "Professional virtual try-on. Replace the clothing in the user photo with the clothing from the garment image. The new clothing must follow the body contours, folds, and pose of the person. REMOVE any visible parts of the original clothing. Blend the edges naturally with the skin and background. Preserve the exact texture, fabric material, and patterns of the garment. Ensure photorealistic lighting, depth, and shadows that match the environment. High resolution, sharp details, cinematic quality. Return ONLY the final try-on image.";
                const finalPrompt = prompt || settings.GEMINI_PROMPT || qualityPrompt;
                const result = await model.generateContent([finalPrompt, personData, garmentData]);
                
                const usage = result.response.usageMetadata;
                const promptTokens = usage?.promptTokenCount || 0;
                const candidatesTokens = usage?.candidatesTokenCount || 0;
                const estimatedCost = calculateGeminiCost(promptTokens, candidatesTokens, modelName);
                
                console.log(`>>> [Cost-Optimization] Tokens: ${usage?.totalTokenCount}. Cost: $${estimatedCost.toFixed(5)}`);

                let base64Result = null;
                if (result.response.candidates && result.response.candidates[0].content.parts) {
                    for (const part of result.response.candidates[0].content.parts) {
                        if (part.inlineData) {
                            base64Result = part.inlineData.data;
                            break;
                        }
                    }
                }

                if (!base64Result) throw new Error("AI did not generate an image.");
                
                if (logEntryId) {
                    await supabase.from("usage_logs").update({
                        status: 200,
                        latency: `${Date.now() - startTime}ms`,
                        error_message: JSON.stringify({ 
                            taskId, 
                            resolution: resolutionStr,
                            prompt_tokens: promptTokens,
                            candidates_tokens: candidatesTokens,
                            estimated_cost: estimatedCost,
                            provider: 'google'
                        })
                    }).eq("id", logEntryId);
                }
                resultImages = ["data:image/png;base64," + base64Result];
            }

            return NextResponse.json({
                status: "success",
                task_id: taskId,
                result: resultImages,
                result_url: resultImages[0]
            });

        } finally {
            leaveQueue();
        }
    } catch (error) {
        console.error("VTO API Error:", error);
        return NextResponse.json(
            { error: (error as Error).message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
