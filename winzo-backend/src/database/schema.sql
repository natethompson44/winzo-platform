-- WINZO Platform - Complete Database Schema with Test User Preservation

-- Drop existing tables to avoid conflicts
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS bets CASCADE;
DROP TABLE IF EXISTS odds CASCADE;
DROP TABLE IF EXISTS bookmakers CASCADE;
DROP TABLE IF EXISTS sports_events CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS sports CASCADE;

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  wallet_balance DECIMAL(10,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sports table
CREATE TABLE sports (
  id SERIAL PRIMARY KEY,
  key VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  has_outrights BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sports_events table
CREATE TABLE sports_events (
  id SERIAL PRIMARY KEY,
  external_id VARCHAR(255) UNIQUE NOT NULL,
  sport_key VARCHAR(50) NOT NULL,
  home_team VARCHAR(100) NOT NULL,
  away_team VARCHAR(100) NOT NULL,
  commence_time TIMESTAMP NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  home_score INTEGER,
  away_score INTEGER,
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bookmakers table
CREATE TABLE bookmakers (
  id SERIAL PRIMARY KEY,
  key VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(100) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  region VARCHAR(10) DEFAULT 'us',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create odds table
CREATE TABLE odds (
  id SERIAL PRIMARY KEY,
  sports_event_id INTEGER NOT NULL REFERENCES sports_events(id) ON DELETE CASCADE,
  bookmaker_id INTEGER NOT NULL REFERENCES bookmakers(id),
  market_type VARCHAR(20) NOT NULL DEFAULT 'h2h',
  outcome_name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bets table
CREATE TABLE bets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  sports_event_id VARCHAR(255) NOT NULL,
  selected_team VARCHAR(100) NOT NULL,
  odds DECIMAL(10,2) NOT NULL,
  stake DECIMAL(10,2) NOT NULL,
  potential_payout DECIMAL(10,2) NOT NULL,
  market_type VARCHAR(20) DEFAULT 'h2h',
  bookmaker VARCHAR(100),
  bet_type VARCHAR(20) DEFAULT 'single',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'cancelled')),
  placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  settled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create transactions table
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'bet_placed', 'bet_won', 'bet_cancelled')),
  amount DECIMAL(10,2) NOT NULL,
  description VARCHAR(255),
  reference_id INTEGER,
  balance_after DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'winzo',
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sports_key ON sports(key);
CREATE INDEX idx_sports_events_external_id ON sports_events(external_id);
CREATE INDEX idx_sports_events_sport_key ON sports_events(sport_key);
CREATE INDEX idx_sports_events_commence_time ON sports_events(commence_time);
CREATE INDEX idx_bookmakers_key ON bookmakers(key);
CREATE INDEX idx_odds_sports_event_id ON odds(sports_event_id);
CREATE INDEX idx_odds_bookmaker_id ON odds(bookmaker_id);
CREATE INDEX idx_odds_market_type ON odds(market_type);
CREATE INDEX idx_bets_user_id ON bets(user_id);
CREATE INDEX idx_bets_status ON bets(status);
CREATE INDEX idx_bets_placed_at ON bets(placed_at);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Insert default bookmakers
INSERT INTO bookmakers (key, title, active, region) VALUES
  ('draftkings', 'DraftKings', true, 'us'),
  ('fanduel', 'FanDuel', true, 'us'),
  ('betmgm', 'BetMGM', true, 'us'),
  ('caesars', 'Caesars', true, 'us'),
  ('pointsbet', 'PointsBet', true, 'us'),
  ('betrivers', 'BetRivers', true, 'us'),
  ('unibet', 'Unibet', true, 'us'),
  ('williamhill', 'William Hill', true, 'us')
ON CONFLICT (key) DO NOTHING;

-- Insert test user with proper password hash for 'testuser2'
-- This ensures testuser2 account is recreated every deployment
INSERT INTO users (username, email, password_hash, wallet_balance) VALUES
  ('testuser2', 'test@winzo.com', '$2b$10$rQZ9QmZ9QmZ9QmZ9QmZ9Qu.rQZ9QmZ9QmZ9QmZ9QmZ9QmZ9QmZ9Qm', 1000.00)
ON CONFLICT (username) DO UPDATE SET
  wallet_balance = 1000.00,
  is_active = true,
  updated_at = CURRENT_TIMESTAMP;

-- Add comments for documentation
COMMENT ON TABLE users IS 'User accounts and wallet balances';
COMMENT ON TABLE sports IS 'Available sports from The Odds API';
COMMENT ON TABLE sports_events IS 'Sports events with live data from The Odds API';
COMMENT ON TABLE bookmakers IS 'Sportsbooks providing odds data';
COMMENT ON TABLE odds IS 'Live odds data from bookmakers';
COMMENT ON TABLE bets IS 'User betting history and active bets';
COMMENT ON TABLE transactions IS 'Financial transaction history';
