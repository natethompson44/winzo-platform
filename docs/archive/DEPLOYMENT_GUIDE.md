# WINZO Platform - Production Deployment Guide

## 🚀 Pre-Deployment Checklist

### ✅ 1. Build Verification
```bash
# Frontend build test
cd winzo-frontend
npm run build
# ✅ Build completed successfully - Ready for deployment

# Backend test (local)
cd ../winzo-backend
npm run test:ci
```

### ✅ 2. Environment Variables Configuration

#### **Frontend Environment Variables (Netlify)**
Required variables in Netlify dashboard:
```bash
REACT_APP_API_URL=https://winzo-platform-production.up.railway.app
REACT_APP_ENVIRONMENT=production
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_DEBUG_MODE=false
NODE_ENV=production
```

#### **Backend Environment Variables (Railway)**
Required variables in Railway dashboard:
```bash
# Database Configuration
DB_HOST=[PROVIDED_BY_RAILWAY]
DB_PORT=5432
DB_NAME=railway
DB_USER=[PROVIDED_BY_RAILWAY]
DB_PASSWORD=[PROVIDED_BY_RAILWAY]
DATABASE_URL=[PROVIDED_BY_RAILWAY]

# API Configuration
ODDS_API_KEY=[YOUR_ODDS_API_KEY]
ODDS_API_BASE_URL=https://api.the-odds-api.com/v4

# Authentication
JWT_SECRET=[GENERATE_SECURE_32_CHAR_STRING]
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS Configuration
FRONTEND_URL=https://[YOUR_NETLIFY_DOMAIN]

# Logging & Performance
LOG_LEVEL=info
API_RATE_LIMIT=1000
API_RATE_WINDOW=3600000
CACHE_TTL=300

# Deployment Settings
RESET_DATABASE=false
```

## 🔄 Git Deployment Commands

### **Pre-Deployment Steps**
```bash
# 1. Check current status
git status

# 2. Stage all changes
git add .

# 3. Commit with descriptive message
git commit -m "feat: Complete WINZO platform overhaul - Production ready deployment

- Implemented Nice Admin design system integration
- Added comprehensive sports betting functionality  
- Enhanced mobile responsiveness and PWA features
- Completed admin dashboard and user management
- Added analytics and performance monitoring
- Fixed all build issues and optimized for production"

# 4. Create backup branch
git branch backup-pre-deployment-$(date +%Y%m%d-%H%M%S)
```

### **Deployment Commands**
```bash
# 5. Switch to main branch
git checkout main

# 6. Merge feature branch (replace with your current branch)
git merge feature/design-system-overhaul

# 7. Push to trigger deployment
git push origin main
```

## 🏗️ Platform Configurations

### **Netlify Configuration** 
*(Already configured in netlify.toml)*

**Build Settings:**
- Base directory: `winzo-frontend/`
- Build command: `npm install && npm run build`
- Publish directory: `winzo-frontend/build/`
- Node version: 18

**Custom Domains** *(Configure in Netlify Dashboard)*:
- Primary: `your-domain.com`
- SSL: Auto-managed by Netlify

### **Railway Configuration**
**Deploy Settings:**
- Root directory: `winzo-backend/`
- Start command: `npm start`
- Auto-deploy: Enabled on main branch
- Health check: `/api/health` (if implemented)

## 🔄 Rollback Procedures

### **Emergency Rollback Commands**
```bash
# If deployment fails - Quick rollback
git checkout main
git reset --hard HEAD~1
git push --force origin main

# Or restore from backup branch
git checkout backup-pre-deployment-[TIMESTAMP]
git checkout -b hotfix-rollback-$(date +%Y%m%d-%H%M%S)
git push origin hotfix-rollback-[TIMESTAMP]
```

### **Graceful Rollback**
```bash
# 1. Create rollback branch
git checkout -b rollback-to-previous-$(date +%Y%m%d-%H%M%S)

# 2. Revert specific commits
git revert [COMMIT_HASH]

# 3. Push rollback
git push origin rollback-to-previous-[TIMESTAMP]

# 4. Create PR for review
```

