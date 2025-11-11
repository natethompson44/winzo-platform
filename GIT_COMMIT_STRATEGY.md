# Git Commit Strategy for Migration

## Current Status
- ✅ Removed node_modules from git tracking (1099+ files)
- ✅ Old backend/ folder deleted
- ✅ Old files deleted
- ⏳ New files need to be added

## Commit Strategy

### Step 1: Stage All Changes
```powershell
git add .
```

### Step 2: Review What Will Be Committed
```powershell
git status
```

### Step 3: Commit Migration
```powershell
git commit -m "Complete migration: Vanilla JS/Express → TypeScript/React/tRPC

- Migrated backend from Express.js to TypeScript/tRPC
- Migrated frontend from vanilla JS to React
- Converted database schema from MySQL to PostgreSQL
- Added custom authentication system
- Added betting limits system
- Added automatic odds/score sync schedulers
- Updated Railway/Netlify deployment configs
- Removed old backend/ folder and index.html
- Removed node_modules from git tracking"
```

## What Will Be Committed

### New Files:
- `server/` - TypeScript backend
- `client/` - React frontend  
- `shared/` - Shared code
- `drizzle/schema.ts` - PostgreSQL schema
- `drizzle/0000_round_nighthawk.sql` - Migration file
- `netlify.toml` - Netlify config
- Updated `railway.toml` - Railway config
- Updated `package.json` - Dependencies
- Various config files (tsconfig.json, vite.config.ts, etc.)

### Deleted Files:
- `backend/` - Old Express backend
- `index.html` - Old vanilla JS frontend
- `package-lock.json` - npm lockfile
- `odds.json` - Old data file
- Old scripts
- `node_modules/` - Removed from tracking (still exists locally)

### Modified Files:
- `.gitignore` - Updated ignore rules
- `package.json` - Updated dependencies and scripts
- `railway.toml` - Updated build commands

## After Committing

1. **Push to GitHub:**
   ```powershell
   git push
   ```

2. **Railway will auto-deploy:**
   - Runs `npm install && npm run build`
   - Starts with `npm start`
   - Runs database migrations automatically

3. **Netlify will auto-deploy:**
   - Runs `npm install && npm run build`
   - Publishes `dist/public`
   - Set `VITE_API_URL` env var in Netlify dashboard


