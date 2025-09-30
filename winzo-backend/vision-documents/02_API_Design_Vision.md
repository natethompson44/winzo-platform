# 02 API Design Vision

## Purpose
This document defines the comprehensive API design strategy for Winzo's sports betting platform, establishing RESTful API patterns, real-time communication protocols, and integration standards that ensure seamless frontend-backend communication and third-party service integration.

## API Design Philosophy

### Core Principles
- **Consistency**: Uniform naming conventions, response formats, and error handling
- **Security**: Authentication, authorization, and data protection at every endpoint
- **Performance**: Optimized queries, caching, and minimal payload sizes
- **Documentation**: Comprehensive, auto-generated API documentation
- **Versioning**: Backward-compatible API evolution and deprecation strategies

### Design Standards
Per frontend integration requirements:
- **JSON-First**: All API responses in JSON format matching frontend expectations
- **HTTP Standards**: Proper use of HTTP methods, status codes, and headers
- **Error Consistency**: Standardized error response format across all endpoints
- **Rate Limiting**: Built-in protection against abuse and overuse
- **CORS Support**: Secure cross-origin resource sharing configuration

## Authentication & Authorization

### JWT-Based Authentication
```typescript
// Authentication Flow
interface AuthRequest {
  username: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  data: {
    user: UserProfile;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  message: string;
}

// Token Refresh
interface RefreshRequest {
  refreshToken: string;
}

interface RefreshResponse {
  success: boolean;
  data: {
    accessToken: string;
    expiresIn: number;
  };
}
```

### Authentication Endpoints
```
POST /api/auth/login
POST /api/auth/register  
POST /api/auth/refresh
DELETE /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/verify-email
```

### Authorization Middleware
```typescript
// Role-based access control
enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}

interface JWTPayload {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  permissions: string[];
  iat: number;
  exp: number;
}
```

## User Management API

### User Profile Management
```typescript
interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  phone?: string;
  country: string;
  timezone: string;
  preferences: UserPreferences;
  verificationStatus: VerificationStatus;
  createdAt: string;
  updatedAt: string;
}

interface UserPreferences {
  oddsFormat: 'american' | 'decimal' | 'fractional';
  language: string;
  currency: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    betResults: boolean;
    promotions: boolean;
  };
  bettingLimits: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}
```

### User Endpoints
```
GET    /api/users/profile
PUT    /api/users/profile
POST   /api/users/change-password
GET    /api/users/balance
GET    /api/users/betting-history
GET    /api/users/transaction-history
PUT    /api/users/preferences
POST   /api/users/verify-identity
GET    /api/users/verification-status
```

## Sports Data API

### Sports & Events Structure
```typescript
interface Sport {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  isActive: boolean;
  configuration: SportConfiguration;
  leagues: League[];
}

interface League {
  id: string;
  sportId: string;
  name: string;
  displayName: string;
  country: string;
  season: string;
  isActive: boolean;
}

interface Event {
  id: string;
  sportId: string;
  leagueId: string;
  homeTeam: Team;
  awayTeam: Team;
  startTime: string;
  status: EventStatus;
  score?: Score;
  statistics?: EventStatistics;
  markets: Market[];
}

interface Team {
  id: string;
  name: string;
  displayName: string;
  abbreviation: string;
  logo: string;
  conference?: string;
  division?: string;
  record?: TeamRecord;
}

enum EventStatus {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  HALFTIME = 'halftime',
  FINISHED = 'finished',
  POSTPONED = 'postponed',
  CANCELLED = 'cancelled'
}
```

### Sports Data Endpoints
```
GET    /api/sports
GET    /api/sports/:sportId
GET    /api/sports/:sportId/leagues
GET    /api/sports/:sportId/events
GET    /api/sports/:sportId/events/live
GET    /api/sports/:sportId/events/:eventId
GET    /api/sports/:sportId/events/:eventId/markets
GET    /api/teams/:teamId
GET    /api/events/featured
GET    /api/events/today
```

## Betting API

### Betting Data Structures
```typescript
interface Market {
  id: string;
  eventId: string;
  type: MarketType;
  name: string;
  description: string;
  isActive: boolean;
  selections: Selection[];
  rules: MarketRules;
}

interface Selection {
  id: string;
  marketId: string;
  name: string;
  odds: number;
  isActive: boolean;
  lastUpdated: string;
}

enum MarketType {
  MONEYLINE = 'moneyline',
  POINT_SPREAD = 'point_spread',
  TOTAL = 'total',
  PROP = 'prop'
}

interface Bet {
  id: string;
  userId: string;
  marketId: string;
  selectionId: string;
  type: BetType;
  stake: number;
  odds: number;
  potentialWin: number;
  status: BetStatus;
  placedAt: string;
  settledAt?: string;
  result?: BetResult;
}

enum BetStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  SETTLED_WIN = 'settled_win',
  SETTLED_LOSS = 'settled_loss',
  CANCELLED = 'cancelled',
  VOIDED = 'voided'
}
```

