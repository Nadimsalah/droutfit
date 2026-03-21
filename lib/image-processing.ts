"use client";

/**
 * Optimizes an image file for Gemini API consumption.
 * - Resizes to max 1024px while maintaining aspect ratio.
 * - Converts to WebP format.
 * - Compresses to ~75% quality.
 */
export async function optimizeImageForGemini(file: File): Promise<{ base64: string; metadata: { width: number; height: number; size: number } }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onerror = () => reject(new Error("Failed to load image for processing"));
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;

                // 1. Maintain aspect ratio and resize to max 1024px
                const MAX_DIM = 1024;
                if (width > height) {
                    if (width > MAX_DIM) {
                        height *= MAX_DIM / width;
                        width = MAX_DIM;
                    }
                } else {
                    if (height > MAX_DIM) {
                        width *= MAX_DIM / height;
                        height = MAX_DIM;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    reject(new Error("Failed to get canvas context"));
                    return;
                }

                // Draw and resize
                ctx.drawImage(img, 0, 0, width, height);

                // Apply Smart Cropping (4:5 Aspect Ratio)
                let processedCanvas = heuristicSmartCrop(canvas);

                // 2. Convert to WebP with 0.85 quality for better detail retention
                const base64 = processedCanvas.toDataURL("image/webp", 0.85);

                // Calculate size in bytes from base64 approx
                const size = Math.round((base64.length * 3) / 4);

                resolve({
                    base64,
                    metadata: { width: processedCanvas.width, height: processedCanvas.height, size }
                });
            };
            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = event.target?.result as string;
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
    });
}

/**
 * Basic heuristic for smart cropping: centers the subject in a 4:5 aspect ratio
 * common for fashion photography, reducing "dead space" that wastes tokens.
 * Bias: We keep 30% from the top (preserving the head) if vertical cropping is needed.
 */
export function heuristicSmartCrop(canvas: HTMLCanvasElement): HTMLCanvasElement {
    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas;

    const width = canvas.width;
    const height = canvas.height;
    
    // Target 4:5 Aspect Ratio
    const targetAspect = 4 / 5;
    const currentAspect = width / height;

    let sourceX = 0, sourceY = 0, sourceWidth = width, sourceHeight = height;

    if (currentAspect > targetAspect) {
        // Too wide, crop sides (keep center)
        sourceWidth = height * targetAspect;
        sourceX = (width - sourceWidth) / 2;
    } else if (currentAspect < targetAspect) {
        // Too tall, crop top/bottom (keep top 30% to preserve faces)
        sourceHeight = width / targetAspect;
        // Bias: Instead of (height - sourceHeight) / 2, we use a 0.3 factor
        // This keeps the top of the person (face/head)
        sourceY = (height - sourceHeight) * 0.3;
    } else {
        return canvas; // Already correct
    }

    const newCanvas = document.createElement("canvas");
    newCanvas.width = sourceWidth;
    newCanvas.height = sourceHeight;
    const newCtx = newCanvas.getContext("2d");
    if (!newCtx) return canvas;

    newCtx.drawImage(canvas, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);
    return newCanvas;
}
