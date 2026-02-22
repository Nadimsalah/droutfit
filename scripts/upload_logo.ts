import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function uploadLogo() {
    try {
        const logoPath = path.resolve(process.cwd(), 'logo', 'Droutfit logo.png');
        const fileBuffer = fs.readFileSync(logoPath);

        // Ensure bucket exists or use an existing one
        const { data: buckets } = await supabase.storage.listBuckets();
        const publicBucket = buckets?.find(b => b.public) || buckets?.[0];

        if (!publicBucket) {
            console.error('No storage buckets found!');
            return;
        }

        console.log('Uploading to bucket:', publicBucket.name);

        const { data, error } = await supabase.storage
            .from(publicBucket.name)
            .upload('logo-black.png', fileBuffer, {
                contentType: 'image/png',
                upsert: true
            });

        if (error) {
            console.error('Upload error:', error);
            return;
        }

        const { data: { publicUrl } } = supabase.storage
            .from(publicBucket.name)
            .getPublicUrl('logo-black.png');

        console.log('LOGO_PUBLIC_URL=' + publicUrl);
    } catch (e) {
        console.error('Unexpected error:', e);
    }
}

uploadLogo();
