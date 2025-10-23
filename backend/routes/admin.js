const express = require('express');
const { query } = require('../db');
const router = express.Router();

// Admin middleware to check if user is admin
const requireAdmin = (req, res, next) => {
    const user = req.user;
    
    if (!user) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }
    
    if (!user.isAdmin) {
        return res.status(403).json({
            success: false,
            error: 'Admin access required'
        });
    }
    
    next();
};

// Apply admin middleware to all routes
router.use(requireAdmin);

// GET /api/admin/users - List all users with balances and bet counts
router.get('/users', async (req, res) => {
    try {
        const usersResult = await query(`
            SELECT 
                u.id,
                u.email,
                u.balance,
                u.is_admin,
                u.created_at,
                COUNT(b.id) as total_bets,
                COALESCE(SUM(CASE WHEN b.status = 'won' THEN b.potential_payout ELSE 0 END), 0) as total_winnings,
                COALESCE(SUM(CASE WHEN b.status = 'lost' THEN b.stake ELSE 0 END), 0) as total_losses
            FROM users u
            LEFT JOIN bets b ON u.id = b.user_id
            GROUP BY u.id, u.email, u.balance, u.is_admin, u.created_at
            ORDER BY u.created_at DESC
        `);

        const users = usersResult.rows.map(user => ({
            id: user.id,
            email: user.email,
            balance: parseFloat(user.balance),
            is_admin: user.is_admin,
            created_at: user.created_at,
            total_bets: parseInt(user.total_bets),
            total_winnings: parseFloat(user.total_winnings),
            total_losses: parseFloat(user.total_losses)
        }));

        res.json({
            success: true,
            data: users,
            count: users.length
        });

    } catch (error) {
        console.error('Admin users error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// GET /api/admin/bets - List all bets with user associations
router.get('/bets', async (req, res) => {
    try {
        const betsResult = await query(`
            SELECT 
                b.id,
                b.match,
                b.team,
                b.odds,
                b.stake,
                b.potential_payout,
                b.status,
                b.created_at,
                u.email as user_email,
                u.id as user_id
            FROM bets b
            JOIN users u ON b.user_id = u.id
            ORDER BY b.created_at DESC
        `);

        const bets = betsResult.rows.map(bet => ({
            id: bet.id,
            match: bet.match,
            team: bet.team,
            odds: parseFloat(bet.odds),
            stake: parseFloat(bet.stake),
            potential_payout: parseFloat(bet.potential_payout),
            status: bet.status,
            created_at: bet.created_at,
            user_email: bet.user_email,
            user_id: bet.user_id
        }));

        res.json({
            success: true,
            data: bets,
            count: bets.length
        });

    } catch (error) {
        console.error('Admin bets error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// This endpoint is handled in app.js to access the clearOddsCache function

// GET /api/admin/health - Return DB connection status, uptime, cache info
router.get('/health', async (req, res) => {
    try {
        const startTime = process.uptime();
        
        // Test database connection
        const dbTest = await query('SELECT NOW() as current_time, COUNT(*) as user_count FROM users');
        
        // Get cache info from the main app (we'll need to access this)
        const healthData = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: {
                seconds: Math.floor(startTime),
                formatted: formatUptime(startTime)
            },
            database: {
                connected: true,
                current_time: dbTest.rows[0].current_time,
                user_count: parseInt(dbTest.rows[0].user_count)
            },
            system: {
                node_version: process.version,
                platform: process.platform,
                memory_usage: process.memoryUsage()
            }
        };

        res.json({
            success: true,
            data: healthData
        });

    } catch (error) {
        console.error('Admin health error:', error);
        res.status(500).json({
            success: false,
            error: 'Database connection failed',
            message: error.message
        });
    }
});

// Helper function to format uptime
function formatUptime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

module.exports = router;
