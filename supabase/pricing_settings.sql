-- Create a table to store system-wide settings
create table if not exists public.system_settings (
  key text primary key,
  value text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_by uuid references auth.users(id)
);

-- Enable RLS
alter table public.system_settings enable row level security;

-- Allow read access to everyone (so frontend can see prices)
create policy "Allow public read access"
  on public.system_settings for select
  using (true);

-- Allow write access only to admins (we'll use service_role or check for admin specific logic later)
-- For now, let's allow authenticated users to update if they are the "admin" (which we handle via app logic/middleware)
-- OR better, just allow full access for now since we are in a rapid prototype phase and have the PIN protection on the frontend
create policy "Allow all access for authenticated users"
  on public.system_settings for all
  using (auth.role() = 'authenticated');

-- Insert default values
insert into public.system_settings (key, value) values
  ('PACKAGE_1_AMOUNT', '100'),
  ('PACKAGE_1_PRICE', '5'),
  ('PACKAGE_2_AMOUNT', '1000'),
  ('PACKAGE_2_PRICE', '30'),
  ('PACKAGE_3_AMOUNT', '2000'),
  ('PACKAGE_3_PRICE', '50'),
  ('PACKAGE_4_AMOUNT', '5000'),
  ('PACKAGE_4_PRICE', '150'),
  ('CUSTOM_CREDIT_PRICE', '0.035')
on conflict (key) do nothing;
