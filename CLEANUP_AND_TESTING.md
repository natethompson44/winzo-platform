# CLEANUP & TESTING GUIDE

## 🗑️ FILES TO DELETE (Old Vanilla JS/Express Project)

These files are from the OLD project and are NO LONGER NEEDED:

### Entire Folders:
- `backend/` - OLD Express.js backend (replaced by `server/`)
- `index.html` - OLD vanilla JS frontend (replaced by `client/`)

### Individual Files:
- `package-lock.json` - npm lockfile (we use pnpm now)
- `odds.json` - old data file
- `drizzle/0000_slow_wraith.sql` - OLD MySQL migration
- `drizzle/0001_bizarre_obadiah_stane.sql` - OLD MySQL migration
- `drizzle/0002_broad_frightful_four.sql` - OLD MySQL migration
- `drizzle/0003_mute_yellowjacket.sql` - OLD MySQL migration
- `drizzle/meta/0000_snapshot.json` - OLD MySQL snapshot

### Old Scripts (in `scripts/` folder):
- `create-admin-railway.ps1` - old admin creation
- `create-admin-user.js` - old admin creation
- `create-admin-user.ps1` - old admin creation
- `create-admin-user.sql` - old SQL script
- `test-admin-creation.ps1` - old test script
- `test-admin-dashboard.js` - old test script
- `test-admin-dashboard.ps1` - old test script
- `test-analytics.ps1` - old test script
- `test-bet-slip.ps1` - old test script
- `test-deployment.ps1` - old test script
- `test-postgresql.ps1` - old test script
- `test-wallet-ui.ps1` - old test script
- `test-wallet.ps1` - old test script
- `setup-backend.ps1` - old setup script

## ✅ FILES TO KEEP (New TypeScript/React/tRPC Project)

### Core Structure:
- `server/` - NEW TypeScript backend (replaces `backend/`)
- `client/` - NEW React frontend (replaces `index.html`)
- `shared/` - Shared types and constants
- `drizzle/` - PostgreSQL schema and migrations
  - Keep: `schema.ts`, `0000_round_nighthawk.sql`, `meta/_journal.json`
  - Delete: Old MySQL migration files (see above)

### Configuration Files:
- `package.json` - Updated for new project
- `pnpm-lock.yaml` - pnpm lockfile
- `tsconfig.json` - TypeScript config
- `vite.config.ts` - Vite config
- `drizzle.config.ts` - Drizzle config (PostgreSQL)
- `components.json` - UI components config
- `railway.toml` - Updated for new build
- `netlify.toml` - NEW Netlify config
- `.env` - Environment variables (keep as-is)
- `.gitignore` - Git ignore rules

### New Scripts (in `scripts/` folder):
- `add-all-teams.mjs` - Add teams to database
- `create-owner.mjs` - Create owner account
- `seed.mjs` - Seed database
- `trigger-sync.mjs` - Trigger odds/score sync
- `update-logos.mjs` - Update team logos
- `install-dependencies.ps1` - Install dependencies
- `git-setup.ps1` - Git setup (if still needed)

### Documentation:
- `MIGRATION_PROMPT.md` - Migration guide
- `MIGRATION_ANALYSIS.md` - Migration analysis
- `NEW_CAPABILITIES_SUMMARY.md` - New features
- `README.md` - Project readme
- `ADMIN_DASHBOARD.md` - Admin docs
- `ANALYTICS_SYSTEM.md` - Analytics docs

## 🧪 HOW TO TEST LOCALLY

### Step 1: Clean Up Old Files
Run the cleanup script (see below)

### Step 2: Install Dependencies
```powershell
pnpm install
```

### Step 3: Set Up Environment
Make sure `.env` has:
- `DATABASE_URL` - Your Railway PostgreSQL URL
- `ODDS_API_KEY` - Your Odds API key
- `JWT_SECRET` - Your JWT secret
- `CORS_ORIGIN` - Your Netlify frontend URL

### Step 4: Run Database Migrations
**NOTE:** You can't run migrations locally against Railway DB. They'll run automatically on Railway deployment.

To test locally, you'd need a local PostgreSQL database, OR just deploy to Railway and let it run migrations.

### Step 5: Start Development Server
```powershell
pnpm dev
```

This will:
- Start the backend server on port 3000
- Start Vite dev server for frontend
- Auto-reload on changes

### Step 6: Test in Browser
Open: `http://localhost:3000`

You should see:
- React frontend loads
- Can navigate to `/login` or `/custom-login`
- Can create account and login
- Backend API responds at `/api/health`

## 🚀 DEPLOYMENT STRUCTURE

### Railway (Backend)
- **Entry Point:** `server/_core/index.ts`
- **Build Command:** `pnpm install && pnpm build`
- **Start Command:** `pnpm start`
- **Output:** `dist/index.js`
- **Config:** `railway.toml`

### Netlify (Frontend)
- **Build Command:** `pnpm install && pnpm build`
- **Publish Directory:** `dist/public`
- **Config:** `netlify.toml`

## 📁 PROJECT STRUCTURE EXPLANATION

```
Site/
├── client/              # React frontend (NEW)
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── components/ # UI components
│   │   └── main.tsx    # Entry point
│   └── index.html      # HTML template
│
├── server/              # TypeScript backend (NEW)
│   ├── _core/          # Core server files
│   │   ├── index.ts    # Server entry point
│   │   ├── context.ts  # tRPC context
│   │   └── env.ts      # Environment config
│   ├── routers.ts      # tRPC routers
│   ├── db.ts           # Database functions
│   ├── auth.ts         # Authentication
│   └── customAuth.ts   # Custom auth routes
│
├── shared/              # Shared code (NEW)
│   └── _core/
│       └── errors.ts   # Error definitions
│
├── drizzle/             # Database schema (UPDATED)
│   ├── schema.ts       # PostgreSQL schema
│   └── 0000_round_nighthawk.sql  # Migration file
│
└── scripts/             # Utility scripts
    ├── create-owner.mjs      # Create owner account
    ├── add-all-teams.mjs     # Add teams
    └── trigger-sync.mjs      # Trigger sync
```

## ⚠️ IMPORTANT NOTES

1. **Old `backend/` folder** - DELETE IT. It's replaced by `server/`
2. **Old `index.html`** - DELETE IT. Frontend is now in `client/`
3. **Database migrations** - Will run automatically on Railway deployment
4. **Local testing** - Requires Railway DB URL (can't test migrations locally)
5. **Build process** - Frontend builds to `dist/public`, backend builds to `dist/`


