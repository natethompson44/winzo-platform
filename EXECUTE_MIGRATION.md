# Execute Migration: Current Site → Reference Project

## Quick Start Prompt

Copy and paste this prompt to execute the complete migration:

---

**"Execute the complete migration from the current vanilla JS/Express project to the TypeScript/React/tRPC reference project located at `C:\Users\Natha\OneDrive\Documents\_Projects\winzo\_winzo-sports-betting_v2_REFERENCE`. Follow MIGRATION_PROMPT.md exactly, ensuring:**

1. **Preserve all existing functionality** - no breaking changes
2. **Convert MySQL schema to PostgreSQL** - adapt Drizzle schema for Railway PostgreSQL
3. **Maintain Railway/Netlify deployment** - keep existing URLs and configuration
4. **Migrate all environment variables** - preserve .env values
5. **Adapt authentication** - make JWT work with reference project structure
6. **Test each phase** - verify before proceeding to next phase
7. **Commit to git** - capture all changes in git history

**Execute phases in this order:**
- Phase 1: Copy reference project files
- Phase 2: Convert database schema (MySQL → PostgreSQL)
- Phase 3: Adapt authentication (JWT integration)
- Phase 4: Configure environment variables
- Phase 5: Update backend configuration
- Phase 6: Configure frontend (Netlify build)
- Phase 7: Install dependencies
- Phase 8: Run database migrations
- Phase 9: Test locally
- Phase 10: Deploy and verify

**Critical requirements:**
- Zero breaking changes
- All existing features must work
- Database migration must preserve data structure
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
"Execute Phase 3 from MIGRATION_PROMPT.md: Adapt reference project authentication to work with JWT tokens from Authorization header and localStorage."

### Phase 4: Environment
"Execute Phase 4 from MIGRATION_PROMPT.md: Merge current .env with reference project requirements, update server/_core/env.ts."

### Phase 5: Backend Config
"Execute Phase 5 from MIGRATION_PROMPT.md: Update server configuration for Railway deployment, ensure CORS is correct, verify odds API integration."

### Phase 6: Frontend Config
"Execute Phase 6 from MIGRATION_PROMPT.md: Create netlify.toml, update tRPC client to use Railway URL, configure Vite build output."

### Phase 7: Dependencies
"Execute Phase 7 from MIGRATION_PROMPT.md: Update package.json scripts, install all dependencies (pnpm or npm)."

### Phase 8: Database Migration
"Execute Phase 8 from MIGRATION_PROMPT.md: Generate Drizzle migrations, verify schema creation in PostgreSQL, seed initial data if needed."

### Phase 9: Testing
"Execute Phase 9 from MIGRATION_PROMPT.md: Test backend locally, test frontend build, verify all features work (auth, betting, wallet, admin)."

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

- [ ] Backend starts successfully: `pnpm dev`
- [ ] Frontend builds successfully: `pnpm build`
- [ ] Database schema created: Check Railway PostgreSQL
- [ ] API endpoints accessible: Test /api/health
- [ ] Frontend routes work: Test all pages
- [ ] Authentication works: Test login/register
- [ ] Betting works: Test bet placement
- [ ] Wallet works: Test deposit/withdrawal
- [ ] Admin works: Test admin features
- [ ] Odds API works: Test odds fetching
- [ ] No console errors: Check browser console
- [ ] CORS configured: No CORS errors
- [ ] Railway deployment: Check logs
- [ ] Netlify deployment: Check build logs

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