## ✅ Post-Deployment Verification

### **Frontend Verification**
- [ ] Site loads at production URL
- [ ] Authentication flow works
- [ ] Sports betting functionality works
- [ ] Admin dashboard accessible
- [ ] Mobile responsiveness verified
- [ ] PWA installation works
- [ ] All major routes functional

### **Backend Verification**
- [ ] API health check responds
- [ ] Database connection successful
- [ ] Authentication endpoints work
- [ ] Sports data fetching works
- [ ] Betting operations functional
- [ ] Admin operations work
- [ ] Error handling working

### **Integration Testing**
```bash
# Test API endpoints
curl https://winzo-platform-production.up.railway.app/api/health
curl https://winzo-platform-production.up.railway.app/api/sports/events

# Test frontend API calls
# Check browser network tab for successful API calls
```

## 📊 Monitoring & Logging

### **Error Monitoring Setup**
1. **Netlify**: Built-in error logging in dashboard
2. **Railway**: Built-in logging and metrics
3. **Custom**: Consider adding Sentry for detailed error tracking

### **Performance Monitoring**
1. **Frontend**: Web Vitals in browser DevTools
2. **Backend**: Railway metrics dashboard
3. **Database**: Monitor query performance

### **Health Checks**
```bash
# Frontend health
curl -I https://[YOUR_NETLIFY_DOMAIN]

# Backend health  
curl https://winzo-platform-production.up.railway.app/api/health
```

## 🚨 Troubleshooting Guide

### **Common Issues & Solutions**

#### **Frontend Build Fails**
```bash
cd winzo-frontend
npm run clean
npm install
npm run build
```

#### **Backend Won't Start**
- Check Railway logs
- Verify environment variables
- Ensure `RESET_DATABASE=false`

#### **API Connection Issues**
- Verify CORS settings
- Check environment variables
- Confirm Railway URL is correct

#### **Database Issues**
- Check Railway database connection
- Verify DATABASE_URL variable
- Check for migration issues

## 📝 Environment Setup Documentation

### **Required Services**
1. **Netlify Account**: For frontend hosting
2. **Railway Account**: For backend hosting
3. **The Odds API Key**: For sports data
4. **PostgreSQL Database**: Provided by Railway

### **Domain Configuration**
1. Configure custom domain in Netlify
2. Update CORS settings in backend
3. Update environment variables

## 🔐 Security Checklist

- [ ] JWT_SECRET is 32+ characters and random
- [ ] Database credentials are secure
- [ ] API keys are properly configured
- [ ] HTTPS is enabled (automatic with Netlify/Railway)
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] No sensitive data in client code

## 📋 Admin Setup

### **First Admin User**
After deployment, create admin user via Railway terminal:
```bash
cd winzo-backend
node src/database/create-admin-user.js
```

Or using SQL directly in Railway database:
```sql
UPDATE users SET role = 'admin' WHERE username = 'your-username';
```

## 🎯 Success Metrics

### **Deployment Success Indicators**
- [ ] Build completes without errors
- [ ] All tests pass
- [ ] Frontend loads successfully
- [ ] Backend responds to health checks
- [ ] Database migrations complete
- [ ] All environment variables set
- [ ] SSL certificates active
- [ ] Monitoring systems online

### **Performance Targets**
- Frontend load time: < 3 seconds
- API response time: < 500ms
- Uptime: > 99.5%

---

## 🚀 Ready for Deployment!

Your WINZO platform is now ready for production deployment. Follow the git commands above to deploy to both Netlify (frontend) and Railway (backend).

**Support**: If issues arise, check the troubleshooting section or create a rollback using the provided commands.

**Monitoring**: Set up alerts in both Netlify and Railway dashboards for immediate notification of any issues.

---

*Generated: $(date)*
*Platform: WINZO Sports Betting Platform*
*Version: 2.0 - Production Ready* 