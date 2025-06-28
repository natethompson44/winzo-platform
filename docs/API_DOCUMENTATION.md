# WINZO Platform API Documentation

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication) 
- [Sports API](#sports-api)
- [Betting API](#betting-api)
- [User Management API](#user-management-api)
- [Wallet API](#wallet-api)
- [Admin API](#admin-api)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)

## Overview

The WINZO Platform API is a RESTful API built with Node.js and Express.js, providing comprehensive sports betting functionality, user management, and administrative features.

### Base URL
```
Development: http://localhost:5000
Production: https://winzo-platform-production.up.railway.app
```

### API Versioning
All API endpoints are prefixed with `/api` and follow RESTful conventions.

### Response Format
All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {}, 
  "message": "Operation successful",
  "timestamp": "2024-12-01T10:30:00.000Z"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-12-01T10:30:00.000Z"
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "phoneNumber": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "createdAt": "2024-12-01T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here"
  },
  "message": "User registered successfully"
}
```

#### POST /api/auth/login
Authenticate user and receive access token.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",
      "lastLogin": "2024-12-01T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "expiresIn": "24h"
  },
  "message": "Login successful"
}
```

#### POST /api/auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

#### POST /api/auth/logout
Logout user and invalidate tokens.

**Headers:** Authorization required

#### GET /api/auth/profile
Get current user profile information.

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "preferences": {
      "defaultStake": 25,
      "oddsFormat": "american",
      "notifications": true
    },
    "createdAt": "2024-12-01T10:30:00.000Z"
  }
}
```

## Sports API

Provides access to live sports data, odds, scores, and event information.

### GET /api/sports
Get all available sports.

**Query Parameters:**
- `include_inactive` (boolean): Include inactive sports (default: false)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "key": "americanfootball_nfl",
      "title": "NFL",
      "group": "American Football",
      "active": true,
      "icon": "🏈",
      "category": "US Sports",
      "popularity": 10
    },
    {
      "key": "basketball_nba",
      "title": "NBA",
      "group": "Basketball",
      "active": true,
      "icon": "🏀",
      "category": "US Sports",
      "popularity": 9
    }
  ],
  "count": 51,
  "quota": {
    "used": 10,
    "remaining": 490,
    "total": 500,
    "percentUsed": 2
  }
}
```

### GET /api/sports/:sport/odds
Get odds for a specific sport.

**Path Parameters:**
- `sport` (string): Sport key from sports list

**Query Parameters:**
- `regions` (string): Comma-separated regions (default: "us")
- `markets` (string): Comma-separated markets (default: "h2h")
- `bookmakers` (string): Comma-separated bookmaker keys
- `limit` (number): Maximum number of events to return

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "event_123",
      "sport_key": "americanfootball_nfl",
      "commence_time": "2024-12-15T20:00:00Z",
      "home_team": "Dallas Cowboys",
      "away_team": "Philadelphia Eagles",
      "bookmakers": [
        {
          "key": "draftkings",
          "title": "DraftKings",
          "markets": [
            {
              "key": "h2h",
              "outcomes": [
                { "name": "Dallas Cowboys", "price": 150 },
                { "name": "Philadelphia Eagles", "price": -180 }
              ]
            },
            {
              "key": "spreads",
              "outcomes": [
                { "name": "Dallas Cowboys", "price": -110, "point": -3.5 },
                { "name": "Philadelphia Eagles", "price": -110, "point": 3.5 }
              ]
            }
          ]
        }
      ],
      "timing": {
        "date": "12/15/2024",
        "time": "8:00 PM",
        "hoursFromNow": 72,
        "isLive": false,
        "isUpcoming": true
      },
      "featured": true,
      "markets_count": 3
    }
  ],
  "count": 15,
  "sport": "americanfootball_nfl"
}
```

### GET /api/sports/:sport/scores
Get scores for a specific sport.

**Path Parameters:**
- `sport` (string): Sport key from sports list

**Query Parameters:**
- `daysFrom` (number): Days from today to include (default: 1)
- `completed_only` (boolean): Only completed games (default: false)
- `live_only` (boolean): Only live games (default: false)

### GET /api/sports/:sport/events/:eventId
Get detailed information for a specific event.

**Path Parameters:**
- `sport` (string): Sport key
- `eventId` (string): Event ID from odds/scores data

## Sports API Endpoints

### Enhanced Sport-Specific Endpoints (Phase 1 - Live Data Integration)

#### NFL Games Endpoint
```
GET /api/sports/nfl/games
```

**Description**: Get NFL games optimized for American Football page with live data transformation.

**Query Parameters**:
- `week` (optional): NFL week number
- `season` (optional): NFL season year (default: 2025)
- `limit` (optional): Number of games to return (default: 20)

**Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "id": "nfl_game_123",
      "sport_key": "americanfootball_nfl",
      "sport_icon": "/images/icon/america-football.png",
      "league_name": "NFL",
      "game_time": "Today, 20:20",
      "home_team": "Philadelphia Eagles",
      "away_team": "Dallas Cowboys",
      "home_team_logo": "/images/clubs/nfl/philadelphia-eagles.png",
      "away_team_logo": "/images/clubs/nfl/dallas-cowboys.png",
      "markets": {
        "h2h": {
          "outcomes": {
            "Philadelphia Eagles": [{"price": -180, "bookmaker": "draftkings"}],
            "Dallas Cowboys": [{"price": 160, "bookmaker": "draftkings"}]
          }
        },
        "spreads": {
          "outcomes": {
            "Philadelphia Eagles": [{"price": -110, "point": -3.5, "bookmaker": "draftkings"}],
            "Dallas Cowboys": [{"price": -110, "point": 3.5, "bookmaker": "draftkings"}]
          }
        },
        "totals": {
          "outcomes": {
            "Over 47.5": [{"price": -105, "point": 47.5, "bookmaker": "draftkings"}],
            "Under 47.5": [{"price": -115, "point": 47.5, "bookmaker": "draftkings"}]
          }
        }
      },
      "bookmaker_count": 5,
      "last_updated": "2025-01-27T15:30:00Z",
      "featured": true
    }
  ],
  "metadata": {
    "sport": "nfl",
    "week": 1,
    "season": 2025,
    "games_count": 12,
    "last_updated": "2025-06-27T01:20:45Z",
    "data_source": "live_api"
  },
  "quota": {
    "used": 125,
    "remaining": 375,
    "total": 500,
    "percentUsed": 25
  }
}
```