### Betting Endpoints
```
POST   /api/bets/place
GET    /api/bets
GET    /api/bets/:betId
PUT    /api/bets/:betId/cancel
POST   /api/bets/parlay
GET    /api/bets/active
GET    /api/bets/settled
POST   /api/bets/validate
GET    /api/markets/:marketId/odds
```

### Bet Placement Flow
```typescript
interface BetPlacementRequest {
  selections: BetSelection[];
  stake: number;
  betType: 'single' | 'parlay';
  acceptOddsChanges?: boolean;
}

interface BetSelection {
  marketId: string;
  selectionId: string;
  odds: number;
}

interface BetPlacementResponse {
  success: boolean;
  data?: {
    betId: string;
    totalStake: number;
    potentialWin: number;
    acceptedOdds: number[];
    confirmationNumber: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
```

## Payment Processing API

### Payment Data Structures
```typescript
interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  paymentMethod?: PaymentMethod;
  reference: string;
  description: string;
  createdAt: string;
  completedAt?: string;
}

enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  BET_DEBIT = 'bet_debit',
  BET_CREDIT = 'bet_credit',
  BONUS = 'bonus',
  ADJUSTMENT = 'adjustment'
}

interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'bank_transfer' | 'e_wallet';
  name: string;
  details: any;
  isDefault: boolean;
}
```

### Payment Endpoints
```
POST   /api/payments/deposit
POST   /api/payments/withdraw
GET    /api/payments/methods
POST   /api/payments/methods
DELETE /api/payments/methods/:methodId
GET    /api/payments/transactions
GET    /api/payments/balance
POST   /api/payments/verify-deposit
```

## Real-Time Communication

### WebSocket Events
```typescript
// Client -> Server Events
interface ClientEvents {
  authenticate: (token: string) => void;
  subscribe_odds: (eventIds: string[]) => void;
  unsubscribe_odds: (eventIds: string[]) => void;
  subscribe_events: (sportIds: string[]) => void;
  place_bet: (betData: BetPlacementRequest) => void;
  get_balance: () => void;
}

// Server -> Client Events
interface ServerEvents {
  authenticated: (user: UserProfile) => void;
  odds_update: (data: OddsUpdate) => void;
  event_update: (data: EventUpdate) => void;
  bet_confirmed: (data: BetConfirmation) => void;
  bet_settled: (data: BetSettlement) => void;
  balance_update: (balance: number) => void;
  error: (error: ErrorResponse) => void;
}

interface OddsUpdate {
  marketId: string;
  eventId: string;
  selections: {
    selectionId: string;
    odds: number;
    lastUpdated: string;
  }[];
}

interface EventUpdate {
  eventId: string;
  status: EventStatus;
  score?: Score;
  clock?: string;
  lastUpdated: string;
}
```

### WebSocket Connection Management
```typescript
class WebSocketManager {
  private connections: Map<string, WebSocket>;
  private userSubscriptions: Map<string, Set<string>>;
  
  authenticate(socket: WebSocket, token: string): Promise<UserProfile>;
  subscribeToOdds(userId: string, eventIds: string[]): void;
  broadcastOddsUpdate(eventId: string, odds: OddsUpdate): void;
  broadcastEventUpdate(eventId: string, update: EventUpdate): void;
  notifyBetResult(userId: string, betResult: BetSettlement): void;
}
```

## Error Handling & Response Standards

### Standard Response Format
```typescript
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId: string;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  meta?: {
    version: string;
    timestamp: string;
    requestId: string;
  };
}
```

### Error Codes & Messages
```typescript
enum APIErrorCode {
  // Authentication Errors
  AUTH_INVALID_CREDENTIALS = 'AUTH_001',
  AUTH_TOKEN_EXPIRED = 'AUTH_002',
  AUTH_TOKEN_INVALID = 'AUTH_003',
  AUTH_INSUFFICIENT_PERMISSIONS = 'AUTH_004',
  
  // Validation Errors
  VALIDATION_REQUIRED_FIELD = 'VAL_001',
  VALIDATION_INVALID_FORMAT = 'VAL_002',
  VALIDATION_OUT_OF_RANGE = 'VAL_003',
  
  // Betting Errors
  BET_INSUFFICIENT_BALANCE = 'BET_001',
  BET_MARKET_CLOSED = 'BET_002',
  BET_ODDS_CHANGED = 'BET_003',
  BET_LIMIT_EXCEEDED = 'BET_004',
  
  // System Errors
  SYSTEM_MAINTENANCE = 'SYS_001',
  SYSTEM_RATE_LIMIT = 'SYS_002',
  SYSTEM_INTERNAL_ERROR = 'SYS_003'
}
```

