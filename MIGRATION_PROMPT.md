# Complete Migration Prompt: Current Site → Reference Project

## Overview
This prompt will guide the complete migration from the current vanilla JS/Express project to the modern TypeScript/React/tRPC reference project, ensuring zero breaking changes and maintaining all existing functionality while upgrading the architecture.

## NEW CAPABILITIES IN REFERENCE PROJECT

The reference project includes significant new features that must be properly migrated:

### 1. **Custom Authentication System**
- Username/password authentication (not just OAuth)
- JWT-based sessions with secure cookies
- User suspension checking
- Password hashing with bcrypt
- Login/logout endpoints at `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`

### 2. **Betting Limits System**
- Per-bet limits per user
- Daily betting limits
- Weekly betting limits
- Automatic enforcement on bet placement
- User suspension checking

### 3. **Automatic Odds Synchronization**
- Scheduled odds sync every 5 minutes
- Fetches from The Odds API automatically
- Creates/updates games in database
- Maps sports to API keys (NFL, NBA, MLB, NHL)
- Runs automatically on server start

### 4. **Automatic Score Synchronization**
- Fetches scores from ESPN API
- Automatically settles bets when games complete
- Updates game status to "completed"
- Credits winnings to user wallets automatically
- Runs every 5 minutes

### 5. **Enhanced User Management**
- Username/password instead of email-based auth
- User suspension system (suspended field)
- Three-tier role system: user, agent, owner
- Betting limits per user (daily, weekly, per-bet)
- Password change functionality

### 6. **Enhanced Admin Features**
- User management (create, update role, suspend users)
- Wallet management (set balance, adjust balance)
- Activity monitoring (view all transactions)
- User details view with full betting/transaction history
- Betting limits management per user

### 7. **Enhanced Database Schema**
- `username` field (unique, required)
- `password` field (hashed with bcrypt)
- `suspended` field (0 = active, 1 = suspended)
- `dailyLimit`, `weeklyLimit`, `perBetLimit` fields
- Role enum: `user`, `agent`, `owner` (not just user/admin)

### 8. **New Utility Scripts**
- `add-all-teams.mjs` - Add all teams for sports
- `create-owner.mjs` - Create owner user account
- `trigger-sync.mjs` - Manually trigger odds/score sync
- `update-logos.mjs` - Update team logos

### 9. **New Frontend Pages**
- `CustomLogin.tsx` - Custom username/password login page
- `Login.tsx` - Alternative login page

## Pre-Migration Checklist

### 1. Backup Current State
- [ ] Commit all current changes to git
- [ ] Create a backup branch: `git checkout -b backup-pre-migration`
- [ ] Document current environment variables
- [ ] Note current Railway and Netlify URLs

### 2. Environment Variables to Preserve
```
PORT=3000
ODDS_API_KEY=ae09b5ce0e57ca5b0ae4ccd0f852ba12
JWT_SECRET=ZRC3xah6pcrrnr7mdu
NODE_ENV=production
CORS_ORIGIN=https://winzo-sports.netlify.app
DATABASE_URL=<from Railway PostgreSQL>
```

---

## Phase 1: Copy Reference Project Files

### Step 1.1: Copy Core Project Structure
Copy the following from `C:\Users\Natha\OneDrive\Documents\_Projects\winzo\_winzo-sports-betting_v2_REFERENCE`:

**Essential Files:**
- `package.json` → Update with PostgreSQL dependencies
- `tsconfig.json`
- `vite.config.ts`
- `drizzle.config.ts` → Update for PostgreSQL
- `components.json`
- `pnpm-lock.yaml` (or convert to npm if preferred)

**Directories:**
- `client/` → Entire directory
- `server/` → Entire directory
- `shared/` → Entire directory
- `drizzle/` → Entire directory (will convert schema)
- `patches/` → Entire directory
- `scripts/` → Merge with existing scripts

### Step 1.2: Preserve Current Project Files
Keep these from current project:
- `.env` → Will merge values
- `.gitignore` → Merge with reference project's
- `railway.toml` → Update for new build process
- `render.yaml` → Keep for alternative deployment
- `scripts/` → Merge PowerShell scripts

---

## Phase 2: Database Schema Conversion (MySQL → PostgreSQL)

### Step 2.1: Convert Drizzle Schema
**File: `drizzle/schema.ts`**

Convert from MySQL to PostgreSQL:
- `mysqlTable()` → `pgTable()`
- `int().autoincrement()` → `serial()` or `integer().generatedAlwaysAsIdentity()`
- `mysqlEnum()` → `pgEnum()` or `varchar()` with CHECK constraint
- `timestamp()` → PostgreSQL-compatible timestamp
- `text()` → `text()` (same)
- `varchar()` → `varchar()` (same)
- `decimal()` → `numeric()` or `decimal()`
- `boolean()` → `boolean()` (same)

