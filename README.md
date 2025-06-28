# WINZO Sports Betting Platform

## 🚀 **MAJOR UPDATE: OddsX Template Integration Complete!**

**WINZO has been transformed with the professional OddsX sports betting template while maintaining full backend integration.**

- **NEW FRONTEND**: `oddsx/oddsx-react/` - Professional Next.js 14 sports betting interface
- **EXISTING BACKEND**: `winzo-backend/` - Fully preserved Node.js backend with all functionality


### **🎯 Current Platform Architecture**
- **Active Frontend**: Professional OddsX-based WINZO platform (`oddsx/oddsx-react/`)
- **Backend**: Complete WINZO backend API (`winzo-backend/`)
- **Deployment**: Netlify (frontend) + Railway (backend)

---

A modern, professional sports betting platform built with React/Next.js, Node.js, and PostgreSQL. WINZO provides real-time odds, comprehensive betting functionality, and a superior user experience for serious sports bettors.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-blue.svg)](https://www.typescriptlang.org/)

## Overview

WINZO is a comprehensive sports betting platform that combines cutting-edge technology with an intuitive user experience. Built with a focus on functionality, reliability, and professional design, it serves both casual and serious sports bettors.

**🎉 Recently Enhanced with OddsX Template Integration:**
- Professional sports betting interface with 20+ sport-specific pages
- Enhanced mobile-first responsive design optimized for betting
- Next.js 14 performance optimizations
- Maintained 100% backend compatibility

### Key Features

- **Real-time Sports Data**: Live odds from major sportsbooks integration
- **Professional Interface**: OddsX-powered sports betting UI with Next.js 14
- **Comprehensive Betting**: Single bets, parlays, and live betting with real-time calculations
- **Secure Authentication**: JWT-based login with invite code registration
- **Wallet Management**: Deposits, withdrawals, and balance tracking
- **Advanced Analytics**: Comprehensive betting history and performance tracking
- **Admin Dashboard**: Complete platform management and user administration
- **Mobile Optimized**: Purpose-built mobile betting experience

### Technology Stack

#### Frontend (NEW - OddsX Integration)
- **Next.js 14** with TypeScript and static export
- **Bootstrap 5** + SCSS with professional sports betting design
- **Context API** for authentication and betting state management
- **Axios** with retry logic for robust API communication
- **React Hot Toast** for user notifications
- **Responsive Design** optimized for sports betting workflows

#### Backend (Preserved)
- **Node.js 18+** with Express.js
- **PostgreSQL** with Sequelize ORM
- **JWT Authentication** with refresh tokens
- **The Odds API** integration for sports data
- **RESTful API** architecture

#### Infrastructure
- **Frontend**: Netlify with Next.js static export
- **Backend**: Railway with PostgreSQL
- **API Integration**: Full WINZO backend compatibility
- **CI/CD**: Automated deployment pipeline

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

# 2. Backend setup (unchanged)
cd winzo-backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run db:setup
npm start

# 3. NEW WINZO Frontend setup (OddsX-based)
cd ../oddsx/oddsx-react
npm install
# Environment variables are pre-configured in .env.local
npm run dev

# 4. Access the application
# NEW Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

### Environment Variables

#### NEW Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://winzo-platform-production.up.railway.app/api
NEXT_PUBLIC_FRONTEND_URL=https://winzo-platform.netlify.app
NEXT_PUBLIC_APP_NAME=WINZO
NEXT_PUBLIC_APP_DESCRIPTION=Professional Sports Betting Platform
```

#### Backend (.env) - Unchanged
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/winzo_platform
ODDS_API_KEY=your_odds_api_key_here
JWT_SECRET=your_secure_jwt_secret_32_chars_minimum
FRONTEND_URL=https://winzo-platform.netlify.app
```

## Project Structure

```
winzo-platform/
├── oddsx/                   # NEW: OddsX Template Integration
│   └── oddsx-react/         # ACTIVE: Next.js 14 WINZO Platform
│       ├── app/             # Next.js app directory
│       ├── components/      # OddsX sports betting components
│       ├── contexts/        # Authentication & betting contexts
│       ├── services/        # Sports data service
│       ├── utils/           # API client and utilities
│       └── public/          # Static assets and data
├── winzo-backend/           # PRESERVED: Node.js backend
│   ├── src/
│   │   ├── routes/         # API route definitions
│   │   ├── models/         # Database models (Sequelize)
│   │   ├── services/       # Business logic and external APIs
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Backend utilities
├── docs/                    # Comprehensive documentation
└── [Configuration Files]    # Git, deployment, and tool configs
```

## Available Scripts

### NEW Frontend (oddsx/oddsx-react)
```bash
npm run dev           # Development server
npm run build         # Production build
npm run start         # Production server
npm run lint          # Next.js linting
```

### Backend (winzo-backend) - Unchanged
```bash
npm start             # Production server
npm run dev          # Development with nodemon
npm run test         # Run tests
npm run db:setup     # Database setup
npm run db:migrate   # Run migrations
```

## Deployment

### Production Deployment (Updated)

The platform now deploys the NEW OddsX-based frontend:

- **Frontend**: `oddsx/oddsx-react` deployed to Netlify with Next.js static export
- **Backend**: `winzo-backend` deployed to Railway with PostgreSQL database
- **Configuration**: Updated `netlify.toml` points to the new frontend

```bash
# Updated deployment script
./deploy-production.sh    # Linux/Mac - Now deploys OddsX integration
```

**Netlify Configuration** (Updated):
```toml
[build]
  base = "oddsx/oddsx-react"
  command = "npm install && npm run build"
  publish = "out"
```

## Features in Detail

### NEW: OddsX Sports Betting Interface
- **Professional Design**: Purpose-built sports betting components
- **20+ Sports Pages**: Dedicated pages for major sports
- **Enhanced Mobile Experience**: Mobile-first betting workflows
- **Real-time Integration**: Connected to WINZO backend APIs
- **TypeScript Support**: Full type safety and development experience

### Preserved: Core WINZO Functionality
- **Complete Authentication**: JWT login/register with invite codes
- **Wallet Management**: Deposits, withdrawals, transaction history
- **Sports Data**: Real-time odds and game information
- **Betting System**: Place bets, view history, manage active bets
- **Admin Features**: User management and platform administration

### Enhanced: User Experience
- **Next.js 14 Performance**: Optimized loading and navigation
- **Professional UI**: Sports betting industry-standard design
- **Improved Mobile**: Touch-optimized betting interface
- **Error Handling**: Robust error states and retry mechanisms
- **Toast Notifications**: Enhanced user feedback system

## API Overview (Unchanged)

The backend API remains fully functional and compatible:

### Authentication
```bash
POST /api/auth/register    # User registration with invite codes
POST /api/auth/login       # User login
GET  /api/auth/me          # User profile
```

### Sports & Betting
```bash
GET  /api/sports/games     # Sports games data
GET  /api/sports/odds      # Live odds
POST /api/bets/place       # Place bet
GET  /api/bets/history     # Betting history
```

### Wallet Management
```bash
GET  /api/user/balance             # Account balance
POST /api/wallet/deposit           # Deposit funds
POST /api/wallet/withdraw          # Withdraw funds
GET  /api/wallet/transactions      # Transaction history
```

## Transformation Summary

### ✅ **What Was Accomplished**
1. **Complete OddsX Integration**: Professional sports betting template fully integrated
2. **100% Backend Compatibility**: All existing WINZO APIs work seamlessly
3. **Enhanced Authentication**: Functional login/register with WINZO backend
4. **Production Ready**: Optimized build process and deployment configuration
5. **Maintained Design Quality**: Professional sports betting interface preserved

### 🎯 **Current Status**
- **Frontend**: OddsX-based WINZO platform (`oddsx/oddsx-react`) - **ACTIVE**
- **Backend**: Complete WINZO backend - **FULLY OPERATIONAL**
- **Deployment**: Configured for production deployment
- **Legacy**: Legacy frontend removed - fully replaced

### 🚀 **Ready For**
- **Production Deployment**: Fully configured and tested
- **User Registration**: With invite code support
- **Sports Betting**: Real-time odds and betting functionality
- **Mobile Usage**: Optimized mobile betting experience
- **Further Development**: Extensible architecture for new features

## Support & Documentation

- **[OddsX Transformation Summary](oddsx/oddsx-react/WINZO_TRANSFORMATION_SUMMARY.md)** - Complete transformation details
- **[Development Guide](docs/DEVELOPMENT_GUIDE.md)** - Setup and development workflow
- **[API Documentation](docs/API_DOCUMENTATION.md)** - Complete backend API reference
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** - Production deployment procedures

---

**🏆 Platform Status**: **Production Ready with OddsX Integration**  
**🎯 Current Version**: **2.1 - OddsX Enhanced**  
**📅 Last Updated**: **December 2024**  

**🎉 Successfully transformed from template to fully functional sports betting platform!**

Built with ❤️ for sports betting enthusiasts, enhanced with professional OddsX design excellence. 