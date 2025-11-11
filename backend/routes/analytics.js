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

// Analytics cache
let analyticsCache = {
    data: null,
    timestamp: null
};

const CACHE_DURATION = 60 * 1000; // 60 seconds

// Helper function to check if cache is valid
function isAnalyticsCacheValid() {
    if (!analyticsCache.data || !analyticsCache.timestamp) {
        return false;
    }
    
    const now = Date.now();
    const cacheAge = now - analyticsCache.timestamp;
    
    return cacheAge < CACHE_DURATION;
}

// Function to clear analytics cache
function clearAnalyticsCache() {
    analyticsCache.data = null;
    analyticsCache.timestamp = null;
    console.log('Analytics cache cleared');
}

// GET /api/analytics - Returns summary stats with caching
router.get('/analytics', async (req, res) => {
    try {
        // Check if we have valid cached data
        if (isAnalyticsCacheValid()) {
            console.log('Serving cached analytics data');
            return res.json({
                success: true,
                data: analyticsCache.data,
                cached: true,
                timestamp: new Date(analyticsCache.timestamp).toISOString()
            });
        }
        
        console.log('Analytics cache expired, fetching fresh data');
        
        // Get total registered users
        const usersResult = await query('SELECT COUNT(*) as total_users FROM users');
        const totalUsers = parseInt(usersResult.rows[0].total_users);
        
        // Get total bets placed
        const betsResult = await query('SELECT COUNT(*) as total_bets FROM bets');
        const totalBets = parseInt(betsResult.rows[0].total_bets);
        
        // Get total amount wagered
        const wageredResult = await query('SELECT COALESCE(SUM(stake), 0) as total_wagered FROM bets');
        const totalWagered = parseFloat(wageredResult.rows[0].total_wagered);
        
        // Get total payouts (won bets)
        const payoutsResult = await query(`
            SELECT 
                COALESCE(SUM(CASE WHEN status = 'won' THEN potential_payout ELSE 0 END), 0) as total_payouts,
                COALESCE(SUM(CASE WHEN status = 'lost' THEN stake ELSE 0 END), 0) as total_losses
            FROM bets
        `);
        const totalPayouts = parseFloat(payoutsResult.rows[0].total_payouts);
        const totalLosses = parseFloat(payoutsResult.rows[0].total_losses);
        
        // Calculate average payout ratio
        const averagePayoutRatio = totalLosses > 0 ? (totalPayouts / totalLosses) : 0;
        
        // Get active users (last 24 hours) - users who placed bets or made transactions
        const activeUsersResult = await query(`
            SELECT COUNT(DISTINCT u.id) as active_users
            FROM users u
            WHERE u.id IN (
                SELECT DISTINCT user_id FROM bets WHERE created_at >= NOW() - INTERVAL '24 hours'
                UNION
                SELECT DISTINCT user_id FROM transactions WHERE created_at >= NOW() - INTERVAL '24 hours'
            )
        `);
        const activeUsers = parseInt(activeUsersResult.rows[0].active_users);
        
        // Get daily stats for charts (last 7 days)
        const dailyStatsResult = await query(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as bets_count,
                COALESCE(SUM(stake), 0) as daily_wagered
            FROM bets 
            WHERE created_at >= NOW() - INTERVAL '7 days'
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        `);
        
        // Get daily transaction stats
        const dailyTransactionsResult = await query(`
            SELECT 
                DATE(created_at) as date,
                type,
                COALESCE(SUM(amount), 0) as daily_amount
            FROM transactions 
            WHERE created_at >= NOW() - INTERVAL '7 days'
            GROUP BY DATE(created_at), type
            ORDER BY date DESC
        `);
        
        // Process daily stats
        const dailyStats = {};
        dailyStatsResult.rows.forEach(row => {
            const date = row.date.toISOString().split('T')[0];
            if (!dailyStats[date]) {
                dailyStats[date] = { date, bets: 0, wagered: 0 };
            }
            dailyStats[date].bets = parseInt(row.bets_count);
            dailyStats[date].wagered = parseFloat(row.daily_wagered);
        });
        
        // Process transaction stats
        const transactionStats = {};
        dailyTransactionsResult.rows.forEach(row => {
            const date = row.date.toISOString().split('T')[0];
            if (!transactionStats[date]) {
                transactionStats[date] = { date, deposits: 0, withdrawals: 0 };
            }
            if (row.type === 'deposit') {
                transactionStats[date].deposits = parseFloat(row.daily_amount);
            } else if (row.type === 'withdraw') {
                transactionStats[date].withdrawals = parseFloat(row.daily_amount);
            }
        });
        
        // Combine daily data
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            last7Days.push({
                date: dateStr,
                bets: dailyStats[dateStr]?.bets || 0,
                wagered: dailyStats[dateStr]?.wagered || 0,
                deposits: transactionStats[dateStr]?.deposits || 0,
                withdrawals: transactionStats[dateStr]?.withdrawals || 0
            });
        }
        
        const analyticsData = {
            summary: {
                total_users: totalUsers,
                total_bets: totalBets,
                total_wagered: totalWagered,
                total_payouts: totalPayouts,
                average_payout_ratio: parseFloat(averagePayoutRatio.toFixed(2)),
                active_users_24h: activeUsers
            },
            charts: {
                daily_stats: last7Days
            }
        };
        
        // Update cache
        analyticsCache.data = analyticsData;
        analyticsCache.timestamp = Date.now();
        
        console.log('Fresh analytics data fetched and cached successfully');
        
        res.json({
            success: true,
            data: analyticsData,
            cached: false,
            timestamp: new Date(analyticsCache.timestamp).toISOString()
        });
        
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// POST /api/admin/refresh-analytics - Clear analytics cache
router.post('/refresh-analytics', (req, res) => {
    clearAnalyticsCache();
    res.json({
        success: true,
        message: 'Analytics cache cleared successfully',
        timestamp: new Date().toISOString()
    });
});

module.exports = { router, clearAnalyticsCache };


