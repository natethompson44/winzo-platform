const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const walletService = require('../services/walletService');
const User = require('../models/User');
const Bet = require('../models/Bet');
const SportsEvent = require('../models/SportsEvent');
const Sport = require('../models/Sport');

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
    const userId = req.user.id;

    // Get user details
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get wallet balance
    const walletBalance = parseFloat(user.walletBalance || 0);

    // Get betting statistics
    const totalBets = await Bet.count({ where: { user_id: userId } });
    const activeBets = await Bet.count({ 
      where: { user_id: userId, status: 'pending' } 
    });
    const wonBets = await Bet.count({ 
      where: { user_id: userId, status: 'won' } 
    });

    // Get recent bets
    const recentBets = await Bet.findAll({
      where: { user_id: userId },
      include: [{
        model: SportsEvent,
        attributes: ['homeTeam', 'awayTeam'],
        include: [{
          model: Sport,
          attributes: ['title']
        }]
      }],
      order: [['placedAt', 'DESC']],
      limit: 5
    });

    // Calculate total wagered and winnings
    const allBets = await Bet.findAll({
      where: { user_id: userId },
      attributes: ['amount', 'actualPayout', 'status']
    });

    const totalWagered = allBets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0);
    const totalWinnings = allBets
      .filter(bet => bet.status === 'won')
      .reduce((sum, bet) => sum + parseFloat(bet.actualPayout || 0), 0);

    // Generate motivational message
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
          lostBets: totalBets - activeBets - wonBets,
          winRate: totalBets > 0 ? ((wonBets / (totalBets - activeBets)) * 100).toFixed(1) : 0,
          totalWagered: totalWagered.toFixed(2),
          totalWinnings: totalWinnings.toFixed(2),
          netProfit: (totalWinnings - totalWagered).toFixed(2)
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
          biggestWin: allBets
            .filter(bet => bet.status === 'won')
            .reduce((max, bet) => Math.max(max, parseFloat(bet.actualPayout || 0)), 0),
          currentStreak: 0, // TODO: Calculate actual streak
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
 */
router.get('/quick-stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get essential counts quickly
    const [user, totalBets, activeBets, wonBets] = await Promise.all([
      User.findByPk(userId, { attributes: ['walletBalance'] }),
      Bet.count({ where: { user_id: userId } }),
      Bet.count({ where: { user_id: userId, status: 'pending' } }),
      Bet.count({ where: { user_id: userId, status: 'won' } })
    ]);

    const walletBalance = parseFloat(user?.walletBalance || 0);

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

