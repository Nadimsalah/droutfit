-- Table to store verification codes
create table if not exists public.verification_codes (
    id uuid default gen_random_uuid() primary key,
    email text not null,
    code text not null,
    expires_at timestamp with time zone not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for cleanup and lookup
create index if not exists verification_codes_email_idx on public.verification_codes (email);

-- RLS
alter table public.verification_codes enable row level security;

-- Allow public to request codes (Insert)
create policy "Enable insert for all users" 
on public.verification_codes 
for insert 
with check (true);

-- Allow public to verify codes (Select)
create policy "Enable select for verification" 
on public.verification_codes 
for select 
using (true);

-- Allow public to cleanup their own codes (Delete)
create policy "Enable delete for verification" 
on public.verification_codes 
for delete 
using (true);
