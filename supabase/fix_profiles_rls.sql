-- Allow public read access to profiles (Fix for Admin Dashboard System Overview & User Management)
-- This allows the dashboard to count users and list them without being logged in as a specific user.

-- Drop existing restricted policies if they exist
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
drop policy if exists "Users can insert their own profile." on public.profiles;
drop policy if exists "Users can update own profile." on public.profiles;

-- Create public read policy
create policy "Allow public read access"
  on public.profiles for select
  using (true);

-- Keep insert/update restricted to the user themselves
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);
