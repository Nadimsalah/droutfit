-- Migration to add missing columns for Virtual Try-On rate limiting
alter table public.usage_logs add column if not exists ip_address text;
alter table public.profiles add column if not exists ip_limit integer default 5;
