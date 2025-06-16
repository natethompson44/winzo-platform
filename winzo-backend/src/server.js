const express = require('express');
const cors = require('cors');
const {
  compressionMiddleware,
  securityMiddleware,
  rateLimitMiddleware,
  apiRateLimitMiddleware,
  requestLoggingMiddleware,
  errorHandlingMiddleware,
} = require('./middleware/optimization');
require('dotenv').config();

const initDatabase = require('./database/init');
const authRoutes = require('./routes/auth');
const sportsRoutes = require('./routes/sports');
const walletRoutes = require('./routes/walletEnhanced');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
app.set('trust proxy', 1);

// Global security middleware with WINZO configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://winzo-platform.netlify.app',
    'https://winzo-platform.netlify.app/'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

app.use(compressionMiddleware);
app.use(securityMiddleware);
app.use(requestLoggingMiddleware);
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(rateLimitMiddleware);
app.use('/api', apiRateLimitMiddleware);
app.use(express.json());

// Track database initialization status
let databaseReady = false;
let databaseError = null;

// Initialize database connection in background
initDatabase()
  .then(() => {
    console.log('✅ Database initialization completed');
    databaseReady = true;
  })
  .catch((error) => {
    console.error('❌ Database initialization failed:', error);
    databaseError = error;
  });

// Application routes with WINZO Big Win Energy
app.use('/api/auth', authRoutes);
app.use('/api/sports', sportsRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/bets', require('./routes/betting'));

// Health check endpoint
app.get('/health', (req, res) => {
  if (databaseError) {
    return res.status(503).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      database: 'error',
      error: databaseError.message
    });
  }
  
  res.status(200).json({
    success: true,
    status: databaseReady ? 'healthy' : 'initializing',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    database: databaseReady ? 'connected' : 'connecting'
  });
});

// Welcome endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🎯 Welcome to WINZO API - Where Big Win Energy Lives!',
    version: '2.0.0',
    features: [
      'Sports Betting with Live Odds',
      'WINZO Wallet Integration', 
      'Real-time Event Updates',
      'Mobile-First Design',
      'Exclusive Community Access'
    ],
    motto: 'BIG WIN ENERGY.'
  });
});

// 404 handler with WINZO personality
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: "Oops! That page took a wrong turn. Let's get you back to winning!",
    suggestion: 'Try /api/sports for betting opportunities or /api/wallet for balance info',
  });
});

app.use(errorHandlingMiddleware);

// Initialize OddsApiService
const oddsApiService = require('./services/oddsApiService');
console.log('OddsApiService initialized');

// Port configuration with Railway support
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Log environment details
console.log('\n🌟 WINZO Backend starting...');
console.log('\n📊 Environment:', process.env.NODE_ENV || 'development');
console.log('\n🔌 Port:', PORT);
console.log('\n🌐 Host:', HOST);
console.log('\n🔑 Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('\n🔒 SSL Mode:', process.env.NODE_ENV === 'production' ? 'Enabled' : 'Disabled');

app.listen(PORT, HOST, () => {
  console.log('\n✅ WINZO Backend started successfully');
  console.log(`\n🌐 Server running on ${HOST}:${PORT}`);
  console.log(`\n🏥 Health check available at /health`);
  console.log(`\n🔗 CORS enabled for: ${process.env.CORS_ORIGIN || 'default origins'}`);
});

