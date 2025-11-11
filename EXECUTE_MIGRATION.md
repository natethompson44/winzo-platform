# Execute Migration: Current Site → Reference Project

## Quick Start Prompt

Copy and paste this prompt to execute the complete migration:

---

**"Execute the complete migration from the current vanilla JS/Express project to the TypeScript/React/tRPC reference project located at `C:\Users\Natha\OneDrive\Documents\_Projects\winzo\_winzo-sports-betting_v2_REFERENCE`. Follow MIGRATION_PROMPT.md exactly, ensuring:**

1. **Preserve all existing functionality** - no breaking changes
2. **Convert MySQL schema to PostgreSQL** - adapt Drizzle schema for Railway PostgreSQL with new fields (username, password, suspended, betting limits)
3. **Maintain Railway/Netlify deployment** - keep existing URLs and configuration
4. **Migrate all environment variables** - preserve .env values
5. **Implement custom authentication** - username/password with JWT cookies (already in reference project)
6. **Set up automatic systems** - odds sync and score sync schedulers
7. **Configure betting limits** - per-bet, daily, weekly limits system
8. **Test each phase** - verify before proceeding to next phase
9. **Commit to git** - capture all changes in git history

**NEW CAPABILITIES TO MIGRATE:**
- Custom username/password authentication (not email-based)
- Betting limits system (per-bet, daily, weekly)
- Automatic odds synchronization (every 5 minutes)
- Automatic score synchronization (every 5 minutes)
- Enhanced user management (suspension, roles: user/agent/owner)
- Enhanced admin features (user management, wallet management, activity monitoring)

**Execute phases in this order:**
- Phase 1: Copy reference project files
- Phase 2: Convert database schema (MySQL → PostgreSQL) with new fields
- Phase 3: Verify custom authentication system
- Phase 4: Configure environment variables
- Phase 5: Update backend configuration (including schedulers)
- Phase 6: Configure frontend (Netlify build)
- Phase 7: Install dependencies (including bcrypt, axios)
- Phase 8: Run database migrations and utility scripts
- Phase 9: Test locally (auth, betting limits, sync systems)
- Phase 10: Deploy and verify

**Critical requirements:**
- Zero breaking changes
- All existing features must work
- Database migration must include new schema fields
- Custom authentication must work
- Betting limits must be enforced
- Automatic sync systems must start
- Railway backend must deploy successfully
- Netlify frontend must build and deploy
- CORS must be properly configured
- All API endpoints must work

**If any step fails, stop and report the issue before proceeding.**"

---

## Alternative: Step-by-Step Execution

If you prefer to execute one phase at a time, use these prompts:

### Phase 1: Copy Files
"Execute Phase 1 from MIGRATION_PROMPT.md: Copy all reference project files to current project, preserving existing .env, railway.toml, and scripts directory."

### Phase 2: Database Conversion
"Execute Phase 2 from MIGRATION_PROMPT.md: Convert Drizzle schema from MySQL to PostgreSQL, update drizzle.config.ts, and modify server/db.ts to use PostgreSQL connection."

### Phase 3: Authentication
"Execute Phase 3 from MIGRATION_PROMPT.md: Verify custom authentication system (username/password with JWT cookies) is properly configured. The reference project already includes this - ensure routes are registered and environment variables are set."

### Phase 4: Environment
"Execute Phase 4 from MIGRATION_PROMPT.md: Merge current .env with reference project requirements, update server/_core/env.ts."

### Phase 5: Backend Config
"Execute Phase 5 from MIGRATION_PROMPT.md: Update server configuration for Railway deployment, ensure CORS is correct, register custom auth routes, and start odds/score sync schedulers."

### Phase 6: Frontend Config
"Execute Phase 6 from MIGRATION_PROMPT.md: Create netlify.toml, update tRPC client to use Railway URL, configure Vite build output."

### Phase 7: Dependencies
"Execute Phase 7 from MIGRATION_PROMPT.md: Update package.json scripts, install all dependencies (pnpm or npm)."

