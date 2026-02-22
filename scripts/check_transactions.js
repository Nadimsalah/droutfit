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

async function checkTransactions() {
    console.log("Checking transactions table...");
    const { data, error } = await supabase.from('transactions').select('*').limit(5);

    if (error) {
        console.error("Transactions Table Error:", error.message);
    } else {
        console.log(`Transactions Table exists. Found ${data.length} recent transactions.`);
        console.log(JSON.stringify(data, null, 2));
    }
}

checkTransactions();
