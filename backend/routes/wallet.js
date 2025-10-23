const express = require('express');
const router = express.Router();

// Import users array from users.js
const { users, nextUserId } = require('./users');

// GET /api/wallet - Return current balance (JWT-protected)
router.get('/wallet', (req, res) => {
    try {
        // User info is attached by JWT middleware
        const user = req.user;
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        // Find user in our storage
        const userData = users.find(u => u.id === user.userId);
        if (!userData) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            balance: userData.balance || 0
        });

    } catch (error) {
        console.error('Wallet balance error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// POST /api/deposit - Add fake funds (JWT-protected, for testing)
router.post('/deposit', (req, res) => {
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

        // Find user in our storage
        const userData = users.find(u => u.id === user.userId);
        if (!userData) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Update balance
        userData.balance = (userData.balance || 0) + depositAmount;

        res.json({
            success: true,
            message: `Deposited $${depositAmount.toFixed(2)} successfully`,
            balance: userData.balance
        });

    } catch (error) {
        console.error('Deposit error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// POST /api/withdraw - Subtract funds (JWT-protected, for testing)
router.post('/withdraw', (req, res) => {
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

        // Find user in our storage
        const userData = users.find(u => u.id === user.userId);
        if (!userData) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Check if user has sufficient balance
        const currentBalance = userData.balance || 0;
        if (currentBalance < withdrawAmount) {
            return res.status(400).json({
                success: false,
                error: 'Insufficient funds',
                message: `Current balance: $${currentBalance.toFixed(2)}, Requested: $${withdrawAmount.toFixed(2)}`
            });
        }

        // Update balance
        userData.balance = currentBalance - withdrawAmount;

        res.json({
            success: true,
            message: `Withdrawn $${withdrawAmount.toFixed(2)} successfully`,
            balance: userData.balance
        });

    } catch (error) {
        console.error('Withdraw error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

module.exports = router;