#### Soccer Games Endpoint
```
GET /api/sports/soccer/games
```

**Description**: Get Soccer games with 3-way betting markets optimized for Soccer page.

**Query Parameters**:
- `league` (optional): Soccer league (default: "epl"). Options: epl, la_liga, bundesliga, serie_a, ligue_one
- `limit` (optional): Number of games to return (default: 20)

**Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "id": "game_id",
      "sport_key": "soccer_epl",
      "sport_icon": "/images/icon/soccer-icon.png",
      "league_name": "Premier League",
      "game_time": "Tomorrow, 3:00 PM CDT",
      "home_team": "Manchester United",
      "away_team": "Liverpool",
      "home_team_logo": "/images/icon/man-utd.png",
      "away_team_logo": "/images/icon/liverpool.png",
      "markets": {
        "h2h": {
          "outcomes": {},
          "bookmakers": [],
          "three_way": {
            "home": [],
            "draw": [],
            "away": []
          }
        }
      },
      "best_odds": {
        "h2h": {
          "summary": {
            "home": { "price": 2.5, "bookmaker": "bet365" },
            "draw": { "price": 3.2, "bookmaker": "williamhill" },
            "away": { "price": 2.8, "bookmaker": "ladbrokes" }
          }
        }
      },
      "bookmaker_count": 8,
      "featured": true
    }
  ],
  "metadata": {
    "sport": "soccer",
    "league": "epl",
    "games_count": 10,
    "data_source": "live_api"
  }
}
```

#### Basketball Games Endpoint
```
GET /api/sports/basketball/games
```

**Description**: Get Basketball games optimized for Basketball page.

**Query Parameters**:
- `league` (optional): Basketball league (default: "nba"). Options: nba, ncaab
- `limit` (optional): Number of games to return (default: 20)

#### Ice Hockey Games Endpoint
```
GET /api/sports/icehockey/games
```

**Description**: Get Ice Hockey games optimized for Ice Hockey page.

**Query Parameters**:
- `league` (optional): Hockey league (default: "nhl")
- `limit` (optional): Number of games to return (default: 20)

#### Best Odds Comparison Endpoint
```
GET /api/sports/{sport}/best-odds/{gameId}
```

**Description**: Get optimized best odds comparison across bookmakers for a specific game.

**Path Parameters**:
- `sport`: Sport key (e.g., "americanfootball_nfl", "soccer_epl")
- `gameId`: Unique game identifier

**Response Format**:
```json
{
  "success": true,
  "data": {
    "game_id": "game_id",
    "sport_key": "americanfootball_nfl",
    "home_team": "Philadelphia Eagles",
    "away_team": "Dallas Cowboys",
    "best_odds": {
      "h2h": {
        "home": { "price": -140, "bookmaker": "draftkings", "bookmaker_title": "DraftKings" },
        "away": { "price": 120, "bookmaker": "fanduel", "bookmaker_title": "FanDuel" }
      }
    },
    "prioritized_bookmakers": [
      {
        "key": "draftkings",
        "title": "DraftKings",
        "markets": [...],
        "priority_rank": 1
      }
    ],
    "total_bookmakers": 7
  }
}
```

### Data Transformation Features

The Phase 1 implementation includes a comprehensive `OddsDataTransformer` service that:

#### Team Logo Mapping
- **NFL**: 32 team logos mapped to `/images/clubs/{team-name}.png`
- **Soccer**: 20+ EPL team logos mapped to existing icons
- **Basketball**: 10+ NBA team logos mapped
- **Hockey**: 8+ NHL team logos mapped
- **Fallback**: Default team logo for unmapped teams

#### Bookmaker Prioritization
- **NFL/NBA/NHL**: DraftKings, FanDuel, BetMGM, Caesars (US focus)
- **Soccer**: Bet365, William Hill, Ladbrokes, Betfair (EU focus)
- **Auto-sorting**: Bookmakers sorted by priority and odds quality

#### Time Formatting
- **Live games**: "Live" status
- **Today**: "Today, HH:MM" format
- **Tomorrow**: "Tomorrow, HH:MM" format
- **Future**: "MMM DD, HH:MM" format

#### Market Processing
- **2-way betting**: NFL, NBA, NHL (home/away)
- **3-way betting**: Soccer (home/draw/away)
- **Multiple markets**: h2h, spreads, totals, props
- **Best odds calculation**: Automatic best price detection

### Error Handling & Fallbacks

All endpoints implement comprehensive error handling:

1. **API Failures**: Automatic fallback to mock data
2. **Invalid Data**: Data validation and sanitization  
3. **Quota Limits**: Smart quota monitoring and management
4. **Network Issues**: Graceful degradation with cached data

### Caching Strategy

- **In-memory caching**: 30 seconds for live odds
- **Sports list caching**: 24 hours
- **Team logos**: Persistent caching
- **Cache invalidation**: Automatic cleanup for expired entries

### Integration Notes

- **Backward compatibility**: All existing endpoints remain functional
- **Progressive enhancement**: New endpoints enhance existing functionality
- **Mock data fallback**: Ensures platform reliability during API issues
- **Type safety**: Full TypeScript support in frontend integration

---

## General Sports Endpoints

## Betting API

Handles all betting operations including bet placement, history, and management.

### POST /api/betting/place
Place a single bet or parlay.

**Headers:** Authorization required

**Request Body:**
```json
{
  "betType": "single",
  "bets": [
    {
      "eventId": "event_123",
      "sport": "americanfootball_nfl",
      "homeTeam": "Dallas Cowboys",
      "awayTeam": "Philadelphia Eagles",
      "selectedTeam": "Dallas Cowboys",
      "odds": -110,
      "bookmaker": "DraftKings",
      "marketType": "h2h",
      "commenceTime": "2024-12-15T20:00:00Z"
    }
  ],
  "totalStake": 25,
  "potentialPayout": 47.73
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "betId": "bet_456",
    "betType": "single",
    "status": "pending",
    "totalStake": 25,
    "potentialPayout": 47.73,
    "bets": [
      {
        "id": "selection_789",
        "eventId": "event_123",
        "selectedTeam": "Dallas Cowboys",
        "odds": -110,
        "stake": 25
      }
    ],
    "placedAt": "2024-12-01T10:30:00.000Z"
  },
  "message": "Bet placed successfully"
}
```

### GET /api/betting/history
Get user's betting history.

**Headers:** Authorization required

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `status` (string): Filter by status (pending, won, lost, cancelled)
- `dateFrom` (string): Start date (ISO format)
- `dateTo` (string): End date (ISO format)
- `sport` (string): Filter by sport

**Response:**
```json
{
  "success": true,
  "data": {
    "bets": [
      {
        "id": "bet_456",
        "betType": "single",
        "status": "won",
        "totalStake": 25,
        "payout": 47.73,
        "profit": 22.73,
        "placedAt": "2024-12-01T10:30:00.000Z",
        "settledAt": "2024-12-01T23:45:00.000Z",
        "bets": [
          {
            "eventId": "event_123",
            "selectedTeam": "Dallas Cowboys",
            "odds": -110,
            "result": "won"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "totalPages": 5,
      "totalItems": 98,
      "hasNextPage": true
    },
    "summary": {
      "totalBets": 98,
      "totalStaked": 2450,
      "totalReturns": 2678.50,
      "netProfit": 228.50,
      "winRate": 0.56
    }
  }
}
```

### GET /api/betting/:betId
Get specific bet details.

**Headers:** Authorization required

### POST /api/betting/:betId/cancel
Cancel a pending bet.

**Headers:** Authorization required

## User Management API

Handle user account operations and preferences.

### GET /api/user/profile
Get user profile information.

**Headers:** Authorization required

### PUT /api/user/profile
Update user profile information.

**Headers:** Authorization required

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+1234567890",
  "preferences": {
    "defaultStake": 50,
    "oddsFormat": "decimal",
    "notifications": true,
    "autoAcceptOddsChanges": false
  }
}
```

### PUT /api/user/password
Change user password.

**Headers:** Authorization required

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

### GET /api/user/preferences
Get user betting preferences.

**Headers:** Authorization required

### PUT /api/user/preferences
Update user betting preferences.

**Headers:** Authorization required

## Wallet API

Manage user wallet, deposits, withdrawals, and transactions.

### GET /api/wallet/balance
Get current wallet balance.

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": 1250.75,
    "availableBalance": 1225.75,
    "pendingBalance": 25.00,
    "currency": "USD",
    "lastUpdated": "2024-12-01T10:30:00.000Z"
  }
}
```

### POST /api/wallet/deposit
Deposit funds to user wallet.

**Headers:** Authorization required

**Request Body:**
```json
{
  "amount": 100,
  "paymentMethod": "credit_card",
  "paymentDetails": {
    "cardToken": "token_abc123"
  }
}
```

### POST /api/wallet/withdraw
Withdraw funds from user wallet.

**Headers:** Authorization required

**Request Body:**
```json
{
  "amount": 200,
  "withdrawalMethod": "bank_transfer",
  "accountDetails": {
    "accountId": "account_xyz789"
  }
}
```

### GET /api/wallet/transactions
Get wallet transaction history.

**Headers:** Authorization required

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `type` (string): Filter by type (deposit, withdrawal, bet, payout)
- `dateFrom` (string): Start date
- `dateTo` (string): End date

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "tx_123",
        "type": "deposit",
        "amount": 100,
        "status": "completed",
        "description": "Credit card deposit",
        "createdAt": "2024-12-01T10:30:00.000Z",
        "completedAt": "2024-12-01T10:31:00.000Z"
      },
      {
        "id": "tx_124",
        "type": "bet",
        "amount": -25,
        "status": "completed",
        "description": "Bet placed: Cowboys vs Eagles",
        "relatedId": "bet_456",
        "createdAt": "2024-12-01T11:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "totalPages": 3,
      "totalItems": 47
    }
  }
}
```

## Admin API

Administrative endpoints for platform management (Admin role required).

### GET /api/admin/dashboard
Get admin dashboard statistics.

**Headers:** Authorization required (Admin role)

**Response:**
```json
{
  "success": true,
  "data": {
    "statistics": {
      "totalUsers": 1250,
      "activeUsers": 340,
      "totalBets": 15680,
      "totalVolume": 156780.50,
      "totalProfit": 12456.78
    },
    "recentActivity": [
      {
        "type": "user_registration",
        "count": 15,
        "timeframe": "last_24h"
      },
      {
        "type": "bets_placed",
        "count": 147,
        "timeframe": "last_24h"
      }
    ]
  }
}
```

### GET /api/admin/users
Get user management list.

**Headers:** Authorization required (Admin role)

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `search` (string): Search by username or email
- `status` (string): Filter by status (active, suspended, banned)

### PUT /api/admin/users/:userId/status
Update user status.

**Headers:** Authorization required (Admin role)

**Request Body:**
```json
{
  "status": "suspended",
  "reason": "Suspicious betting patterns"
}
```

### GET /api/admin/bets/pending
Get pending bets for settlement.

**Headers:** Authorization required (Admin role)

### POST /api/admin/bets/:betId/settle
Manually settle a bet.

**Headers:** Authorization required (Admin role)

**Request Body:**
```json
{
  "result": "won",
  "payout": 47.73,
  "notes": "Manual settlement due to data issue"
}
```

## Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "error": "Detailed error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Specific field error"
  },
  "timestamp": "2024-12-01T10:30:00.000Z"
}
```

### Common Error Codes
- `AUTH_REQUIRED` - Authentication required
- `AUTH_INVALID` - Invalid authentication token
- `AUTH_EXPIRED` - Authentication token expired
- `PERMISSION_DENIED` - Insufficient permissions
- `VALIDATION_ERROR` - Request validation failed
- `RESOURCE_NOT_FOUND` - Requested resource not found
- `DUPLICATE_ENTRY` - Resource already exists
- `INSUFFICIENT_BALANCE` - Not enough funds in wallet
- `BET_LIMIT_EXCEEDED` - Bet exceeds maximum limit
- `ODDS_CHANGED` - Odds have changed since selection
- `EVENT_SUSPENDED` - Event is no longer available for betting

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- **General endpoints**: 100 requests per minute per IP
- **Authentication endpoints**: 10 requests per minute per IP
- **Sports data endpoints**: 60 requests per minute per user
- **Betting endpoints**: 30 requests per minute per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1638360000
```

