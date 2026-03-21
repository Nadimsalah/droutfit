import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Strips EXIF and other metadata from a base64 image string to reduce payload size.
 */
export function stripMetadata(base64Image: string): string {
    // Simple way to "strip" is to re-encode, but server-side without Canvas is tricky.
    // For now, we ensure we only take the data part if it has a prefix.
    return base64Image.replace(/^data:image\/\w+;base64,/, "");
}

/**
 * Selects the optimal resolution to minimize output tokens while preserving quality.
 * 768px saves ~40% tokens compared to 1024px.
 */
export function getOptimalResolution(isMobile: boolean, isHD: boolean): number {
    if (isHD) return 1024;
    // Aggressive cost-saving: Default to 768px even on desktop unless HD is requested.
    // This saves ~40-50% tokens compared to 1024px.
    return 768;
}

/**
 * Calculates real-world cost for Gemini models.
 * Rates (approx per 1M tokens):
 * - 2.5 Flash Image: $0.10 input, $30.00 output (Premium Generator)
 * - 2.0 Flash: $0.10 input, $0.40 output
 * - 2.0 Flash Lite: $0.075 input, $0.30 output (Extreme Value)
 */
export function calculateGeminiCost(promptTokens: number, candidatesTokens: number, modelName: string = "gemini-2.5-flash-image"): number {
    let inputRate = 0.10;
    let outputRate = 30.00;

    if (modelName.includes("lite") || modelName.includes("8b")) {
        inputRate = 0.075;
        outputRate = 0.30;
    } else if (modelName.includes("1.5-flash")) {
        inputRate = 0.075;
        outputRate = 0.30;
    } else if (modelName.includes("2.0-flash")) {
        inputRate = 0.10;
        outputRate = 0.40;
    }

    const inputCost = (promptTokens / 1_000_000) * inputRate;
    const outputCost = (candidatesTokens / 1_000_000) * outputRate;
    return inputCost + outputCost;
}

/**
 * Simple in-memory cache for garment image data to avoid repeated processing
 * or re-fetching if the same URL is used multiple times in a short window.
 */
const garmentCache = new Map<string, { data: string, timestamp: number }>();
const CACHE_TTL = 3600 * 1000; // 1 hour

export async function getCachedGarment(url: string, fetchFn: (url: string) => Promise<string>): Promise<string> {
    const now = Date.now();
    const entry = garmentCache.get(url);
    
    if (entry && (now - entry.timestamp < CACHE_TTL)) {
        return entry.data;
    }

    const data = await fetchFn(url);
    garmentCache.set(url, { data, timestamp: now });
    
    // Cleanup old entries
    if (garmentCache.size > 100) {
        const oldestKey = garmentCache.keys().next().value;
        if (oldestKey) garmentCache.delete(oldestKey);
    }

    return data;
}

/**
 * Queue-Based Request System (Simple In-Memory Semaphore)
 * Prevents API spikes and allows sequential processing.
 */
let activeRequests = 0;
const MAX_CONCURRENT = 3;
const queue: (() => void)[] = [];

export async function enterQueue(): Promise<void> {
    if (activeRequests < MAX_CONCURRENT) {
        activeRequests++;
        return;
    }

    return new Promise((resolve) => {
        queue.push(() => {
            activeRequests++;
            resolve();
        });
    });
}

export function leaveQueue(): void {
    activeRequests--;
    const next = queue.shift();
    if (next) next();
}
