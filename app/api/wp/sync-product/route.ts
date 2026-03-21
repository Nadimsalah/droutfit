import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
    try {
        const { merchant_id, external_id, name, image } = await req.json();

        if (!merchant_id || !external_id || !image) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        let userId = merchant_id;

        // If merchant_id is an API Key, resolve it to the actual UUID
        if (merchant_id.startsWith('dr_')) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('api_key', merchant_id)
                .single();
            if (profile) {
                userId = profile.id;
            } else {
                return NextResponse.json({ error: "Invalid API Key or Merchant ID" }, { status: 401 });
            }
        }

        // Try to find if this product already exists for this merchant 
        // We'll store the WordPress ID in a 'metadata' field if it exists, or use 'store_url' as a temporary key
        // Format for store_url to identify WP products: wp_product:[merchant_id]:[external_id]

        const wpKey = `wp_product:${userId}:${external_id}`;

        const { data: existingProduct, error: findError } = await supabase
            .from('products')
            .select('*')
            .eq('store_url', wpKey)
            .single();

        if (existingProduct) {
            return NextResponse.json({ success: true, product: existingProduct });
        }

        // Create the product
        const { data: newProduct, error: insertError } = await supabase
            .from('products')
            .insert([{
                user_id: userId,
                name: name || "WordPress Product",
                image: image,
                store_url: wpKey,
                usage: 0
            }])
            .select()
            .single();

        if (insertError) {
            console.error('Error creating WP product in DrOutfit:', insertError);
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, product: newProduct });
    } catch (error: any) {
        console.error('WP Sync Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
