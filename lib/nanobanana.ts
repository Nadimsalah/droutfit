
export interface TryOnResponse {
    result_url: string;
    status: 'success' | 'error' | 'processing';
    error?: string;
    taskId?: string;
}

const API_KEY = process.env.NEXT_PUBLIC_NANOBANANA_API_KEY;
const BASE_URL = 'https://api.nanobananaapi.ai/api/v1/nanobanana';

/**
 * Generates a Virtual Try-On image using the NanoBanana API.
 * Following the official documentation provided by the user.
 */
export async function generateTryOn(garmentUrl: string, faceImageUrl: string): Promise<TryOnResponse> {
    console.log("Starting NanoBanana VTO with:", { garmentUrl, faceImageUrl });

    if (!API_KEY) {
        console.warn("No NanoBanana API key found, using mock fallback.");
        await new Promise((resolve) => setTimeout(resolve, 3000));
        return {
            status: 'success',
            result_url: garmentUrl,
        };
    }

    try {
        // 1. Create Try-On Task
        // Documentation specifies POST /generate with Authorization: Bearer
        const response = await fetch(`${BASE_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                prompt: 'virtual try-on garment replacement',
                type: 'IMAGETOIAMGE', // Documented typo "IAMGE"
                numImages: 1,
                imageUrls: [faceImageUrl, garmentUrl],
            }),
        });

        const result = await response.json();
        console.log("Task submission response:", result);

        if (!response.ok || result.code !== 200) {
            throw new Error(result.msg || "Failed to submit generation task");
        }

        const taskId = result.data?.taskId || result.taskId;

        if (!taskId) {
            throw new Error("No taskId returned from API");
        }

        console.log(`Task ID: ${taskId}. Starting polling...`);

        // 2. Poll for Status using record-info
        let attempts = 0;
        const maxAttempts = 100; // Increased to 8+ minutes

        while (attempts < maxAttempts) {
            attempts++;

            const statusResponse = await fetch(`${BASE_URL}/record-info?taskId=${taskId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                },
            });

            const taskData = await statusResponse.json();
            console.log(`Polling attempt ${attempts} for ${taskId}:`, taskData);

            /**
             * Status Values (successFlag):
             * 0: GENERATING
             * 1: SUCCESS
             * 2: CREATE_TASK_FAILED
             * 3: GENERATE_FAILED
             */
            const successFlag = taskData.data?.successFlag !== undefined ? taskData.data.successFlag : taskData.successFlag;
            const resData = taskData.data?.response || taskData.response;

            if (successFlag === 1) {
                const resultImageUrl = resData?.resultImageUrl || resData?.result_url;
                if (resultImageUrl) {
                    console.log("Generation successful!", resultImageUrl);
                    return {
                        status: 'success',
                        result_url: resultImageUrl,
                        taskId
                    };
                }
                throw new Error("Success flag received but no result URL found");
            } else if (successFlag === 2 || successFlag === 3) {
                const errorMsg = taskData.data?.errorMessage || taskData.errorMessage || taskData.msg || "Generation failed on server";
                throw new Error(errorMsg);
            }

            // Wait 5 seconds before next poll
            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        throw new Error("Generation timed out");

    } catch (error) {
        console.error("NanoBanana API Runtime Error:", error);
        return {
            status: 'error',
            result_url: garmentUrl, // Fallback to avoid breaking UI
            error: (error as Error).message
        };
    }
}
