const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const walletService = require('../services/walletService');
const User = require('../models/User');
const Bet = require('../models/Bet');
const SportsEvent = require('../models/SportsEvent');
const Sport = require('../models/Sport');
const { Op } = require('sequelize');

/**
 * WINZO Dashboard Routes
 * 
 * Centralized dashboard data aggregation with Big Win Energy messaging.
 * Provides comprehensive user overview combining wallet, betting, and activity data.
 * OPTIMIZATION: Reduced N+1 queries by batching database operations.
 */

/**
 * GET /api/dashboard - Get comprehensive dashboard data
 * Returns aggregated user data for the main dashboard view
 * FIXED: Removed N+1 queries by batching all data fetches
 */
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user;

    // OPTIMIZATION: Batch all database queries to reduce N+1 issues
    const [user, bettingData] = await Promise.all([
      // Get user details
      User.findByPk(userId, {
        attributes: { exclude: ['password'] }
      }),
      
      // Get all betting data in a single optimized query
      Bet.findAll({
        where: { user_id: userId },
        include: [{
          model: SportsEvent,
          attributes: ['homeTeam', 'awayTeam'],
          include: [{
            model: Sport,
            attributes: ['title']
          }]
        }],
        attributes: ['id', 'amount', 'actualPayout', 'status', 'placedAt', 'selectedTeam', 'odds'],
        order: [['placedAt', 'DESC']]
      })
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // OPTIMIZATION: Calculate all statistics from the single bettingData query
    const walletBalance = parseFloat(user.walletBalance || 0);
    const totalBets = bettingData.length;
    const activeBets = bettingData.filter(bet => bet.status === 'pending').length;
    const wonBets = bettingData.filter(bet => bet.status === 'won').length;
    const lostBets = bettingData.filter(bet => bet.status === 'lost').length;

    // Calculate financial metrics
    const totalWagered = bettingData.reduce((sum, bet) => sum + parseFloat(bet.amount), 0);
    const totalWinnings = bettingData
      .filter(bet => bet.status === 'won')
      .reduce((sum, bet) => sum + parseFloat(bet.actualPayout || 0), 0);
    
    const netProfit = totalWinnings - totalWagered;
    const winRate = totalBets > 0 ? (wonBets / (totalBets - activeBets)) : 0;

    // Get recent bets (top 5)
    const recentBets = bettingData.slice(0, 5);

    // Calculate advanced metrics
    const settledBets = bettingData.filter(bet => bet.status !== 'pending');
    const biggestWin = settledBets
      .filter(bet => bet.status === 'won')
      .reduce((max, bet) => Math.max(max, parseFloat(bet.actualPayout || 0)), 0);

    // Calculate streak (consecutive wins/losses)
    let currentStreak = 0;
    let streakType = null;
    for (const bet of settledBets) {
      if (bet.status === 'won') {
        if (streakType === 'won' || streakType === null) {
          currentStreak += (streakType === null ? 1 : 1);
          streakType = 'won';
        } else {
          break;
        }
      } else if (bet.status === 'lost') {
        if (streakType === 'lost' || streakType === null) {
          currentStreak += (streakType === null ? 1 : 1);
          streakType = 'lost';
        } else {
          break;
        }
      }
    }

    // Generate motivational message based on performance
    let welcomeMessage;
    if (wonBets >= 5) {
      welcomeMessage = `🏆 Welcome back, champion! ${wonBets} wins and counting!`;
    } else if (totalBets >= 10) {
      welcomeMessage = `⚡ Your Big Win Energy is building! ${totalBets} bets placed!`;
    } else if (totalBets > 0) {
      welcomeMessage = `🚀 Great start! Your winning journey is underway!`;
    } else {
      welcomeMessage = `💎 Welcome to WINZO! Ready to activate your Big Win Energy?`;
    }

    // RESPONSE: Single comprehensive response with all data
    res.json({
      success: true,
      message: welcomeMessage,
      data: {
        user: {
          id: user.id,
          username: user.username,
          inviteCode: user.inviteCode,
          memberSince: user.createdAt
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
          lostBets,
          winRate: (winRate * 100).toFixed(1),
          totalWagered: totalWagered.toFixed(2),
          totalWinnings: totalWinnings.toFixed(2),
          netProfit: netProfit.toFixed(2)
        },
        recentActivity: recentBets.map(bet => ({
          id: bet.id,
          event: bet.sportsEvent ? 
            `${bet.sportsEvent.homeTeam} vs ${bet.sportsEvent.awayTeam}` : 
            'Event not found',
          sport: bet.sportsEvent?.sport?.title || 'Unknown',
          amount: parseFloat(bet.amount),
          status: bet.status,
          placedAt: bet.placedAt
        })),
        quickStats: {
          biggestWin,
          currentStreak,
          streakType,
          favoritesSport: 'Coming soon!', // TODO: Calculate from bet history
          nextMilestone: totalBets < 10 ? 
            `${10 - totalBets} more bets to unlock Experienced Player!` :
            'Keep building that Big Win Energy!'
        }
      }
    });

  } catch (error) {
    console.error('WINZO Dashboard: Error loading dashboard:', error.message);
    res.status(500).json({
      success: false,
      message: "Let's try loading your dashboard again!",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/dashboard/quick-stats - Get quick statistics for dashboard widgets
 * Returns essential stats for dashboard cards and widgets
 * OPTIMIZATION: Single query for all quick stats
 */
router.get('/quick-stats', auth, async (req, res) => {
  try {
    const userId = req.user;

    // OPTIMIZATION: Single query instead of multiple separate queries
    const [user, betCounts] = await Promise.all([
      User.findByPk(userId, { attributes: ['walletBalance'] }),
      Bet.findAll({
        where: { user_id: userId },
        attributes: ['status'],
        raw: true
      })
    ]);

    const walletBalance = parseFloat(user?.walletBalance || 0);
    
    // Calculate counts from single query result
    const totalBets = betCounts.length;
    const activeBets = betCounts.filter(bet => bet.status === 'pending').length;
    const wonBets = betCounts.filter(bet => bet.status === 'won').length;

    res.json({
      success: true,
      message: "Quick stats loaded with Big Win Energy!",
      data: {
        walletBalance: walletBalance.toFixed(2),
        activeBets,
        recentWins: wonBets,
        totalBets,
        status: 'active'
      }
    });

  } catch (error) {
    console.error('WINZO Dashboard: Error loading quick stats:', error.message);
    res.status(500).json({
      success: false,
      message: "Let's try loading those stats again!",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

