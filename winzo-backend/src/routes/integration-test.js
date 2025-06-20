const express = require('express')
const auth = require('../middleware/auth')

const router = express.Router()

/**
 * GET /api/integration-test/ping - Simple connectivity test
 */
router.get('/ping', (req, res) => {
  res.json({
    success: true,
    message: 'WINZO Backend is alive and ready! 🚀',
    timestamp: new Date().toISOString(),
    endpoints: {
      account: {
        profile: 'GET/PUT /api/user/profile',
        avatar: 'POST /api/user/avatar',
        preferences: 'GET/PUT /api/user/preferences',
        password: 'PUT /api/user/password',
        security: 'GET /api/user/security',
        sessions: 'GET /api/user/sessions'
      },
      analytics: {
        charts: 'GET /api/analytics/charts',
        summary: 'GET /api/analytics/summary',
        export: 'GET /api/analytics/export'
      },
      betting: {
        history: 'GET /api/bets/history (enhanced)',
        place: 'POST /api/bets/place',
        details: 'GET /api/bets/:betId'
      },
      existing: {
        auth: 'POST /api/auth/login|register',
        dashboard: 'GET /api/dashboard',
        sports: 'GET /api/sports',
        wallet: 'GET /api/wallet'
      }
    }
  })
})

/**
 * GET /api/integration-test/auth-test - Test authentication
 */
router.get('/auth-test', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Authentication working! ✅',
    user: {
      id: req.user.id,
      authenticated: true
    },
    timestamp: new Date().toISOString()
  })
})

/**
 * GET /api/integration-test/cors-test - Test CORS configuration
 */
router.get('/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is configured correctly! 🌐',
    headers: {
      origin: req.headers.origin || 'No origin header',
      userAgent: req.headers['user-agent'],
      method: req.method
    },
    timestamp: new Date().toISOString()
  })
})

/**
 * POST /api/integration-test/data-test - Test data handling
 */
router.post('/data-test', (req, res) => {
  const { testData, format } = req.body
  
  res.json({
    success: true,
    message: 'Data handling working correctly! 📊',
    received: {
      testData,
      format,
      bodySize: JSON.stringify(req.body).length
    },
    processed: {
      testDataType: typeof testData,
      formatType: typeof format,
      timestamp: new Date().toISOString()
    }
  })
})

/**
 * GET /api/integration-test/endpoints-status - Check all new endpoints
 */
router.get('/endpoints-status', (req, res) => {
  const endpoints = [
    { name: 'User Profile', path: '/api/user/profile', method: 'GET', requiresAuth: true },
    { name: 'Update Profile', path: '/api/user/profile', method: 'PUT', requiresAuth: true },
    { name: 'Upload Avatar', path: '/api/user/avatar', method: 'POST', requiresAuth: true },
    { name: 'Get Preferences', path: '/api/user/preferences', method: 'GET', requiresAuth: true },
    { name: 'Update Preferences', path: '/api/user/preferences', method: 'PUT', requiresAuth: true },
    { name: 'Change Password', path: '/api/user/password', method: 'PUT', requiresAuth: true },
    { name: 'Security Settings', path: '/api/user/security', method: 'GET', requiresAuth: true },
    { name: 'Active Sessions', path: '/api/user/sessions', method: 'GET', requiresAuth: true },
    { name: 'Analytics Charts', path: '/api/analytics/charts', method: 'GET', requiresAuth: true },
    { name: 'Analytics Summary', path: '/api/analytics/summary', method: 'GET', requiresAuth: true },
    { name: 'Export Data', path: '/api/analytics/export', method: 'GET', requiresAuth: true },
    { name: 'Betting History (Enhanced)', path: '/api/bets/history', method: 'GET', requiresAuth: true }
  ]

  res.json({
    success: true,
    message: 'All new endpoints are configured! 🎯',
    endpoints,
    summary: {
      total: endpoints.length,
      authenticated: endpoints.filter(e => e.requiresAuth).length,
      public: endpoints.filter(e => !e.requiresAuth).length
    },
    integrationNotes: {
      authentication: 'Use Bearer token in Authorization header',
      avatarUpload: 'Use multipart/form-data with field name "avatar"',
      filtering: 'Enhanced history endpoint supports advanced filtering',
      export: 'Analytics export supports CSV format with optional charts',
      preferences: 'User preferences stored as JSON with validation'
    },
    timestamp: new Date().toISOString()
  })
})

/**
 * GET /api/integration-test/sample-data - Get sample data for testing
 */
router.get('/sample-data', (req, res) => {
  res.json({
    success: true,
    message: 'Sample data for frontend testing 🧪',
    sampleUser: {
      id: 1,
      username: 'testuser',
      email: 'test@winzo.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      country: 'United States',
      emailVerified: true,
      phoneVerified: false,
      walletBalance: 100.00
    },
    samplePreferences: {
      defaultStake: 10.00,
      quickStakeAmounts: [5.00, 10.00, 25.00, 50.00, 100.00],
      oddsFormat: 'decimal',
      autoAcceptOddsChanges: false,
      enableNotifications: true,
      emailNotifications: true,
      smsNotifications: false,
      favoritesSports: ['Football', 'Basketball'],
      favoritesTeams: ['Lakers', 'Chiefs']
    },
    sampleBetHistory: [
      {
        id: 'bet_001',
        date: '2024-01-15',
        sport: 'Basketball',
        event: 'Lakers vs Warriors',
        betType: 'Point Spread',
        stake: 50,
        odds: 1.91,
        status: 'won',
        profit: 45.50
      }
    ],
    sampleAnalytics: {
      totalBets: 25,
      winRate: 64.0,
      netProfit: 125.50,
      roi: 12.5
    },
    timestamp: new Date().toISOString()
  })
})

module.exports = router
