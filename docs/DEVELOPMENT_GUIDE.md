# WINZO Platform Development Guide

## Table of Contents
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Environment](#development-environment)
- [Coding Standards](#coding-standards)
- [Component Development](#component-development)
- [State Management](#state-management)
- [Testing](#testing)
- [Build & Deployment](#build--deployment)
- [Performance](#performance)
- [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites
- **Node.js**: Version 18+ (see `.nvmrc` for exact version)
- **npm**: Version 9+
- **PostgreSQL**: Version 14+
- **Git**: Latest version
- **Code Editor**: VS Code recommended with extensions

### Quick Setup
```bash
# 1. Clone the repository
git clone <repository-url>
cd winzo-platform

# 2. Backend setup
cd winzo-backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run db:setup
npm start

# 3. Frontend setup (new terminal)
cd ../winzo-frontend
npm install
cp .env.example .env
# Edit .env with backend URL
npm start

# 4. Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

### Required Environment Variables

#### Backend (.env)
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=winzo_platform
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DATABASE_URL=postgresql://user:password@localhost:5432/winzo_platform

# The Odds API
ODDS_API_KEY=your_odds_api_key_here
ODDS_API_BASE_URL=https://api.the-odds-api.com/v4

# Authentication
JWT_SECRET=your_secure_jwt_secret_32_chars_minimum
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENVIRONMENT=development
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_DEBUG_MODE=true
```

## Project Structure

### Frontend Architecture
```
winzo-frontend/
├── public/                 # Static assets
│   ├── index.html         # Main HTML template
│   ├── manifest.json      # PWA manifest
│   └── sw.js             # Service worker
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components
│   │   ├── sports/       # Sports-specific components
│   │   ├── layout/       # Layout components
│   │   ├── account/      # Account management
│   │   ├── admin/        # Admin dashboard
│   │   └── mobile/       # Mobile-specific components
│   ├── pages/            # Page-level components
│   ├── contexts/         # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript definitions
│   └── styles/           # CSS and design system
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

### Backend Architecture
```
winzo-backend/
├── src/
│   ├── routes/           # API route definitions
│   ├── models/           # Database models (Sequelize)
│   ├── services/         # Business logic services
│   ├── middleware/       # Express middleware
│   ├── utils/            # Utility functions
│   ├── database/         # Database setup and migrations
│   └── types/            # TypeScript definitions
├── tests/                # Test files
├── package.json          # Dependencies and scripts
└── server.js            # Application entry point
```

## Development Environment

### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-eslint"
  ]
}
```

### VS Code Settings
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  }
}
```

### Git Configuration
```bash
# Setup Git hooks for code quality
npx husky install
npx husky add .husky/pre-commit "npm run lint-staged"
npx husky add .husky/pre-push "npm run test"
```

## Coding Standards

### TypeScript Guidelines

#### Interface Naming
```typescript
// Use PascalCase for interfaces
interface UserProfile {
  id: string;
  username: string;
  email: string;
}

// Use 'I' prefix for internal interfaces only when needed
interface IApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
```

#### Type Definitions
```typescript
// Use union types for specific values
type BetType = 'single' | 'parlay' | 'system';
type UserRole = 'user' | 'admin' | 'moderator';

// Use generic types for reusable components
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Use enums for constants
enum BetStatus {
  PENDING = 'pending',
  WON = 'won',
  LOST = 'lost',
  CANCELLED = 'cancelled'
}
```

### React Component Guidelines

#### Functional Components
```tsx
// Use functional components with TypeScript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

#### Hooks Usage
```tsx
// Custom hooks for business logic
const useBetSlip = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addBet = useCallback((bet: Bet) => {
    setBets(prevBets => [...prevBets, bet]);
  }, []);

  const removeBet = useCallback((betId: string) => {
    setBets(prevBets => prevBets.filter(bet => bet.id !== betId));
  }, []);

  return {
    bets,
    isLoading,
    addBet,
    removeBet
  };
};
```

### CSS Guidelines

#### Design System Usage
```css
/* Use CSS variables from design system */
.custom-component {
  background-color: var(--color-neutral-0);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  font-size: var(--text-base);
  transition: var(--transition-normal);
}

/* Follow BEM methodology for custom components */
.game-card {
  /* Block */
}

.game-card__header {
  /* Element */
}

.game-card__header--featured {
  /* Modifier */
}
```

#### Responsive Design
```css
/* Mobile-first approach */
.responsive-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

/* Tablet and up */
@media (min-width: 768px) {
  .responsive-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .responsive-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-8);
  }
}
```

## Component Development

### Component Structure
```
Component/
├── index.ts              # Export file
├── Component.tsx         # Main component
├── Component.test.tsx    # Tests
├── Component.stories.tsx # Storybook stories (if using)
└── types.ts             # Component-specific types
```

### Component Template
```tsx
// Component.tsx
import React from 'react';
import { ComponentProps } from './types';
import './Component.css';

export const Component: React.FC<ComponentProps> = ({
  prop1,
  prop2,
  ...props
}) => {
  return (
    <div className="component" {...props}>
      {/* Component content */}
    </div>
  );
};
```

### Props Interface Template
```typescript
// types.ts
export interface ComponentProps {
  // Required props
  id: string;
  
  // Optional props with defaults
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  
  // Event handlers
  onClick?: (event: React.MouseEvent) => void;
  onChange?: (value: string) => void;
  
  // Children and content
  children?: React.ReactNode;
  
  // HTML attributes
  className?: string;
  'data-testid'?: string;
}
```

## State Management

### Context Pattern
```tsx
// AuthContext.tsx
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Implementation...

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Custom Hooks
```tsx
// useApi.ts
const useApi = <T>(endpoint: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<T>(endpoint);
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
```

## Testing

### Testing Strategy
- **Unit Tests**: Individual components and utilities
- **Integration Tests**: Component interactions and API calls
- **E2E Tests**: Critical user flows
- **Performance Tests**: Bundle size and runtime performance

### Jest Configuration
```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --coverage --watchAll=false"
  },
  "jest": {
    "testEnvironment": "jsdom",
    "setupFilesAfterEnv": ["<rootDir>/src/setupTests.ts"],
    "collectCoverageFrom": [
      "src/**/*.{ts,tsx}",
      "!src/**/*.d.ts",
      "!src/index.tsx"
    ]
  }
}
```

### Component Testing
```tsx
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct variant class', () => {
    render(<Button variant="accent">Click me</Button>);
    expect(screen.getByText('Click me')).toHaveClass('btn-accent');
  });
});
```

### API Testing
```tsx
// apiClient.test.ts
import { apiClient } from './apiClient';
import { mockServer } from '../mocks/server';

beforeAll(() => mockServer.listen());
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());

