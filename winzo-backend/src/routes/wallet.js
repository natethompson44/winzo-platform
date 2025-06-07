const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const walletService = require('../services/walletService');

/**
 * WINZO Wallet Routes
 * 
 * These routes handle all WINZO Wallet operations with the signature "Big Win Energy"
 * approach. Every interaction celebrates success and maintains the confident, energetic
 * tone that makes WINZO special. Mobile-first design ensures smooth thumb-driven
 * experiences for the exclusive WINZO community.
 */

/**
 * GET /api/wallet/balance - Get current WINZO Wallet balance
 * Returns balance with encouraging messaging
 */
router.get('/balance', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const balance = await walletService.getBalance(userId);

    const message = balance > 100 ? 
      `💰 $${balance.toFixed(2)} ready for Big Win Energy! You're loaded and ready to win!` :
      balance > 0 ?
      `💵 $${balance.toFixed(2)} in your WINZO Wallet. Time to multiply that energy!` :
      "Your WINZO Wallet is ready for action! Add funds to activate Big Win Energy!";

    res.json({
      success: true,
      message,
      data: {
        balance: parseFloat(balance.toFixed(2)),
        formatted: `$${balance.toFixed(2)}`,
        status: balance > 0 ? 'ready' : 'needs_funds',
        encouragement: balance > 50 ? 
          "You've got serious winning power!" :
          "Every big win starts with the first bet!"
      }
    });

  } catch (error) {
    console.error('WINZO Wallet: Error getting balance:', error.message);
    res.status(500).json({
      success: false,
      message: "Let's try checking your WINZO Wallet balance again!",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/wallet/add-funds - Add funds to WINZO Wallet
 * Handles fund additions with celebration messaging
 */
router.post('/add-funds', [
  auth,
  body('amount').isFloat({ min: 1 }).withMessage('Minimum $1 required to fuel your Big Win Energy'),
  body('method').optional().isIn(['credit_card', 'bank_transfer', 'crypto', 'admin_credit'])
    .withMessage('Valid payment method required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Almost there! Just need to fix one thing to power up your wallet.",
        errors: errors.array()
      });
    }

    const { amount, method = 'credit_card' } = req.body;
    const userId = req.user.id;

    // In a real implementation, you'd process the payment here
    // For now, we'll simulate successful payment processing
    const transaction = await walletService.addFunds(userId, amount, `payment_${method}`);

    // Celebratory response based on amount
    let celebrationMessage;
    let celebrationLevel;

    if (amount >= 500) {
      celebrationMessage = "🚀 MASSIVE ENERGY BOOST! You're ready for legendary wins!";
      celebrationLevel = "legendary";
    } else if (amount >= 100) {
      celebrationMessage = "🔥 BIG WIN ENERGY ACTIVATED! Time to dominate!";
      celebrationLevel = "big";
    } else if (amount >= 50) {
      celebrationMessage = "⚡ Power up complete! Your winning streak starts now!";
      celebrationLevel = "medium";
    } else {
      celebrationMessage = "💪 WINZO Wallet charged! Let's turn this into big wins!";
      celebrationLevel = "standard";
    }

    res.json({
      success: true,
      message: celebrationMessage,
      data: {
        transaction: {
          amount: transaction.amount,
          previousBalance: transaction.previousBalance,
          newBalance: transaction.newBalance,
          method,
          timestamp: transaction.timestamp
        },
        wallet: {
          balance: transaction.newBalance,
          formatted: `$${transaction.newBalance.toFixed(2)}`,
          status: 'powered_up'
        },
        celebration: {
          level: celebrationLevel,
          message: "Your Big Win Energy is stronger than ever!",
          nextAction: "Ready to place your winning bets?"
        }
      }
    });

  } catch (error) {
    console.error('WINZO Wallet: Error adding funds:', error.message);
    res.status(500).json({
      success: false,
      message: "No worries! Let's try adding those funds again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/wallet/stats - Get comprehensive wallet and betting statistics
 * Returns detailed stats with motivational messaging
 */
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await walletService.getUserStats(userId);

    // Generate motivational messaging based on performance
    let motivationMessage;
    let statusLevel;

    if (stats.betting.wonBets >= 10 && stats.betting.winRate >= 60) {
      motivationMessage = "🏆 WINZO CHAMPION! You're absolutely crushing it!";
      statusLevel = "champion";
    } else if (stats.betting.wonBets >= 5 && stats.betting.winRate >= 50) {
      motivationMessage = "🔥 HOT STREAK ALERT! Your Big Win Energy is unstoppable!";
      statusLevel = "hot_streak";
    } else if (stats.betting.totalBets >= 10) {
      motivationMessage = "⚡ EXPERIENCED PLAYER! Your winning moment is coming!";
      statusLevel = "experienced";
    } else if (stats.betting.totalBets > 0) {
      motivationMessage = "🚀 RISING STAR! Every champion started exactly where you are!";
      statusLevel = "rising";
    } else {
      motivationMessage = "💎 FRESH ENERGY! Your winning journey starts with the first bet!";
      statusLevel = "fresh";
    }

    res.json({
      success: true,
      message: motivationMessage,
      data: {
        user: {
          username: stats.username,
          walletBalance: stats.walletBalance,
          status: statusLevel
        },
        betting: {
          ...stats.betting,
          winRate: `${stats.betting.winRate}%`,
          totalWagered: `$${stats.betting.totalWagered.toFixed(2)}`,
          totalWinnings: `$${stats.betting.totalWinnings.toFixed(2)}`,
          netProfit: `$${stats.betting.netProfit.toFixed(2)}`,
          profitStatus: stats.betting.netProfit > 0 ? 'winning' : 'building'
        },
        recentActivity: stats.recentBets.map(bet => ({
          ...bet,
          amount: `$${bet.amount.toFixed(2)}`,
          outcome: bet.status === 'won' ? `🎉 WON` : 
                   bet.status === 'lost' ? `Next time!` : 
                   `🎯 Pending`
        })),
        insights: {
          strongestSport: "Coming soon!",
          bestBettingTime: "Coming soon!",
          winningStreak: stats.betting.wonBets,
          nextMilestone: stats.betting.totalBets < 10 ? 
            `${10 - stats.betting.totalBets} more bets to unlock Experienced Player status!` :
            "Keep building that Big Win Energy!"
        }
      }
    });

  } catch (error) {
    console.error('WINZO Wallet: Error getting stats:', error.message);
    res.status(500).json({
      success: false,
      message: "Let's try loading your WINZO stats again!",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/wallet/withdraw - Request withdrawal from WINZO Wallet
 * Handles withdrawal requests with supportive messaging
 */
router.post('/withdraw', [
  auth,
  body('amount').isFloat({ min: 10 }).withMessage('Minimum withdrawal is $10'),
  body('method').isIn(['bank_transfer', 'crypto', 'check'])
    .withMessage('Valid withdrawal method required'),
  body('details').notEmpty().withMessage('Withdrawal details required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Almost there! Just need to complete your withdrawal details.",
        errors: errors.array()
      });
    }

    const { amount, method, details } = req.body;
    const userId = req.user.id;

    // Check if user has sufficient balance
    const balance = await walletService.getBalance(userId);
    if (balance < amount) {
      return res.status(400).json({
        success: false,
        message: "You need a bit more in your WINZO Wallet for this withdrawal. Time for a few more wins!",
        data: {
          requestedAmount: amount,
          availableBalance: balance,
          shortfall: amount - balance
        }
      });
    }

    // In a real implementation, you'd process the withdrawal request
    // For now, we'll simulate the request being queued
    
    // Deduct funds (mark as pending withdrawal)
    const transaction = await walletService.deductFunds(userId, amount, `withdrawal_${method}`);

    res.json({
      success: true,
      message: `💸 Withdrawal request submitted! Your $${amount.toFixed(2)} is on the way!`,
      data: {
        withdrawal: {
          amount: parseFloat(amount),
          method,
          status: 'pending',
          estimatedTime: method === 'crypto' ? '1-2 hours' : 
                        method === 'bank_transfer' ? '1-3 business days' : 
                        '5-7 business days',
          referenceId: `WZ${Date.now()}`,
          submittedAt: new Date()
        },
        wallet: {
          previousBalance: transaction.previousBalance,
          newBalance: transaction.newBalance,
          pendingWithdrawals: amount
        },
        message: "🎉 Congratulations on your WINZO winnings! More Big Win Energy coming your way!"
      }
    });

  } catch (error) {
    console.error('WINZO Wallet: Error processing withdrawal:', error.message);
    res.status(500).json({
      success: false,
      message: "Let's try processing your withdrawal again!",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/wallet/transactions - Get wallet transaction history
 * Returns transaction history with clear, friendly descriptions
 */
router.get('/transactions', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, page = 1, type } = req.query;

    // This would typically query a transactions table
    // For now, we'll return a simulated response
    const transactions = [
      {
        id: '1',
        type: 'credit',
        amount: 50.00,
        description: 'Welcome bonus - Big Win Energy activated!',
        timestamp: new Date(),
        status: 'completed'
      }
    ];

    res.json({
      success: true,
      message: "Here's your WINZO Wallet activity! Every transaction tells a winning story!",
      data: {
        transactions: transactions.map(tx => ({
          ...tx,
          amount: `${tx.type === 'credit' ? '+' : '-'}$${tx.amount.toFixed(2)}`,
          friendlyDescription: tx.description,
          icon: tx.type === 'credit' ? '💰' : '💸'
        })),
        summary: {
          totalCredits: 1,
          totalDebits: 0,
          netChange: '+$50.00',
          period: '30 days'
        }
      }
    });

  } catch (error) {
    console.error('WINZO Wallet: Error getting transactions:', error.message);
    res.status(500).json({
      success: false,
      message: "Let's try loading your transaction history again!",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

