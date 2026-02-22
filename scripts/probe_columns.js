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

async function listAllColumns() {
    // We can't easily query information_schema from the client, 
    // but we can try to select a row and see what metadata we get
    // or just try to select from likely old columns.

    const candidates = ['id', 'full_name', 'credits', 'created_at', 'first_name', 'last_name', 'store_name'];
    console.log("Probing columns in 'profiles'...");

    for (const col of candidates) {
        const { error } = await supabase.from('profiles').select(col).limit(1);
        if (!error) {
            console.log(`✅ Column exists: ${col}`);
        } else {
            console.log(`❌ Column missing: ${col} (${error.message})`);
        }
    }
}

listAllColumns();
