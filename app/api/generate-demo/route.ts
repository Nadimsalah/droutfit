import { NextRequest, NextResponse } from "next/server";

// NanoBanana provider removed to optimize costs.

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

        // Security Patch: IP extraction & Demo limits
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


        // 2. Fetch System Settings
        const { data: settingsData } = await supabaseAdmin.from('system_settings').select('key, value');
        const settings: Record<string, string> = {};
        settingsData?.forEach(s => settings[s.key] = s.value);

        const PREFERRED_AI_PROVIDER = settings.PREFERRED_AI_PROVIDER || 'google';
        const GEM_API_KEY = settings.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

        const geminiPrompt = settings.GEMINI_PROMPT || "Analyze these images for virtual try-on suitability. Return 'READY'.";

        // 3. Call AI Provider
        let resultUrl = null;
        let usageMetadataRecord = {};

        if (PREFERRED_AI_PROVIDER === 'google') {
            if (!GEM_API_KEY) throw new Error("Google Gemini API Key is missing.");
            console.log("Using Google Official AI for Demo...");
            try {
                const genAI = new GoogleGenerativeAI(GEM_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
                    console.log(`Google AI Success (Demo 2.5). Tokens: ${totalTokens}. Cost: $${estimatedCost.toFixed(5)}`);
                    resultUrl = await uploadToImgBB(base64Result);
                } else {
                    const analysisText = result.response.text();
                    console.error("Google AI 2.5 (Demo) did not return an image. Response text:", analysisText);
                    throw new Error("The AI 2.5 did not generate an image: " + analysisText);
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
                console.error("Google AI Demo 2.5 Error:", err);
                throw err;
            }
        } else {
            console.log("No valid AI provider selected. Defaulting to Google...");
        }

        if (!resultUrl) {
            resultUrl = absoluteGarmentUrl;
        }

        const latency = `${Date.now() - startTime}ms`;

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
