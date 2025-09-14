-- Create admin_settings table for managing system configuration
CREATE TABLE IF NOT EXISTS admin_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default recommendation count setting
INSERT INTO admin_settings (key, value) 
VALUES ('recommendation_count', 1)
ON CONFLICT (key) DO NOTHING;

-- Add RLS policies
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (you may want to restrict this to admin users)
CREATE POLICY "Allow all operations on admin_settings" ON admin_settings
FOR ALL USING (true);
