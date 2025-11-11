# DEPLOYMENT COMPATIBILITY FIX

## Issues Found:

1. **Railway pnpm support** - Railway may not have pnpm by default
2. **Frontend API URLs** - CustomLogin uses relative URLs that won't work from Netlify
3. **Railway URL hardcoded** - Need to verify actual Railway URL matches

## Solutions:

### Option 1: Use npm instead of pnpm (More Compatible)

Railway's nixpacks supports npm by default. We can:
- Keep pnpm for local development
- Use npm for Railway deployment
- Update railway.toml to use npm

### Option 2: Configure Railway for pnpm

Railway can use pnpm if we:
- Add `.nvmrc` or configure Node version
- Use nixpacks with pnpm detection
- Or use a custom Dockerfile

### Option 3: Fix Frontend API Calls

The CustomLogin page uses relative URLs `/api/auth/login` which won't work when:
- Frontend is on Netlify (https://winzo-sports.netlify.app)
- Backend is on Railway (https://winzo-platform-production-d306.up.railway.app)

Need to update CustomLogin.tsx to use the Railway URL in production.

## Recommended Fix:

1. **Update railway.toml** to use npm (more compatible)
2. **Fix CustomLogin.tsx** to use Railway URL in production
3. **Add Netlify env var** for Railway URL
4. **Keep pnpm for local dev** (works fine locally)


