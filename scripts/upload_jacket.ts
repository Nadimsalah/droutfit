import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env.local', 'utf-8');
const envVars = envFile.split('\n').reduce((acc, line) => {
    const [key, value] = line.split('=');
    if (key && value) acc[key.trim()] = value.trim();
    return acc;
}, {} as Record<string, string>);

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL or Key is missing');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const fileData = fs.readFileSync('public/alaska-jacket.webp');

    const { data, error } = await supabase.storage.from('tryimages').upload('alaska-jacket.webp', fileData, {
        contentType: 'image/webp',
        upsert: true
    });

    if (error) {
        console.error('Upload error:', error);
        return;
    }

    const { data: urlData } = supabase.storage.from('tryimages').getPublicUrl('alaska-jacket.webp');

    console.log('UPLOAD_SUCCESS:', urlData.publicUrl);
}

run().catch(console.error);
