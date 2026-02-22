-- Allow anyone (anon) to DELETE products
-- WARNING: This allows ANYONE with the API key to delete products. 
-- Only use for local development or prototyping.
create policy "Enable delete for anon users"
on "public"."products"
as PERMISSIVE
for DELETE
to anon
using (true);

-- Allow authenticated users to DELETE products (if you implement auth later)
create policy "Enable delete for authenticated users"
on "public"."products"
as PERMISSIVE
for DELETE
to authenticated
using (true);

-- Check existing policies
select * from pg_policies where table_name = 'products';
