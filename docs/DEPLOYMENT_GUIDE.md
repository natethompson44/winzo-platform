# WINZO Platform Deployment Guide

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Frontend Deployment](#frontend-deployment)
- [Backend Deployment](#backend-deployment)
- [Database Setup](#database-setup)
- [Production Deployment](#production-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)
- [Rollback Procedures](#rollback-procedures)

## Overview

This comprehensive guide covers deployment procedures for the WINZO Platform across development, staging, and production environments using Netlify (frontend) and Railway (backend).

### Deployment Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Netlify)     │◄──►│   (Railway)     │◄──►│  (PostgreSQL)   │
│                 │    │                 │    │   (Railway)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Deployment Environments
- **Development**: Local development environment
- **Staging**: Pre-production testing environment
- **Production**: Live platform environment

## Prerequisites

### Required Accounts and Services
- **GitHub Account**: For code repository and CI/CD
- **Netlify Account**: For frontend hosting
- **Railway Account**: For backend and database hosting
- **The Odds API Account**: For sports data integration

### Required Tools
```bash
# Development Tools
Node.js 18+
npm 9+
Git
PostgreSQL (for local development)

# Deployment Tools
Netlify CLI (optional)
Railway CLI (optional)
```

### API Keys and Services
- **The Odds API Key**: Sports data provider
- **JWT Secret**: Secure random 32+ character string
- **Database Credentials**: Provided by Railway
- **CORS Origins**: Frontend domains for backend CORS

## Environment Setup

### Environment Variables

#### Frontend (.env)
```bash
# API Configuration
REACT_APP_API_URL=https://your-backend-url.railway.app
REACT_APP_ENVIRONMENT=production

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_DEBUG_MODE=false

# Build Configuration
GENERATE_SOURCEMAP=false
INLINE_RUNTIME_CHUNK=false
```

#### Backend (.env)
```bash
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=your-db-password

# The Odds API
ODDS_API_KEY=your-odds-api-key
ODDS_API_BASE_URL=https://api.the-odds-api.com/v4

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-32-chars-minimum
JWT_EXPIRES_IN=24h

# CORS Configuration
FRONTEND_URL=https://your-frontend-domain.netlify.app

# Application Settings
RESET_DATABASE=false
LOG_LEVEL=info
API_RATE_LIMIT=1000
API_RATE_WINDOW=3600000
CACHE_TTL=300
```

### Development Environment Setup

#### Local Development
```bash
# 1. Clone repository
git clone <repository-url>
cd winzo-platform

# 2. Backend setup
cd winzo-backend
npm install
cp .env.example .env
# Edit .env with your local configuration
npm run db:setup
npm start

# 3. Frontend setup (new terminal)
cd ../winzo-frontend
npm install
cp .env.example .env
# Edit .env with backend URL
npm start

# 4. Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

## Frontend Deployment

### Netlify Deployment

#### Automatic Deployment Setup
1. **Connect Repository**:
   - Login to Netlify
   - Click "New site from Git"
   - Connect GitHub account
   - Select WINZO repository

2. **Build Settings**:
   ```yaml
   # netlify.toml (already configured)
   [build]
     base = "winzo-frontend/"
     command = "npm install && npm run build"
     publish = "winzo-frontend/build/"
   
   [build.environment]
     NODE_VERSION = "18"
     NPM_VERSION = "9"
   ```

3. **Environment Variables**:
   - Go to Site settings → Environment variables
   - Add all required REACT_APP_ variables
   - Ensure REACT_APP_API_URL points to Railway backend

#### Manual Deployment
```bash
# Build and deploy manually
cd winzo-frontend
npm install
npm run build

# Deploy using Netlify CLI
netlify deploy --prod --dir=build

# Or using drag-and-drop
# Upload build/ folder to Netlify dashboard
```

### Build Optimization

#### Production Build Settings
```json
{
  "scripts": {
    "build": "GENERATE_SOURCEMAP=false react-scripts build",
    "build:analyze": "npm run build && npx source-map-explorer 'build/static/js/*.js'"
  }
}
```

#### Performance Optimizations
- **Code Splitting**: Automatic with React lazy loading
- **Asset Optimization**: Images and fonts compressed
- **Caching**: Service worker for offline support
- **CDN**: Netlify global CDN for fast delivery

## Backend Deployment

### Railway Deployment

#### Automatic Deployment Setup
1. **Create Railway Project**:
   - Login to Railway
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose WINZO repository

2. **Configure Build**:
   ```json
   // package.json
   {
     "scripts": {
       "start": "node src/server.js",
       "build": "echo 'No build step required'",
       "railway:start": "npm start"
     }
   }
   ```

3. **Environment Variables**:
   - Go to project settings → Variables
   - Add all required environment variables
   - Railway automatically provides DATABASE_URL

#### Manual Deployment
```bash
# Using Railway CLI
cd winzo-backend
railway login
railway link [project-id]
railway up

# Or using Git deployment
git push railway main
```

### Database Migration
```bash
# Run database migrations on Railway
railway run npm run db:migrate

# Or connect to Railway database directly
railway connect postgres
```

## Database Setup

### PostgreSQL on Railway

#### Automatic Setup
Railway automatically provides:
- **PostgreSQL Instance**: Latest stable version
- **Connection String**: DATABASE_URL environment variable
- **Backups**: Automatic daily backups
- **Monitoring**: Built-in performance monitoring

#### Manual Database Operations
```bash
# Connect to Railway database
railway connect postgres

# Run SQL commands
\dt                    # List tables
\d users              # Describe users table
SELECT * FROM users;  # Query users

# Run migrations
railway run npm run db:migrate

# Reset database (development only)
railway run npm run db:reset
```

### Database Schema
The platform uses the following main tables:
- **users**: User accounts and profiles
- **bets**: Betting transactions
- **events**: Sports events and odds
- **transactions**: Financial transactions
- **admin_logs**: Administrative actions

## Production Deployment

### Pre-Deployment Checklist
```bash
# 1. Code Quality
✓ All tests passing
✓ ESLint warnings resolved
✓ TypeScript compilation successful
✓ No console.log statements in production code

# 2. Environment Configuration
✓ All environment variables set
✓ API keys configured and tested
✓ Database migrations ready
✓ CORS settings configured

# 3. Performance
✓ Bundle size optimized
✓ Images compressed
✓ API response times < 500ms
✓ Database queries optimized

# 4. Security
✓ JWT secret is secure and random
✓ HTTPS enabled on all endpoints
✓ Input validation implemented
✓ Rate limiting configured
```

### Deployment Commands

#### Quick Deployment (Git-based)
```bash
# 1. Final code preparation
git add .
git commit -m "feat: Production deployment v2.0"
git push origin main

# 2. Frontend deployment (automatic via Netlify)
# Triggered by Git push to main branch

# 3. Backend deployment (automatic via Railway)
# Triggered by Git push to main branch

# 4. Verify deployment
curl https://your-backend.railway.app/api/health
curl https://your-frontend.netlify.app
```

#### Manual Deployment Scripts
```bash
# Use provided deployment scripts
./scripts/deploy-production.sh    # Linux/Mac
.\scripts\deploy-production.ps1   # Windows PowerShell
```

### Post-Deployment Verification

#### Frontend Verification
```bash
# Check frontend functionality
✓ Site loads correctly
✓ Authentication works
✓ Sports data displays
✓ Betting functionality operational
✓ Mobile responsiveness verified
✓ PWA installation works
```

#### Backend Verification
```bash
# Check backend health
curl https://your-backend.railway.app/api/health

# Test API endpoints
curl -H "Authorization: Bearer TOKEN" \
     https://your-backend.railway.app/api/sports

# Verify database connection
railway run node -e "require('./src/database/init').testConnection()"
```

## Monitoring & Maintenance

### Application Monitoring

#### Netlify Monitoring
- **Build Status**: Monitor build success/failure
- **Performance**: Core Web Vitals and page speed
- **Error Tracking**: JavaScript errors and failures
- **Traffic Analytics**: User engagement metrics

#### Railway Monitoring
- **Application Health**: CPU, memory, disk usage
- **Response Times**: API endpoint performance
- **Error Rates**: Application error frequency
- **Database Performance**: Query performance and connections

### Health Checks

#### Automated Health Checks
```javascript
// Health check endpoints
GET /api/health              // Basic health check
GET /api/health/detailed     // Comprehensive system check
GET /api/health/database     // Database connectivity
```

#### Manual Health Verification
```bash
# Quick health check script
#!/bin/bash
echo "Checking frontend..."
curl -f https://your-frontend.netlify.app > /dev/null && echo "✓ Frontend OK" || echo "✗ Frontend Error"

echo "Checking backend..."
curl -f https://your-backend.railway.app/api/health > /dev/null && echo "✓ Backend OK" || echo "✗ Backend Error"

echo "Checking database..."
curl -f https://your-backend.railway.app/api/health/database > /dev/null && echo "✓ Database OK" || echo "✗ Database Error"
```

### Backup and Recovery

#### Database Backups
Railway provides automatic backups, but you can also create manual backups:
```bash
# Create manual backup
railway run pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
railway run psql $DATABASE_URL < backup_20241201_120000.sql
```

#### Code Backups
```bash
# Create backup branch before major changes
git checkout -b backup-$(date +%Y%m%d-%H%M%S)
git push origin backup-$(date +%Y%m%d-%H%M%S)
```

## Troubleshooting

### Common Deployment Issues

#### Frontend Issues
**Problem**: Build fails on Netlify
```bash
# Solutions:
1. Check Node.js version compatibility
2. Clear build cache: Site settings → Build & deploy → Environment variables → Clear cache
3. Verify environment variables are set
4. Check for TypeScript errors in build logs
```

**Problem**: API calls fail after deployment
```bash
# Solutions:
1. Verify REACT_APP_API_URL is correct
2. Check CORS settings on backend
3. Ensure HTTPS is used for API calls
4. Verify network connectivity
```

#### Backend Issues
**Problem**: Railway deployment fails
```bash
# Solutions:
1. Check package.json start script
2. Verify environment variables
3. Check Railway build logs
4. Ensure database migrations run successfully
```

**Problem**: Database connection fails
```bash
# Solutions:
1. Verify DATABASE_URL is set correctly
2. Check database credentials
3. Ensure database service is running
4. Test connection manually: railway connect postgres
```

#### Performance Issues
**Problem**: Slow response times
```bash
# Diagnosis:
1. Check Railway metrics for CPU/memory usage
2. Analyze database query performance
3. Review API endpoint response times
4. Check external API (Odds API) response times

# Solutions:
1. Optimize database queries
2. Implement caching
3. Scale Railway resources
4. Optimize frontend bundle size
```

### Debugging Tools

#### Frontend Debugging
```bash
# Enable debug mode
REACT_APP_DEBUG_MODE=true

# Analyze bundle size
npm run build:analyze

# Check service worker
# DevTools → Application → Service Workers
```

#### Backend Debugging
```bash
# Enable debug logging
LOG_LEVEL=debug

# Connect to Railway logs
railway logs --follow

# Database debugging
railway connect postgres
```

## Rollback Procedures

### Emergency Rollback

#### Frontend Rollback (Netlify)
```bash
# Option 1: Use Netlify dashboard
# Site settings → Deploys → Previous deploy → Publish

# Option 2: Git rollback
git revert <commit-hash>
git push origin main  # Triggers new deployment
```

#### Backend Rollback (Railway)
```bash
# Option 1: Railway dashboard
# Project → Deployments → Previous deployment → Redeploy

# Option 2: Git rollback
git revert <commit-hash>
git push origin main  # Triggers new deployment
```

### Graceful Rollback

#### Step-by-Step Rollback
```bash
# 1. Identify issue and create rollback branch
git checkout -b rollback-$(date +%Y%m%d-%H%M%S)

# 2. Revert problematic changes
git revert <problematic-commit>

# 3. Test rollback locally
npm start  # Test both frontend and backend

# 4. Deploy rollback
git push origin main

# 5. Verify rollback success
# Check health endpoints and user functionality
```

### Database Rollback
```bash
# Only if schema changes were made
# 1. Create database backup
railway run pg_dump $DATABASE_URL > pre_rollback_backup.sql

# 2. Restore previous schema
railway run psql $DATABASE_URL < previous_schema_backup.sql

# 3. Verify data integrity
# Test critical user flows
```

---

**Deployment Guide Version**: 2.0  
**Last Updated**: December 2024  
**Platform**: WINZO Sports Betting  
**Supported Environments**: Development, Staging, Production

*This deployment guide covers the complete deployment lifecycle for the WINZO Platform. For emergency support during deployments, contact the DevOps team immediately.* 