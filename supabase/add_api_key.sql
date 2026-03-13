-- Add api_key column to public.profiles
alter table public.profiles add column if not exists api_key text unique;

-- Generate a random API key for existing users using a shell-compatible format
-- This uses a uuid-like string as a starting point
update public.profiles 
set api_key = 'dr_' || encode(gen_random_bytes(24), 'hex')
where api_key is null;

-- Update the handle_new_user function to generate an API key for new signups
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, full_name, credits, api_key)
    values (new.id, new.raw_user_meta_data->>'full_name', 100, 'dr_' || encode(gen_random_bytes(24), 'hex'));
    return new;
end;
$$ language plpgsql security definer;

-- Add index for fast key lookups
create index if not exists idx_profiles_api_key on public.profiles(api_key);
