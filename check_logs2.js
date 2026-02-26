const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
    const { data, error } = await supabase.from('usage_logs').insert([{
        method: 'POST',
        path: '/api/generate-demo',
        status: 200,
        latency: '3000ms',
        error_message: JSON.stringify({
            result_url: 'demo-result',
            input_images: ['test1', 'test2']
        })
    }]);
    console.log("INSERT RES:", data, error);
}
check();
