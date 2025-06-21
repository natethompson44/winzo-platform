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
npm run db:setup     # Setup database
npm run db:reset     # Reset database (dev only)
npm run db:migrate   # Run migrations
npm run db:seed      # Seed test data

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
# Reset database (development only)
npm run db:reset

# Check database connection
node -e "require('./src/database/init').testConnection()"

# View database logs
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