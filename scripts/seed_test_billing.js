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

async function seedTransaction() {
    const email = 'droutfit.ai@gmail.com';
    console.log(`Finding user with email: ${email}...`);

    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
        console.error("User not found");
        return;
    }

    console.log(`Found user ID: ${user.id}. Seeding 2 test transactions...`);

    const { error: seedError } = await supabase.from('transactions').insert([
        {
            user_id: user.id,
            amount: 5.33,
            type: 'CREDITS',
            status: 'succeeded',
            description: 'Starter Pack (100 Images)',
            created_at: new Date(Date.now() - 86400000 * 2).toISOString() // 2 days ago
        },
        {
            user_id: user.id,
            amount: 30.00,
            type: 'CREDITS',
            status: 'succeeded',
            description: 'Popular Pack (1000 Images)',
            created_at: new Date().toISOString()
        }
    ]);

    if (seedError) {
        console.error("Seed Error:", seedError.message);
    } else {
        console.log("Successfully seeded 2 transactions! Refresh your dashboard now.");
    }
}

seedTransaction();
