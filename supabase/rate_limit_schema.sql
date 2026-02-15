-- Add ip_limit to profiles with a default of 5
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'ip_limit') then
    alter table public.profiles add column ip_limit integer default 5;
  end if;
end $$;

-- Ensure usage_logs has ip_address column
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'usage_logs' and column_name = 'ip_address') then
    alter table public.usage_logs add column ip_address text;
  end if;
end $$;
