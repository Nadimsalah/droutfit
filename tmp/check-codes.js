
const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkCodes() {
    console.log("--- Checking verification_codes table ---");

    try {
        const { data, count, error } = await supabase
            .from('verification_codes')
            .select('*', { count: 'exact' });

        if (error) {
            console.error("Error querying verification_codes:", error);
        } else {
            console.log(`Table has ${count} codes.`);
            if (data && data.length > 0) {
                console.log("Latest codes (first 3):", data.slice(0, 3));
            }
        }

    } catch (e) {
        console.error("Debug failed:", e.message)
    }
}

checkCodes();
