-- Add tokens and cost columns to usage_logs
ALTER TABLE usage_logs 
ADD COLUMN IF NOT EXISTS tokens_used INTEGER,
ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL(10, 5);

-- Update RLS if necessary (assuming it might be needed for visibility in xdash)
-- Usually usage_logs are managed by service role or specific policies.
