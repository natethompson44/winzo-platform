# WINZO Sports Betting Platform

A modern sports betting platform built with TypeScript, React, tRPC, and PostgreSQL.

## 🚀 Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Express.js + tRPC + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based with secure cookies
- **Deployment**: Railway (backend) + Netlify (frontend)
- **Package Manager**: pnpm

## 📁 Project Structure

```
Site/
├── client/              # React frontend
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # UI components
│   │   └── main.tsx     # Entry point
│   └── index.html
├── server/              # TypeScript backend
│   ├── _core/
│   │   └── index.ts     # Server entry point
│   ├── routers.ts       # tRPC routers
│   ├── db.ts            # Database functions
│   ├── auth.ts          # Authentication
│   ├── customAuth.ts    # Custom auth routes
│   ├── bettingLimits.ts # Betting limits enforcement
│   ├── oddsSync.ts      # Automatic odds sync
│   └── scoreSync.ts     # Automatic score sync
├── shared/              # Shared code
├── drizzle/             # Database schema
│   ├── schema.ts        # PostgreSQL schema
│   └── migrations/      # Migration files
└── scripts/             # Utility scripts
```

## ✨ Features

### Core Features
- **Sports Betting**: Place bets on NFL, NBA, MLB, NHL games
- **Parlay Bets**: Multi-game parlay betting
- **Wallet System**: Deposit, withdraw, and manage balance
- **Bet History**: View all past bets with status tracking
- **Real-time Odds**: Automatic odds synchronization every 5 minutes
- **Auto Settlement**: Automatic bet settlement when games complete

### Authentication & Security
- **Custom Authentication**: Username/password with JWT cookies
- **User Roles**: user, agent, owner
- **User Suspension**: Suspend/unsuspend users
- **Betting Limits**: Per-bet, daily, and weekly limits per user

### Admin Features
- **User Management**: Create, update roles, suspend users
- **Wallet Management**: Set balances, adjust balances
- **Activity Monitoring**: View all transactions and bets
- **Betting Limits Management**: Set limits per user

## 🛠️ Development

### Prerequisites
- Node.js 20+
- pnpm 10+
- PostgreSQL database (Railway or local)

### Setup

1. **Install dependencies**
   ```powershell
   pnpm install
   ```

2. **Configure environment variables**
   Create a `.env` file:
   ```env
   DATABASE_URL=postgresql://...
   ODDS_API_KEY=your_odds_api_key
   JWT_SECRET=your_jwt_secret
   CORS_ORIGIN=https://winzo-sports.netlify.app
   NODE_ENV=development
   ```

3. **Start development server**
   ```powershell
   pnpm dev
   ```

4. **Initialize database** (first time only)
   ```powershell
   # Add teams to database
   node scripts/add-all-teams.mjs
   
   # Create owner account
   node scripts/create-owner.mjs
   
   # Trigger initial odds sync
   node scripts/trigger-sync.mjs
   ```

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm check` - Type check without emitting
- `pnpm db:push` - Generate and run database migrations

## 🚀 Deployment

### Railway (Backend)

The backend automatically deploys to Railway on git push. Configuration is in `railway.toml`.

**Environment Variables Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `ODDS_API_KEY` - The Odds API key
- `JWT_SECRET` - JWT signing secret
- `CORS_ORIGIN` - Frontend URL
- `NODE_ENV` - production

### Netlify (Frontend)

The frontend automatically deploys to Netlify on git push. Configuration is in `netlify.toml`.

**Environment Variables Required:**
- `VITE_API_URL` - Backend API URL (optional, defaults to Railway URL)

## 📊 Database Schema

The database uses PostgreSQL with the following main tables:
- `users` - User accounts with authentication and limits
- `sports` - Supported sports (NFL, NBA, MLB, NHL)
- `teams` - Teams for each sport
- `games` - Game matchups with odds
- `bets` - User bets (single and parlay)
- `parlayLegs` - Individual selections in parlay bets
- `wallets` - User wallet balances
- `transactions` - All financial transactions

See `drizzle/schema.ts` for full schema definition.

## 🔄 Automatic Systems

### Odds Synchronization
- Runs every 5 minutes automatically
- Fetches odds from The Odds API
- Creates new games and updates existing ones
- Started automatically on server start

### Score Synchronization
- Runs every 5 minutes automatically
- Fetches scores from ESPN API
- Settles bets when games complete
- Credits winnings to user wallets
- Started automatically on server start

## 🔐 Authentication

The platform uses custom username/password authentication with JWT tokens stored in secure HTTP-only cookies.

**Endpoints:**
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

## 📝 API Documentation

The API uses tRPC for type-safe client-server communication. All endpoints are defined in `server/routers.ts`.

**Main Routers:**
- `auth` - Authentication endpoints
- `sports` - Sports listing
- `teams` - Team queries
- `games` - Game queries
- `wallet` - Wallet operations
- `bets` - Bet placement and queries
- `admin` - Admin operations (protected)

## 🧪 Testing

Run type checking:
```powershell
pnpm check
```

## 📚 Documentation

- `MIGRATION_STATUS.md` - Migration status and summary
- `MIGRATION_PROMPT.md` - Detailed migration guide (reference)
- `EXECUTE_MIGRATION.md` - Migration execution instructions (reference)
- `ADMIN_DASHBOARD.md` - Admin dashboard documentation
- `ANALYTICS_SYSTEM.md` - Analytics system documentation

## 🐛 Troubleshooting

**Server won't start?**
- Check `.env` has all required variables
- Verify `DATABASE_URL` is correct
- Ensure `pnpm install` completed successfully

**Frontend won't load?**
- Check browser console for errors
- Verify backend is running and accessible
- Check CORS configuration

**Database errors?**
- Verify PostgreSQL connection string
- Check migrations have run: `pnpm db:push`
- Ensure teams are added: `node scripts/add-all-teams.mjs`

## 📄 License

MIT

## 👥 Contributing

This is a private project. For questions or issues, contact the project maintainer.
