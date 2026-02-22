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

async function checkVerificationCodes() {
    console.log("Checking verification_codes table...");
    const { data, error } = await supabase.from('verification_codes').select('*').limit(1);

    if (error) {
        console.error("Verification Codes Table Error:", error.message);
        if (error.message.includes("does not exist")) {
            console.log("TABLE DOES NOT EXIST. Please run verification_codes.sql in Supabase SQL Editor.");
        }
    } else {
        console.log("Verification Codes Table exists and is accessible.");
    }

    console.log("\nChecking Auth Users listable via Admin API...");
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
        console.error("Auth Admin API Error:", authError.message);
    } else {
        console.log(`Successfully listed ${users.length} users via Admin API.`);
    }
}

checkVerificationCodes();
