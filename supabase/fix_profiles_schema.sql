-- ==========================================
-- FIX ADMIN DASHBOARD SCHEMA (Run this to fix "column does not exist" errors)
-- ==========================================

-- 1. Add missing columns safely
do $$
begin
  -- Add email if missing
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'email') then
    alter table public.profiles add column email text;
  end if;

  -- Add created_at if missing
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'created_at') then
    alter table public.profiles add column created_at timestamp with time zone default now();
  end if;
end $$;

-- 2. Update Sync Function to include created_at
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name, created_at)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.created_at -- Sync creation time from auth
  )
  on conflict (id) do update
  set email = excluded.email,
      first_name = excluded.first_name,
      last_name = excluded.last_name;
  return new;
end;
$$ language plpgsql security definer;

-- 3. Backfill Data (including default created_at for existing rows if null)
insert into public.profiles (id, email, first_name, last_name, created_at)
select 
  id, 
  email, 
  raw_user_meta_data->>'first_name', 
  raw_user_meta_data->>'last_name',
  created_at
from auth.users
on conflict (id) do update
set email = excluded.email,
    created_at = excluded.created_at;
