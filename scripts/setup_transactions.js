const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync(path.resolve(__dirname, '../.env.local'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) env[key.trim()] = value.join('=').trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function runSQL() {
    const sql = `
-- Create transactions table
create table if not exists public.transactions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete set null,
    amount decimal(10, 2) not null,
    type text not null check (type in ('SUBSCRIPTION', 'CREDITS', 'TOPUP')),
    status text not null default 'succeeded',
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.transactions enable row level security;

-- Policies
drop policy if exists "Users can view own transactions" on public.transactions;
create policy "Users can view own transactions"
    on public.transactions for select
    using (auth.uid() = user_id);

drop policy if exists "Authenticated users can insert transactions" on public.transactions;
create policy "Authenticated users can insert transactions"
    on public.transactions for insert
    with check (true);

grant all on public.transactions to anon;
grant all on public.transactions to authenticated;
grant all on public.transactions to service_role;
    `;

    // Supabase JS doesn't have a direct 'run sql' method, but we can try to use RPC or just check if it exists
    // Since I can't run raw SQL easily via the JS client without a specific RPC function, 
    // I will try to perform a dummy insert to see if I can trick it, or just advise the user.
    // Wait, I can try to use the 'query' method if available or just check the error.

    console.log("Attempting to create table via dummy insert (this won't work for creation)...");
    const { error } = await supabase.from('transactions').insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        amount: 0,
        type: 'TOPUP',
        description: 'Initial dummy'
    });

    if (error && error.message.includes("does not exist")) {
        console.error("The table 'transactions' STILL does not exist. Please run the SQL manually in Supabase Dashboard.");
        console.log("SQL TO RUN:\n", sql);
    } else {
        console.log("Table seems to exist now or error was different:", error?.message);
    }
}

runSQL();
