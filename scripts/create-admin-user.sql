-- SQL Query to create admin user
-- Run this in Railway Dashboard -> PostgreSQL -> Query tab

-- Create admin user with hashed password for "admin123"
INSERT INTO users (email, password_hash, balance, is_admin) 
VALUES ('admin@winzo.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1000.00, true)
ON CONFLICT (email) DO UPDATE SET 
    is_admin = true, 
    password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

-- Verify the user was created
SELECT id, email, is_admin, balance FROM users WHERE email = 'admin@winzo.com';


