create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    full_name text,
    first_name text,
    last_name text,
    store_name text,
    store_website text,
    store_domain text,
    credits integer default 5,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

create policy "Users can view their own profile" on public.profiles
    for select using (auth.uid() = id);

create policy "Users can insert their own profile" on public.profiles
    for insert with check (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
    for update using (auth.uid() = id);

-- 2. Products Table
create table if not exists public.products (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users on delete cascade not null,
    name text,
    image text not null,
    store_url text,
    usage integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on products
alter table public.products enable row level security;

-- Products Policies
create policy "Users can manage their own products" on public.products
    for all using (auth.uid() = user_id);

create policy "Public can view products" on public.products
    for select using (true);

-- 3. Usage Logs Table
create table if not exists public.usage_logs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users on delete cascade not null,
    method text,
    path text,
    status integer,
    latency text,
    error_message text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on usage_logs
alter table public.usage_logs enable row level security;

-- Usage Logs Policies
create policy "Users can view their own logs" on public.usage_logs
    for select using (auth.uid() = user_id);

-- 4. Trigger to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, full_name, credits)
    values (new.id, new.raw_user_meta_data->>'full_name', 5);
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();
