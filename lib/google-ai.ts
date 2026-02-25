
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface TryOnResponse {
    result_url: string;
    status: 'success' | 'error' | 'processing';
    error?: string;
    taskId?: string;
}

/**
 * Generates a Virtual Try-On image using Google's official AI (Gemini/Imagen).
 * Note: While Gemini is multi-modal, specialized VTO often uses Imagen 3 with specific prompts.
 */
export async function generateGoogleTryOn(garmentUrl: string, faceImageUrl: string, productId: string): Promise<TryOnResponse> {
    console.log("Starting Google AI VTO with:", { garmentUrl, faceImageUrl, productId });

    try {
        const response = await fetch('/api/virtual-try-on', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: `Virtual Try-On: Put the clothing from ${garmentUrl} onto the person in ${faceImageUrl}. Ensure realistic fit and lighting.`,
                type: 'GOOGLE_AI',
                numImages: 1,
                imageUrls: [faceImageUrl, garmentUrl],
                productId: productId
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Generation failed with Google AI");
        }

        return {
            status: 'success',
            result_url: result.result_url,
            taskId: result.taskId
        };

    } catch (error) {
        console.error("Google AI Try-On Error:", error);
        return {
            status: 'error',
            result_url: garmentUrl, // Fallback
            error: (error as Error).message
        };
    }
}
