-- Create initial Super Admin user
-- Run this SQL in your Supabase SQL Editor

INSERT INTO users (
  id,
  name,
  email,
  phone,
  password_hash,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Super Admin',
  'admin@leelra.ke',
  '+254700000000',
  '$2b$12$LQv3c1yqBWVHxkd0L4kKOvGz5sVqU8sK9rLqJqKqYX', -- Password: SuperAdmin@2026
  'SUPER_ADMIN',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;
