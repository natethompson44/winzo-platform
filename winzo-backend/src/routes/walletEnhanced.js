const express = require('express')
const router = express.Router()
// Import authentication middleware. The file exports a single function,
// so we require it directly rather than using object destructuring.
const authenticateToken = require('../middleware/auth')
const { User } = require('../models')

/**
 * Enhanced Wallet API Routes with Full Financial Management
 *
 * Provides comprehensive wallet functionality including deposits,
 * withdrawals, transaction history, and balance management.
 */

// Get wallet balance with enhanced data
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const user = await User.findByPk(userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const balance = user.walletBalance || 0

    // Determine status and encouragement based on balance
    let status, encouragement
    if (balance >= 100) {
      status = 'ready'
      encouragement = '🔥 You\'re loaded and ready for Big Win Energy!'
    } else if (balance >= 50) {
      status = 'good'
      encouragement = '💪 Good balance! Time to make some winning moves!'
    } else if (balance >= 10) {
      status = 'low'
      encouragement = '⚡ Add more funds to maximize your winning potential!'
    } else {
      status = 'empty'
      encouragement = '💎 Power up your wallet and activate that Big Win Energy!'
    }

    res.json({
      success: true,
      message: 'Wallet balance retrieved successfully',
      data: {
        balance,
        formatted: `$${balance.toFixed(2)}`,
        status,
        encouragement,
        lastUpdated: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Wallet balance error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve wallet balance',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Add funds to wallet
router.post('/add-funds', authenticateToken, async (req, res) => {
  try {
    const { amount, method } = req.body
    const userId = req.user.id

    // Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount. Minimum deposit is $1.'
      })
    }

    if (amount > 10000) {
      return res.status(400).json({
        success: false,
        message: 'Maximum deposit is $10,000 per transaction.'
      })
    }

    const validMethods = ['credit_card', 'bank_transfer', 'crypto']
    if (!validMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method'
      })
    }

    // Get user
    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Simulate payment processing
    // In production, this would integrate with actual payment processors
    const processingTime = method === 'crypto' ? 100 : method === 'credit_card' ? 200 : 500
    await new Promise(resolve => setTimeout(resolve, processingTime))

    // Update user balance
    const newBalance = user.walletBalance + amount
    await user.update({ walletBalance: newBalance })

    // Create transaction record (simplified for demo)
    const transaction = {
      id: `txn_${Date.now()}`,
      type: 'credit',
      amount: `+$${amount.toFixed(2)}`,
      description: `Deposit via ${method.replace('_', ' ')}`,
      timestamp: new Date().toISOString(),
      status: 'completed',
      method
    }

    res.json({
      success: true,
      message: `🎉 $${amount.toFixed(2)} added successfully! Your Big Win Energy is charged up!`,
      data: {
        transaction,
        newBalance: `$${newBalance.toFixed(2)}`,
        balanceIncrease: `+$${amount.toFixed(2)}`
      }
    })
  } catch (error) {
    console.error('Add funds error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to add funds. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Withdraw funds from wallet
router.post('/withdraw', authenticateToken, async (req, res) => {
  try {
    const { amount, method, details } = req.body
    const userId = req.user.id

    // Validate input
    if (!amount || amount < 10) {
      return res.status(400).json({
        success: false,
        message: 'Minimum withdrawal amount is $10.'
      })
    }

    if (!details || details.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid withdrawal details.'
      })
    }

    const validMethods = ['bank_transfer', 'crypto']
    if (!validMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid withdrawal method'
      })
    }

    // Get user and check balance
    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    if (user.walletBalance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance for withdrawal.'
      })
    }

    // Simulate withdrawal processing
    const processingTime = method === 'crypto' ? 200 : 800
    await new Promise(resolve => setTimeout(resolve, processingTime))

    // Update user balance
    const newBalance = user.walletBalance - amount
    await user.update({ walletBalance: newBalance })

    // Create transaction record
    const transaction = {
      id: `txn_${Date.now()}`,
      type: 'debit',
      amount: `-$${amount.toFixed(2)}`,
      description: `Withdrawal via ${method.replace('_', ' ')}`,
      timestamp: new Date().toISOString(),
      status: 'processing',
      method,
      estimatedCompletion: method === 'crypto' ? '1-2 hours' : '1-3 business days'
    }

    res.json({
      success: true,
      message: `💸 Withdrawal of $${amount.toFixed(2)} initiated! Your winnings are on the way!`,
      data: {
        transaction,
        newBalance: `$${newBalance.toFixed(2)}`,
        estimatedCompletion: transaction.estimatedCompletion
      }
    })
  } catch (error) {
    console.error('Withdraw error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to process withdrawal. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Get transaction history
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const { limit = 20, offset = 0 } = req.query

    // In production, this would fetch from a transactions table
    // For demo, we'll generate some sample transactions
    const sampleTransactions = [
      {
        id: 'txn_001',
        type: 'credit',
        amount: '+$100.00',
        description: 'Welcome bonus - Big Win Energy activated!',
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        status: 'completed',
        friendlyDescription: 'Welcome bonus - Big Win Energy activated!',
        icon: '🎁'
      },
      {
        id: 'txn_002',
        type: 'credit',
        amount: '+$50.00',
        description: 'Deposit via credit card',
        timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        status: 'completed',
        friendlyDescription: 'Deposit via credit card',
        icon: '💳'
      },
      {
        id: 'txn_003',
        type: 'debit',
        amount: '-$25.00',
        description: 'Bet placed on NBA Lakers vs Celtics',
        timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        status: 'completed',
        friendlyDescription: 'Bet placed on NBA Lakers vs Celtics',
        icon: '🏀'
      },
      {
        id: 'txn_004',
        type: 'credit',
        amount: '+$75.00',
        description: 'Winning bet payout - NFL Chiefs vs Bills',
        timestamp: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
        status: 'completed',
        friendlyDescription: 'Winning bet payout - NFL Chiefs vs Bills',
        icon: '🏆'
      }
    ]

    const paginatedTransactions = sampleTransactions.slice(offset, offset + parseInt(limit))

    res.json({
      success: true,
      message: 'Transaction history retrieved successfully',
      data: {
        transactions: paginatedTransactions,
        pagination: {
          total: sampleTransactions.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (offset + parseInt(limit)) < sampleTransactions.length
        },
        summary: {
          totalDeposits: '$150.00',
          totalWithdrawals: '$0.00',
          totalBets: '$25.00',
          totalWinnings: '$75.00',
          netActivity: '+$200.00'
        }
      }
    })
  } catch (error) {
    console.error('Transaction history error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transaction history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Get wallet statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const user = await User.findByPk(userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Generate comprehensive wallet and user statistics
    const walletBalance = user.walletBalance || 0

    // Determine user status based on activity and balance
    let userStatus
    if (walletBalance >= 500) userStatus = 'champion'
    else if (walletBalance >= 200) userStatus = 'experienced'
    else if (walletBalance >= 100) userStatus = 'rising'
    else if (walletBalance >= 50) userStatus = 'hot_streak'
    else userStatus = 'fresh'

    const stats = {
      user: {
        username: user.username,
        walletBalance,
        status: userStatus,
        joinedDate: user.createdAt,
        lastActive: new Date().toISOString()
      },
      betting: {
        totalBets: 0,
        pendingBets: 0,
        wonBets: 0,
        lostBets: 0,
        winRate: '0%',
        totalWagered: '$0.00',
        totalWinnings: '$0.00',
        netProfit: '$0.00',
        profitStatus: 'building',
        favoriteMarket: 'Coming soon!',
        biggestWin: '$0.00'
      },
      insights: {
        strongestSport: 'Coming soon!',
        bestBettingTime: 'Coming soon!',
        winningStreak: 0,
        nextMilestone: 'Place your first bet to get started!',
        recommendations: [
          'Start with small bets to build confidence',
          'Focus on sports you know well',
          'Set a budget and stick to it'
        ]
      },
      achievements: [
        {
          id: 'welcome',
          title: 'Welcome to WINZO!',
          description: 'Account created successfully',
          icon: '🎉',
          unlockedAt: user.createdAt,
          rarity: 'common'
        }
      ]
    }

    res.json({
      success: true,
      message: 'Wallet statistics retrieved successfully',
      data: stats
    })
  } catch (error) {
    console.error('Wallet stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve wallet statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Get payment methods
router.get('/payment-methods', authenticateToken, async (req, res) => {
  try {
    const paymentMethods = {
      deposit: [
        {
          id: 'credit_card',
          name: 'Credit Card',
          icon: '💳',
          processingTime: 'Instant',
          fees: 'Free',
          minAmount: 1,
          maxAmount: 10000,
          popular: true
        },
        {
          id: 'bank_transfer',
          name: 'Bank Transfer',
          icon: '🏦',
          processingTime: '1-2 business days',
          fees: 'Free',
          minAmount: 10,
          maxAmount: 50000,
          popular: false
        },
        {
          id: 'crypto',
          name: 'Cryptocurrency',
          icon: '₿',
          processingTime: '10-30 minutes',
          fees: 'Network fees apply',
          minAmount: 5,
          maxAmount: 25000,
          popular: false
        }
      ],
      withdrawal: [
        {
          id: 'bank_transfer',
          name: 'Bank Transfer',
          icon: '🏦',
          processingTime: '1-3 business days',
          fees: 'Free',
          minAmount: 10,
          maxAmount: 50000,
          popular: true
        },
        {
          id: 'crypto',
          name: 'Cryptocurrency',
          icon: '₿',
          processingTime: '1-2 hours',
          fees: 'Network fees apply',
          minAmount: 10,
          maxAmount: 25000,
          popular: false
        }
      ]
    }

    res.json({
      success: true,
      message: 'Payment methods retrieved successfully',
      data: paymentMethods
    })
  } catch (error) {
    console.error('Payment methods error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment methods',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

module.exports = router
