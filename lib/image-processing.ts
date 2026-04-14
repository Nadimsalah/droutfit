"use client";

/**
 * Reads an image file and returns it as full-quality base64.
 * No resizing, no cropping, no recompression.
 * The original file bytes are sent directly to the AI model.
 */
export async function optimizeImageForGemini(
    file: File
): Promise<{ base64: string; metadata: { width: number; height: number; size: number } }> {
    return new Promise((resolve, reject) => {
        // Step 1: Read original dimensions (for metadata only, no canvas manipulation)
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            const width = img.width;
            const height = img.height;
            URL.revokeObjectURL(objectUrl);

            // Step 2: Read the original file as base64 — zero quality loss
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target?.result as string;
                const size = file.size;
                resolve({ base64, metadata: { width, height, size } });
            };
            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.readAsDataURL(file); // keeps original format & quality
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Failed to load image"));
        };

        img.src = objectUrl;
    });
}

/**
 * @deprecated — No longer used. Kept for reference only.
 * Smart cropping was removed because it cuts parts of the person's body,
 * causing the AI model to produce incorrect try-on results.
 */
export function heuristicSmartCrop(canvas: HTMLCanvasElement): HTMLCanvasElement {
    return canvas;
}
