-- Create new user with desired credentials
INSERT INTO users (id, name, email, password_hash, role, is_active, created_at, updated_at) 
VALUES (
  uuid_generate_v4(),
  'Wakili Geoffrey Langat',
  'wakili.langat@leelra.ke',
  '$2b$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'SUPER_ADMIN',
  true,
  NOW(),
  NOW()
);
