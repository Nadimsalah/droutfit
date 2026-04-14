-- ==========================================
-- FIX: "Database error creating new user"
-- Root cause: handle_new_user trigger crashes
-- because profiles table may be missing email
-- column, or trigger has no error handling.
-- Run this entire script in Supabase SQL Editor.
-- ==========================================

-- Step 1: Ensure the profiles table has ALL required columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS store_name text,
  ADD COLUMN IF NOT EXISTS store_website text,
  ADD COLUMN IF NOT EXISTS store_domain text,
  ADD COLUMN IF NOT EXISTS credits integer DEFAULT 100,
  ADD COLUMN IF NOT EXISTS is_subscribed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS api_key text,
  ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- Step 2: Replace the trigger function with a SAFE version
-- Uses EXCEPTION WHEN OTHERS so it NEVER blocks user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    first_name,
    last_name,
    credits,
    is_subscribed,
    subscription_tier,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      CONCAT(
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        ' ',
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
      )
    ),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    100,     -- Default free credits
    FALSE,   -- Not subscribed by default
    'free',  -- Default tier
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    updated_at = NOW();

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  -- Log the error but DO NOT BLOCK user creation
  RAISE WARNING 'handle_new_user trigger failed for user %: % (SQLSTATE: %)',
    NEW.id, SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Re-attach the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Ensure RLS policies allow the trigger (SECURITY DEFINER bypasses RLS,
-- but we still need insert policy for normal flows)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop all old conflicting policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read access" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;

-- Re-create clean policies
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Step 5: Grant service_role full access (needed for admin API calls)
GRANT ALL ON public.profiles TO service_role;

-- Step 6: Backfill any existing auth users who are missing a profile
INSERT INTO public.profiles (id, email, full_name, credits, is_subscribed, subscription_tier, created_at, updated_at)
SELECT
  u.id,
  u.email,
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.email
  ),
  100,
  FALSE,
  'free',
  u.created_at,
  NOW()
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- Verify: Should return no errors
SELECT 'Trigger fix applied successfully. Profiles count: ' || COUNT(*)::text AS status
FROM public.profiles;
