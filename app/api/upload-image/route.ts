import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || "");

export async function POST(req: NextRequest) {
    if (!supabaseServiceKey) {
        return NextResponse.json({ error: "Internal Configuration Error: SUPABASE_SERVICE_ROLE_KEY is missing." }, { status: 500 });
    }

    try {
        const { base64Image, bucketName = "tryimages" } = await req.json();

        // Security Patch: Restrict allowed buckets
        const allowedBuckets = ["tryimages", "public_assets", "avatars", "logos", "plugins"];
        if (!allowedBuckets.includes(bucketName)) {
            return NextResponse.json({ error: "Unauthorized bucket target" }, { status: 403 });
        }

        if (!base64Image || typeof base64Image !== 'string') {
            return NextResponse.json({ error: "Missing or invalid data" }, { status: 400 });
        }

        // Detect file type and extension
        let contentType = "image/jpeg";
        let extension = "jpg";

        if (base64Image.startsWith("data:application/zip;base64,")) {
            contentType = "application/zip";
            extension = "zip";
        } else if (base64Image.startsWith("data:image/png;base64,")) {
            contentType = "image/png";
            extension = "png";
        } else if (base64Image.startsWith("data:image/webp;base64,")) {
            contentType = "image/webp";
            extension = "webp";
        }

        // Pre-check: Does the bucket exist?
        const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
        const bucketExists = buckets?.some(b => b.name === bucketName);

        if (!bucketExists) {
            // Auto-create bucket if it doesn't exist (optional, but safer to check)
            await supabaseAdmin.storage.createBucket(bucketName, { public: true });
        }

        // Sanitize input
        const base64Data = base64Image.split(',')[1] || base64Image;
        const buffer = Buffer.from(base64Data, "base64");
        const fileName = `upload_${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;

        const { error } = await supabaseAdmin.storage
            .from(bucketName)
            .upload(fileName, buffer, {
                contentType: contentType,
                upsert: true
            });

        if (error) {
            console.error("Upload storage error:", error);
            throw new Error(error.message);
        }

        const { data: urlData } = supabaseAdmin.storage
            .from(bucketName)
            .getPublicUrl(fileName);

        return NextResponse.json({ url: urlData.publicUrl });
    } catch (error: any) {
        console.error("Critical upload error:", error);
        return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
    }
}
