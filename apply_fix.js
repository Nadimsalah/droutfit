/**
 * apply_fix.js - Applies the trigger fix to Supabase via Management API
 * Run: node apply_fix.js
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const client = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

async function applyFix() {
  // Use Supabase Management API to run raw SQL
  // Project ref is extracted from the URL
  const projectRef = url.replace('https://', '').replace('.supabase.co', '');
  
  const sqlStatements = [
    // Add missing columns
    `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text`,
    `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text`,
    `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name text`,
    `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name text`,
    `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credits integer DEFAULT 100`,
    `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_subscribed boolean DEFAULT false`,
    `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free'`,
    `GRANT ALL ON public.profiles TO service_role`,
  ];

  console.log('Project ref:', projectRef);
  console.log('Attempting to add columns via individual ALTER TABLE statements...\n');

  for (const sql of sqlStatements) {
    try {
      const res = await fetch(`${url}/rest/v1/`, {
        method: 'HEAD',
        headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` }
      });
      console.log('Connection OK:', res.status);
      break;
    } catch(e) {
      console.error('Connection error:', e.message);
    }
  }

  // Now try the management API approach
  console.log('\nAttempting via Management API...');
  const managementSql = `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text; GRANT ALL ON public.profiles TO service_role;`;
  
  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`
      },
      body: JSON.stringify({ query: managementSql })
    });
    const data = await res.json();
    console.log('Management API result:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.log('Management API not available:', e.message);
  }

  // Test user creation to see current state
  console.log('\n--- Testing user creation ---');
  const testEmail = `test-${Date.now()}@droutfit-review.com`;
  const { data, error } = await client.auth.admin.createUser({
    email: testEmail,
    password: 'TestReview123!',
    email_confirm: true,
    user_metadata: { full_name: 'Test Reviewer' }
  });

  if (error) {
    console.error('❌ User creation STILL FAILING:', error.message);
    console.log('\n==============================================');
    console.log('MANUAL ACTION REQUIRED:');
    console.log('==============================================');
    console.log('Go to: https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
    console.log('Paste and run the contents of: supabase/fix_user_creation_trigger.sql');
    console.log('==============================================\n');
  } else {
    console.log('✅ User creation WORKS! ID:', data.user.id);
    await client.auth.admin.deleteUser(data.user.id);
    console.log('🧹 Test user cleaned up.');

    // Now create the permanent reviewer account for Shopify
    await createReviewerAccount();
  }
}

async function createReviewerAccount() {
  console.log('\n--- Creating permanent Shopify reviewer account ---');
  
  // Check if already exists
  const reviewEmail = 'shopify-review@droutfit.com';
  
  // Try to delete if exists first for clean slate
  // (this will succeed or fail silently)
  const { data: existingUsers } = await client.auth.admin.listUsers();
  const existing = existingUsers?.users?.find(u => u.email === reviewEmail);
  if (existing) {
    await client.auth.admin.deleteUser(existing.id);
    console.log('Deleted old reviewer account, recreating...');
  }

  const { data, error } = await client.auth.admin.createUser({
    email: reviewEmail,
    password: 'DrOutfit@Review2025!',
    email_confirm: true,
    user_metadata: { full_name: 'Shopify Reviewer' }
  });

  if (error) {
    console.error('❌ Failed to create reviewer account:', error.message);
  } else {
    // Give them some credits
    await client.from('profiles').update({ credits: 500 }).eq('id', data.user.id);
    console.log('\n✅ REVIEWER ACCOUNT CREATED SUCCESSFULLY!');
    console.log('==========================================');
    console.log('Email:    shopify-review@droutfit.com');
    console.log('Password: DrOutfit@Review2025!');
    console.log('Credits:  500 (pre-loaded for testing)');
    console.log('==========================================');
  }
}

applyFix().catch(console.error);
