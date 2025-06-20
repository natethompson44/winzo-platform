-- WINZO Platform - Odds API Integration Migration
-- This script adds support for live sports data from The Odds API

-- Add Odds API support to sports_events table
ALTER TABLE sports_events ADD COLUMN IF NOT EXISTS external_id VARCHAR(255) UNIQUE;
ALTER TABLE sports_events ADD COLUMN IF NOT EXISTS commence_time TIMESTAMP;
ALTER TABLE sports_events ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;
ALTER TABLE sports_events ADD COLUMN IF NOT EXISTS last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE sports_events ADD COLUMN IF NOT EXISTS home_score INTEGER;
ALTER TABLE sports_events ADD COLUMN IF NOT EXISTS away_score INTEGER;

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_sports_events_external_id ON sports_events(external_id);
CREATE INDEX IF NOT EXISTS idx_sports_events_commence_time ON sports_events(commence_time);
CREATE INDEX IF NOT EXISTS idx_sports_events_completed ON sports_events(completed);
CREATE INDEX IF NOT EXISTS idx_sports_events_last_update ON sports_events(last_update);

-- Create bookmakers table to store sportsbook information
CREATE TABLE IF NOT EXISTS bookmakers (
  id SERIAL PRIMARY KEY,
  key VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(100) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  region VARCHAR(10) DEFAULT 'us',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert common US bookmakers
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

-- Enhance odds table to support multiple bookmakers and market types
ALTER TABLE odds ADD COLUMN IF NOT EXISTS bookmaker_id INTEGER REFERENCES bookmakers(id);
ALTER TABLE odds ADD COLUMN IF NOT EXISTS market_type VARCHAR(20) NOT NULL DEFAULT 'h2h';
ALTER TABLE odds ADD COLUMN IF NOT EXISTS outcome_name VARCHAR(100);
ALTER TABLE odds ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);
ALTER TABLE odds ADD COLUMN IF NOT EXISTS last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add indexes for odds table performance
CREATE INDEX IF NOT EXISTS idx_odds_bookmaker_id ON odds(bookmaker_id);
CREATE INDEX IF NOT EXISTS idx_odds_market_type ON odds(market_type);
CREATE INDEX IF NOT EXISTS idx_odds_last_update ON odds(last_update);
CREATE INDEX IF NOT EXISTS idx_odds_sports_event_id ON odds(sports_event_id);

-- Add comments for documentation
COMMENT ON TABLE bookmakers IS 'Stores information about sportsbooks/bookmakers from The Odds API';
COMMENT ON COLUMN sports_events.external_id IS 'External ID from The Odds API for event synchronization';
COMMENT ON COLUMN odds.market_type IS 'Type of betting market: h2h (moneyline), spreads, totals, outrights';
COMMENT ON COLUMN odds.price IS 'Odds price in American format (e.g., +150, -200)';

-- Create transactions table for financial tracking
CREATE TABLE IF NOT EXISTS transactions (
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

-- Create indexes for transactions table
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_reference_id ON transactions(reference_id);

-- Add comments for documentation
COMMENT ON TABLE transactions IS 'Financial transaction history for users';
COMMENT ON COLUMN transactions.amount IS 'Positive for credits, negative for debits';
COMMENT ON COLUMN transactions.reference_id IS 'Reference to bet ID or other related record';
COMMENT ON COLUMN transactions.balance_after IS 'User balance after this transaction';
