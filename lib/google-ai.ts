import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface TryOnResponse {
    result_url: string;
    status: 'success' | 'error' | 'processing';
    error?: string;
    taskId?: string;
}

/**
 * Generates a Virtual Try-On image using Google's official AI (Gemini).
 */
export async function generateGoogleTryOn(garmentUrl: string, faceImageUrl: string, productId: string): Promise<TryOnResponse> {
    console.log("Starting Google AI VTO with:", { garmentUrl, faceImageUrl, productId });

    try {
        // Use a 60-second timeout to avoid "signal is aborted without reason" in slow AI requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort("Request timed out after 60s"), 60000);

        const response = await fetch('/api/virtual-try-on', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: controller.signal,
            body: JSON.stringify({
                prompt: `Virtual Try-On: Put the clothing from ${garmentUrl} onto the person in ${faceImageUrl}. Ensure realistic fit and lighting.`,
                type: 'GOOGLE_AI',
                numImages: 1,
                imageUrls: [faceImageUrl, garmentUrl],
                productId: productId
            }),
        });

        clearTimeout(timeoutId);

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Generation failed with Google AI");
        }

        return {
            status: 'success',
            result_url: result.result_url,
            taskId: result.taskId
        };

    } catch (error: any) {
        console.error("Google AI Try-On Error:", error);
        return {
            status: 'error',
            result_url: garmentUrl, // Fallback
            error: error.name === 'AbortError' ? "The AI process took too long. Please try again." : error.message
        };
    }
}
