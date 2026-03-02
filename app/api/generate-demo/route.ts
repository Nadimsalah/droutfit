import { NextRequest, NextResponse } from "next/server";

const NANOBANANA_BASE_URL = "https://api.nanobananaapi.ai/api/v1/nanobanana";

import { GoogleGenerativeAI } from "@google/generative-ai";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || "");

async function uploadToImgBB(base64Image: string): Promise<string> {
    if (!supabaseServiceKey) throw new Error("Missing Supabase Service Key for upload");

    // Remove data:image/jpeg;base64, prefix if present
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Generate random filename
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
        const { userImageUrl, garmentUrl } = await req.json();

        if (!userImageUrl) {
            return NextResponse.json({ error: "Missing user image URL" }, { status: 400 });
        }

        // Ensure userImageUrl is uploaded if it's base64 (which it should be from the demo UI)
        let finalUserImageUrl = userImageUrl;
        if (userImageUrl.startsWith('data:image')) {
            console.log("Uploading demo user image to ImgBB...");
            finalUserImageUrl = await uploadToImgBB(userImageUrl);
        }

        // Ensure garmentUrl is absolute since we are testing
        const absoluteGarmentUrl = garmentUrl.startsWith('http')
            ? garmentUrl
            : new URL(garmentUrl, req.nextUrl.origin).toString();

        console.log("Images ready:", finalUserImageUrl, absoluteGarmentUrl);


        // 2. Fetch System Settings
        const { data: settingsData } = await supabaseAdmin.from('system_settings').select('key, value');
        const settings: Record<string, string> = {};
        settingsData?.forEach(s => settings[s.key] = s.value);

        const PREFERRED_AI_PROVIDER = settings.PREFERRED_AI_PROVIDER || 'nanobanana';
        const NB_API_KEY = settings.NANOBANANA_API_KEY || process.env.NEXT_PUBLIC_NANOBANANA_API_KEY;
        const GEM_API_KEY = settings.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

        const geminiPrompt = settings.GEMINI_PROMPT || "Analyze these images for virtual try-on suitability. Return 'READY'.";
        const nbPrompt = settings.NANOBANANA_PROMPT || "high quality fashion photography, realistic lighting";

        // 3. Call AI Provider
        let resultUrl = null;
        let usageMetadataRecord = {};

        if (PREFERRED_AI_PROVIDER === 'google') {
            if (!GEM_API_KEY) throw new Error("Google Gemini API Key is missing.");
            console.log("Using Google Official AI for Demo...");
            try {
                const genAI = new GoogleGenerativeAI(GEM_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-image-preview" });

                const [personData, garmentData] = await Promise.all([
                    (async () => {
                        const resp = await fetch(finalUserImageUrl);
                        const buffer = await resp.arrayBuffer();
                        return { inlineData: { data: Buffer.from(buffer).toString("base64"), mimeType: "image/jpeg" } };
                    })(),
                    (async () => {
                        const resp = await fetch(absoluteGarmentUrl);
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
                    console.log(`Google AI Success (Demo 3.1). Tokens: ${totalTokens}. Cost: $${estimatedCost.toFixed(5)}`);
                    resultUrl = await uploadToImgBB(base64Result);
                } else {
                    const analysisText = result.response.text();
                    console.error("Google AI 3.1 (Demo) did not return an image. Response text:", analysisText);
                    throw new Error("The AI 3.1 did not generate an image: " + analysisText);
                }

                // Add usage metadata to result
                usageMetadataRecord = {
                    tokens_used: totalTokens,
                    estimated_cost: estimatedCost,
                    prompt_tokens: promptTokens,
                    candidates_tokens: candidatesTokens
                };

                await new Promise(resolve => setTimeout(resolve, 3000));
            } catch (err) {
                console.error("Google AI Demo 3.1 Error:", err);
                throw err;
            }
        } else if (PREFERRED_AI_PROVIDER === 'nanobanana') {
            if (!NB_API_KEY) throw new Error("NanoBanana API Key is missing.");
            console.log("Using NanoBanana for Demo...");
            const taskResponse = await fetch(`${NANOBANANA_BASE_URL}/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${NB_API_KEY}`,
                },
                body: JSON.stringify({
                    prompt: nbPrompt,
                    type: "IMAGETOIAMGE",
                    numImages: 1,
                    imageUrls: [finalUserImageUrl, absoluteGarmentUrl],
                }),
            });

            const taskResult = await taskResponse.json();
            if (taskResponse.ok && taskResult.code === 200) {
                const taskId = taskResult.data?.taskId || taskResult.taskId;
                let attempts = 0;
                while (attempts < 30) {
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
                    } else if (successFlag === 2) break;
                }
            }
        }

        if (!resultUrl) {
            resultUrl = absoluteGarmentUrl;
        }

        const latency = `${Date.now() - startTime}ms`;
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '::1';

        // Attempt to log entry (we omit user_id for guest/demo attempts)
        try {
            await supabaseAdmin.from('usage_logs').insert([{
                user_id: null, // This requires a nullable user_id column
                method: "POST",
                path: "/api/generate-demo",
                status: 200,
                latency: latency,
                ip_address: ip,
                error_message: JSON.stringify({
                    taskId: "LIVE-DEMO",
                    result_url: resultUrl,
                    input_images: [finalUserImageUrl, absoluteGarmentUrl],
                    ...usageMetadataRecord
                })
            }]);
        } catch (logErr) {
            console.error("Failed to log demo request:", logErr);
        }

        return NextResponse.json({
            status: "success",
            result_url: resultUrl,
        });

    } catch (error) {
        console.error("Demo API Error:", error);
        return NextResponse.json(
            { error: (error as Error).message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
