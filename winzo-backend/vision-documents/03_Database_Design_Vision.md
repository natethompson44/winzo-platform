# 03 Database Design Vision

## Purpose
This document defines the comprehensive database architecture for Winzo's sports betting platform, establishing data models, relationships, indexing strategies, and performance optimization techniques that ensure data integrity, scalability, and high-performance query execution.

## Database Architecture Philosophy

### Core Principles
- **ACID Compliance**: Guaranteed data consistency for all financial transactions
- **Scalability**: Design that supports horizontal and vertical scaling
- **Performance**: Optimized queries and indexing for sub-50ms response times
- **Data Integrity**: Comprehensive constraints and validation at the database level
- **Audit Trail**: Complete transaction history and change tracking

### Technology Stack
- **Primary Database**: PostgreSQL 15+ for transactional data and complex queries
- **Caching Layer**: Redis 7+ for session management and high-frequency data
- **Search Engine**: PostgreSQL Full-Text Search for content discovery
- **Backup Strategy**: Point-in-time recovery with automated daily backups
- **Monitoring**: Real-time database performance monitoring and alerting

## Core Database Schema

### User Management Schema
```sql
-- Users table - Core user authentication and profile data
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'user' NOT NULL,
    status user_status DEFAULT 'active' NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT users_username_check CHECK (char_length(username) >= 3),
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')
);

-- User profiles table - Extended user information
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    phone VARCHAR(20),
    country_code CHAR(2) NOT NULL DEFAULT 'US',
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    language_code CHAR(2) DEFAULT 'en',
    currency_code CHAR(3) DEFAULT 'USD',
    verification_status verification_status DEFAULT 'unverified',
    verification_documents JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT user_profiles_age_check CHECK (
        date_of_birth IS NULL OR 
        date_of_birth <= CURRENT_DATE - INTERVAL '18 years'
    )
);

-- User preferences table - Betting and UI preferences
CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    odds_format odds_format DEFAULT 'american',
    notifications JSONB DEFAULT '{"email": true, "sms": false, "push": true}',
    betting_limits JSONB DEFAULT '{"daily": 1000, "weekly": 5000, "monthly": 20000}',
    responsible_gaming JSONB DEFAULT '{"session_timeout": 120, "reality_check": true}',
    ui_preferences JSONB DEFAULT '{"theme": "light", "language": "en"}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Custom types for user management
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator', 'support');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'banned', 'pending');
CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
CREATE TYPE odds_format AS ENUM ('american', 'decimal', 'fractional');
```

### Sports Data Schema
```sql
-- Sports table - Different sports supported
CREATE TABLE sports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    icon_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Leagues table - Leagues within sports
CREATE TABLE leagues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    country_code CHAR(2),
    season VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(sport_id, slug)
);

-- Teams table - Teams participating in leagues
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    league_id UUID REFERENCES leagues(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    abbreviation VARCHAR(10),
    slug VARCHAR(100) NOT NULL,
    logo_url VARCHAR(255),
    city VARCHAR(100),
    conference VARCHAR(50),
    division VARCHAR(50),
    founded_year INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(sport_id, slug)
);

-- Events table - Games/matches between teams
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    league_id UUID REFERENCES leagues(id) ON DELETE SET NULL,
    home_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    away_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status event_status DEFAULT 'scheduled',
    period VARCHAR(20),
    clock VARCHAR(20),
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    venue VARCHAR(200),
    weather_conditions JSONB,
    officials JSONB,
    statistics JSONB,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT events_different_teams CHECK (home_team_id != away_team_id),
    CONSTRAINT events_future_start CHECK (start_time > CURRENT_TIMESTAMP - INTERVAL '1 day')
);

-- Custom types for sports data
CREATE TYPE event_status AS ENUM (
    'scheduled', 'live', 'halftime', 'finished', 
    'postponed', 'cancelled', 'suspended'
);
```

