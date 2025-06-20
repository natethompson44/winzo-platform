const express = require('express')
const cors = require('cors')
const {
  compressionMiddleware,
  securityMiddleware,
  rateLimitMiddleware,
  apiRateLimitMiddleware,
  requestLoggingMiddleware,
  errorHandlingMiddleware
} = require('./middleware/optimization')
require('dotenv').config()

// Validate critical environment variables
const requiredEnvVars = ['DATABASE_URL']
const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars)
  console.error('💥 Server cannot start without these variables')
  process.exit(1)
}

console.log('✅ Environment validation passed')

const initDatabase = require('./database/init')
const authRoutes = require('./routes/auth')
const sportsRoutes = require('./routes/sports')
const walletRoutes = require('./routes/walletEnhanced')
const dashboardRoutes = require('./routes/dashboard')
const userRoutes = require('./routes/user')
const analyticsRoutes = require('./routes/analytics')
const adminRoutes = require('./routes/admin')

const app = express()
app.set('trust proxy', 1)

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
}

app.use(compressionMiddleware)
app.use(securityMiddleware)
app.use(requestLoggingMiddleware)
app.use(cors(corsOptions))
app.options('*', cors(corsOptions))
app.use(rateLimitMiddleware)
app.use('/api', apiRateLimitMiddleware)
app.use(express.json())

// Track database initialization status
let databaseReady = false
let databaseError = null
let databaseInitializing = true

// Initialize database connection in background
initDatabase()
  .then(() => {
    console.log('✅ Database initialization completed')
    databaseReady = true
    databaseInitializing = false
  })
  .catch((error) => {
    console.error('❌ Database initialization failed:', error)
    databaseError = error
    databaseInitializing = false
  })

// Application routes with WINZO Big Win Energy
app.use('/api/auth', authRoutes)
app.use('/api/sports', sportsRoutes)
app.use('/api/wallet', walletRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/bets', require('./routes/betting'))
app.use('/api/user', userRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/integration-test', require('./routes/integration-test'))

// Serve uploaded files (avatars, etc.)
app.use('/uploads', express.static('uploads'))

// Health check endpoint
app.get('/health', (req, res) => {
  // Always respond quickly, don't wait for database
  const healthStatus = {
    success: true,
    status: databaseReady ? 'healthy' : (databaseInitializing ? 'initializing' : 'degraded'),
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    database: databaseReady ? 'connected' : (databaseInitializing ? 'connecting' : 'disconnected')
  }

  if (databaseError) {
    healthStatus.database_error = databaseError.message
  }

  const statusCode = databaseReady ? 200 : 503
  res.status(statusCode).json(healthStatus)
})

// Simple health check for Railway (always returns 200)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

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
  })
})

// 404 handler with WINZO personality
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: "Oops! That page took a wrong turn. Let's get you back to winning!",
    suggestion: 'Try /api/sports for betting opportunities or /api/wallet for balance info'
  })
})

app.use(errorHandlingMiddleware)

// Port configuration with Railway support
const PORT = process.env.PORT || 5000
const HOST = process.env.HOST || '0.0.0.0'

// Log environment details
console.log('\n🌟 WINZO Backend starting...')
console.log('\n📊 Environment:', process.env.NODE_ENV || 'development')
console.log('\n🔌 Port:', PORT)
console.log('\n🌐 Host:', HOST)
console.log('\n🔑 Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set')
console.log('\n🔒 SSL Mode:', process.env.NODE_ENV === 'production' ? 'Enabled' : 'Disabled')

app.listen(PORT, HOST, () => {
  console.log('\n✅ WINZO Backend started successfully')
  console.log(`\n🌐 Server running on ${HOST}:${PORT}`)
  console.log('\n🏥 Health check available at /health')
  console.log(`\n🔗 CORS enabled for: ${process.env.CORS_ORIGIN || 'default origins'}`)
})
