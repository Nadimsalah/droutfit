const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    // There isn't a direct way to get schema via JS client easily without SQL
    // But we can try to insert a dummy record and see what columns are available or query a single record
    const { data, error } = await supabase.from('usage_logs').select('*').limit(1);

    if (error) {
        console.error("Error fetching logs:", error);
    } else if (data && data.length > 0) {
        console.log("Columns in usage_logs:", Object.keys(data[0]));
    } else {
        console.log("No records in usage_logs. Cannot determine columns via select.");
        // Try a different approach if no data
        const { data: colData, error: colError } = await supabase.rpc('get_table_info', { t_name: 'usage_logs' });
        if (colError) {
            console.log("RPC get_table_info failed (expected if not exists).");
        } else {
            console.log("Column Info:", colData);
        }
    }
}

checkSchema();
