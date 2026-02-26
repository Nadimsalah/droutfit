require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data: logs } = await supabase.from('usage_logs').select('user_id').limit(5);
    console.log("Usage logs user IDs:", logs);

    if (logs && logs.length > 0) {
        const uids = logs.map(l => l.user_id).filter(Boolean);
        const { data: profiles } = await supabase.from('profiles').select('id, full_name, store_name').in('id', uids);
        console.log("Profiles found:", profiles);
    }
}
run();
