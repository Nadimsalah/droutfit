-- ==========================================
-- Shopify Mandatory GDPR Compliance Logs
-- Run this in Supabase SQL Editor
-- ==========================================

-- Create the compliance_logs table
CREATE TABLE IF NOT EXISTS public.compliance_logs (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    type        text NOT NULL,           -- e.g. 'customers/data_request', 'customers/redact', 'shop/redact'
    shop_domain text,
    shop_id     text,
    customer_id text,
    payload     jsonb,                   -- full webhook payload for audit
    received_at timestamptz NOT NULL DEFAULT NOW(),
    created_at  timestamptz NOT NULL DEFAULT NOW()
);

-- Index for fast lookups by shop
CREATE INDEX IF NOT EXISTS compliance_logs_shop_domain_idx ON public.compliance_logs (shop_domain);
CREATE INDEX IF NOT EXISTS compliance_logs_type_idx        ON public.compliance_logs (type);
CREATE INDEX IF NOT EXISTS compliance_logs_received_at_idx ON public.compliance_logs (received_at DESC);

-- Enable RLS
ALTER TABLE public.compliance_logs ENABLE ROW LEVEL SECURITY;

-- Only service_role (backend) can read/write — no public access
DROP POLICY IF EXISTS "service_role_all" ON public.compliance_logs;
CREATE POLICY "service_role_all" ON public.compliance_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Grant service_role full access
GRANT ALL ON public.compliance_logs TO service_role;

-- Verify
SELECT 'compliance_logs table ready' AS status, COUNT(*) AS existing_rows
FROM public.compliance_logs;
