# WINZO Admin Dashboard Documentation

## Overview

The WINZO Admin Dashboard provides comprehensive administrative capabilities for managing users, monitoring system health, and overseeing betting activities. This document outlines the implementation details, API endpoints, and usage instructions.

## Features

### 🔐 Role-Based Access Control
- **Admin Detection**: Users with `is_admin = true` in the database can access admin features
- **JWT Integration**: Admin status is included in JWT tokens for secure authentication
- **Route Protection**: All admin endpoints are protected by middleware that verifies admin privileges

### 📊 Admin Dashboard Sections

#### 1. System Health Monitoring
- **Database Status**: Real-time connection status and user count
- **System Uptime**: Server uptime tracking with formatted display
- **Memory Usage**: Current heap memory consumption
- **Node.js Version**: Runtime environment information

#### 2. User Management
- **User List**: Complete user directory with balances and statistics
- **Betting Statistics**: Total bets, winnings, and losses per user
- **Admin Status**: Visual indicators for admin users
- **Registration Dates**: User account creation tracking

#### 3. Betting Overview
- **All Bets Table**: Comprehensive view of all placed bets
- **User Associations**: Links bets to specific users
- **Status Tracking**: Pending, won, and lost bet statuses
- **Financial Data**: Stakes, odds, and potential payouts

#### 4. Odds Management
- **Cache Control**: Manual odds cache refresh functionality
- **API Integration**: Direct control over odds API data fetching
- **Real-time Updates**: Force immediate data refresh

## API Endpoints

### Authentication Required
All admin endpoints require a valid JWT token with admin privileges.

### GET /api/admin/users
**Description**: Retrieve all users with comprehensive statistics

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "balance": 1000.00,
      "is_admin": false,
      "created_at": "2024-01-01T00:00:00.000Z",
      "total_bets": 5,
      "total_winnings": 150.00,
      "total_losses": 100.00
    }
  ],
  "count": 1
}
```

### GET /api/admin/bets
**Description**: Retrieve all bets with user associations

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "match": "Cowboys vs Eagles",
      "team": "Cowboys",
      "odds": 1.85,
      "stake": 50.00,
      "potential_payout": 92.50,
      "status": "pending",
      "created_at": "2024-01-01T00:00:00.000Z",
      "user_email": "user@example.com",
      "user_id": 1
    }
  ],
  "count": 1
}
```

### GET /api/admin/health
**Description**: System health and performance metrics

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": {
      "seconds": 3600,
      "formatted": "1h 0m 0s"
    },
    "database": {
      "connected": true,
      "current_time": "2024-01-01T00:00:00.000Z",
      "user_count": 10
    },
    "system": {
      "node_version": "v18.17.0",
      "platform": "linux",
      "memory_usage": {
        "heapUsed": 52428800,
        "heapTotal": 67108864
      }
    }
  }
}
```

### POST /api/admin/refresh-odds
**Description**: Manually refresh the odds cache

**Response**:
```json
{
  "success": true,
  "message": "Odds cache cleared successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Database Schema Updates

### Users Table Enhancement
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
```

### JWT Payload Enhancement
```javascript
// Before
{ userId: 1 }

// After
{ userId: 1, isAdmin: true }
```

## Frontend Implementation

### Admin Button Visibility
The admin button is conditionally displayed based on user privileges:

```javascript
if (currentUser.is_admin) {
    adminBtn.classList.remove('hidden');
} else {
    adminBtn.classList.add('hidden');
}
```

### Dashboard Components

#### System Health Card
- Real-time system metrics display
- Refresh button for manual updates
- Color-coded status indicators

#### Users Table
- Responsive table design
- Sortable columns
- Admin status badges
- Financial statistics

#### Bets Table
- Comprehensive bet overview
- Status color coding
- User association display
- Date formatting

#### Odds Management
- One-click cache refresh
- Success/error notifications
- Real-time feedback

## Security Considerations

### Middleware Protection
```javascript
const requireAdmin = (req, res, next) => {
    const user = req.user;
    
    if (!user || !user.isAdmin) {
        return res.status(403).json({
            success: false,
            error: 'Admin access required'
        });
    }
    
    next();
};
```

### Token Validation
- All admin requests require valid JWT tokens
- Admin status is verified on every request
- Automatic token expiration handling

## Testing

### Creating Admin Users
```bash
# Using the provided script
node scripts/create-admin-user.js admin@winzo.com admin123
```

### Running Admin Tests
```bash
# Test all admin functionality
node scripts/test-admin-dashboard.js
```

### Test Coverage
- ✅ Admin authentication
- ✅ User management endpoints
- ✅ Betting data access
- ✅ System health monitoring
- ✅ Odds cache management
- ✅ Non-admin access blocking

## Mobile Responsiveness

The admin dashboard is fully responsive with:
- **Mobile-first design**: Optimized for small screens
- **Responsive tables**: Horizontal scrolling on mobile
- **Touch-friendly buttons**: Appropriate sizing for touch interfaces
- **Adaptive layouts**: Grid systems that adapt to screen size

## Error Handling

### Frontend Error Management
- Loading states for all async operations
- Error messages with user-friendly text
- Retry mechanisms for failed requests
- Toast notifications for user feedback

### Backend Error Responses
- Consistent error response format
- Appropriate HTTP status codes
- Detailed error messages for debugging
- Graceful degradation on failures

## Performance Considerations

### Database Optimization
- Indexed queries for user and bet lookups
- Efficient JOIN operations
- Pagination support for large datasets

### Caching Strategy
- In-memory odds cache
- Admin data refresh controls
- Optimized API responses

## Deployment Notes

### Environment Variables
```bash
# Required for admin functionality
JWT_SECRET=your-secret-key
DATABASE_URL=your-database-url
NODE_ENV=production
```

### Database Migration
The admin functionality requires a database migration to add the `is_admin` column:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
```

## Future Enhancements

### Planned Features
- **User Management**: Promote/demote admin status
- **Betting Controls**: Manual bet resolution
- **Analytics Dashboard**: Advanced reporting
- **Audit Logs**: Admin action tracking
- **Bulk Operations**: Mass user management

### Scalability Considerations
- **Pagination**: For large user/bet datasets
- **Caching**: Redis integration for better performance
- **Monitoring**: Advanced system metrics
- **Alerts**: Automated system notifications

## Troubleshooting

### Common Issues

#### Admin Button Not Showing
1. Verify user has `is_admin = true` in database
2. Check JWT token includes `isAdmin` field
3. Ensure frontend is reading admin status correctly

#### Admin Endpoints Returning 403
1. Verify JWT token is valid and not expired
2. Check user has admin privileges in database
3. Ensure middleware is properly configured

#### Database Connection Issues
1. Check `DATABASE_URL` environment variable
2. Verify database server is running
3. Test connection with health endpoint

### Debug Commands
```bash
# Check admin user status
psql $DATABASE_URL -c "SELECT email, is_admin FROM users WHERE email = 'admin@winzo.com';"

# Test admin endpoints
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/admin/health

# Verify JWT payload
node -e "console.log(JSON.parse(Buffer.from('YOUR_TOKEN'.split('.')[1], 'base64').toString()))"
```

## Support

For issues or questions regarding the admin dashboard:
1. Check the troubleshooting section above
2. Review the test scripts for expected behavior
3. Verify database schema and permissions
4. Test with the provided admin user creation script
