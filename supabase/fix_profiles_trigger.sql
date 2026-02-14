-- ==========================================
-- FIX MISSING PROFILES (User Management)
-- ==========================================

-- 1. Create Handle New User Trigger
-- This ensures every new signup automatically gets a profile entry.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid conflict
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Backfill Existing Users
-- If you already have users who signed up before this trigger,
-- this command will create profile entries for them.
insert into public.profiles (id, email, first_name, last_name)
select 
  id, 
  email, 
  raw_user_meta_data->>'first_name', 
  raw_user_meta_data->>'last_name'
from auth.users
on conflict (id) do nothing;

-- 3. Allow Public Read on Profiles (Already sent, but good to ensure)
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
drop policy if exists "Allow public read access" on public.profiles;
create policy "Allow public read access"
  on public.profiles for select
  using (true);
