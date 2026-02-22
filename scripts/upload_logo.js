const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envFile = fs.readFileSync(path.resolve(__dirname, '../.env.local'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) env[key.trim()] = value.join('=').trim();
});

const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function uploadLogo() {
    try {
        const logoPath = path.resolve(__dirname, '../logo/Droutfit logo.png');
        const fileBuffer = fs.readFileSync(logoPath);

        const { data: buckets } = await supabase.storage.listBuckets();
        let bucketName = 'tryimages'; // Default guess based on storage.ts

        const targetBucket = buckets?.find(b => b.name === 'public' || b.name === 'assets' || b.public);
        if (targetBucket) bucketName = targetBucket.name;

        console.log('Using bucket:', bucketName);

        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload('logo-black.png', fileBuffer, {
                contentType: 'image/png',
                upsert: true
            });

        if (error) {
            console.error('Upload error:', error);
            return;
        }

        const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl('logo-black.png');

        console.log('SUCCESS_URL:' + publicUrl);
    } catch (e) {
        console.error('Unexpected error:', e);
    }
}

uploadLogo();
