import { NextRequest, NextResponse } from "next/server";

const NANOBANANA_API_KEY = process.env.NEXT_PUBLIC_NANOBANANA_API_KEY;
const NANOBANANA_BASE_URL = "https://api.nanobananaapi.ai/api/v1/nanobanana";
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
    try {
        const { userImageUrl, garmentUrl } = await req.json();

        if (!userImageUrl) {
            return NextResponse.json({ error: "Missing user image URL" }, { status: 400 });
        }

        if (!NANOBANANA_API_KEY) {
            return NextResponse.json({ error: "Missing NanoBanana API Key in env" }, { status: 500 });
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

        // 2. Call NanoBanana API
        const taskResponse = await fetch(`${NANOBANANA_BASE_URL}/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${NANOBANANA_API_KEY}`,
            },
            body: JSON.stringify({
                prompt: "virtual try-on garment replacement, extremely high quality, realistic lighting",
                type: "IMAGETOIAMGE",
                numImages: 1,
                imageUrls: [finalUserImageUrl, absoluteGarmentUrl],
            }),
        });

        const taskResult = await taskResponse.json();

        if (!taskResponse.ok || taskResult.code !== 200) {
            throw new Error(taskResult.msg || "Failed to submit NanoBanana generation task");
        }

        const taskId = taskResult.data?.taskId || taskResult.taskId;
        console.log("Submitted to NanoBanana, Task ID:", taskId);

        // 3. Poll for result
        let attempts = 0;
        const maxAttempts = 60; // 5 minutes max
        let resultUrl = null;

        while (attempts < maxAttempts) {
            attempts++;
            await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5s

            const statusResponse = await fetch(`${NANOBANANA_BASE_URL}/record-info?taskId=${taskId}`, {
                headers: { "Authorization": `Bearer ${NANOBANANA_API_KEY}` },
            });
            const statusData = await statusResponse.json();

            // Handle their nested structure
            const successFlag = statusData.data?.successFlag !== undefined ? statusData.data.successFlag : statusData.successFlag;
            const resData = statusData.data?.response || statusData.response;

            if (successFlag === 1) {
                resultUrl = resData?.resultImageUrl || resData?.result_url;
                break;
            } else if (successFlag === 2 || successFlag === 3) {
                throw new Error(statusData.errorMessage || "Generation failed on NanoBanana side");
            }
        }

        if (!resultUrl) {
            throw new Error("Generation timed out");
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