describe('apiClient', () => {
  it('makes successful GET request', async () => {
    const data = await apiClient.get('/api/sports');
    expect(data).toHaveProperty('success', true);
    expect(data.data).toBeInstanceOf(Array);
  });

  it('handles API errors', async () => {
    mockServer.use(
      rest.get('/api/sports', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );

    await expect(apiClient.get('/api/sports')).rejects.toThrow('Server error');
  });
});
```

## 🔐 Authentication System

### Session Persistence Fix (December 2024)

**CRITICAL FIX IMPLEMENTED**: Resolved authentication session loss during sports navigation.

#### Problem Identified:
- Users were automatically logged out when navigating to ANY sports section
- Sports pages used `HeaderMain` component which didn't check authentication status
- Hardcoded "Log In" and "Sign Up" buttons regardless of user login status
- 100% reproducible issue affecting all sports betting workflows

#### Solution Implemented:

1. **Updated HeaderMain Component** (`components/Shared/HeaderMain.tsx`):
   ```typescript
   // Now uses authentication context
   import { useAuth } from '@/contexts/AuthContext';
   
   const { user, isAuthenticated, logout } = useAuth();
   
   // Shows different UI based on authentication status
   {isAuthenticated ? (
     // Authenticated user UI with balance, dashboard link, user icon
   ) : (
     // Non-authenticated user UI with login/signup buttons
   )}
   ```

2. **Updated HeaderTwo Component** (`components/Shared/HeaderTwo.tsx`):
   ```typescript
   // Now displays real user balance instead of hardcoded $0.22
   <span className="fw-bold d-block">${user?.wallet_balance?.toFixed(2) || '0.00'}</span>
   ```

3. **Updated FooterCard Component** (`components/Shared/FooterCard.tsx`):
   ```typescript
   // Shows authentication-aware betting interface
   {isAuthenticated ? (
     <span className="n3-color fs-seven">Clear Bet</span>
   ) : (
     <Link href="/login" className="n3-color fs-seven">Sign In & Bet</Link>
   )}
   ```

#### Authentication Flow:
1. **Login Process**: ✅ User logs in successfully
2. **Dashboard Access**: ✅ User can access dashboard with authenticated header
3. **Sports Navigation**: ✅ **FIXED** - User remains logged in when navigating to sports sections
4. **Consistent UI**: ✅ All pages now show appropriate authentication status

#### Testing Verification:
- ✅ No more automatic logout during sports navigation
- ✅ User balance displayed correctly across all pages
- ✅ Appropriate header content based on authentication status
- ✅ Bet slip shows correct authentication-based options
- ✅ No ESLint warnings or TypeScript errors
- ✅ Successful Next.js build and static export

#### Business Impact:
- **RESOLVED**: Critical user experience issue
- **IMPROVED**: Seamless sports betting workflow
- **ENHANCED**: Professional authentication system
- **ELIMINATED**: User frustration from repeated logins

### Authentication Components

#### Primary Components:
- **AuthContext** (`contexts/AuthContext.tsx`): Core authentication logic
- **HeaderMain** (`components/Shared/HeaderMain.tsx`): Sports pages header (now authentication-aware)
- **HeaderTwo** (`components/Shared/HeaderTwo.tsx`): Dashboard header (enhanced with real user data)
- **FooterCard** (`components/Shared/FooterCard.tsx`): Bet slip (authentication-aware)

#### Authentication State Management:
```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, inviteCode: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateBalance: (newBalance: number) => void;
}
```

#### Token Management:
- Stored in `localStorage` as 'authToken'
- Automatically included in API requests via axios interceptors
- Persistent across page navigation and refresh
- Proper cleanup on logout

#### Error Handling:
- Network errors preserve authentication state
- 401 responses only remove tokens for auth-related endpoints
- Graceful fallback for API failures
- User-friendly error messages

## Build & Deployment

### Available Scripts

#### Frontend Scripts
```bash
# Development
npm start              # Start development server
npm run build         # Build for production
npm run build:debug   # Build with source maps
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint issues
npm run type-check    # TypeScript type checking
npm run test          # Run tests
npm run test:coverage # Run tests with coverage

