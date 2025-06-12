# WINZO Platform Deployment Guide

## Production Deployment Checklist
### Pre-Deployment
- [ ] All tests passing (`python3 test_winzo_platform.py`)
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] SSL certificates obtained
- [ ] Domain DNS configured
- [ ] Monitoring setup completed

### Backend Deployment
#### Environment Setup
```bash
# Production environment variables
NODE_ENV=production
DB_HOST=your_production_db_host
DB_NAME=winzo_platform_prod
ODDS_API_KEY=your_production_api_key
JWT_SECRET=your_super_secure_production_secret
FRONTEND_URL=https://your-domain.com
```

#### Database Setup
```bash
# Create production database
createdb winzo_platform_prod
# Run migrations
NODE_ENV=production npm run db:setup
```

#### Server Deployment
```bash
# Install dependencies
npm ci --only=production
# Start with PM2 (recommended)
pm2 start src/server.js --name winzo-backend
# Or with systemd
sudo systemctl start winzo-backend
```

### Frontend Deployment
#### Build for Production
```bash
cd winzo-frontend
npm ci
npm run build
```

#### Netlify Deployment
1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Configure environment variables
5. Deploy

#### Environment Variables (Netlify)
```
REACT_APP_API_URL=https://api.your-domain.com
REACT_APP_ENVIRONMENT=production
```

### Post-Deployment Verification
#### Automated Testing
```bash
# Test production endpoints
python3 test_winzo_platform.py --url https://api.your-domain.com
```

#### Manual Verification
- [ ] Frontend loads correctly
- [ ] User registration/login works
- [ ] Sports data displays
- [ ] Bet placement functions
- [ ] Wallet operations work
- [ ] Mobile responsiveness
- [ ] SSL certificate valid
- [ ] Performance acceptable

### Monitoring Setup
#### Health Checks
```bash
# Backend health
curl https://api.your-domain.com/health
# Frontend health
curl https://your-domain.com
```

#### Log Monitoring
```bash
# PM2 logs
pm2 logs winzo-backend
# System logs
journalctl -u winzo-backend -f
```

### Backup Strategy
#### Database Backups
```bash
# Daily backup script
pg_dump winzo_platform_prod > backup_$(date +%Y%m%d).sql
# Automated backup with cron
0 2 * * * /path/to/backup_script.sh
```

#### File Backups
- Application code (Git repository)
- Environment configurations
- SSL certificates
- Log files

### Security Considerations
#### SSL/TLS
- Use Let's Encrypt or commercial SSL certificate
- Enforce HTTPS redirects
- Configure HSTS headers

#### Database Security
- Use strong passwords
- Enable SSL connections
- Restrict network access
- Regular security updates

#### API Security
- Rate limiting enabled
- Input validation
- JWT token security
- CORS properly configured

### Performance Optimization
#### Backend
- Enable compression
- Use connection pooling
- Implement caching
- Monitor API quota usage

#### Frontend
- Enable gzip compression
- Use CDN for static assets
- Implement code splitting
- Optimize images

### Troubleshooting
#### Common Issues
1. CORS Errors: Check FRONTEND_URL environment variable
2. Database Connection: Verify connection string and firewall
3. API Key Issues: Confirm The Odds API key is valid
4. Build Failures: Check Node.js version compatibility

#### Debug Commands
```bash
# Check backend status
curl -I https://api.your-domain.com/health
# Check database connection
psql -h your_db_host -U your_user -d winzo_platform_prod
# Check logs
pm2 logs winzo-backend --lines 100
```

### Maintenance
#### Regular Tasks
- [ ] Monitor API quota usage
- [ ] Review error logs
- [ ] Update dependencies
- [ ] Database maintenance
- [ ] Security patches
- [ ] Performance monitoring

#### Monthly Tasks
- [ ] Review user analytics
- [ ] Optimize database queries
- [ ] Update documentation
- [ ] Security audit
- [ ] Backup verification

### Support Contacts
- Technical Issues: tech@winzo.com
- API Issues: The Odds API Support
- Hosting Issues: Your hosting provider support
