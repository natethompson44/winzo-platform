# Database Initialization Guide

## Problem Summary

After the migration, the database tables were created but remained empty because:

1. **Migrations only create schema** - They don't populate data
2. **Seed scripts were MySQL-based** - The old `seed.mjs` used MySQL syntax (`onDuplicateKeyUpdate`) which doesn't work with PostgreSQL
3. **No automatic initialization** - There was no script to initialize the database with required data
4. **Sports mismatch** - The `add-all-teams.mjs` script expected sports named "Football", "Basketball", "Hockey" but the old seed used "American Football"

## What Was Fixed

### ✅ PostgreSQL Compatibility
- Fixed `seed-sports.mjs` to use PostgreSQL syntax
- Removed MySQL-specific code (`onDuplicateKeyUpdate`)
- Added proper error handling for PostgreSQL unique violations

### ✅ Role-Based Access Control
**Role-based access IS properly set up:**

1. **Schema**: `roleEnum` with values: `["user", "agent", "owner"]`
2. **Middleware**:
   - `protectedProcedure` - Requires authenticated user
   - `adminProcedure` - Requires `owner` or `agent` role
   - `ownerProcedure` - Requires `owner` role only
3. **Frontend**: Admin page checks for `owner` or `agent` role
4. **Backend**: All admin routes use `adminProcedure` or `ownerProcedure`

### ✅ Owner Account Creation
- Updated `create-owner.mjs` to create account with:
  - Username: `owner`
  - Password: `owner`
  - Role: `owner`
- Also creates a wallet for the owner

### ✅ New Initialization Scripts
Created `scripts/init-db.mjs` that:
- Creates owner account (`owner/owner`)
- Creates wallet for owner
- Provides clear next steps

## How to Initialize Database

### Option 1: Use the Setup Script (Recommended)
```bash
pnpm run db:setup
```

This runs all initialization steps in order:
1. Creates owner account and wallet
2. Seeds sports (Football, Basketball, Hockey)
3. Adds all teams (NFL, NBA, NHL)

### Option 2: Run Steps Individually
```bash
# 1. Create owner account
pnpm run db:init

# 2. Seed sports
pnpm run db:seed-sports

# 3. Add teams
pnpm run db:seed-teams
```

### Option 3: Manual Script Execution
```bash
node scripts/init-db.mjs
node scripts/seed-sports.mjs
node scripts/add-all-teams.mjs
```

## Database Schema Status

### ✅ Tables Created (via migrations)
- `users` - User accounts with roles
- `sports` - Sports (NFL, NBA, NHL)
- `teams` - Teams for each sport
- `games` - Game matchups
- `wallets` - User balances
- `transactions` - Transaction history
- `bets` - User bets
- `parlayLegs` - Parlay bet legs

### ✅ Data Population
- **Sports**: Must be seeded manually (run `seed-sports.mjs`)
- **Teams**: Must be seeded manually (run `add-all-teams.mjs`)
- **Games**: Populated automatically by odds sync scheduler (every 5 minutes)
- **Users**: Created via registration or `init-db.mjs`

## Role-Based Access Verification

### Owner Account
- **Username**: `owner`
- **Password**: `owner`
- **Role**: `owner`
- **Access**: Full admin access, can manage users, wallets, and all settings

### Role Permissions

| Role | Can Bet | Can View Admin | Can Manage Users | Can Manage Wallets | Can Change Roles |
|------|---------|----------------|------------------|-------------------|------------------|
| `user` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `agent` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `owner` | ✅ | ✅ | ✅ | ✅ | ✅ |

### Testing Role Access

1. **Login as owner**:
   ```bash
   POST /api/auth/login
   { "username": "owner", "password": "owner" }
   ```

2. **Access admin panel**: Navigate to `/admin` - should work

3. **Test owner-only endpoints**: Should have access to all admin features

## PostgreSQL Compatibility Confirmed

All scripts now use:
- ✅ `drizzle-orm/postgres-js` (not `mysql2`)
- ✅ PostgreSQL error codes (`23505` for unique violations)
- ✅ PostgreSQL-compatible syntax
- ✅ Proper connection handling with `postgres` package

## Next Steps After Initialization

1. **Verify owner account**: Login with `owner/owner`
2. **Check sports**: Should see Football, Basketball, Hockey in database
3. **Check teams**: Should see all NFL, NBA, NHL teams
4. **Wait for games**: Odds sync will populate games automatically (runs every 5 minutes)
5. **Create test users**: Use registration or admin panel

## Troubleshooting

### Tables are empty
- Run `pnpm run db:setup` to initialize data
- Check Railway logs to ensure migrations ran successfully

### Owner account doesn't work
- Verify account was created: Check `users` table
- Verify role is set to `owner`
- Check JWT_SECRET is set in environment variables

### Sports/Teams missing
- Run `pnpm run db:seed-sports`
- Run `pnpm run db:seed-teams`
- Check that sports exist before running add-all-teams

### Games not appearing
- Odds sync runs automatically every 5 minutes
- Check `ODDS_API_KEY` is set in environment variables
- Check Railway logs for sync errors

