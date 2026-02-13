-- Allow public read access to transactions (Fix for Admin Dashboard)
-- Since the admin user is not authenticated with Supabase (only PIN cookie),
-- we need to allow public read access to the transactions table for the dashboard to work.

-- Drop existing restricted policies if they exist (to be safe)
drop policy if exists "Authenticated users can view all transactions" on public.transactions;
drop policy if exists "Users can view own transactions" on public.transactions;

-- Create public read policy
create policy "Allow public read access"
  on public.transactions for select
  using (true);

-- Ensure insert is still restricted.
-- You can keep existing insert policies.
