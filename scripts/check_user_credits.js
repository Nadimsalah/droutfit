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

async function checkUserCredits(email) {
    console.log(`Checking credits for: ${email}`);

    // 1. Get user by email from Auth
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) return console.error('Auth Error:', authError);

    const user = users.find(u => u.email === email);
    if (!user) return console.log('User not found in Auth.');

    console.log(`Auth User ID: ${user.id}`);

    // 2. Get profile from public.profiles
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError) {
        console.error('Profile Error:', profileError);
    } else {
        console.log('Profile found:');
        console.log(`  Credits: ${profile.credits}`);
        console.log(`  Full Name: ${profile.full_name}`);
        console.log(`  Store Name: ${profile.store_name}`);
    }
}

const targetEmail = process.argv[2] || 'salaheddinenadim@gmail.com';
checkUserCredits(targetEmail);