### Phase 8: Database Migration
"Execute Phase 8 from MIGRATION_PROMPT.md: Generate Drizzle migrations, verify schema creation in PostgreSQL (including new fields), run utility scripts (add-all-teams, create-owner), and migrate existing users if any."

### Phase 9: Testing
"Execute Phase 9 from MIGRATION_PROMPT.md: Test backend locally (verify schedulers start), test frontend build, verify all features work (custom auth, betting with limits, wallet, admin, automatic sync systems)."

### Phase 10: Deployment
"Execute Phase 10 from MIGRATION_PROMPT.md: Deploy backend to Railway, deploy frontend to Netlify, verify CORS, test all endpoints."

---

## Pre-Execution Checklist

Before running the migration, ensure:

- [ ] Current project is committed to git
- [ ] Backup branch created: `git checkout -b backup-pre-migration`
- [ ] .env file documented
- [ ] Railway and Netlify URLs noted
- [ ] Reference project accessible at specified path
- [ ] PostgreSQL database accessible via DATABASE_URL
- [ ] Railway and Netlify dashboards accessible

---

## Post-Migration Verification

After migration completes, verify:

### Core Functionality
- [ ] Backend starts successfully: `pnpm dev`
- [ ] Frontend builds successfully: `pnpm build`
- [ ] Database schema created: Check Railway PostgreSQL
- [ ] API endpoints accessible: Test /api/health
- [ ] Frontend routes work: Test all pages

### Authentication
- [ ] Custom login works: Test `/api/auth/login` with username/password
- [ ] Logout works: Test `/api/auth/logout`
- [ ] User session persists: Test `/api/auth/me`
- [ ] JWT cookies set correctly: Check browser cookies
- [ ] User suspension works: Test suspended user cannot login

### Betting System
- [ ] Betting works: Test bet placement
- [ ] Parlay bets work: Test multi-game parlays
- [ ] Betting limits enforced: Test per-bet, daily, weekly limits
- [ ] Suspended users blocked: Test suspended user cannot bet

### Wallet System
- [ ] Wallet works: Test deposit/withdrawal
- [ ] Transactions recorded: Check transaction history
- [ ] Balance updates correctly: Verify after deposits/bets/wins

### Admin Features
- [ ] Admin dashboard accessible: Test admin routes
- [ ] User management works: Create, update role, suspend users
- [ ] Wallet management works: Set balance, adjust balance
- [ ] Activity monitoring works: View all transactions
- [ ] User details view works: See full user history

### Automatic Systems
- [ ] Odds sync running: Check console logs for sync messages
- [ ] Score sync running: Check console logs for sync messages
- [ ] Games created/updated: Verify games in database
- [ ] Bets auto-settled: Test with completed games

### Deployment
- [ ] No console errors: Check browser console
- [ ] CORS configured: No CORS errors
- [ ] Railway deployment: Check logs, verify schedulers start
- [ ] Netlify deployment: Check build logs
- [ ] Production URLs work: Test deployed frontend/backend

---

## Troubleshooting

If migration fails:

1. **Check git status**: `git status` - see what changed
2. **Review error messages**: Check console/logs
3. **Verify environment**: Check .env variables
4. **Test database connection**: Verify DATABASE_URL
5. **Check dependencies**: Ensure all packages installed
6. **Review build output**: Check for TypeScript errors
7. **Rollback if needed**: `git checkout backup-pre-migration`

---

## Success Indicators

Migration is successful when:

✅ All phases complete without errors
✅ Local testing passes
✅ Railway deployment succeeds
✅ Netlify deployment succeeds
✅ All features work as before
✅ No breaking changes
✅ Git history captures all changes

---

## Next Steps After Migration

1. Update cursor rules for new stack
2. Update README.md with new architecture
3. Document API endpoints
4. Set up CI/CD if needed
5. Performance optimization
6. User testing

