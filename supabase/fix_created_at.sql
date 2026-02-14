-- Simply Run this command to fix the "created_at does not exist" error.

alter table public.profiles 
add column if not exists created_at timestamp with time zone default now();

-- Update existing rows to have a default time if they are null
update public.profiles 
set created_at = now() 
where created_at is null;