### Betting Engine Schema
```sql
-- Markets table - Betting markets for events
CREATE TABLE markets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    type market_type NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    handicap DECIMAL(10,2),
    total_points DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    status market_status DEFAULT 'open',
    rules JSONB DEFAULT '{}',
    settlement_rules JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    settled_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(event_id, type, handicap, total_points)
);

-- Selections table - Individual betting options within markets
CREATE TABLE selections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    short_name VARCHAR(50),
    odds DECIMAL(10,4) NOT NULL,
    probability DECIMAL(5,4),
    is_active BOOLEAN DEFAULT TRUE,
    result selection_result,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT selections_odds_positive CHECK (odds > 0),
    CONSTRAINT selections_probability_valid CHECK (
        probability IS NULL OR (probability >= 0 AND probability <= 1)
    )
);

-- Bets table - Individual user bets
CREATE TABLE bets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type bet_type NOT NULL,
    status bet_status DEFAULT 'pending',
    stake DECIMAL(10,2) NOT NULL,
    total_odds DECIMAL(10,4) NOT NULL,
    potential_win DECIMAL(10,2) NOT NULL,
    actual_win DECIMAL(10,2) DEFAULT 0,
    currency_code CHAR(3) DEFAULT 'USD',
    placed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    settled_at TIMESTAMP WITH TIME ZONE,
    void_reason TEXT,
    metadata JSONB DEFAULT '{}',
    
    CONSTRAINT bets_stake_positive CHECK (stake > 0),
    CONSTRAINT bets_odds_positive CHECK (total_odds > 0),
    CONSTRAINT bets_potential_win_positive CHECK (potential_win > 0)
);

-- Bet selections table - Individual selections within a bet (for parlays)
CREATE TABLE bet_selections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bet_id UUID NOT NULL REFERENCES bets(id) ON DELETE CASCADE,
    selection_id UUID NOT NULL REFERENCES selections(id) ON DELETE CASCADE,
    odds DECIMAL(10,4) NOT NULL,
    result selection_result,
    settled_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(bet_id, selection_id),
    CONSTRAINT bet_selections_odds_positive CHECK (odds > 0)
);

-- Custom types for betting
CREATE TYPE market_type AS ENUM (
    'moneyline', 'point_spread', 'total_points', 
    'first_half', 'prop_bet', 'futures'
);

CREATE TYPE market_status AS ENUM ('open', 'suspended', 'closed', 'settled', 'voided');
CREATE TYPE bet_type AS ENUM ('single', 'parlay', 'system');
CREATE TYPE bet_status AS ENUM (
    'pending', 'accepted', 'rejected', 'settled_win', 
    'settled_loss', 'settled_push', 'cancelled', 'voided'
);
CREATE TYPE selection_result AS ENUM ('win', 'loss', 'push', 'void');
```

### Financial Schema
```sql
-- User balances table - Current account balances
CREATE TABLE user_balances (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(12,2) DEFAULT 0.00 NOT NULL,
    bonus_balance DECIMAL(12,2) DEFAULT 0.00 NOT NULL,
    pending_balance DECIMAL(12,2) DEFAULT 0.00 NOT NULL,
    currency_code CHAR(3) DEFAULT 'USD',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT user_balances_balance_non_negative CHECK (balance >= 0),
    CONSTRAINT user_balances_bonus_non_negative CHECK (bonus_balance >= 0)
);

-- Transactions table - All financial transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency_code CHAR(3) DEFAULT 'USD',
    status transaction_status DEFAULT 'pending',
    reference VARCHAR(100) UNIQUE,
    external_reference VARCHAR(100),
    description TEXT,
    payment_method_id UUID,
    related_bet_id UUID REFERENCES bets(id),
    processor_response JSONB,
    fees DECIMAL(10,2) DEFAULT 0.00,
    net_amount DECIMAL(12,2) GENERATED ALWAYS AS (amount - fees) STORED,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT transactions_amount_not_zero CHECK (amount != 0),
    CONSTRAINT transactions_fees_non_negative CHECK (fees >= 0)
);

-- Payment methods table - User payment methods
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type payment_method_type NOT NULL,
    name VARCHAR(100) NOT NULL,
    details JSONB NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Custom types for financial data
CREATE TYPE transaction_type AS ENUM (
    'deposit', 'withdrawal', 'bet_debit', 'bet_credit', 
    'bonus', 'adjustment', 'fee', 'refund'
);

CREATE TYPE transaction_status AS ENUM (
    'pending', 'processing', 'completed', 'failed', 
    'cancelled', 'reversed'
);

CREATE TYPE payment_method_type AS ENUM (
    'credit_card', 'debit_card', 'bank_transfer', 
    'e_wallet', 'cryptocurrency'
);
```

### Audit and Logging Schema
```sql
-- Audit log table - Track all significant changes
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action audit_action NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_audit_log_table_record (table_name, record_id),
    INDEX idx_audit_log_user_timestamp (user_id, timestamp),
    INDEX idx_audit_log_timestamp (timestamp)
);

-- System events table - Application events and errors
CREATE TABLE system_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    severity event_severity DEFAULT 'info',
    message TEXT NOT NULL,
    details JSONB,
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(100),
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_system_events_type_timestamp (event_type, created_at),
    INDEX idx_system_events_severity_timestamp (severity, created_at)
);

-- Custom types for audit
CREATE TYPE audit_action AS ENUM ('INSERT', 'UPDATE', 'DELETE');
CREATE TYPE event_severity AS ENUM ('debug', 'info', 'warning', 'error', 'critical');
```

