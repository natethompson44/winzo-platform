# New Capabilities in Reference Project - Migration Summary

This document summarizes all the new capabilities found in the updated reference project that need to be accounted for during migration.

## 🔐 1. Custom Authentication System

**What it is:**
- Complete username/password authentication system (not email-based)
- JWT-based sessions with secure HTTP-only cookies
- User suspension checking on login
- Password hashing with bcrypt (10 salt rounds)

**Files:**
- `server/auth.ts` - Password hashing and user authentication logic
- `server/customAuth.ts` - Express routes for `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- `server/_core/context.ts` - JWT verification from cookies
- `client/src/pages/CustomLogin.tsx` - Login UI component

**Migration Notes:**
- Already fully implemented in reference project
- Just need to ensure routes are registered in `server/_core/index.ts`
- Uses cookie-based auth (more secure than localStorage)
- JWT secret must be set in environment variables

---

## 🎯 2. Betting Limits System

**What it is:**
- Per-bet limits per user
- Daily betting limits
- Weekly betting limits
- Automatic enforcement on bet placement
- User suspension checking before allowing bets

**Files:**
- `server/bettingLimits.ts` - Limit checking logic
- `server/routers.ts` - Integrated into bet placement endpoints
- Database schema - `dailyLimit`, `weeklyLimit`, `perBetLimit` fields

**How it works:**
1. Before placing any bet, system checks:
   - Is user suspended?
   - Does bet exceed per-bet limit?
   - Would bet exceed daily limit?
   - Would bet exceed weekly limit?
2. If any check fails, bet is rejected with specific error message
3. Limits are stored in user table (0 = no limit)

**Migration Notes:**
- Schema includes new limit fields
- Logic is already integrated into bet placement
- Admin can set limits per user via admin panel

---

## 🔄 3. Automatic Odds Synchronization

**What it is:**
- Automatically fetches odds from The Odds API every 5 minutes
- Creates new games in database
- Updates existing games with new odds
- Maps sports to API keys (NFL, NBA, MLB, NHL)
- Runs continuously in background

**Files:**
- `server/oddsSync.ts` - Sync logic and scheduler
- `server/oddsApi.ts` - API client for The Odds API
- `scripts/trigger-sync.mjs` - Manual trigger script

**How it works:**
1. Scheduler starts automatically on server start
2. Every 5 minutes, fetches odds for all sports
3. Matches teams by name (fuzzy matching)
4. Creates new games or updates existing ones
5. Stores external ID for future updates

**Migration Notes:**
- Starts automatically - no configuration needed
- Requires `ODDS_API_KEY` in environment
- Teams must be added to database first (use `add-all-teams.mjs`)
- Can be manually triggered: `node scripts/trigger-sync.mjs`

---

## 📊 4. Automatic Score Synchronization

**What it is:**
- Automatically fetches scores from ESPN API every 5 minutes
- Settles bets when games complete
- Updates game status to "completed"
- Credits winnings to user wallets automatically
- Runs continuously in background

**Files:**
- `server/scoreSync.ts` - Sync logic and scheduler

**How it works:**
1. Scheduler starts automatically on server start
2. Every 5 minutes, fetches scores from ESPN API
3. Matches games by team names
4. When game is completed:
   - Updates game status
   - Determines winner
   - Settles all bets for that game
   - Credits winnings to winners' wallets
   - Creates transaction records

**Migration Notes:**
- Starts automatically - no configuration needed
- No API key required (ESPN API is public)
- Requires teams to be properly named in database
- Works automatically once games are in database

---

## 👥 5. Enhanced User Management

**What it is:**
- Username/password authentication (not email-based)
- User suspension system
- Three-tier role system: `user`, `agent`, `owner`
- Betting limits per user
- Password change functionality

**Database Schema Changes:**
```typescript
users {
  username: string (unique, required)
  password: string (hashed with bcrypt)
  suspended: integer (0 = active, 1 = suspended)
  dailyLimit: integer (0 = no limit)
  weeklyLimit: integer (0 = no limit)
  perBetLimit: integer (0 = no limit)
  role: enum ("user" | "agent" | "owner")
}
```

**Migration Notes:**
- Current project uses email-based auth - will need to migrate
- Existing users will need usernames assigned
- Passwords will need to be reset (users can't migrate hashed passwords)
- Admin role becomes "owner" or "agent"

---

## 🛠️ 6. Enhanced Admin Features

**What it is:**
- Comprehensive user management
- Wallet management
- Activity monitoring
- User details view with full history

**Admin Capabilities:**

### User Management
- Create new users
- Update user roles (user/agent/owner)
- Suspend/unsuspend users
- Set betting limits per user
- View user details with full history

### Wallet Management
- View all wallets
- Set user balance directly
- Adjust balance (add/subtract with reason)
- View all transactions

### Activity Monitoring
- View all bets across all users
- View all transactions
- Filter by user, date, type

**Files:**
- `server/routers.ts` - Admin routes (lines 354-537)
- `client/src/pages/Admin.tsx` - Admin UI

**Migration Notes:**
- All admin features are in tRPC routers
- Protected by `adminProcedure` and `ownerProcedure`
- Requires role-based access control

---

## 📝 7. Enhanced Database Schema

**New Fields in Users Table:**
- `username` - Unique username for login
- `password` - Bcrypt hashed password
- `suspended` - 0 = active, 1 = suspended
- `dailyLimit` - Daily betting limit in cents (0 = no limit)
- `weeklyLimit` - Weekly betting limit in cents (0 = no limit)
- `perBetLimit` - Per-bet limit in cents (0 = no limit)

**Role Enum:**
- Changed from `["user", "admin"]` to `["user", "agent", "owner"]`
- `owner` - Full access, can manage everything
- `agent` - Can manage users and wallets
- `user` - Standard user access

**Migration Notes:**
- Schema conversion from MySQL to PostgreSQL required
- Existing users need migration script
- Default values: suspended=0, limits=0 (no limit)

---

## 🔧 8. New Utility Scripts

**Scripts in `scripts/` directory:**

1. **`add-all-teams.mjs`**
   - Adds all teams for supported sports (NFL, NBA, MLB, NHL)
   - Must be run before odds sync can work
   - Populates teams table with proper names

2. **`create-owner.mjs`**
   - Creates owner user account
   - Interactive prompts for username, password, name
   - Sets role to "owner"

3. **`trigger-sync.mjs`**
   - Manually triggers odds synchronization
   - Useful for testing or immediate updates
   - Can be run via cron or manually

4. **`update-logos.mjs`**
   - Updates team logos
   - Optional - for visual enhancements

**Migration Notes:**
- Run `add-all-teams.mjs` before first odds sync
- Run `create-owner.mjs` to create admin account
- Other scripts are optional utilities

---

## 🎨 9. New Frontend Pages

**New Pages:**

1. **`CustomLogin.tsx`**
   - Beautiful custom login page
   - Username/password form
   - Stadium background image
   - WINZO branding

2. **`Login.tsx`**
   - Alternative login page
   - May have different styling/features

**Migration Notes:**
- Login pages are already implemented
- Just need to ensure routes are set up
- Can customize branding/styling as needed

---

## ⚙️ 10. Server Configuration Updates

**Automatic Systems:**
- Odds sync scheduler starts on server start
- Score sync scheduler starts on server start
- Both run every 5 minutes automatically

**Custom Auth Routes:**
- `/api/auth/login` - POST username/password
- `/api/auth/logout` - POST to logout
- `/api/auth/me` - GET current user

**Migration Notes:**
- Schedulers start automatically in `server/_core/index.ts`
- Custom auth routes registered via `registerCustomAuthRoutes(app)`
- No additional configuration needed

---

## 📋 Migration Checklist for New Features

### Authentication
- [ ] Verify custom auth routes are registered
- [ ] Test username/password login
- [ ] Test logout functionality
- [ ] Test user session persistence
- [ ] Test user suspension

### Betting Limits
- [ ] Verify limit fields in database schema
- [ ] Test per-bet limit enforcement
- [ ] Test daily limit enforcement
- [ ] Test weekly limit enforcement
- [ ] Test suspended user cannot bet

### Automatic Sync
- [ ] Verify odds sync scheduler starts
- [ ] Verify score sync scheduler starts
- [ ] Test manual odds sync trigger
- [ ] Verify games are created/updated
- [ ] Verify bets are auto-settled

### User Management
- [ ] Migrate existing users to username-based
- [ ] Set default passwords (users reset)
- [ ] Migrate roles (admin → owner/agent)
- [ ] Set default betting limits

### Admin Features
- [ ] Test user creation
- [ ] Test role updates
- [ ] Test user suspension
- [ ] Test wallet management
- [ ] Test activity monitoring

---

## 🚀 Quick Start After Migration

1. **Add Teams:**
   ```bash
   node scripts/add-all-teams.mjs
   ```

2. **Create Owner:**
   ```bash
   node scripts/create-owner.mjs
   ```

3. **Trigger Initial Sync:**
   ```bash
   node scripts/trigger-sync.mjs
   ```

4. **Verify:**
   - Check console logs for sync messages
   - Verify games appear in database
   - Test login with owner account
   - Test betting with limits

---

## 📚 Additional Notes

- All new features are already implemented in reference project
- Migration mainly involves:
  - Schema conversion (MySQL → PostgreSQL)
  - Environment variable configuration
  - Running utility scripts
  - Testing all features

- No code changes needed for most features
- Just configuration and testing required

