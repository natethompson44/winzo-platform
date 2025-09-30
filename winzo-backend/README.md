# Winzo Sports Betting Platform - Backend API

A comprehensive, production-ready backend API for the Winzo sports betting platform built with Node.js, TypeScript, Express, PostgreSQL, and Redis.

## 🏗️ Architecture Overview

The Winzo backend follows a modular, scalable architecture designed for high-performance sports betting operations:

- **TypeScript-First**: Full type safety and enhanced developer experience
- **Microservices-Ready**: Modular design supporting future service separation  
- **Real-Time Capabilities**: WebSocket integration for live odds and updates
- **Financial-Grade Security**: PCI DSS compliance and comprehensive audit trails
- **High Performance**: Optimized for sub-100ms API response times
- **Regulatory Compliance**: Built-in features for gaming regulation requirements

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL 15+
- Redis 7+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd winzo-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database setup**
   ```bash
   # Create database
   createdb winzo_dev
   
   # Run migrations
   npm run db:migrate
   
   # Seed initial data
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000/api/v1`

## 📁 Project Structure

```
winzo-backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.ts   # Database configuration
│   │   ├── environment.ts # Environment variables
│   │   ├── logger.ts     # Logging configuration
│   │   ├── redis.ts      # Redis configuration
│   │   └── swagger.ts    # API documentation
│   ├── controllers/      # Route controllers
│   │   ├── auth.ts       # Authentication endpoints
│   │   ├── betting.ts    # Betting operations
│   │   ├── payments.ts   # Payment processing
│   │   ├── sports.ts     # Sports data
│   │   └── users.ts      # User management
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts       # Authentication middleware
│   │   ├── errorHandler.ts # Error handling
│   │   ├── rateLimit.ts  # Rate limiting
│   │   └── validation.ts # Request validation
│   ├── models/           # Data models (Prisma)
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic services
│   │   ├── auth.ts       # Authentication service
│   │   ├── betting.ts    # Betting engine
│   │   ├── email.ts      # Email service
│   │   ├── payments.ts   # Payment processing
│   │   ├── sports.ts     # Sports data service
│   │   └── websocket.ts  # WebSocket handling
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript type definitions
│   └── server.ts         # Main server entry point
├── tests/                # Test files
├── docs/                 # API documentation
├── database/             # Database migrations and seeds
├── vision-documents/     # Architecture and design documents
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with initial data
- `npm run docs:generate` - Generate API documentation

## 🌐 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration  
- `POST /api/v1/auth/refresh` - Refresh access token
- `DELETE /api/v1/auth/logout` - User logout

### Users
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `GET /api/v1/users/balance` - Get account balance
- `GET /api/v1/users/betting-history` - Get betting history

### Sports
- `GET /api/v1/sports` - List all sports
- `GET /api/v1/sports/:sportId/events` - Get events for sport
- `GET /api/v1/sports/:sportId/events/:eventId` - Get event details
- `GET /api/v1/sports/:sportId/events/:eventId/markets` - Get betting markets

### Betting
- `POST /api/v1/bets/place` - Place a bet
- `GET /api/v1/bets` - Get user's bets
- `GET /api/v1/bets/:betId` - Get bet details
- `PUT /api/v1/bets/:betId/cancel` - Cancel pending bet

### Payments
- `POST /api/v1/payments/deposit` - Deposit funds
- `POST /api/v1/payments/withdraw` - Withdraw funds
- `GET /api/v1/payments/transactions` - Get transaction history
- `GET /api/v1/payments/methods` - Get payment methods

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Rate Limiting**: Configurable rate limits per endpoint and user
- **Input Validation**: Comprehensive request validation and sanitization
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet Security**: Security headers and protection middleware
- **Audit Logging**: Complete audit trail for all financial transactions
- **Encryption**: Data encryption at rest and in transit
- **PCI Compliance**: Payment processing following PCI DSS standards

## 📊 Database Schema

The application uses PostgreSQL with the following key entities:

- **Users**: User accounts and authentication
- **UserProfiles**: Extended user information and preferences
- **Sports/Leagues/Teams**: Sports data hierarchy
- **Events**: Games and matches
- **Markets/Selections**: Betting markets and options
- **Bets/BetSelections**: User betting transactions
- **Transactions**: Financial transaction records
- **AuditLog**: Comprehensive audit trail

## 🔄 Real-Time Features

WebSocket integration provides real-time updates for:

- **Live Odds**: Real-time odds changes and market updates
- **Event Updates**: Live scores and game status changes  
- **Bet Confirmations**: Instant bet placement confirmations
- **Balance Updates**: Real-time account balance changes
- **Notifications**: Push notifications for important events

## 🧪 Testing

The project includes comprehensive testing:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

Test categories:
- **Unit Tests**: Individual function and service testing
- **Integration Tests**: API endpoint and database testing
- **E2E Tests**: Complete user workflow testing
- **Performance Tests**: Load and stress testing

## 📚 API Documentation

Interactive API documentation is available in development:

- **Swagger UI**: `http://localhost:3000/docs`
- **OpenAPI Spec**: Auto-generated from code annotations
- **Postman Collection**: Available in `/docs` folder