# Deployment
npm run deploy        # Deploy to Netlify
```

#### Backend Scripts
```bash
# Development
npm start             # Start production server
npm run dev          # Start with nodemon
npm run test         # Run tests
npm run lint         # Run ESLint

# Database
npm run migrate             # Run comprehensive migrations
npm run migrate:prod        # Run migrations in production
npm run db:check           # Check database tables and users
npm run db:create-test-user # Create test user for development

# Deployment
npm run deploy       # Deploy to Railway
```

### Build Optimization

#### Frontend Optimization
```json
// package.json - Build optimizations
{
  "scripts": {
    "analyze": "npm run build && npx source-map-explorer 'build/static/js/*.js'",
    "build:profile": "npm run build -- --profile"
  }
}
```

#### Code Splitting
```tsx
// Lazy loading for route components
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Sports = lazy(() => import('../pages/Sports'));

const App = () => (
  <Router>
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sports" element={<Sports />} />
      </Routes>
    </Suspense>
  </Router>
);
```

### Environment Configuration

#### Development vs Production
```typescript
// config.ts
const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  environment: process.env.NODE_ENV || 'development',
  enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  debugMode: process.env.REACT_APP_DEBUG_MODE === 'true'
};

export default config;
```

## Database Management

### Migration System

WINZO uses a comprehensive migration system that automatically handles database schema updates. The migration system is designed to be safe for both development and production environments.

#### Migration Architecture
```
winzo-backend/src/database/
├── complete-migration.js          # Comprehensive migration runner
├── init.js                       # Database initialization
├── schema.sql                    # Base database schema
├── user_enhancement_migration.sql # User profile enhancements
├── admin_role_migration.sql      # Admin role support
├── create-test-user.js           # Development utility
└── check-tables.js              # Database inspection tool
```

#### How Migrations Work

1. **Automatic Execution**: Migrations run automatically when the server starts
2. **Idempotent Operations**: Safe to run multiple times - checks existing state
3. **Progressive Updates**: Applies only missing schema changes
4. **Production Safe**: Includes proper error handling and rollback capabilities

#### Migration Process

The `complete-migration.js` script runs these steps in order:

1. **Basic Schema**: Creates core tables (users, sports, events, odds, bets, transactions)
2. **User Enhancements**: Adds profile fields (first_name, last_name, phone, preferences, etc.)
3. **Admin Support**: Adds role-based access control
4. **Validation**: Verifies all changes were applied successfully

### Available Commands

```bash
# Run all necessary migrations
npm run migrate

