const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
    const { data: logs } = await supabase.from('usage_logs').select('user_id').limit(5);
    console.log("LOG USER IDs:", logs.map(l => l.user_id));

    if (logs && logs.length > 0) {
        const uids = [...new Set(logs.map(l => l.user_id))].filter(Boolean);
        console.log("UNIQUE UIDs:", uids);
        const { data: profiles, error } = await supabase.from('profiles').select('id, full_name, email').in('id', uids);
        if (error) console.error("PROFILES ERR:", error);
        console.log("PROFILES:", profiles);
    }
}
check();
