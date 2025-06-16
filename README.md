# WINZO Platform - Professional Sports Betting Platform
A modern, full-stack sports betting platform built with React, Node.js, and The Odds API. Features real-time odds, comprehensive betting functionality, and a professional user experience.

## Features
### Core Functionality
- **Live Sports Data**: Real-time odds from major sportsbooks (DraftKings, FanDuel, BetMGM)
- **Comprehensive Betting**: Single bets and parlays with real-time payout calculations
- **Wallet Management**: Secure deposit, withdrawal, and balance tracking
- **Betting History**: Complete transaction history with filtering and statistics
- **User Dashboard**: Personalized overview with stats and recent activity
### Sports Coverage
- **51+ Sports**: NFL, NBA, MLB, NHL, Soccer, Tennis, and more
- **Live Odds**: Updated every 30 seconds from top sportsbooks
- **Multiple Markets**: Moneyline, spread, totals, and specialty bets
- **Event Tracking**: Live scores and game status updates
### Technical Features
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Real-time Updates**: Live odds and balance synchronization
- **Secure Authentication**: JWT-based user authentication
- **API Integration**: Professional integration with The Odds API
- **Database Persistence**: PostgreSQL with comprehensive data modeling

## Technology Stack
### Frontend
- **React 18** with TypeScript
- **Context API** for state management
- **Axios** for API communication
- **CSS3** with modern animations and responsive design
### Backend
- **Node.js** with Express.js
- **PostgreSQL** database with Sequelize ORM
- **JWT** authentication
- **The Odds API** integration
- **RESTful API** architecture
### Infrastructure
- **Netlify** deployment for frontend
- **Environment-based** configuration
- **CORS** enabled for cross-origin requests
- **Error handling** and logging throughout

