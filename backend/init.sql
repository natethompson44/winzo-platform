-- WINZO Database Schema
-- This file contains the SQL schema for the WINZO PostgreSQL database
-- Run this script to initialize the database tables

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    balance NUMERIC(10,2) DEFAULT 1000.00,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create bets table
CREATE TABLE IF NOT EXISTS bets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    match VARCHAR(255) NOT NULL,
    team VARCHAR(255) NOT NULL,
    odds NUMERIC(5,2) NOT NULL,
    stake NUMERIC(10,2) NOT NULL,
    potential_payout NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) CHECK (type IN ('deposit', 'withdraw')),
    amount NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_created_at ON bets(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- Insert sample data for testing (optional)
-- Uncomment the following lines to add test data

-- INSERT INTO users (email, password_hash, balance) VALUES 
-- ('test@winzo.com', '$2a$10$example_hash', 1000.00);

-- INSERT INTO bets (user_id, match, team, odds, stake, potential_payout) VALUES 
-- (1, 'Cowboys vs Eagles', 'Cowboys', 1.85, 50.00, 92.50);

-- INSERT INTO transactions (user_id, type, amount) VALUES 
-- (1, 'deposit', 100.00);
