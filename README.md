# WINZO Sports Betting Platform

A modern, professional sports betting platform built with React, Node.js, and PostgreSQL. WINZO provides real-time odds, comprehensive betting functionality, and a superior user experience for serious sports bettors.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-blue.svg)](https://www.typescriptlang.org/)

## Overview

WINZO is a comprehensive sports betting platform that combines cutting-edge technology with an intuitive user experience. Built with a focus on functionality, reliability, and professional design, it serves both casual and serious sports bettors.

### Key Features

- **Real-time Sports Data**: Live odds from major sportsbooks (DraftKings, FanDuel, BetMGM)
- **Comprehensive Betting**: Single bets, parlays, and live betting with real-time calculations
- **Professional Interface**: Desktop-optimized for serious bettors, mobile-simplified for quick access
- **Secure Wallet**: Deposits, withdrawals, and balance tracking with secure transactions
- **Advanced Analytics**: Comprehensive betting history, performance tracking, and insights
- **Admin Dashboard**: Complete platform management and user administration
- **PWA Support**: Installable web app with offline functionality

### Technology Stack

#### Frontend
- **React 18** with TypeScript
- **CSS Variables** + Modern CSS (Grid/Flexbox)
- **Context API** for state management
- **PWA** with service worker support
- **Responsive Design** (mobile-first approach)

#### Backend
- **Node.js 18+** with Express.js
- **PostgreSQL** with Sequelize ORM
- **JWT Authentication** with refresh tokens
- **The Odds API** integration for sports data
- **RESTful API** architecture

#### Infrastructure
- **Frontend**: Netlify with auto-deployment
- **Backend**: Railway with PostgreSQL
- **CI/CD**: GitHub Actions
- **Monitoring**: Built-in logging and performance tracking

## Documentation

### For Developers

- **[Development Guide](docs/DEVELOPMENT_GUIDE.md)** - Setup, coding standards, testing, and workflow
- **[API Documentation](docs/API_DOCUMENTATION.md)** - Complete API reference and examples
- **[Design System Guide](docs/DESIGN_SYSTEM_GUIDE.md)** - UI components, styling, and brand guidelines
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** - Production deployment procedures

### For Users & Administrators

- **[User Guide](docs/USER_GUIDE.md)** - Complete end-user documentation
- **[Admin Guide](docs/ADMIN_GUIDE.md)** - Platform management and administration

### Project Information

- **[Project Overview](PROJECT_OVERVIEW.md)** - High-level project information and architecture

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+
- PostgreSQL 14+
- The Odds API key

### Local Development

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
# Edit .env with backend URL (http://localhost:5000)
npm start

# 4. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

### Environment Variables

#### Backend (.env)
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/winzo_platform
ODDS_API_KEY=your_odds_api_key_here
JWT_SECRET=your_secure_jwt_secret_32_chars_minimum
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENVIRONMENT=development
```

## Project Structure

```
winzo-platform/
├── winzo-frontend/          # React frontend application
│   ├── src/
│   │   ├── components/      # React components (UI, Sports, Layout, etc.)
│   │   ├── pages/          # Page-level components
│   │   ├── contexts/       # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   ├── types/          # TypeScript definitions
│   │   └── styles/         # CSS and design system
│   └── public/             # Static assets and PWA files
├── winzo-backend/           # Node.js backend application
│   ├── src/
│   │   ├── routes/         # API route definitions
│   │   ├── models/         # Database models (Sequelize)
│   │   ├── services/       # Business logic and external APIs
│   │   ├── middleware/     # Express middleware
│   │   ├── database/       # Database configuration and migrations
│   │   └── utils/          # Backend utilities
│   └── tests/              # Test files
├── docs/                    # Comprehensive documentation
├── scripts/                 # Deployment and utility scripts
└── [Configuration Files]    # Git, deployment, and tool configs
```

## Available Scripts

### Frontend
```bash
npm start              # Development server
npm run build         # Production build
npm run test          # Run tests
npm run lint          # ESLint checking
npm run type-check    # TypeScript validation
```

### Backend
```bash
npm start             # Production server
npm run dev          # Development with nodemon
npm run test         # Run tests
npm run db:setup     # Database setup
npm run db:migrate   # Run migrations
npm run db:reset     # Reset database (dev only)
```

## API Overview

### Authentication
```bash
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
POST /api/auth/logout      # User logout
GET  /api/auth/profile     # User profile
```

### Sports Data
```bash
GET /api/sports                        # Available sports
GET /api/sports/{sport}/odds           # Live odds
GET /api/sports/{sport}/scores         # Live scores
GET /api/sports/{sport}/events/{id}    # Event details
```

### Betting
```bash
POST /api/betting/place               # Place bet
GET  /api/betting/history            # Betting history
GET  /api/betting/{betId}            # Bet details
POST /api/betting/{betId}/cancel     # Cancel bet
```

### Wallet
```bash
GET  /api/wallet/balance             # Account balance
POST /api/wallet/deposit             # Deposit funds
POST /api/wallet/withdraw            # Withdraw funds
GET  /api/wallet/transactions        # Transaction history
```

## Deployment

### Production Deployment
The platform is configured for automatic deployment:

- **Frontend**: Deployed to Netlify with auto-deployment on git push
- **Backend**: Deployed to Railway with PostgreSQL database
- **CI/CD**: GitHub Actions for automated testing and deployment

```bash
# Quick deployment using provided scripts
./scripts/deploy-production.sh    # Linux/Mac
.\scripts\deploy-production.ps1   # Windows PowerShell
```

For detailed deployment instructions, see the [Deployment Guide](docs/DEPLOYMENT_GUIDE.md).

## Features in Detail

### Sports Betting
- **51+ Sports**: NFL, NBA, MLB, NHL, Soccer, Tennis, and more
- **Multiple Markets**: Moneyline, spread, totals, parlays, prop bets
- **Live Betting**: In-game betting with real-time odds updates
- **Real-time Odds**: Updated every 30 seconds from top sportsbooks

### User Experience
- **Desktop First**: Advanced features for serious bettors
- **Mobile Optimized**: Simplified interface for quick betting
- **PWA Support**: Install as app with offline functionality
- **Responsive Design**: Seamless experience across all devices

### Security & Compliance
- **JWT Authentication**: Secure token-based authentication
- **Data Encryption**: HTTPS and TLS 1.3 for all communications
- **Input Validation**: Comprehensive request validation
- **Responsible Gaming**: Deposit limits, time limits, self-exclusion

### Administrative Features
- **User Management**: Complete user administration and support
- **Bet Settlement**: Automated and manual bet settlement
- **Analytics Dashboard**: Comprehensive business intelligence
- **Financial Controls**: Deposit/withdrawal management and reporting

## Testing

### Running Tests
```bash
# Frontend tests
cd winzo-frontend
npm test

# Backend tests
cd winzo-backend
npm test

# Integration tests
python test_winzo_platform.py
```

### Test Coverage
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Critical user flow testing
- **Performance Tests**: Load and stress testing

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the coding standards
4. Add tests for new functionality
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines
- Follow the established coding standards (see [Development Guide](docs/DEVELOPMENT_GUIDE.md))
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR
- Follow the Git workflow outlined in the documentation

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

### Documentation
- **Complete Guides**: Comprehensive documentation in `/docs/` directory
- **API Reference**: Full API documentation with examples
- **Video Tutorials**: Available in the platform help section

### Contact
- **Technical Issues**: Create an issue in this repository
- **Business Inquiries**: Contact the development team
- **User Support**: Available through the platform help center

### Community
- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: Platform improvements and suggestions
- **Wiki**: Community-maintained documentation and tips

## Acknowledgments

- **The Odds API**: Comprehensive sports data provider
- **Nice Admin**: Template foundation for admin interface
- **React Community**: Excellent documentation and resources
- **Node.js Ecosystem**: Robust backend technologies
- **Railway & Netlify**: Reliable hosting and deployment platforms

---

**Platform Status**: Production Ready  
**Version**: 2.0  
**Last Updated**: December 2024  

Built with ❤️ for sports betting enthusiasts

*For detailed information about any aspect of the platform, please refer to the comprehensive documentation in the `/docs/` directory.* 