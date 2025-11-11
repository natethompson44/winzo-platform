# DEPLOYMENT COMPATIBILITY GUIDE

## ✅ Fixed Issues

### 1. Railway Package Manager
- **Changed:** `railway.toml` now uses `npm` instead of `pnpm`
- **Why:** Railway's nixpacks supports npm by default
- **Local Dev:** Still uses `pnpm` (works fine locally)
- **Production:** Uses `npm` (more compatible with Railway)

### 2. Frontend API URLs
- **Fixed:** `CustomLogin.tsx` now uses Railway URL in production
- **Fixed:** Created `client/src/lib/apiUrl.ts` helper function
- **Fixed:** `main.tsx` uses the same helper for consistency
- **Result:** Frontend on Netlify can now call backend on Railway

### 3. Netlify Configuration
- **Updated:** `netlify.toml` uses `npm` instead of `pnpm`
- **Added:** Comment about setting `VITE_API_URL` env var
- **Note:** Set `VITE_API_URL` in Netlify dashboard to your Railway URL

## 🔧 Configuration Summary

### Railway (Backend)
- **Package Manager:** npm (via railway.toml)
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Entry Point:** `server/_core/index.ts` → builds to `dist/index.js`

### Netlify (Frontend)
- **Package Manager:** npm (via netlify.toml)
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist/public`
- **Environment Variable:** Set `VITE_API_URL` to your Railway URL

### Local Development
- **Package Manager:** pnpm (works fine locally)
- **Command:** `pnpm dev`
- **Backend:** `http://localhost:3000`
- **Frontend:** Same URL (Vite dev server)

## 📋 Next Steps

### 1. Verify Railway URL
Check your Railway dashboard to confirm the backend URL is:
```
https://winzo-platform-production-d306.up.railway.app
```
If different, update:
- `client/src/lib/apiUrl.ts` (fallback URL)
- Netlify environment variable `VITE_API_URL`

### 2. Set Netlify Environment Variable
In Netlify dashboard:
1. Go to Site Settings → Environment Variables
2. Add: `VITE_API_URL` = `https://winzo-platform-production-d306.up.railway.app`
3. Redeploy

### 3. Test Locally
```powershell
# Install dependencies (npm works too)
npm install

# Or use pnpm (preferred for local dev)
pnpm install

# Start dev server
pnpm dev
```

### 4. Deploy
```powershell
# Commit changes
git add .
git commit -m "Fix deployment compatibility: use npm for Railway/Netlify"

# Push to deploy
git push
```

## ⚠️ Important Notes

1. **Package Manager Split:**
   - Local: `pnpm` (faster, better)
   - Railway: `npm` (more compatible)
   - Netlify: `npm` (more compatible)

2. **Railway URL:**
   - Hardcoded fallback in `apiUrl.ts`
   - Can override with `VITE_API_URL` env var
   - Set in Netlify dashboard for production

3. **CORS:**
   - Already configured in `server/_core/index.ts`
   - Allows requests from `https://winzo-sports.netlify.app`
   - Check `.env` has correct `CORS_ORIGIN`

4. **Database Migrations:**
   - Run automatically on Railway deployment
   - Can't test locally (Railway DB not accessible)
   - Check Railway logs for migration status

## 🐛 Troubleshooting

**Railway build fails?**
- Check Railway logs
- Verify `package.json` has `build` and `start` scripts
- Ensure Node version is compatible

**Netlify build fails?**
- Check Netlify build logs
- Verify `netlify.toml` is correct
- Ensure `dist/public` directory exists after build

**Frontend can't reach backend?**
- Check `VITE_API_URL` is set in Netlify
- Verify Railway URL is correct
- Check CORS configuration
- Check browser console for errors