## Examples

### Complete Betting Flow Example

```javascript
// 1. Authenticate user
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'johndoe',
    password: 'password123'
  })
});

const { token } = await loginResponse.json();

// 2. Get available sports
const sportsResponse = await fetch('/api/sports', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { data: sports } = await sportsResponse.json();

// 3. Get odds for NFL
const oddsResponse = await fetch('/api/sports/americanfootball_nfl/odds', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { data: events } = await oddsResponse.json();

// 4. Place a bet
const betResponse = await fetch('/api/betting/place', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    betType: 'single',
    bets: [{
      eventId: events[0].id,
      sport: 'americanfootball_nfl',
      homeTeam: events[0].home_team,
      awayTeam: events[0].away_team,
      selectedTeam: events[0].home_team,
      odds: events[0].bookmakers[0].markets[0].outcomes[0].price,
      bookmaker: events[0].bookmakers[0].key,
      marketType: 'h2h',
      commenceTime: events[0].commence_time
    }],
    totalStake: 25,
    potentialPayout: 47.73
  })
});

const { data: bet } = await betResponse.json();
console.log('Bet placed:', bet.betId);
```

### WebSocket Integration
For real-time odds updates:

```javascript
const socket = io('wss://api.winzo.com', {
  auth: { token: jwtToken }
});

// Subscribe to odds updates for specific sport
socket.emit('subscribe_odds', { sport: 'americanfootball_nfl' });

// Listen for odds updates
socket.on('odds_update', (data) => {
  console.log('Odds updated:', data);
  // Update UI with new odds
});

// Listen for bet settlement
socket.on('bet_settled', (data) => {
  console.log('Bet settled:', data);
  // Update user balance and bet status
});
```

