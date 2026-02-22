const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync(path.resolve(__dirname, '../.env.local'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) env[key.trim()] = value.join('=').trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function listTables() {
    const { data, error } = await supabase.rpc('get_tables'); // If a custom RPC exists
    if (error) {
        // Try information_schema if possible (often blocked)
        const { data: qData, error: qError } = await supabase.from('verification_codes').select('*').limit(1);
        console.log('Verification codes accessible:', !!qData);
        console.log('Error listing tables usually requires SQL editor, but let\'s try selecting from a few likely candidates.');

        const candidates = ['users', 'user_profiles', 'accounts', 'inquiries', 'products', 'usage_logs'];
        for (const table of candidates) {
            const { error: e } = await supabase.from(table).select('*').limit(1);
            if (!e) console.log(`Table exists: ${table}`);
            else console.log(`Table missing or inaccessible: ${table} (${e.message})`);
        }
    }
}

listTables();