**CRITICAL: New Schema Fields**
The reference project has enhanced user schema with:
- `username` (unique, required) - replaces email-based auth
- `password` (hashed with bcrypt) - for custom authentication
- `suspended` (integer: 0 = active, 1 = suspended)
- `dailyLimit`, `weeklyLimit`, `perBetLimit` (integers, 0 = no limit)
- Role enum: `user`, `agent`, `owner` (not just user/admin)

**Key Changes:**
```typescript
// OLD (MySQL)
import { mysqlTable, int, mysqlEnum, timestamp } from "drizzle-orm/mysql-core";

// NEW (PostgreSQL)
import { pgTable, serial, pgEnum, timestamp, integer, varchar, text } from "drizzle-orm/pg-core";

// Example conversion - users table with new fields:
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: text("name"),
  role: pgEnum("role", ["user", "agent", "owner"]).default("user").notNull(),
  suspended: integer("suspended").default(0).notNull(), // 0 = active, 1 = suspended
  dailyLimit: integer("dailyLimit").default(0), // 0 = no limit
  weeklyLimit: integer("weeklyLimit").default(0), // 0 = no limit
  perBetLimit: integer("perBetLimit").default(0), // 0 = no limit
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});
```

### Step 2.2: Update Drizzle Config
**File: `drizzle.config.ts`**
```typescript
import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql", // Changed from "mysql"
  dbCredentials: {
    url: connectionString,
  },
});
```

### Step 2.3: Update Database Connection
**File: `server/db.ts`**

Change from MySQL to PostgreSQL:
```typescript
import { drizzle } from "drizzle-orm/postgres-js"; // Changed from mysql2
import postgres from "postgres"; // New import

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
```

### Step 2.4: Update Package Dependencies
**File: `package.json`**

Remove MySQL dependencies, add PostgreSQL and new dependencies:
```json
{
  "dependencies": {
    // Remove: "mysql2": "^3.15.0",
    // Add:
    "postgres": "^3.4.3",
    "drizzle-orm": "^0.44.5", // Ensure PostgreSQL support
    "bcrypt": "^6.0.0", // For password hashing (already in reference)
    "jsonwebtoken": "^9.0.2", // For JWT tokens (already in reference)
    "axios": "^1.12.2" // For ESPN API calls (score sync)
  },
  "devDependencies": {
    "@types/bcrypt": "^6.0.0",
    "@types/jsonwebtoken": "^9.0.10"
  }
}
```

---

## Phase 3: Authentication Adaptation

### Step 3.1: Custom Authentication System

**The reference project includes a complete custom authentication system:**
- Username/password authentication (not email-based)
- JWT-based sessions with secure cookies
- User suspension checking
- Password hashing with bcrypt
- Login/logout endpoints at `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`

**The system is already implemented in:**
- `server/auth.ts` - Password hashing and user authentication
- `server/customAuth.ts` - Express routes for login/logout/me
- `server/_core/context.ts` - JWT verification from cookies
- `client/src/pages/CustomLogin.tsx` - Login UI

### Step 3.2: Verify Custom Auth Routes
**File: `server/_core/index.ts`**

Ensure custom auth routes are registered:
```typescript
import { registerCustomAuthRoutes } from "../customAuth";

// In startServer function:
registerCustomAuthRoutes(app);
```

### Step 3.3: Update Environment Variables
**File: `server/_core/env.ts`**

Ensure JWT secret is configured:
```typescript
export const ENV = {
  // ... other vars
  jwtSecret: process.env.JWT_SECRET ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "", // Same as jwtSecret
};
```

### Step 3.4: Frontend Authentication
**The reference project uses cookie-based auth by default.**

If you need to maintain localStorage-based auth from current project:
- Update `client/src/pages/CustomLogin.tsx` to store token in localStorage
- Update `server/_core/context.ts` to also check Authorization header
- Update tRPC client to send token in headers

**However, cookie-based auth is more secure and recommended.**

---

## Phase 4: Environment Configuration

### Step 4.1: Update Environment Variables
**File: `server/_core/env.ts`**

Ensure all required variables are defined:
```typescript
export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  oddsApiKey: process.env.ODDS_API_KEY ?? "",
  corsOrigin: process.env.CORS_ORIGIN ?? "https://winzo-sports.netlify.app",
};
```

### Step 4.2: Create/Update .env File
Merge current `.env` with reference project requirements:
```env
# Railway Variables
PORT=3000
ODDS_API_KEY=ae09b5ce0e57ca5b0ae4ccd0f852ba12
JWT_SECRET=ZRC3xah6pcrrnr7mdu
NODE_ENV=production
CORS_ORIGIN=https://winzo-sports.netlify.app
DATABASE_URL=postgresql://postgres:hMEupuOslZHxriyGRMzbfbqHovdQGWLA@postgres.railway.internal:5432/railway

# Optional OAuth (can be added later)
OAUTH_SERVER_URL=
OWNER_OPEN_ID=
VITE_APP_ID=
```

