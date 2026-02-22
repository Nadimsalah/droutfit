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

async function checkUser(email) {
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
        console.log("Auth User not found:", email);
        return;
    }

    console.log("Auth User found:", user.id);

    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id);

    if (profileError) {
        console.error("Profile Error:", profileError.message);
    } else {
        console.log("Profiles Found:", profiles.length);
        console.log("Profiles Data:", JSON.stringify(profiles, null, 2));
    }
}

checkUser("salaheddinenadim@gmail.com");