## Indexing Strategy

### Primary Indexes
```sql
-- Performance-critical indexes for frequent queries
CREATE INDEX CONCURRENTLY idx_events_sport_start_time 
    ON events(sport_id, start_time) 
    WHERE status IN ('scheduled', 'live');

CREATE INDEX CONCURRENTLY idx_events_status_start_time 
    ON events(status, start_time);

CREATE INDEX CONCURRENTLY idx_markets_event_active 
    ON markets(event_id, is_active) 
    WHERE is_active = true;

CREATE INDEX CONCURRENTLY idx_selections_market_active 
    ON selections(market_id, is_active) 
    WHERE is_active = true;

CREATE INDEX CONCURRENTLY idx_bets_user_placed_at 
    ON bets(user_id, placed_at DESC);

CREATE INDEX CONCURRENTLY idx_bets_status_placed_at 
    ON bets(status, placed_at DESC);

CREATE INDEX CONCURRENTLY idx_transactions_user_created_at 
    ON transactions(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_transactions_type_status 
    ON transactions(type, status);
```

### Composite Indexes for Complex Queries
```sql
-- Multi-column indexes for specific query patterns
CREATE INDEX CONCURRENTLY idx_events_sport_league_start 
    ON events(sport_id, league_id, start_time) 
    WHERE status = 'scheduled';

CREATE INDEX CONCURRENTLY idx_markets_event_type_active 
    ON markets(event_id, type, is_active);

CREATE INDEX CONCURRENTLY idx_bets_user_status_type 
    ON bets(user_id, status, type);

-- Partial indexes for specific conditions
CREATE INDEX CONCURRENTLY idx_events_live 
    ON events(sport_id, updated_at) 
    WHERE status = 'live';

CREATE INDEX CONCURRENTLY idx_markets_open 
    ON markets(event_id, updated_at) 
    WHERE status = 'open';
```

### Full-Text Search Indexes
```sql
-- Search indexes for content discovery
CREATE INDEX CONCURRENTLY idx_teams_search 
    ON teams USING GIN(to_tsvector('english', name || ' ' || display_name));

CREATE INDEX CONCURRENTLY idx_events_search 
    ON events USING GIN(to_tsvector('english', 
        (SELECT home.name || ' vs ' || away.name 
         FROM teams home, teams away 
         WHERE home.id = events.home_team_id 
           AND away.id = events.away_team_id)));
```

## Database Performance Optimization

### Query Optimization Patterns
```sql
-- Efficient event listing with related data
CREATE OR REPLACE FUNCTION get_events_with_markets(
    p_sport_id UUID,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
    event_id UUID,
    home_team_name VARCHAR,
    away_team_name VARCHAR,
    start_time TIMESTAMP WITH TIME ZONE,
    status event_status,
    market_count BIGINT
) LANGUAGE SQL STABLE AS $$
    SELECT 
        e.id,
        ht.display_name,
        at.display_name,
        e.start_time,
        e.status,
        COUNT(m.id) as market_count
    FROM events e
    JOIN teams ht ON e.home_team_id = ht.id
    JOIN teams at ON e.away_team_id = at.id
    LEFT JOIN markets m ON e.id = m.event_id AND m.is_active = true
    WHERE e.sport_id = p_sport_id
      AND e.start_time > CURRENT_TIMESTAMP - INTERVAL '1 day'
    GROUP BY e.id, ht.display_name, at.display_name, e.start_time, e.status
    ORDER BY e.start_time
    LIMIT p_limit OFFSET p_offset;
$$;

-- Efficient user betting history
CREATE OR REPLACE FUNCTION get_user_betting_history(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 50
) RETURNS TABLE (
    bet_id UUID,
    bet_type bet_type,
    stake DECIMAL,
    total_odds DECIMAL,
    status bet_status,
    placed_at TIMESTAMP WITH TIME ZONE,
    selections JSON
) LANGUAGE SQL STABLE AS $$
    SELECT 
        b.id,
        b.type,
        b.stake,
        b.total_odds,
        b.status,
        b.placed_at,
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'selection_name', s.name,
                'odds', bs.odds,
                'result', bs.result
            ) ORDER BY bs.id
        ) as selections
    FROM bets b
    JOIN bet_selections bs ON b.id = bs.bet_id
    JOIN selections s ON bs.selection_id = s.id
    WHERE b.user_id = p_user_id
    GROUP BY b.id, b.type, b.stake, b.total_odds, b.status, b.placed_at
    ORDER BY b.placed_at DESC
    LIMIT p_limit;
$$;
```

