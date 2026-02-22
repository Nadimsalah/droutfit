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

async function checkSystemSettings() {
    const { data, error } = await supabase.from('system_settings').select('*');
    if (error) {
        console.error("System Settings Error:", error.message);
    } else {
        console.log("System Settings Count:", data.length);
        console.log("Values:", JSON.stringify(data, null, 2));
    }
}

checkSystemSettings();
