const express = require('express');
const router = express.Router();

// Import users array from users.js
const { users } = require('./users');

// In-memory storage for bets (in production, use a proper database)
const bets = [];
let nextBetId = 1;

// POST /api/bet - Allow logged-in users to save a bet
router.post('/bet', (req, res) => {
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

        // Check if user has sufficient balance
        const userData = users.find(u => u.id === user.userId);
        if (!userData) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const stakeAmount = parseFloat(stake);
        const currentBalance = userData.balance || 0;

        if (currentBalance < stakeAmount) {
            return res.status(400).json({
                success: false,
                error: 'Insufficient funds',
                message: `Current balance: $${currentBalance.toFixed(2)}, Required stake: $${stakeAmount.toFixed(2)}`
            });
        }

        // Create new bet
        const newBet = {
            id: nextBetId++,
            user_id: user.userId,
            match: match,
            team: team,
            odds: parseFloat(odds),
            stake: stakeAmount,
            potential_payout: parseFloat(potential_payout),
            created_at: new Date().toISOString()
        };

        bets.push(newBet);

        // Deduct stake from user's balance
        userData.balance = currentBalance - stakeAmount;

        res.status(201).json({
            success: true,
            message: 'Bet placed successfully',
            bet: {
                id: newBet.id,
                match: newBet.match,
                team: newBet.team,
                odds: newBet.odds,
                stake: newBet.stake,
                potential_payout: newBet.potential_payout,
                created_at: newBet.created_at
            },
            new_balance: userData.balance
        });

    } catch (error) {
        console.error('Bet placement error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// GET /api/bets - Get user's betting history (requires valid token)
router.get('/bets', (req, res) => {
    try {
        // User info is attached by JWT middleware
        const user = req.user;
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        // Get user's bets
        const userBets = bets.filter(bet => bet.user_id === user.userId);

        res.json({
            success: true,
            bets: userBets.map(bet => ({
                id: bet.id,
                match: bet.match,
                team: bet.team,
                odds: bet.odds,
                stake: bet.stake,
                potential_payout: bet.potential_payout,
                created_at: bet.created_at
            }))
        });

    } catch (error) {
        console.error('Get bets error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

module.exports = router;