# Run migrations in production environment
npm run migrate:prod

# Check current database state
npm run db:check

# Create test user for development
npm run db:create-test-user
```

### Migration Details

#### Schema Migration (schema.sql)
- Creates base tables: users, sports, sports_events, odds, bets, transactions, bookmakers
- Establishes relationships and foreign keys
- Adds essential indexes for performance
- Inserts default bookmaker data

#### User Enhancement Migration
- Adds personal information fields (name, phone, address, etc.)
- Adds verification status fields (email_verified, phone_verified)
- Adds security features (two_factor_enabled, account_locked, login_attempts)
- Adds preferences JSON field for user settings
- Adds invite_code for referral system

#### Admin Role Migration
- Adds role field to users table ('user' or 'admin')
- Creates index for role-based queries
- Enables admin dashboard functionality

### Development Workflow

#### Local Development
```bash
# Initial setup
npm install
npm run migrate
npm run db:create-test-user

# Check database state
npm run db:check

# Start development server
npm run dev
```

#### Production Deployment
- Migrations run automatically on Railway when the app starts
- Production DATABASE_URL is used automatically
- No manual intervention required

### Troubleshooting Database Issues

#### Common Issues
```bash
# Check if database connection is working
npm run db:check

# Verify migrations completed
npm run migrate

# Create fresh test user
npm run db:create-test-user

# Reset database (development only)
# Note: This will delete all data!
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npm run migrate
```

#### Database Schema Verification
```sql
-- Check if user enhancement fields exist
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check user roles
SELECT DISTINCT role FROM users;

-- Verify indexes exist
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'users';
```

### Adding New Migrations

When adding new database features:

1. **Create Migration SQL File**: Add new `.sql` file in `src/database/`
2. **Update complete-migration.js**: Add check and execution logic
3. **Test Locally**: Verify migration works on fresh database
4. **Update Documentation**: Document new fields/tables

#### Example Migration Addition
```javascript
// In complete-migration.js
const newFeatureExists = await checkIfColumnExists(sequelize, 'users', 'new_feature_field')

if (!newFeatureExists) {
  console.log('\n🆕 Running new feature migration...')
  await runMigrationScript(sequelize, 'new_feature_migration.sql', 'New feature migration')
} else {
  console.log('\n🆕 New feature already exists')
}
```

## Performance

### Performance Guidelines

#### React Performance
```tsx
// Use React.memo for pure components
export const ExpensiveComponent = React.memo<Props>(({ data }) => {
  return <div>{/* Expensive rendering */}</div>;
});

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// Use useCallback for event handlers
const handleClick = useCallback(() => {
  // Handle click
}, [dependency]);
```

#### Bundle Analysis
```bash
# Analyze bundle size
npm run analyze

# Check for duplicate dependencies
npx duplicate-package-checker

# Audit for vulnerabilities
npm audit
```

### Performance Monitoring
```typescript
// Performance tracking
const trackPerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
};

// Web Vitals monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf build/
npm run build

# Fix TypeScript errors
npm run type-check
```

#### Runtime Errors
```bash
# Check console for errors
# Enable debug mode in development
REACT_APP_DEBUG_MODE=true npm start

# Check network requests in DevTools
# Verify API endpoints are responding
```

#### Database Issues
```bash
# Check database state and connection
npm run db:check

# Run migrations manually
npm run migrate

# Create test user for login testing
npm run db:create-test-user

