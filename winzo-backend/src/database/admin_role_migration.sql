-- Add admin role field to users table
-- This migration adds a role field to the users table to support admin functionality

-- Add the role column with ENUM type
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(10) DEFAULT 'user';

-- Create an index for better performance on role queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Update any existing admin users (if you have a specific admin account)
-- Uncomment and modify the following line if you have a specific admin user
-- UPDATE users SET role = 'admin' WHERE username = 'admin' OR email = 'admin@winzo.com';

-- Create a sample admin user (optional - remove in production)
-- INSERT INTO users (username, email, password_hash, role, wallet_balance, is_active, created_at, updated_at)
-- VALUES ('admin', 'admin@winzo.com', '$2b$10$samplehashhere', 'admin', 1000.00, true, NOW(), NOW())
-- ON CONFLICT (username) DO NOTHING;

-- Verify the changes
SELECT column_name, data_type, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role'; 