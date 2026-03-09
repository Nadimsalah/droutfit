-- Create system_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to settings
CREATE POLICY "Allow public read access to settings"
ON public.system_settings
FOR SELECT
TO public
USING (true);

-- Allow service role to manage settings
CREATE POLICY "Allow service role to manage settings"
ON public.system_settings
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Insert initial Landing Demo Image if not exists
INSERT INTO public.system_settings (key, value)
VALUES ('LANDING_DEMO_IMAGE', '/alaska-jacket.webp')
ON CONFLICT (key) DO NOTHING;
