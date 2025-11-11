const express = require('express');
const { query, transaction } = require('../db');
const { depositEventTracker, withdrawEventTracker } = require('../middleware/eventTracker');
const router = express.Router();

// GET /api/wallet - Return current balance (JWT-protected)
router.get('/wallet', async (req, res) => {
    try {
        // User info is attached by JWT middleware
        const user = req.user;
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        // Find user in database
        const userResult = await query('SELECT balance FROM users WHERE id = $1', [user.userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const balance = parseFloat(userResult.rows[0].balance);

        res.json({
            success: true,
            balance: balance
        });

    } catch (error) {
        console.error('Wallet balance error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// POST /api/deposit - Add funds (JWT-protected)
router.post('/deposit', depositEventTracker, async (req, res) => {
    try {
        // User info is attached by JWT middleware
        const user = req.user;
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const { amount } = req.body;

        // Validate input
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Valid amount is required'
            });
        }

        const depositAmount = parseFloat(amount);

        // Use transaction to ensure atomicity
        const result = await transaction(async (client) => {
            // Find user in database
            const userResult = await client.query('SELECT balance FROM users WHERE id = $1', [user.userId]);
            if (userResult.rows.length === 0) {
                throw new Error('User not found');
            }

            const currentBalance = parseFloat(userResult.rows[0].balance);
            const newBalance = currentBalance + depositAmount;

            // Update user balance
            await client.query('UPDATE users SET balance = $1 WHERE id = $2', [newBalance, user.userId]);

            // Record transaction
            await client.query(
                'INSERT INTO transactions (user_id, type, amount) VALUES ($1, $2, $3)',
                [user.userId, 'deposit', depositAmount]
            );

            return newBalance;
        });

        res.json({
            success: true,
            message: `Deposited $${depositAmount.toFixed(2)} successfully`,
            balance: result
        });

    } catch (error) {
        console.error('Deposit error:', error);
        
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

// POST /api/withdraw - Subtract funds (JWT-protected)
router.post('/withdraw', withdrawEventTracker, async (req, res) => {
    try {
        // User info is attached by JWT middleware
        const user = req.user;
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const { amount } = req.body;

        // Validate input
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Valid amount is required'
            });
        }

        const withdrawAmount = parseFloat(amount);

        // Use transaction to ensure atomicity
        const result = await transaction(async (client) => {
            // Find user in database
            const userResult = await client.query('SELECT balance FROM users WHERE id = $1', [user.userId]);
            if (userResult.rows.length === 0) {
                throw new Error('User not found');
            }

            const currentBalance = parseFloat(userResult.rows[0].balance);
            if (currentBalance < withdrawAmount) {
                throw new Error(`Insufficient funds. Current balance: $${currentBalance.toFixed(2)}, Requested: $${withdrawAmount.toFixed(2)}`);
            }

            const newBalance = currentBalance - withdrawAmount;

            // Update user balance
            await client.query('UPDATE users SET balance = $1 WHERE id = $2', [newBalance, user.userId]);

            // Record transaction
            await client.query(
                'INSERT INTO transactions (user_id, type, amount) VALUES ($1, $2, $3)',
                [user.userId, 'withdraw', withdrawAmount]
            );

            return newBalance;
        });

        res.json({
            success: true,
            message: `Withdrawn $${withdrawAmount.toFixed(2)} successfully`,
            balance: result
        });

    } catch (error) {
        console.error('Withdraw error:', error);
        
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

module.exports = router;