### Connection Pooling Configuration
```sql
-- Connection pool settings for optimal performance
-- postgresql.conf optimizations
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
```

## Data Integrity and Constraints

### Referential Integrity
```sql
-- Ensure data consistency with foreign key constraints
ALTER TABLE user_profiles 
    ADD CONSTRAINT fk_user_profiles_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) 
    ON DELETE CASCADE;

ALTER TABLE events 
    ADD CONSTRAINT fk_events_home_team 
    FOREIGN KEY (home_team_id) REFERENCES teams(id) 
    ON DELETE CASCADE;

ALTER TABLE events 
    ADD CONSTRAINT fk_events_away_team 
    FOREIGN KEY (away_team_id) REFERENCES teams(id) 
    ON DELETE CASCADE;

-- Prevent betting on past events
ALTER TABLE bets 
    ADD CONSTRAINT fk_bets_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) 
    ON DELETE CASCADE;
```

### Business Logic Constraints
```sql
-- Ensure betting rules are enforced at database level
CREATE OR REPLACE FUNCTION check_bet_placement() 
RETURNS TRIGGER AS $$
BEGIN
    -- Check if user has sufficient balance
    IF (SELECT balance FROM user_balances WHERE user_id = NEW.user_id) < NEW.stake THEN
        RAISE EXCEPTION 'Insufficient balance for bet placement';
    END IF;
    
    -- Check if event is still open for betting
    IF EXISTS (
        SELECT 1 FROM events e
        JOIN markets m ON e.id = m.event_id
        JOIN selections s ON m.id = s.market_id
        JOIN bet_selections bs ON s.id = bs.selection_id
        WHERE bs.bet_id = NEW.id
          AND (e.start_time <= CURRENT_TIMESTAMP OR e.status != 'scheduled')
    ) THEN
        RAISE EXCEPTION 'Cannot bet on events that have started or are not scheduled';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_bet_placement
    BEFORE INSERT ON bets
    FOR EACH ROW
    EXECUTE FUNCTION check_bet_placement();
```

## Backup and Recovery Strategy

### Automated Backup Configuration
```sql
-- Point-in-time recovery setup
-- Enable WAL archiving
archive_mode = on
archive_command = 'cp %p /backup/archive/%f'
wal_level = replica

-- Backup script configuration
#!/bin/bash
# Daily full backup
pg_basebackup -D /backup/daily/$(date +%Y%m%d) -Ft -z -P -U backup_user

# Continuous WAL archiving
pg_receivewal -D /backup/wal -U replication_user --synchronous
```

### Recovery Procedures
```sql
-- Recovery configuration for disaster scenarios
-- recovery.conf for point-in-time recovery
restore_command = 'cp /backup/archive/%f %p'
recovery_target_time = '2024-01-01 12:00:00'
recovery_target_action = 'promote'
```

## Monitoring and Maintenance

### Performance Monitoring Queries
```sql
-- Monitor slow queries
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC
LIMIT 20;

-- Monitor index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_tup_read = 0
ORDER BY schemaname, tablename;

-- Monitor table bloat
SELECT 
    schemaname,
    tablename,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    n_dead_tup
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;
```

### Maintenance Procedures
```sql
-- Automated maintenance tasks
-- Daily VACUUM and ANALYZE
CREATE OR REPLACE FUNCTION daily_maintenance() RETURNS void AS $$
BEGIN
    -- Vacuum frequently updated tables
    VACUUM ANALYZE bets;
    VACUUM ANALYZE transactions;
    VACUUM ANALYZE selections;
    VACUUM ANALYZE user_balances;
    
    -- Update table statistics
    ANALYZE events;
    ANALYZE markets;
    ANALYZE users;
    
    -- Clean up old audit logs (keep 1 year)
    DELETE FROM audit_log 
    WHERE timestamp < CURRENT_TIMESTAMP - INTERVAL '1 year';
    
    -- Clean up old system events (keep 6 months)
    DELETE FROM system_events 
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '6 months';
END;
$$ LANGUAGE plpgsql;

-- Schedule daily maintenance
SELECT cron.schedule('daily-maintenance', '0 2 * * *', 'SELECT daily_maintenance()');
```

The database design vision ensures Winzo's sports betting platform maintains data integrity, achieves high performance, and scales effectively while supporting all business requirements and regulatory compliance needs.

