# WINZO Platform - Quick Deployment Commands

## 🚀 One-Line Deployment (Automated)

**Windows PowerShell (Recommended):**
```powershell
.\deploy-production.ps1
```

**Linux/Mac/Git Bash:**
```bash
bash deploy-production.sh
```

## 📋 Manual Deployment Commands

### Pre-Deployment Checks
```bash
# Check build
cd winzo-frontend && npm run build && cd ..

# Check git status
git status
```

### Git Deployment Sequence
```bash
# Stage all changes
git add .

# Commit with deployment message
git commit -m "feat: Complete WINZO platform overhaul - Production ready deployment

- Implemented Nice Admin design system integration
- Added comprehensive sports betting functionality  
- Enhanced mobile responsiveness and PWA features
- Completed admin dashboard and user management
- Added analytics and performance monitoring
- Fixed all build issues and optimized for production"

# Create backup branch
git branch backup-pre-deployment-$(date +%Y%m%d-%H%M%S)

# Switch to main and merge
git checkout main
git merge feature/design-system-overhaul

# Deploy to production
git push origin main
```

## 🔄 Emergency Rollback Commands

### Quick Rollback
```bash
git checkout main
git reset --hard HEAD~1
git push --force origin main
```

### Safe Rollback with Branch
```bash
git checkout backup-pre-deployment-[TIMESTAMP]
git checkout -b hotfix-rollback-$(date +%Y%m%d-%H%M%S)
git push origin hotfix-rollback-[TIMESTAMP]
```

## 🧪 Testing Commands

### Frontend Testing
```bash
cd winzo-frontend
npm run build
npm run test:ci
npm run lint
```

### Backend Testing
```bash
cd winzo-backend
npm run test:ci
npm run lint
```

### Production Health Checks
```bash
# Frontend health check
curl -I https://[YOUR_NETLIFY_DOMAIN]

# Backend health check
curl https://winzo-platform-production.up.railway.app/api/health

# API test
curl https://winzo-platform-production.up.railway.app/api/sports/events
```

## ⚙️ Environment Variable Setup

### Netlify Dashboard Variables
```bash
REACT_APP_API_URL=https://winzo-platform-production.up.railway.app
REACT_APP_ENVIRONMENT=production
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_DEBUG_MODE=false
NODE_ENV=production
```

### Railway Dashboard Variables
```bash
# Database (provided by Railway)
DATABASE_URL=[PROVIDED_BY_RAILWAY]
DB_HOST=[PROVIDED_BY_RAILWAY]
DB_PORT=5432
DB_NAME=railway
DB_USER=[PROVIDED_BY_RAILWAY]
DB_PASSWORD=[PROVIDED_BY_RAILWAY]

# Required Configuration
ODDS_API_KEY=[YOUR_ODDS_API_KEY]
JWT_SECRET=[SECURE_32_CHAR_STRING]
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://[YOUR_NETLIFY_DOMAIN]
RESET_DATABASE=false
```

## 🔧 Post-Deployment Setup

### Create Admin User (Railway Terminal)
```bash
# Option 1: Using Node script
cd winzo-backend
node src/database/create-admin-user.js

# Option 2: Direct SQL in Railway database
# UPDATE users SET role = 'admin' WHERE username = 'your-username';
```

### Domain Configuration Checklist
- [ ] Configure custom domain in Netlify
- [ ] Update FRONTEND_URL in Railway environment variables
- [ ] Verify SSL certificates are active
- [ ] Test CORS configuration

## 📊 Monitoring Commands

### Check Deployment Status
```bash
# Check git deployment status
git log --oneline -10

# Check branch status
git branch -a

# Check latest commit
git show --stat
```

### Performance Monitoring
```bash
# Frontend performance test
curl -w "@curl-format.txt" -o /dev/null -s https://[YOUR_NETLIFY_DOMAIN]

# Backend response time test
curl -w "Total time: %{time_total}s\n" -o /dev/null -s https://winzo-platform-production.up.railway.app/api/health
```

## 🚨 Troubleshooting Commands

### Build Issues
```bash
# Clean and rebuild frontend
cd winzo-frontend
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Git Issues
```bash
# Reset to last working state
git checkout main
git reset --hard origin/main

# View deployment history
git log --oneline --graph -20
```

### Service Status
```bash
# Check service status
curl -I https://[YOUR_NETLIFY_DOMAIN]
curl -I https://winzo-platform-production.up.railway.app

# Test API endpoints
curl -X GET https://winzo-platform-production.up.railway.app/api/sports/events
curl -X POST https://winzo-platform-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

---

## 🎯 Quick Success Checklist

After deployment, verify:
- [ ] Frontend loads at Netlify URL
- [ ] Backend responds at Railway URL  
- [ ] Authentication works end-to-end
- [ ] Sports data fetching works
- [ ] Admin dashboard accessible
- [ ] Mobile interface functional
- [ ] All environment variables set
- [ ] SSL certificates active

---

*Use these commands for quick deployment and troubleshooting of the WINZO platform.* 