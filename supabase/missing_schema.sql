-- Function to decrement credits safely
create or replace function public.decrement_credits(user_id_arg uuid, amount int)
returns void
language plpgsql
security definer
as $$
begin
  update public.profiles
  set credits = credits - amount
  where id = user_id_arg and credits >= amount;
end;
$$;

-- Policies for Products (if missing)
alter table public.products enable row level security;

-- Users can view their own products
drop policy if exists "Users can view own products" on public.products;
create policy "Users can view own products"
  on public.products for select
  using (auth.uid() = user_id);

-- Public can view products (for widget) - usually managed via API but good to have if public client needs it
drop policy if exists "Public can view products" on public.products;
create policy "Public can view products"
  on public.products for select
  using (true);

-- Users can insert/update/delete their own products
drop policy if exists "Users can modify own products" on public.products;
create policy "Users can modify own products"
  on public.products for all
  using (auth.uid() = user_id);

-- Policies for Usage Logs
alter table public.usage_logs enable row level security;

-- Users can view their own logs
drop policy if exists "Users can view own logs" on public.usage_logs;
create policy "Users can view own logs"
  on public.usage_logs for select
  using (auth.uid() = user_id);

-- Only service role can insert/update logs (handled by API)
-- But if we want client logging (unlikely for usage), we'd add it here.
