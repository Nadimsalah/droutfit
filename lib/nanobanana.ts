
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
/**
 * Generates a Virtual Try-On image using the server-side API route.
 * This proxy handles API keys and rate limiting securely.
 */
export async function generateTryOn(garmentUrl: string, faceImageUrl: string, productId: string): Promise<TryOnResponse> {
    console.log("Starting NanoBanana VTO with:", { garmentUrl, faceImageUrl, productId });

    try {
        const response = await fetch('/api/virtual-try-on', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: 'Put the provided clothing item onto the uploaded person. Keep the original face, body shape, pose, and background unchanged. Only replace the outfit. Make it realistic, properly fitted, and naturally blended with correct lighting and shadows.',
                type: 'IMAGETOIAMGE', // API expects this typo "IAMGE"
                numImages: 1,
                imageUrls: [faceImageUrl, garmentUrl],
                productId: productId
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Generation failed");
        }

        return {
            status: 'success',
            result_url: result.result_url,
            taskId: result.taskId
        };

    } catch (error) {
        console.error("Try-On Error:", error);
        return {
            status: 'error',
            result_url: garmentUrl, // Fallback to avoid breaking UI
            error: (error as Error).message
        };
    }
}

export async function getTryOnLimit(productId: string): Promise<{ remaining: number, limit: number, hasAccess: boolean }> {
    try {
        const response = await fetch(`/api/virtual-try-on?productId=${productId}`);
        const data = await response.json();

        if (!response.ok) {
            console.error("Failed to check limit:", data);
            return { remaining: 5, limit: 5, hasAccess: true }; // Fallback to allow usage if check fails (fail open)
        }

        return {
            remaining: data.remaining,
            limit: data.limit,
            hasAccess: data.hasAccess
        };
    } catch (error) {
        console.error("Error checking limit:", error);
        return { remaining: 5, limit: 5, hasAccess: true };
    }
}
