
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.log("Missing Supabase env vars")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debug() {
    try {
        console.log("--- Checking Users ---")
        const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()
        if (authError) throw authError
        console.log(`Total users returned current page: ${users.length}`)

        const { count, error: countError } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
        if (countError) throw countError
        console.log(`Total profiles count: ${count}`)

        console.log("\n--- Checking verification_codes table ---")
        const { data: tableData, error: tableError } = await supabase.from('verification_codes').select('*').limit(1)
        if (tableError) {
            console.log("verification_codes table error:", tableError.message)
        } else {
            console.log("verification_codes table exists and is accessible")
        }

        console.log("\n--- Checking Resend Key Presence ---")
        console.log("RESEND_API_KEY present:", !!process.env.RESEND_API_KEY)

    } catch (e) {
        console.error("Debug failed:", e.message)
    }
}

debug()
