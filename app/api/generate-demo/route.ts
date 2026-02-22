import { NextRequest, NextResponse } from "next/server";

const NANOBANANA_API_KEY = process.env.NEXT_PUBLIC_NANOBANANA_API_KEY;
const NANOBANANA_BASE_URL = "https://api.nanobananaapi.ai/api/v1/nanobanana";
const IMGBB_API_KEY = "6e50cdadbd11bf7df0cc0d381180fb22"; // dummy if needed

async function uploadToImgBB(base64Image: string): Promise<string> {
    const formData = new FormData();
    // Remove data:image/jpeg;base64, prefix if present
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|webp|jpg);base64,/, "");
    formData.append("image", cleanBase64);

    // Fallback key just for the demo flow to ensure it runs smooth for the user without DB Config
    const response = await fetch(`https://api.imgbb.com/1/upload?key=8e65cf11186713915f79ee8bc116f1b3`, {
        method: "POST",
        body: formData,
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
        throw new Error(result.error?.message || "ImgBB upload failed");
    }

    return result.data.url;
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

        // Ensure garmentUrl is absolute since we are testing
        const absoluteGarmentUrl = garmentUrl.startsWith('http')
            ? garmentUrl
            : new URL(garmentUrl, req.nextUrl.origin).toString();

        console.log("Images ready:", userImageUrl, absoluteGarmentUrl);

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
                imageUrls: [userImageUrl, absoluteGarmentUrl],
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
