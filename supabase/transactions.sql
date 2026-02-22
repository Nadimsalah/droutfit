-- Create transactions table
create table if not exists public.transactions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete set null,
    amount decimal(10, 2) not null,
    type text not null check (type in ('SUBSCRIPTION', 'CREDITS')),
    status text not null default 'succeeded',
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.transactions enable row level security;

-- Policies
-- Users can see their own transactions
create policy "Users can view own transactions"
    on public.transactions for select
    using (auth.uid() = user_id);

-- Admins can view all transactions (using service role or existing admin logic)
-- For now, authenticated users can insert (simulating payment webhook)
create policy "Authenticated users can insert transactions"
    on public.transactions for insert
    with check (auth.role() = 'authenticated');

create policy "Users can update own transactions"
    on public.transactions for update
    using (auth.uid() = user_id);

-- Admins can read all (simpler rule for now given our context)
create policy "Authenticated users can view all transactions"
    on public.transactions for select
    using (auth.role() = 'authenticated');
