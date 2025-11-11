# Complete Migration Prompt: Current Site → Reference Project

## Overview
This prompt will guide the complete migration from the current vanilla JS/Express project to the modern TypeScript/React/tRPC reference project, ensuring zero breaking changes and maintaining all existing functionality while upgrading the architecture.

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

**Key Changes:**
```typescript
// OLD (MySQL)
import { mysqlTable, int, mysqlEnum, timestamp } from "drizzle-orm/mysql-core";

// NEW (PostgreSQL)
import { pgTable, serial, pgEnum, timestamp, integer } from "drizzle-orm/pg-core";

// Example conversion:
// users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  // ... rest of fields
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

Remove MySQL dependencies, add PostgreSQL:
```json
{
  "dependencies": {
    // Remove: "mysql2": "^3.15.0",
    // Add:
    "postgres": "^3.4.3",
    "drizzle-orm": "^0.44.5" // Ensure PostgreSQL support
  }
}
```

---

## Phase 3: Authentication Adaptation

### Step 3.1: Choose Authentication Strategy

**Option A: Keep JWT (Recommended for Migration)**
- Simpler migration
- Maintains current auth flow
- Less breaking changes

**Option B: Migrate to OAuth + Cookies**
- More secure
- Better for production
- Requires more changes

**For this migration, we'll adapt the reference project to use JWT tokens similar to current project.**

### Step 3.2: Update Authentication Context
**File: `server/_core/context.ts`**

Adapt to read JWT from Authorization header instead of cookies:
```typescript
// Read JWT from Authorization header
const authHeader = req.headers.authorization;
const token = authHeader?.replace('Bearer ', '');

if (token) {
  try {
    const decoded = jwt.verify(token, ENV.cookieSecret);
    // Set user from decoded token
  } catch (error) {
    // Invalid token
  }
}
```

### Step 3.3: Update Frontend Auth
**File: `client/src/_core/hooks/useAuth.ts`**

Adapt to use localStorage for JWT tokens:
```typescript
// Store token in localStorage
localStorage.setItem('auth_token', token);

// Read token from localStorage
const token = localStorage.getItem('auth_token');
```

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

Ensure CORS is properly configured:
```typescript
import cors from "cors";

app.use(cors({
  origin: ENV.corsOrigin,
  credentials: true,
}));
```

### Step 5.2: Update Odds API Integration
**File: `server/oddsApi.ts`**

Verify it uses the correct API key from environment:
```typescript
const API_KEY = process.env.ODDS_API_KEY;
```

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
- users
- sports
- teams
- games
- wallets
- transactions
- bets
- parlayLegs

### Step 8.3: Seed Initial Data (Optional)
If reference project has seed script:
```bash
pnpm run seed
# or check scripts/seed.mjs
```

---

## Phase 9: Testing & Validation

### Step 9.1: Local Testing
1. Start backend: `pnpm dev`
2. Verify server starts on port 3000
3. Check `/api/health` endpoint
4. Test database connection
5. Verify tRPC endpoints accessible

### Step 9.2: Frontend Testing
1. Build frontend: `pnpm build`
2. Test production build locally
3. Verify all routes work
4. Test authentication flow
5. Test betting functionality

### Step 9.3: Integration Testing
1. Test user registration/login
2. Test wallet deposit/withdrawal
3. Test bet placement
4. Test parlay bets
5. Test admin features
6. Test odds fetching

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