### HTTP Status Code Usage
```typescript
// Success Responses
200 OK          // Successful GET, PUT requests
201 Created     // Successful POST requests
204 No Content  // Successful DELETE requests

// Client Error Responses
400 Bad Request      // Invalid request format/data
401 Unauthorized     // Authentication required
403 Forbidden        // Insufficient permissions
404 Not Found        // Resource doesn't exist
409 Conflict         // Resource conflict (duplicate)
422 Unprocessable    // Validation errors
429 Too Many Requests // Rate limit exceeded

// Server Error Responses
500 Internal Server Error // Unexpected server error
502 Bad Gateway          // External service error
503 Service Unavailable  // Temporary unavailability
```

## API Versioning Strategy

### Version Management
```typescript
// URL-based versioning
GET /api/v1/sports
GET /api/v2/sports

// Header-based versioning (alternative)
GET /api/sports
Headers: {
  'API-Version': 'v1',
  'Accept': 'application/json'
}

interface APIVersionInfo {
  version: string;
  deprecated: boolean;
  deprecationDate?: string;
  sunsetDate?: string;
  migrationGuide?: string;
}
```

## Rate Limiting & Throttling

### Rate Limiting Configuration
```typescript
interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Maximum requests per window
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
  keyGenerator: (req: Request) => string;
}

// Rate limit tiers
const RATE_LIMITS = {
  anonymous: { windowMs: 15 * 60 * 1000, maxRequests: 100 },
  authenticated: { windowMs: 15 * 60 * 1000, maxRequests: 1000 },
  premium: { windowMs: 15 * 60 * 1000, maxRequests: 5000 }
};
```

## Caching Strategy

### Cache Configuration
```typescript
interface CacheConfig {
  odds: { ttl: 5000, staleWhileRevalidate: true },
  events: { ttl: 30000, staleWhileRevalidate: true },
  sports: { ttl: 3600000, staleWhileRevalidate: false },
  users: { ttl: 300000, staleWhileRevalidate: true }
}

// Cache invalidation patterns
class CacheManager {
  invalidateOdds(eventId: string): void;
  invalidateEvent(eventId: string): void;
  invalidateUserData(userId: string): void;
  warmupCache(keys: string[]): Promise<void>;
}
```

## API Documentation

### OpenAPI Specification
```yaml
openapi: 3.0.0
info:
  title: Winzo Sports Betting API
  version: 1.0.0
  description: Comprehensive API for sports betting platform
  contact:
    name: Winzo API Team
    email: api@winzo.app
servers:
  - url: https://api.winzo.app/v1
    description: Production server
  - url: https://api-staging.winzo.app/v1
    description: Staging server
```

### Documentation Features
- **Interactive API Explorer**: Swagger UI for testing endpoints
- **Code Examples**: Sample requests/responses in multiple languages
- **Authentication Guide**: Step-by-step authentication setup
- **Rate Limiting Info**: Current limits and usage guidelines
- **Webhook Documentation**: Real-time event notification setup

## Integration Testing

### API Testing Strategy
```typescript
describe('Betting API', () => {
  describe('POST /api/bets/place', () => {
    it('should place a valid single bet', async () => {
      const betData = {
        selections: [{ marketId: 'market123', selectionId: 'sel456', odds: 1.85 }],
        stake: 10.00,
        betType: 'single'
      };
      
      const response = await request(app)
        .post('/api/bets/place')
        .set('Authorization', `Bearer ${authToken}`)
        .send(betData)
        .expect(201);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data.betId).toBeDefined();
    });
  });
});
```

## Performance Optimization

### Query Optimization
```typescript
// Efficient data fetching
interface QueryOptions {
  include?: string[];    // Related data to include
  fields?: string[];     // Specific fields to return
  sort?: string;         // Sorting criteria
  limit?: number;        // Result limit
  offset?: number;       // Pagination offset
}

// Example: GET /api/events?include=teams,markets&fields=id,name,startTime&sort=startTime&limit=20
```

### Response Compression
```typescript
// Gzip compression for large responses
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
  threshold: 1024
}));
```

The API design vision ensures seamless integration between Winzo's frontend and backend while providing a robust, scalable, and secure foundation for sports betting operations.

