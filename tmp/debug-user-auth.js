
const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugUser(emailToFind) {
    console.log("--- Searching for User:", emailToFind, "---");

    try {
        // 1. Try direct find
        const { data: { users }, error } = await supabase.auth.admin.listUsers({
            perPage: 1000
        });

        if (error) throw error;

        const user = users.find(u => u.email?.toLowerCase() === emailToFind.toLowerCase());

        if (user) {
            console.log("User found in Auth!", {
                id: user.id,
                email: user.email,
                last_sign_in: user.last_sign_in_at
            });
        } else {
            console.log("User NOT found in Auth list (first 1000).");
            console.log("Total users in this page:", users.length);

            // Try to find if user exists at all in profiles
            const { data: profile, error: pError } = await supabase
                .from('profiles')
                .select('id, email')
                .ilike('email', emailToFind)
                .single();

            if (profile) {
                console.log("User exists in 'profiles' table but NOT in Auth list users!", profile);
            } else {
                console.log("User NOT found in profiles either.");
            }
        }

    } catch (e) {
        console.error("Debug failed:", e.message)
    }
}

// Search for the user's email from the screenshot/metadata
debugUser('salaheddinenadim@gmail.com');
