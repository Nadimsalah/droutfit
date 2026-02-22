import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || "");

export async function POST(req: NextRequest) {
    try {
        const { base64Image, bucketName = "tryimages" } = await req.json();

        if (!base64Image) {
            return NextResponse.json({ error: "Missing image data" }, { status: 400 });
        }

        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        const fileName = `upload_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

        const { error } = await supabaseAdmin.storage
            .from(bucketName)
            .upload(fileName, buffer, {
                contentType: "image/jpeg",
                upsert: true
            });

        if (error) {
            throw new Error(error.message);
        }

        const { data: urlData } = supabaseAdmin.storage
            .from(bucketName)
            .getPublicUrl(fileName);

        return NextResponse.json({ url: urlData.publicUrl });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
    }
}
