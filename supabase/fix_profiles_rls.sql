-- Allow public read access to profiles (Fix for Admin Dashboard)
-- Safe version: Drops existing policies first.

drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
drop policy if exists "Allow public read access" on public.profiles;

create policy "Allow public read access"
  on public.profiles for select
  using (true);

-- Ensure users can still only edit their own profile
drop policy if exists "Users can update own profile." on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles; -- drop self if exists
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);