## 🔧 Configuration

### Environment Variables

Key configuration options (see `.env.example`):

```bash
# Server
NODE_ENV=development
PORT=3000
HOST=localhost

# Database  
DATABASE_URL="postgresql://username:password@localhost:5432/winzo_dev"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"

# External APIs
SPORTS_DATA_API_KEY="your-sports-api-key"
STRIPE_SECRET_KEY="your-stripe-key"
```

### Database Configuration

PostgreSQL settings for optimal performance:

```sql
# postgresql.conf
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
```

### Redis Configuration

Redis settings for caching and sessions:

```bash
# redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
```

## 🚀 Deployment

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment**
   ```bash
   export NODE_ENV=production
   ```

3. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

4. **Start the server**
   ```bash
   npm run start:prod
   ```

### Docker Deployment

```dockerfile
# Dockerfile included for containerized deployment
docker build -t winzo-backend .
docker run -p 3000:3000 winzo-backend
```

### Health Monitoring

Health check endpoint available at `/health`:

```json
{
  "status": "healthy",
  "services": [
    {
      "service": "database",
      "status": "healthy",
      "responseTime": 5
    },
    {
      "service": "redis",
      "status": "healthy", 
      "responseTime": 2
    }
  ],
  "uptime": 86400,
  "version": "1.0.0"
}
```

## 📈 Performance Targets

- **API Response Time**: < 100ms for 95% of requests
- **Database Queries**: < 50ms for standard operations  
- **Real-Time Updates**: < 500ms latency for odds updates
- **Concurrent Users**: 10,000+ simultaneous connections
- **Transaction Throughput**: 1,000+ bets per second

## 🔄 Development Workflow

1. **Feature Development**
   ```bash
   git checkout -b feature/new-feature
   npm run dev
   # Make changes
   npm run test
   npm run lint
   ```

2. **Code Quality**
   - ESLint for code quality
   - Prettier for formatting  
   - Husky for pre-commit hooks
   - Jest for testing

3. **Database Changes**
   ```bash
   # Create migration
   npx prisma migrate dev --name migration-name
   
   # Generate client
   npm run db:generate
   ```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check PostgreSQL status
   pg_isready -h localhost -p 5432
   
   # Verify connection string
   echo $DATABASE_URL
   ```

2. **Redis Connection Issues**
   ```bash
   # Test Redis connection
   redis-cli ping
   
   # Check Redis logs
   redis-cli monitor
   ```

3. **Port Already in Use**
   ```bash
   # Find process using port 3000
   lsof -i :3000
   
   # Kill process
   kill -9 <PID>
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🏗️ Architecture Documents

Detailed architecture documentation available in `/vision-documents`:

- `01_Backend_Architecture_Vision.md` - Overall backend architecture
- `02_API_Design_Vision.md` - API design principles and patterns
- `03_Database_Design_Vision.md` - Database schema and optimization

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the API documentation at `/docs`
- Review the vision documents for architectural details

---

**Winzo Backend API** - Built with ❤️ for high-performance sports betting