---

## Phase 5: Backend Configuration

### Step 5.1: Update Server Entry Point
**File: `server/_core/index.ts`**

Ensure CORS is properly configured and schedulers are started:
```typescript
import cors from "cors";
import { startOddsSyncScheduler } from "../oddsSync";
import { startScoreSyncScheduler } from "../scoreSync";
import { registerCustomAuthRoutes } from "../customAuth";

app.use(cors({
  origin: ENV.corsOrigin,
  credentials: true,
}));

// Register custom auth routes
registerCustomAuthRoutes(app);

// In server.listen callback:
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}/`);
  
  // Start automatic odds synchronization (every 5 minutes)
  startOddsSyncScheduler();
  
  // Start automatic score synchronization (every 5 minutes)
  startScoreSyncScheduler();
});
```

### Step 5.2: Update Odds API Integration
**File: `server/oddsApi.ts`**

Verify it uses the correct API key from environment:
```typescript
const API_KEY = process.env.ODDS_API_KEY;
```

### Step 5.3: Automatic Synchronization Systems

**Odds Sync (`server/oddsSync.ts`):**
- Automatically fetches odds from The Odds API every 5 minutes
- Creates new games and updates existing ones
- Maps sports to API keys (NFL, NBA, MLB, NHL)
- Runs on server start and continues in background

**Score Sync (`server/scoreSync.ts`):**
- Automatically fetches scores from ESPN API every 5 minutes
- Settles bets when games complete
- Updates game status and credits winnings
- Runs on server start and continues in background

**Both systems start automatically - no additional configuration needed.**

### Step 5.3: Update Railway Configuration
**File: `railway.toml`**

Update for new build process:
```toml
[build]
builder = "nixpacks"
buildCommand = "pnpm install && pnpm build"

[deploy]
startCommand = "pnpm start"
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "on_failure"

[env]
NODE_ENV = "production"
```

---

## Phase 6: Frontend Configuration

### Step 6.1: Update API Base URL
**File: `client/src/lib/trpc.ts` or create new file**

Ensure tRPC client points to Railway backend:
```typescript
import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../../server/routers";

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // Browser
    return window.location.hostname === 'localhost'
      ? 'http://localhost:3000'
      : 'https://winzo-platform-production-d306.up.railway.app';
  }
  return 'https://winzo-platform-production-d306.up.railway.app';
};

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      credentials: 'include',
    }),
  ],
});
```

### Step 6.2: Create Netlify Configuration
**File: `netlify.toml`** (new file)

```toml
[build]
  command = "pnpm install && pnpm build"
  publish = "dist/public"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "20"
```

### Step 6.3: Update Vite Config for Production
**File: `vite.config.ts`**

Ensure build output is correct:
```typescript
build: {
  outDir: path.resolve(import.meta.dirname, "dist/public"),
  emptyOutDir: true,
}
```

---

## Phase 7: Package Management

### Step 7.1: Update package.json Scripts
Ensure scripts are correct:
```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx watch server/_core/index.ts",
    "build": "vite build && esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "check": "tsc --noEmit",
    "format": "prettier --write .",
    "test": "vitest run",
    "db:push": "drizzle-kit generate && drizzle-kit migrate"
  }
}
```

### Step 7.2: Install Dependencies
```bash
# If using pnpm (reference project uses pnpm)
pnpm install

