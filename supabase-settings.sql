-- Create the system_settings table to store global configurations
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to settings
CREATE POLICY "Allow public read access" ON system_settings
    FOR SELECT USING (true);

-- Allow authenticated admins to update settings
-- This policy allows full access to authenticated users (Admins)
CREATE POLICY "Allow admin full access" ON system_settings
    FOR ALL USING (auth.role() = 'authenticated');

-- Initialize default values
INSERT INTO system_settings (key, value) VALUES
('PACKAGE_1_AMOUNT', '500'),
('PACKAGE_1_PRICE', '26.19'),
('PACKAGE_2_AMOUNT', '1500'),
('PACKAGE_2_PRICE', '62.29'),
('PACKAGE_3_AMOUNT', '3500'),
('PACKAGE_3_PRICE', '113.89'),
('PACKAGE_4_AMOUNT', '5000'),
('PACKAGE_4_PRICE', '150'),
('CUSTOM_CREDIT_PRICE', '0.028'),
('MINIMUM_CUSTOM_AMOUNT', '50000'),
('LANDING_DEMO_IMAGE', '/alaska-jacket.webp'),
('WP_PLUGIN_ZIP_URL', '/plugins/droutfit-try-on.zip')
ON CONFLICT (key) DO NOTHING;
