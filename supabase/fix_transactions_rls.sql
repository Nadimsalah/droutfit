-- Allow public read access to transactions (Fix for Admin Dashboard)
-- Safe version: Drops existing policies first to avoid "policy already exists" errors.

drop policy if exists "Authenticated users can view all transactions" on public.transactions;
drop policy if exists "Users can view own transactions" on public.transactions;
drop policy if exists "Allow public read access" on public.transactions;

create policy "Allow public read access"
  on public.transactions for select
  using (true);

-- Ensure insert is still restricted.
-- You can keep existing insert policies.
