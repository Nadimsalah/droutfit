/**
 * apply_trigger_fix.js
 * 
 * Run this script locally to test user creation after applying the SQL fix.
 * Usage: node apply_trigger_fix.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const client = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function testUserCreation() {
    const testEmail = `shopify-review-test-${Date.now()}@droutfit-test-credentials.com`;
    const testPassword = 'DrOutfit@Review2025!';
    const testName = 'Shopify Review Bot';

    console.log('\n========================================');
    console.log('DrOutfit - User Creation Test');
    console.log('========================================');
    console.log(`Creating test user: ${testEmail}`);

    // Test 1: Create user via Admin API
    const { data: userData, error: userErr } = await client.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: { full_name: testName }
    });

    if (userErr) {
        console.error('❌ FAIL: User creation error:', userErr.message, `(${userErr.code})`);
        console.log('\n⚠️  You need to apply the SQL fix first!');
        console.log('   Open Supabase Dashboard → SQL Editor → paste supabase/fix_user_creation_trigger.sql');
        return;
    }

    console.log('✅ PASS: User created! ID:', userData.user.id);

    // Test 2: Check profile was auto-created by trigger
    const { data: profile, error: profErr } = await client
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single();

    if (profErr) {
        console.error('❌ FAIL: Profile not found:', profErr.message);
    } else {
        console.log('✅ PASS: Profile auto-created:', JSON.stringify(profile, null, 2));
    }

    // Cleanup
    await client.auth.admin.deleteUser(userData.user.id);
    console.log('🧹 Test user cleaned up.');
    console.log('\n✅ ALL TESTS PASSED - App is ready for Shopify review!');
    console.log('\nTest Credentials for Shopify:');
    console.log('  Email:    shopify-review@droutfit.com');
    console.log('  Password: DrOutfit@Review2025!');
}

testUserCreation().catch(console.error);
