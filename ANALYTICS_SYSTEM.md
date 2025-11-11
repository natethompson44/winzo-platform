# Analytics System Documentation

## Overview

The WINZO Analytics System provides comprehensive tracking and reporting capabilities for the betting platform. It includes real-time analytics, event tracking, and administrative dashboards with interactive charts.

## Features Implemented

### 1. Analytics API Endpoint (`/api/admin/analytics`)

**Purpose**: Returns summary statistics and analytics data for the platform.

**Authentication**: JWT-protected (Admin only)

**Caching**: 60-second cache to reduce database load

**Response Format**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_users": 150,
      "total_bets": 1250,
      "total_wagered": 125000.50,
      "total_payouts": 98000.25,
      "average_payout_ratio": 0.78,
      "active_users_24h": 45
    },
    "charts": {
      "daily_stats": [
        {
          "date": "2025-01-20",
          "bets": 25,
          "wagered": 2500.00,
          "deposits": 1500.00,
          "withdrawals": 500.00
        }
      ]
    }
  },
  "cached": false,
  "timestamp": "2025-01-20T21:00:00Z"
}
```

### 2. Event Tracking Middleware

**Purpose**: Lightweight in-memory event logging for all user actions.

**Tracked Events**:
- `bet_placed`: When users place bets
- `deposit`: When users deposit funds
- `withdraw`: When users withdraw funds
- `login`: When users log in
- `register`: When users register

**Event Log Format**:
```json
{
  "event": "bet_placed",
  "user": "user@example.com",
  "amount": 50,
  "odds": 2.1,
  "match": "Team A vs Team B",
  "team": "Team A",
  "timestamp": "2025-01-20T21:00:00Z"
}
```

### 3. Logs API Endpoint (`/api/logs`)

**Purpose**: Provides access to event logs with filtering capabilities.

**Authentication**: JWT-protected (Admin only)

**Query Parameters**:
- `type`: Filter by event type (optional)
- `user`: Filter by user email (optional)
- `limit`: Number of events to return (default: 100)
- `offset`: Pagination offset (default: 0)

**Response Format**:
```json
{
  "success": true,
  "data": {
    "events": [...],
    "pagination": {
      "total": 1000,
      "limit": 100,
      "offset": 0,
      "hasMore": true
    },
    "summary": {
      "total_events": 1000,
      "event_type_counts": {
        "bet_placed": 500,
        "deposit": 200,
        "withdraw": 100,
        "login": 150,
        "register": 50
      }
    }
  }
}
```

### 4. Enhanced Admin Dashboard

**New Features**:
- **Tabbed Interface**: Overview, Analytics, and Logs tabs
- **Real-time Analytics**: Auto-refresh every 30 seconds
- **Interactive Charts**: Daily bets and transactions using Chart.js
- **KPI Cards**: Key performance indicators with visual icons
- **Event Log Viewer**: Filterable and searchable event logs

**Chart Types**:
- **Bar Chart**: Daily bets placed (last 7 days)
- **Line Chart**: Daily deposits and withdrawals (last 7 days)

## File Structure

```
backend/
├── routes/
│   ├── analytics.js          # Analytics API endpoints
│   └── logs.js              # Logs API endpoints
├── middleware/
│   └── eventTracker.js      # Event tracking middleware
└── app.js                   # Main application (updated)

frontend/
└── index.html               # Enhanced admin dashboard
```

## API Endpoints

### Analytics Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/analytics` | Get platform analytics | Admin |
| POST | `/api/admin/refresh-analytics` | Clear analytics cache | Admin |

### Logs Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/logs` | Get event logs | Admin |
| GET | `/api/logs/stats` | Get log statistics | Admin |
| POST | `/api/logs/clear` | Clear all logs | Admin |

## Implementation Details

### Event Tracking Middleware

The event tracking middleware is applied to specific routes:

```javascript
// Applied to bet placement
router.post('/bet', betEventTracker, async (req, res) => { ... });

// Applied to deposits
router.post('/deposit', depositEventTracker, async (req, res) => { ... });

// Applied to withdrawals
router.post('/withdraw', withdrawEventTracker, async (req, res) => { ... });

// Applied to login
router.post('/login', loginEventTracker, async (req, res) => { ... });

// Applied to registration
router.post('/register', registerEventTracker, async (req, res) => { ... });
```

### Analytics Caching

Analytics data is cached for 60 seconds to improve performance:

```javascript
let analyticsCache = {
    data: null,
    timestamp: null
};

const CACHE_DURATION = 60 * 1000; // 60 seconds
```

### Frontend Integration

The admin dashboard includes:

1. **Tab Management**: Switch between Overview, Analytics, and Logs
2. **Auto-refresh**: Analytics data refreshes every 30 seconds
3. **Chart.js Integration**: Interactive charts for data visualization
4. **Error Handling**: Loading states and error messages
5. **Responsive Design**: Works on desktop and mobile devices

## Security Considerations

1. **JWT Authentication**: All analytics and logs endpoints require admin authentication
2. **Input Validation**: All API inputs are validated
3. **Rate Limiting**: Consider implementing rate limiting for production
4. **Data Privacy**: Event logs contain user data - ensure compliance with privacy regulations

## Performance Optimizations

1. **Analytics Caching**: 60-second cache reduces database queries
2. **In-memory Logs**: Event logs stored in memory for fast access
3. **Pagination**: Logs endpoint supports pagination for large datasets
4. **Database Indexing**: Ensure proper database indexes for analytics queries

## Testing

A comprehensive test script is provided at `scripts/test-analytics.ps1` that verifies:

- Analytics endpoint functionality
- Event tracking middleware
- Logs endpoint with filtering
- Admin authentication requirements
- Real-time analytics updates
- Caching behavior

## Deployment Considerations

1. **Environment Variables**: Ensure proper DATABASE_URL configuration
2. **Memory Management**: Monitor memory usage for event logs
3. **Database Performance**: Consider database optimization for analytics queries
4. **CDN**: Chart.js is loaded from CDN for better performance

## Future Enhancements

1. **Real-time WebSocket Updates**: Push analytics updates to connected clients
2. **Advanced Filtering**: More sophisticated log filtering options
3. **Export Functionality**: Export analytics data to CSV/PDF
4. **Custom Dashboards**: Allow admins to create custom dashboard layouts
5. **Alerting System**: Notifications for unusual activity patterns

## Troubleshooting

### Common Issues

1. **Database Connection Errors**: Ensure DATABASE_URL is correctly configured
2. **Memory Issues**: Monitor event log memory usage
3. **Chart Rendering**: Ensure Chart.js CDN is accessible
4. **Authentication Failures**: Verify JWT token validity

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your environment variables.

## Support

For issues or questions regarding the analytics system, please refer to the main project documentation or contact the development team.