# View database logs (if available)
tail -f /var/log/postgresql/postgresql.log
```

### Debugging Tools

#### React Developer Tools
- Install React DevTools browser extension
- Use Profiler for performance debugging
- Inspect component props and state

#### Network Debugging
```typescript
// API request interceptor for debugging
axios.interceptors.request.use(request => {
  console.log('Starting Request:', request);
  return request;
});

axios.interceptors.response.use(
  response => {
    console.log('Response:', response);
    return response;
  },
  error => {
    console.error('Response Error:', error);
    return Promise.reject(error);
  }
);
```

### Development Workflow

#### Git Workflow
```bash
# Feature development
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
# Create pull request

# Hotfix workflow
git checkout -b hotfix/fix-critical-bug
# Make fix
git add .
git commit -m "fix: resolve critical bug"
git push origin hotfix/fix-critical-bug
# Create urgent pull request
```

#### Code Review Checklist
- [ ] Code follows established patterns
- [ ] Tests are included and passing
- [ ] No console.log statements in production code
- [ ] TypeScript types are properly defined
- [ ] Accessibility considerations addressed
- [ ] Performance impact considered
- [ ] Documentation updated if needed

---

**Development Guide Version**: 2.0  
**Last Updated**: December 2024  
**Maintained By**: Development Team  
**Next Review**: Quarterly

*This guide is a living document. For the latest updates, check the repository's development documentation.*

### API Quota Management & Performance Optimization (December 2024)

**CRITICAL PERFORMANCE FIXES IMPLEMENTED**: Resolved API quota exhaustion issue where single page loads consumed 60+ API calls.

#### Problem Identified:
- **Excessive API Usage**: Single American Football page load consumed 60+ Odds API calls
- **Insufficient Caching**: 30-second cache duration caused constant API requests
- **No Quota Protection**: No safeguards against API exhaustion
- **Redundant Requests**: 200+ duplicate requests for team logo fallbacks

#### Solution Implemented:

1. **Optimized Cache Durations** (`src/services/oddsApiService.js`):
   ```javascript
   // BEFORE: Aggressive API usage
   odds: 30,     // 30 seconds - caused 60+ calls per page
   scores: 15,   // 15 seconds - excessive refreshing
   
   // AFTER: Optimized for production
   odds: 300,    // 5 minutes - reduces calls by 90%
   scores: 60,   // 1 minute - balanced freshness vs quota
   sports: 86400 // 24 hours - rarely changes
   ```

2. **Emergency Quota Protection**:
   ```javascript
   // Quota protection prevents API exhaustion
   if (this.quotaRemaining < 5) {
     // Return stale cache instead of making new calls
     const staleCache = this.cache.get(cacheKey)
     if (staleCache) {
       return staleCache.data // Use older data to preserve quota
     }
     throw new Error('API quota exhausted')
   }
   ```

3. **Smart Emergency Caching**:
   ```javascript
   // When quota < 100 calls remaining, use longer cache durations
   emergencyCacheDurations: {
     sports: 172800, // 48 hours
     odds: 900,      // 15 minutes  
     scores: 300     // 5 minutes
   }
   ```

4. **Team Logo Path Optimization** (`src/services/OddsDataTransformer.js`):
   ```javascript
   // FIXED: Corrected paths to prevent 404s
   'Philadelphia Eagles': '/images/clubs/philadelphia-eagles.png', // Direct path
   // REMOVED: Invalid subdirectory paths that caused fallbacks
   // 'Philadelphia Eagles': '/images/clubs/nfl/philadelphia-eagles.png', // 404!
   ```

5. **Default Logo Caching & Client-Side Preloading**:
   ```javascript
   // Backend: Prevents hundreds of duplicate default-team.png requests
   static defaultLogoCache = new Map();
   static getDefaultTeamLogo(teamName) {
     const cacheKey = 'default_logo';
     if (this.defaultLogoCache.has(cacheKey)) {
       return this.defaultLogoCache.get(cacheKey); // Cached path
     }
     const defaultPath = '/images/clubs/default-team.png';
     this.defaultLogoCache.set(cacheKey, defaultPath);
     return defaultPath;
   }

   // Frontend: Client-side logo deduplication and preloading
   class TeamLogoCache {
     static getCachedLogoUrl(originalUrl) {
       // Preloads default-team.png before first img request
       // Deduplicates logo URLs to prevent multiple HTTP requests
       // Returns cached URL to ensure consistent references
     }
     
     private static preloadDefaultLogo() {
       // Creates <link rel="preload"> for immediate caching
       // Eliminates 100+ duplicate HTTP requests on page load
     }
   }
   ```

#### Performance Impact:

##### Before Optimization:
```
🔴 Page Load: 60+ API calls
🔴 Team Logos: 200+ duplicate requests  
🔴 Cache Duration: 30 seconds
🔴 Daily API Usage: ~8,640 calls (unsustainable)
🔴 Quota Exhaustion: High risk
```

##### After Optimization:
```
🟢 Page Load: 1-2 API calls (first time)
🟢 Team Logos: Optimized paths + caching + client-side preloading
🟢 HTTP Requests: 1 request for default-team.png (vs 100+ duplicate requests)
🟢 Cache Duration: 5 minutes
🟢 Daily API Usage: ~288 calls (sustainable)
🟢 Quota Management: Protected with emergency mode
🟢 Page Load Speed: Significantly faster due to image preloading
```

#### Quota Monitoring Features:

1. **Real-time Quota Tracking**:
   ```javascript
   getQuotaStatus() {
     return {
       used: this.quotaUsed,
       remaining: this.quotaRemaining,
       total: 500,
       percentUsed: Math.round((this.quotaUsed / 500) * 100)
     }
   }
   ```

2. **Automatic Warnings**:
   ```javascript
   // Console warnings when quota gets low
   if (this.quotaRemaining < 50) {
     console.warn(`⚠️ API quota getting low: ${this.quotaRemaining} calls remaining`)
   }
   if (this.quotaRemaining < 20) {
     console.error(`🚨 API quota critically low: ${this.quotaRemaining} calls remaining`)
   }
   ```

3. **Emergency Fallback Mode**:
   - Activates when quota < 100 calls remaining
   - Uses stale cached data instead of making new API calls
   - Extends cache durations automatically
   - Prevents complete service disruption

#### Environment Variables:
```bash
# Optional: Override default cache durations
ODDS_API_CACHE_DURATION_SPORTS=86400  # 24 hours
ODDS_API_CACHE_DURATION_ODDS=300      # 5 minutes
ODDS_API_CACHE_DURATION_SCORES=60     # 1 minute
```

#### Testing Results:
- ✅ **API Usage Reduced**: From 60+ calls to 1-2 calls per page load
- ✅ **Performance Improved**: Faster page loads due to caching
- ✅ **HTTP Requests Optimized**: From 100+ to 1 request for default team logos
- ✅ **Client-Side Preloading**: Default logos cached before first img element loads
- ✅ **Quota Protected**: Automatic fallbacks prevent exhaustion
- ✅ **Visual Stability**: Eliminated flickering team logos
- ✅ **Production Ready**: Sustainable for high-traffic usage

#### Business Impact:
- **Cost Reduction**: 95% reduction in API usage costs
- **Reliability**: Protected against quota exhaustion outages
- **Performance**: Faster user experience with cached data
- **Scalability**: Platform can handle more concurrent users

*This guide is a living document. For the latest updates, check the repository's development documentation.*

## 🕐 Timezone Configuration

**Default Timezone: CDT (Central Daylight Time)**

All game times are displayed in Central Daylight Time (CDT) for consistency with major US sports scheduling.

### Time Display Format
- **Today**: "Today, 7:20 PM CDT"  
- **Tomorrow**: "Tomorrow, 8:00 PM CDT"
- **Future**: "Sep 4, 7:20 PM CDT"
- **Live Games**: "Live"

### Backend Implementation
Game times are converted to CDT in `winzo-backend/src/services/OddsDataTransformer.js`:

```javascript
static formatGameTime(commenceTime) {
  const timeFormatOptions = { 
    timeZone: 'America/Chicago',  // CDT timezone
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true
  };
  
  // Always display with "CDT" suffix for clarity
  return `Today, ${timeStr} CDT`;
}
```

### Frontend Display
Times are displayed consistently across all sports pages using the formatted time from the API.

**Example Fix**: Eagles vs Cowboys game showing "Sep 5, 12:20 AM" is now correctly displayed as "Sep 4, 7:20 PM CDT" 