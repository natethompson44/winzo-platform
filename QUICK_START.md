# QUICK START GUIDE

## 🎯 What Changed?

### OLD Structure (Vanilla JS/Express):
```
Site/
├── backend/          ❌ DELETE - Old Express backend
│   ├── app.js
│   └── routes/
├── index.html        ❌ DELETE - Old vanilla JS frontend
└── package.json      ✅ UPDATED - Now uses TypeScript/React
```

### NEW Structure (TypeScript/React/tRPC):
```
Site/
├── server/           ✅ NEW - TypeScript backend (replaces backend/)
│   └── _core/
│       └── index.ts  ← Server entry point
├── client/           ✅ NEW - React frontend (replaces index.html)
│   └── src/
│       └── main.tsx  ← Frontend entry point
└── drizzle/          ✅ UPDATED - PostgreSQL schema
    └── schema.ts
```

## 🚀 Quick Test Steps

### 1. Clean Up Old Files
```powershell
powershell -ExecutionPolicy Bypass -File scripts/cleanup-old-files.ps1
```

### 2. Start Development Server
```powershell
pnpm dev
```

This starts:
- Backend: `http://localhost:3000`
- Frontend: Same URL (Vite dev server)

### 3. Test in Browser
Open: `http://localhost:3000`

You should see the React app!

## 📋 File Mapping

| Old File | New File | Status |
|----------|----------|--------|
| `backend/app.js` | `server/_core/index.ts` | ✅ Replaced |
| `index.html` | `client/src/main.tsx` | ✅ Replaced |
| `backend/routes/*` | `server/routers.ts` | ✅ Replaced |
| `backend/db.js` | `server/db.ts` | ✅ Replaced |

## 🔍 How to Know What's Active

### Backend Entry Point:
- **OLD:** `backend/app.js` ❌
- **NEW:** `server/_core/index.ts` ✅

### Frontend Entry Point:
- **OLD:** `index.html` ❌  
- **NEW:** `client/src/main.tsx` ✅

### Package Scripts:
- **OLD:** `npm start` → `backend/app.js` ❌
- **NEW:** `pnpm dev` → `server/_core/index.ts` ✅

## ⚠️ Common Confusion Points

1. **Two `index.html` files?**
   - Root `index.html` ❌ DELETE (old)
   - `client/index.html` ✅ KEEP (new React template)

2. **Two server folders?**
   - `backend/` ❌ DELETE (old Express)
   - `server/` ✅ KEEP (new TypeScript)

3. **Migration files?**
   - Old MySQL migrations ❌ DELETE
   - `0000_round_nighthawk.sql` ✅ KEEP (PostgreSQL)

4. **Lock files?**
   - `package-lock.json` ❌ DELETE (npm)
   - `pnpm-lock.yaml` ✅ KEEP (pnpm)

## 🎬 Next Steps After Cleanup

1. ✅ Run cleanup script
2. ✅ Test locally: `pnpm dev`
3. ✅ Commit changes to git
4. ✅ Push to Railway (auto-deploys)
5. ✅ Push to Netlify (auto-deploys)

## 🆘 If Something Breaks

1. Check `server/_core/index.ts` is the entry point
2. Check `client/src/main.tsx` is the frontend entry
3. Check `.env` has all required variables
4. Check Railway/Netlify logs for errors


