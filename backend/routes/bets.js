const express = require('express');
const { query, transaction } = require('../db');
const { betEventTracker } = require('../middleware/eventTracker');
const router = express.Router();

// POST /api/bet - Allow logged-in users to save a bet
router.post('/bet', betEventTracker, async (req, res) => {
    try {
        // User info is attached by JWT middleware
        const user = req.user;
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const { match, team, odds, stake, potential_payout } = req.body;

        // Validate input
        if (!match || !team || !odds || !stake || !potential_payout) {
            return res.status(400).json({
                success: false,
                error: 'All bet fields are required: match, team, odds, stake, potential_payout'
            });
        }

        // Validate numeric fields
        if (isNaN(parseFloat(odds)) || isNaN(parseFloat(stake)) || isNaN(parseFloat(potential_payout))) {
            return res.status(400).json({
                success: false,
                error: 'Odds, stake, and potential_payout must be valid numbers'
            });
        }

        const stakeAmount = parseFloat(stake);

        // Use transaction to ensure atomicity
        const result = await transaction(async (client) => {
            // Check if user has sufficient balance
            const userResult = await client.query('SELECT balance FROM users WHERE id = $1', [user.userId]);
            if (userResult.rows.length === 0) {
                throw new Error('User not found');
            }

            const currentBalance = parseFloat(userResult.rows[0].balance);
            if (currentBalance < stakeAmount) {
                throw new Error(`Insufficient funds. Current balance: $${currentBalance.toFixed(2)}, Required stake: $${stakeAmount.toFixed(2)}`);
            }

            // Create new bet
            const betResult = await client.query(
                'INSERT INTO bets (user_id, match, team, odds, stake, potential_payout) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, match, team, odds, stake, potential_payout, created_at',
                [user.userId, match, team, parseFloat(odds), stakeAmount, parseFloat(potential_payout)]
            );

            // Deduct stake from user's balance
            const newBalance = currentBalance - stakeAmount;
            await client.query('UPDATE users SET balance = $1 WHERE id = $2', [newBalance, user.userId]);

            return {
                bet: betResult.rows[0],
                newBalance: newBalance
            };
        });

        res.status(201).json({
            success: true,
            message: 'Bet placed successfully',
            bet: {
                id: result.bet.id,
                match: result.bet.match,
                team: result.bet.team,
                odds: parseFloat(result.bet.odds),
                stake: parseFloat(result.bet.stake),
                potential_payout: parseFloat(result.bet.potential_payout),
                created_at: result.bet.created_at
            },
            new_balance: result.newBalance
        });

    } catch (error) {
        console.error('Bet placement error:', error);
        
        // Handle specific error cases
        if (error.message.includes('Insufficient funds')) {
            return res.status(400).json({
                success: false,
                error: 'Insufficient funds',
                message: error.message
            });
        }
        
        if (error.message.includes('User not found')) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// GET /api/bets - Get user's betting history (requires valid token)
router.get('/bets', async (req, res) => {
    try {
        // User info is attached by JWT middleware
        const user = req.user;
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        // Get user's bets from database
        const betsResult = await query(
            'SELECT id, match, team, odds, stake, potential_payout, status, created_at FROM bets WHERE user_id = $1 ORDER BY created_at DESC',
            [user.userId]
        );

        res.json({
            success: true,
            bets: betsResult.rows.map(bet => ({
                id: bet.id,
                match: bet.match,
                team: bet.team,
                odds: parseFloat(bet.odds),
                stake: parseFloat(bet.stake),
                potential_payout: parseFloat(bet.potential_payout),
                status: bet.status,
                created_at: bet.created_at
            }))
        });

    } catch (error) {
        console.error('Get bets error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

module.exports = router;
