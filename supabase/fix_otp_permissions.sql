-- 1. Ensure the verification_codes table exists with correct structure
create table if not exists public.verification_codes (
    id uuid default gen_random_uuid() primary key,
    email text not null,
    code text not null,
    expires_at timestamp with time zone not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Drop existing policies to start fresh and avoid "already exists" errors
drop policy if exists "Enable insert for all users" on public.verification_codes;
drop policy if exists "Enable select for verification" on public.verification_codes;
drop policy if exists "Enable delete for verification" on public.verification_codes;
drop policy if exists "Service role only" on public.verification_codes;

-- 3. Enable RLS
alter table public.verification_codes enable row level security;

-- 4. Create "SUPER PERMISSIVE" policies for the OTP flow 
-- These allow the frontend/anon key to manage codes without needing a secret key

-- Allow anyone to request a code
create policy "public_insert_otp" 
on public.verification_codes 
for insert 
with check (true);

-- Allow anyone to check a code (necessary for verification)
create policy "public_select_otp" 
on public.verification_codes 
for select 
using (true);

-- Allow anyone to delete a code (necessary for cleanup after use)
create policy "public_delete_otp" 
on public.verification_codes 
for delete 
using (true);

-- 5. Grant permissions to the anon and authenticated roles
grant all on public.verification_codes to anon;
grant all on public.verification_codes to authenticated;
grant all on public.verification_codes to service_role;
