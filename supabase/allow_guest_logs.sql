-- ==========================================
-- ALLOW GUEST LOGGING (LANDING PAGE DEMO)
-- ==========================================

-- 1. Make user_id nullable in usage_logs so guest/demo attempts can be recorded
ALTER TABLE public.usage_logs ALTER COLUMN user_id DROP NOT NULL;

-- 2. Optional: Add a comment to the table
COMMENT ON COLUMN public.usage_logs.user_id IS 'UUID of the user. Can be NULL for Guest/Demo attempts from landing page.';
