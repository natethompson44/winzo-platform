const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const initDatabase = require('./database/init');
const authRoutes = require('./routes/auth');
const sportsRoutes = require('./routes/sportsEnhanced');
const walletRoutes = require('./routes/walletEnhanced');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
app.set('trust proxy', 1);

console.log('\n🌟 WINZO Backend starting...');
console.log('\n📊 Environment:', process.env.NODE_ENV || 'development');
console.log('\n🔌 Port:', process.env.PORT || 5000);

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

// Rate limiting with WINZO-specific configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased for sports betting activity
  message: {
    success: false,
    message: "Whoa! Slow down there, champion. Let's pace that Big Win Energy!"
  }
});

app.use(helmet());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(limiter);
app.use(express.json());

// Initialize database connection
initDatabase();

// Application routes with WINZO Big Win Energy
app.use('/api/auth', authRoutes);
app.use('/api/sports', sportsRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
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
    suggestion: "Try /api/sports for betting opportunities or /api/wallet for balance info"
  });
});

// Error handler with WINZO energy
app.use((error, req, res, next) => {
  console.error('WINZO Server Error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: "No worries! Our WINZO team is on it. Let's try that again!",
    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    timestamp: new Date().toISOString()
  });
});

// Initialize OddsApiService
const oddsApiService = require('./services/oddsApiService');
console.log('OddsApiService initialized');

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 WINZO API Server powered up on port ${PORT}!`);
  console.log(`💪 Big Win Energy activated and ready for action!`);
  console.log(`🎯 Sports betting system online and ready to win!`);
  console.log('\n✅ WINZO Backend started successfully');
  console.log(`\n🌐 Server running on port ${PORT}`);
  console.log('\n🏥 Health check available at /health');
});