## Prerequisites
- Node.js 18+ (see .nvmrc for exact version)
- npm 9+
- PostgreSQL 14+
- The Odds API key (get from [the-odds-api.com](https://the-odds-api.com))
- Python 3.8+ (for testing)

## Additional Documentation
- [Deployment Guide](DEPLOYMENT.md) - Detailed deployment instructions
- [Mobile Optimization Summary](WINZO_MOBILE_OPTIMIZATION_SUMMARY.md) - Mobile-specific features and optimizations
- [UX/UI Improvements](WINZO_UX_UI_IMPROVEMENTS_IMPLEMENTED.md) - User experience enhancements
- [Netlify Deployment Fix](NETLIFY_DEPLOYMENT_FIX.md) - Netlify-specific deployment solutions
- [Netlify TypeScript Fix](NETLIFY_TYPESCRIPT_FIX.md) - TypeScript configuration for Netlify
- [MIME Type Fix](MIME_TYPE_FIX.md) - Content type handling solutions

## Available Scripts
### Frontend
```bash
# Development
npm start              # Start development server
npm run build         # Build for production
npm run build:debug   # Build with source maps for debugging
npm run lint          # Run ESLint
npm run type-check    # Run TypeScript type checking

# Deployment
npm run deploy        # Build and deploy to Netlify
```

### Backend
```bash
# Development
npm start             # Start development server
npm run dev          # Start with nodemon for development
npm run test         # Run backend tests

# Database
npm run db:setup     # Setup database schema
npm run db:reset     # Reset database (development only)
npm run db:migrate   # Run database migrations

# Deployment
npm run deploy:railway  # Deploy to Railway
```

## Quick Start
### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd winzo-platform-main
```
### 2. Backend Setup
```bash
cd winzo-backend
npm install
# Create environment file
cp .env.example .env
# Edit .env with your database and API key details
# Setup database
npm run db:setup
# Start backend server
npm start
```
### 3. Frontend Setup
```bash
cd ../winzo-frontend
npm install
# Create environment file
cp .env.example .env
# Edit .env with your backend URL
# Start frontend development server
npm start
```
### 4. Access the Platform
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Test Login: testuser2 / testuser2

## Configuration
### Environment Variables
#### Backend (.env)
```
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=winzo_platform
DB_USER=your_db_user
DB_PASSWORD=your_db_password
# The Odds API
ODDS_API_KEY=your_odds_api_key_here
ODDS_API_BASE_URL=https://api.the-odds-api.com/v4
# Authentication
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h
# Server Configuration
PORT=5000
NODE_ENV=development
```
#### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENVIRONMENT=development
```

## Testing
### Automated Testing
```bash
# Run comprehensive test suite
python3 test_winzo_platform.py
# Test specific URL
python3 test_winzo_platform.py --url http://localhost:5000
```
### Manual Testing Checklist
- [ ] User registration and login
- [ ] Sports data loading and display
- [ ] Odds clicking and bet slip functionality
- [ ] Bet placement and confirmation
- [ ] Wallet operations (deposit/withdrawal)
- [ ] Betting history and filtering
- [ ] Dashboard statistics and updates
- [ ] Mobile responsive design
- [ ] Error handling and edge cases

## API Endpoints
### Authentication
- POST /api/auth/login - User login
- POST /api/auth/register - User registration
- GET /api/auth/profile - Get user profile
### Sports Data
- GET /api/sports - Get all available sports
- GET /api/sports/{sport}/odds - Get odds for specific sport
- GET /api/sports/{sport}/scores - Get live scores
- GET /api/sports/{sport}/events/{eventId} - Get specific event
### Betting
- POST /api/bets/place - Place single bet or parlay
- GET /api/bets/history - Get betting history
- GET /api/bets/{betId} - Get specific bet details
- POST /api/bets/{betId}/cancel - Cancel pending bet
### Wallet
- GET /api/wallet/balance - Get wallet balance
- POST /api/wallet/deposit - Deposit funds
- POST /api/wallet/withdraw - Withdraw funds
- GET /api/wallet/transactions - Get transaction history

## Usage Examples
### Placing a Bet
```javascript
// Add bet to slip
const betData = {
  eventId: "event_123",
  sport: "americanfootball_nfl",
  homeTeam: "Kansas City Chiefs",
  awayTeam: "Buffalo Bills",
  selectedTeam: "Kansas City Chiefs",
  odds: -110,
  bookmaker: "DraftKings",
  marketType: "h2h",
  commenceTime: "2024-01-15T18:00:00Z"
};
addToBetSlip(betData);
// Place the bet
const response = await apiClient.post('/api/bets/place', {
  bets: [betData],
  betType: 'single',
  totalStake: 25,
  potentialPayout: 47.73
});
```
### Getting Live Odds
```javascript
const response = await apiClient.get('/api/sports/americanfootball_nfl/odds?limit=10');
const events = response.data.data;
events.forEach(event => {
  console.log(`${event.away_team} @ ${event.home_team}`);
  event.bookmakers.forEach(bookmaker => {
    console.log(`${bookmaker.title}: ${bookmaker.markets[0].outcomes}`);
  });
});
```

## Security Features
- JWT Authentication: Secure token-based authentication
- Input Validation: Comprehensive request validation
- SQL Injection Protection: Parameterized queries with Sequelize
- CORS Configuration: Controlled cross-origin access
- Environment Variables: Sensitive data protection
- Rate Limiting: API quota management and monitoring

## Mobile Optimization
- Responsive Design: Optimized for all screen sizes
- Touch-Friendly: Large buttons and touch targets
- Fast Loading: Optimized images and code splitting
- Offline Handling: Graceful degradation for poor connections
- PWA Ready: Service worker and manifest configuration

## Deployment
### Frontend (Netlify)
The frontend is configured for automatic deployment to Netlify with the following features:
- Automatic builds on git push
- Environment variable management
- Custom domain support
- TypeScript compilation
- Asset optimization

Deployment can be done manually:
```bash
# Using the provided script
./rebuild-and-deploy.sh  # Unix/Mac
.\rebuild-and-deploy.ps1 # Windows

# Or manually
cd winzo-frontend
npm run build
netlify deploy --prod
```

### Backend (Railway)
The backend is configured for deployment on Railway with:
- Automatic deployments from git
- PostgreSQL database provisioning
- Environment variable management
- Health checks and monitoring

Deployment can be done manually:
```bash
cd winzo-backend
railway up
```

## Testing Infrastructure
### Automated Testing
The project includes comprehensive testing:
- Python-based integration tests (`test_winzo_platform.py`)
- Backend unit tests in `winzo-backend/tests/`
- Frontend component tests (using Jest and React Testing Library)

Run all tests:
```bash
# Backend tests
cd winzo-backend
npm test

# Frontend tests
cd winzo-frontend
npm test

# Integration tests
python test_winzo_platform.py
```

### Test Utilities
- `test-railway-urls.js` - Validates Railway deployment URLs
- `reset-database.js` - Database reset utility for testing
- `reset-and-start.js` - Combined reset and start script

## Troubleshooting
### Common Issues
#### API Key Issues
```bash
# Verify API key is working
curl "https://api.the-odds-api.com/v4/sports?apiKey=YOUR_KEY"
```
#### Database Connection
```bash
# Test database connection
psql -h localhost -U your_user -d winzo_platform
```
#### CORS Errors
- Ensure backend CORS is configured for your frontend URL
- Check that API_URL in frontend matches backend URL
#### Build Errors
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Deployment Issues
#### Netlify Deployment
- Check `netlify.toml` for build settings
- Verify environment variables in Netlify dashboard
- Review build logs for TypeScript errors
- Ensure proper MIME types are set

#### Railway Deployment
- Verify `railway.json` configuration
- Check database connection settings
- Review Railway logs for startup issues
- Ensure proper environment variables are set

### Database Issues
```bash
# Reset database (development only)
node winzo-backend/reset-database.js

# Check database connection
node winzo-backend/src/utils/db-check.js
```

## Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- The Odds API for comprehensive sports data
- React and Node.js communities for excellent documentation
- All contributors and testers who helped improve the platform

## Support
For support, email support@winzo.com or create an issue in this repository.

WINZO Platform - Built with ❤️ for sports betting enthusiasts