# OR if using npm
npm install
```

---

## Phase 8: Database Migration

### Step 8.1: Generate Drizzle Migrations
```bash
pnpm db:push
# or
npm run db:push
```

### Step 8.2: Verify Schema
Check that all tables are created correctly in PostgreSQL:
- users (with username, password, suspended, limits fields)
- sports
- teams
- games
- wallets
- transactions
- bets
- parlayLegs

### Step 8.3: Run Utility Scripts
**Add Teams:**
```bash
node scripts/add-all-teams.mjs
```

**Create Owner Account:**
```bash
node scripts/create-owner.mjs
# Follow prompts to create owner user
```

**Update Team Logos (Optional):**
```bash
node scripts/update-logos.mjs
```

### Step 8.4: Seed Initial Data (Optional)
If reference project has seed script:
```bash
pnpm run seed
# or check scripts/seed.mjs
```

### Step 8.5: Migrate Existing Users (If Any)
If you have existing users in the current database, you'll need to:
1. Convert email-based users to username-based
2. Set default passwords (users will need to reset)
3. Migrate roles (admin → owner or agent)
4. Set default betting limits (0 = no limit)

---

## Phase 9: Testing & Validation

### Step 9.1: Local Testing
1. Start backend: `pnpm dev`
2. Verify server starts on port 3000
3. Check `/api/health` endpoint
4. Test database connection
5. Verify tRPC endpoints accessible
6. **Verify odds sync starts** (check console logs)
7. **Verify score sync starts** (check console logs)

### Step 9.2: Frontend Testing
1. Build frontend: `pnpm build`
2. Test production build locally
3. Verify all routes work
4. Test custom login page (`/login` or `/custom-login`)
5. Test authentication flow
6. Test betting functionality

### Step 9.3: Authentication Testing
1. **Test username/password login** via `/api/auth/login`
2. **Test logout** via `/api/auth/logout`
3. **Test /api/auth/me** endpoint
4. Verify JWT cookies are set correctly
5. Test user suspension (if applicable)

### Step 9.4: Betting Limits Testing
1. Create test user with betting limits
2. Test per-bet limit enforcement
3. Test daily limit enforcement
4. Test weekly limit enforcement
5. Test suspended user cannot bet

### Step 9.5: Integration Testing
1. Test user registration/login
2. Test wallet deposit/withdrawal
3. Test bet placement (with limits)
4. Test parlay bets
5. Test admin features (user management, wallet management)
6. Test odds fetching (should be automatic)
7. **Test automatic odds sync** (wait 5 minutes or trigger manually)
8. **Test automatic score sync** (wait 5 minutes or trigger manually)

### Step 9.6: Manual Sync Testing
**Trigger odds sync manually:**
```bash
node scripts/trigger-sync.mjs
```

**Verify:**
- Games are created/updated in database
- Odds are current
- Teams are matched correctly

---

## Phase 10: Deployment

### Step 10.1: Railway Backend Deployment
1. Push changes to git
2. Railway should auto-deploy
3. Verify build succeeds
4. Check logs for errors
5. Test `/api/health` endpoint
6. Verify database connection

### Step 10.2: Netlify Frontend Deployment
1. Connect Netlify to repository
2. Set build command: `pnpm install && pnpm build`
3. Set publish directory: `dist/public`
4. Add environment variables if needed
5. Deploy and verify
6. Test frontend → backend communication

### Step 10.3: CORS Verification
Ensure CORS is working:
- Frontend can call backend API
- Cookies/tokens are sent correctly
- No CORS errors in browser console

---

## Phase 11: Cleanup

### Step 11.1: Remove Old Files
After successful migration, remove:
- `backend/` directory (old Express routes)
- `index.html` (old vanilla JS frontend)
- Old route files if not needed

### Step 11.2: Update Documentation
- Update README.md
- Update deployment docs
- Document new architecture
- Update API documentation

---

## Rollback Plan

If migration fails:

1. **Git Rollback:**
   ```bash
   git checkout backup-pre-migration
   git branch -D main
   git checkout -b main
   ```

2. **Database Rollback:**
   - Keep old database intact
   - Can recreate from old schema if needed

3. **Deployment Rollback:**
   - Railway: Revert to previous deployment
   - Netlify: Revert to previous deployment

---

## Success Criteria

Migration is successful when:
- ✅ Backend deploys to Railway successfully
- ✅ Frontend deploys to Netlify successfully
- ✅ Database schema is created correctly
- ✅ User registration/login works
- ✅ Betting functionality works
- ✅ Wallet functionality works
- ✅ Admin features work
- ✅ Odds API integration works
- ✅ No console errors
- ✅ All routes accessible
- ✅ CORS configured correctly

---

## Post-Migration Tasks

1. **Update Cursor Rules**
   - Create new rules for TypeScript/React/tRPC stack
   - Remove old vanilla JS rules

2. **Performance Optimization**
   - Monitor bundle sizes
   - Optimize images/assets
   - Check loading times

3. **Feature Parity Check**
   - Verify all old features work
   - Test new features
   - Document any differences

4. **User Testing**
   - Test with real users
   - Gather feedback
   - Fix any issues

---

## Notes

- This migration maintains all existing functionality
- Database schema is enhanced, not replaced
- Authentication can be gradually migrated
- All environment variables are preserved
- Deployment URLs remain the same
- Zero downtime if done correctly

---

## Execution Order

Execute phases in this exact order:
1. Phase 1: Copy files
2. Phase 2: Database conversion
3. Phase 3: Authentication
4. Phase 4: Environment
5. Phase 5: Backend config
6. Phase 6: Frontend config
7. Phase 7: Package management
8. Phase 8: Database migration
9. Phase 9: Testing
10. Phase 10: Deployment
11. Phase 11: Cleanup

Do not skip phases or execute out of order.

