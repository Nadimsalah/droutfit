-- Allow public read access to products
-- This is required for the widget to display product details to unauthenticated users

-- First, check if the policy already exists to avoid errors (or drop and recreate)
drop policy if exists "Public can view products" on public.products;

-- Create the policy
create policy "Public can view products"
    on public.products for select
    using (true);
