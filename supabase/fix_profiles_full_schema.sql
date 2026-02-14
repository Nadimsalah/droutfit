-- ==========================================
-- FIX MISSING COLUMNS (Credits & Subscription)
-- ==========================================

-- 1. Add 'credits' and 'is_subscribed' to profiles
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'credits') then
    alter table public.profiles add column credits integer default 0;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'is_subscribed') then
    alter table public.profiles add column is_subscribed boolean default false;
  end if;
  
  -- Also add subscription_tier key just in case we need it later
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'subscription_tier') then
    alter table public.profiles add column subscription_tier text default 'free';
  end if;
end $$;

-- 2. Update Sync Function (Again, to include defaults)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name, created_at, credits, is_subscribed)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    coalesce(new.created_at, now()),
    0,     -- Default credits
    false  -- Default subscription
  )
  on conflict (id) do update
  set email = excluded.email,
      first_name = excluded.first_name,
      last_name = excluded.last_name;
  return new;
end;
$$ language plpgsql security definer;

-- 3. Backfill Defaults for Existing Users
update public.profiles 
set credits = 0 
where credits is null;

update public.profiles 
set is_subscribed = false 
where is_subscribed is null;