---

**API Documentation Version**: 2.0  
**Last Updated**: June 2025  
**Maintained By**: Backend Team  
**Next Review**: Quarterly

*This API documentation is automatically generated from code comments and updated with each release.* 

## Enhanced Sports Endpoints Error Handling

All sports endpoints now include comprehensive error handling to prevent authentication issues and page crashes:

### NFL Games Endpoint
```
GET /sports/nfl/games
```

**Parameters:**
- `week` (optional): NFL week number
- `season` (optional): NFL season year (default: 2025)
- `limit` (optional): Number of games to return (default: 20)

**Enhanced Response Handling:**
- Validates response structure before processing
- Handles both nested and flat response formats
- Provides fallback sample data on failures
- Preserves user authentication session on API errors

**Sample Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "nfl_game_123",
      "sport_key": "americanfootball_nfl",
      "sport_icon": "/images/icon/america-football.png",
      "league_name": "NFL",
      "game_time": "Today, 20:20",
      "home_team": "Philadelphia Eagles",
      "away_team": "Dallas Cowboys",
      "home_team_logo": "/images/clubs/nfl/philadelphia-eagles.png",
      "away_team_logo": "/images/clubs/nfl/dallas-cowboys.png",
      "markets": {
        "h2h": {
          "outcomes": {
            "Philadelphia Eagles": [{"price": -180, "bookmaker": "draftkings"}],
            "Dallas Cowboys": [{"price": 160, "bookmaker": "draftkings"}]
          }
        },
        "spreads": {
          "outcomes": {
            "Philadelphia Eagles": [{"price": -110, "point": -3.5, "bookmaker": "draftkings"}],
            "Dallas Cowboys": [{"price": -110, "point": 3.5, "bookmaker": "draftkings"}]
          }
        },
        "totals": {
          "outcomes": {
            "Over 47.5": [{"price": -105, "point": 47.5, "bookmaker": "draftkings"}],
            "Under 47.5": [{"price": -115, "point": 47.5, "bookmaker": "draftkings"}]
          }
        }
      },
      "bookmaker_count": 5,
      "last_updated": "2025-01-27T15:30:00Z",
      "featured": true
    }
  ]
}
```

### Error Handling Standards

**Authentication Preservation:**
- 401 errors on sports endpoints do NOT remove authentication tokens
- User sessions are preserved during sports data failures
- Only auth-specific endpoints (`/auth/`, `/user/`, `/admin/`) can trigger logout

**Data Validation:**
- All array responses are validated before processing
- Graceful handling of malformed API responses
- Automatic fallback to sample data when needed
- Comprehensive logging for debugging

**Error Response Format:**
```json
{
  "success": false,
  "message": "Detailed error description",
  "error_code": "SPORTS_DATA_UNAVAILABLE",
  "fallback_available": true
}
```

### Similar Endpoints

All sport-specific endpoints follow the same enhanced error handling pattern:

- `GET /sports/soccer/games` - Soccer/Football games
- `GET /sports/basketball/games` - Basketball/NBA games  
- `GET /sports/icehockey/games` - Ice Hockey/NHL games

**Common Parameters:**
- `league` (optional): Specific league filter
- `limit` (optional): Number of games to return
- `status` (optional): Game status filter (`upcoming`, `live`, `finished`) 