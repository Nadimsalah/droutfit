import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testUpload() {
    const buffer = Buffer.from('test string');
    const fileName = `test_${Date.now()}.txt`;

    const { data, error } = await supabase.storage
        .from('tryimages')
        .upload(fileName, buffer, {
            contentType: 'text/plain',
            upsert: true
        });

    if (error) {
        console.error('Upload failed:', error);
    } else {
        console.log('Upload success:', data);
    }
}

testUpload();
