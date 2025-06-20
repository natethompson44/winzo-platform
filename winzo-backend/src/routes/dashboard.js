const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const walletService = require('../services/walletService')
const User = require('../models/User')
const Bet = require('../models/Bet')
const SportsEvent = require('../models/SportsEvent')
const Sport = require('../models/Sport')

/**
 * WINZO Dashboard Routes
 *
 * Centralized dashboard data aggregation with Big Win Energy messaging.
 * Provides comprehensive user overview combining wallet, betting, and activity data.
 */

/**
 * GET /api/dashboard - Get comprehensive dashboard data
 * Returns aggregated user data for the main dashboard view
 */
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id
    console.log('WINZO Dashboard: Loading for user:', userId)

    // Get user details
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password_hash'] }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Get wallet balance
    const walletBalance = parseFloat(user.wallet_balance || 0)
    console.log('WINZO Dashboard: Wallet balance:', walletBalance)

    // Try to get betting statistics with fallback
    let totalBets = 0
    let activeBets = 0
    let wonBets = 0
    let recentBets = []
    let allBets = []

    try {
      // Try with user_id first (snake_case from associations)
      totalBets = await Bet.count({ where: { user_id: userId } })
      activeBets = await Bet.count({ where: { user_id: userId, status: 'pending' } })
      wonBets = await Bet.count({ where: { user_id: userId, status: 'won' } })

      recentBets = await Bet.findAll({
        where: { user_id: userId },
        order: [['createdAt', 'DESC']],
        limit: 5
      })

      allBets = await Bet.findAll({
        where: { user_id: userId },
        attributes: ['amount', 'actualPayout', 'status']
      })

      console.log('WINZO Dashboard: Betting stats loaded with user_id')
    } catch (betError) {
      console.log('WINZO Dashboard: Trying with userId (camelCase)...')
      try {
        // Fallback to camelCase
        totalBets = await Bet.count({ where: { userId } })
        activeBets = await Bet.count({ where: { userId, status: 'pending' } })
        wonBets = await Bet.count({ where: { userId, status: 'won' } })

        recentBets = await Bet.findAll({
          where: { userId },
          order: [['createdAt', 'DESC']],
          limit: 5
        })

        allBets = await Bet.findAll({
          where: { userId },
          attributes: ['amount', 'actualPayout', 'status']
        })

        console.log('WINZO Dashboard: Betting stats loaded with userId')
      } catch (betError2) {
        console.log('WINZO Dashboard: Bet queries failed, using default values:', betError2.message)
        // Use default values - no bets
      }
    }

    // Calculate total wagered and winnings safely
    const totalWagered = allBets.reduce((sum, bet) => sum + parseFloat(bet.amount || 0), 0)
    const totalWinnings = allBets
      .filter(bet => bet.status === 'won')
      .reduce((sum, bet) => sum + parseFloat(bet.actualPayout || 0), 0)

    // Generate motivational message
    let welcomeMessage
    if (wonBets >= 5) {
      welcomeMessage = `🏆 Welcome back, champion! ${wonBets} wins and counting!`
    } else if (totalBets >= 10) {
      welcomeMessage = `⚡ Your Big Win Energy is building! ${totalBets} bets placed!`
    } else if (totalBets > 0) {
      welcomeMessage = '🚀 Great start! Your winning journey is underway!'
    } else {
      welcomeMessage = '💎 Welcome to WINZO! Ready to activate your Big Win Energy?'
    }

    res.json({
      success: true,
      message: welcomeMessage,
      data: {
        user: {
          id: user.id,
          username: user.username,
          memberSince: user.created_at
        },
        wallet: {
          balance: walletBalance,
          formatted: `$${walletBalance.toFixed(2)}`,
          status: walletBalance > 0 ? 'ready' : 'needs_funds'
        },
        betting: {
          totalBets,
          activeBets,
          wonBets,
          lostBets: totalBets - activeBets - wonBets,
          winRate: totalBets > 0 ? ((wonBets / (totalBets - activeBets)) * 100).toFixed(1) : '0',
          totalWagered: totalWagered.toFixed(2),
          totalWinnings: totalWinnings.toFixed(2),
          netProfit: (totalWinnings - totalWagered).toFixed(2)
        },
        recentActivity: recentBets.map(bet => ({
          id: bet.id,
          event: 'Event details',
          sport: 'Sports betting',
          amount: parseFloat(bet.amount || 0),
          status: bet.status,
          placedAt: bet.createdAt
        })),
        quickStats: {
          biggestWin: allBets
            .filter(bet => bet.status === 'won')
            .reduce((max, bet) => Math.max(max, parseFloat(bet.actualPayout || 0)), 0),
          currentStreak: 0,
          favoritesSport: 'Coming soon!',
          nextMilestone: totalBets < 10
            ? `${10 - totalBets} more bets to unlock Experienced Player!`
            : 'Keep building that Big Win Energy!'
        }
      }
    })
  } catch (error) {
    console.error('WINZO Dashboard: Error loading dashboard:', error.message)
    console.error('WINZO Dashboard: Full error details:', error)
    res.status(500).json({
      success: false,
      message: "Let's try loading your dashboard again!",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
})

/**
 * GET /api/dashboard/quick-stats - Get quick statistics for dashboard widgets
 * Returns essential stats for dashboard cards and widgets
 */
router.get('/quick-stats', auth, async (req, res) => {
  try {
    const userId = req.user.id

    // Get essential counts quickly
    const [user, totalBets, activeBets, wonBets] = await Promise.all([
      User.findByPk(userId, { attributes: ['wallet_balance'] }),
      Bet.count({ where: { userId } }),
      Bet.count({ where: { userId, status: 'pending' } }),
      Bet.count({ where: { userId, status: 'won' } })
    ])

    const walletBalance = parseFloat(user?.wallet_balance || 0)

    res.json({
      success: true,
      message: 'Quick stats loaded with Big Win Energy!',
      data: {
        walletBalance: walletBalance.toFixed(2),
        activeBets,
        recentWins: wonBets,
        totalBets,
        status: 'active'
      }
    })
  } catch (error) {
    console.error('WINZO Dashboard: Error loading quick stats:', error.message)
    res.status(500).json({
      success: false,
      message: "Let's try loading those stats again!",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

module.exports = router
