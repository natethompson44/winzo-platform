const express = require('express');
const { getRecentEvents, getEventsByType, getEventsByUser, clearEventLogs } = require('../middleware/eventTracker');
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

// GET /api/logs - Get event logs with optional filtering
router.get('/logs', async (req, res) => {
    try {
        const { 
            type, 
            user, 
            limit = 100, 
            offset = 0 
        } = req.query;
        
        let events;
        
        // Filter events based on query parameters
        if (type) {
            events = getEventsByType(type, parseInt(limit));
        } else if (user) {
            events = getEventsByUser(user, parseInt(limit));
        } else {
            events = getRecentEvents(parseInt(limit));
        }
        
        // Apply offset
        const startIndex = parseInt(offset);
        const endIndex = startIndex + parseInt(limit);
        const paginatedEvents = events.slice(startIndex, endIndex);
        
        // Get event type counts for summary
        const allEvents = getRecentEvents(1000); // Get more events for stats
        const eventTypeCounts = allEvents.reduce((acc, event) => {
            acc[event.event] = (acc[event.event] || 0) + 1;
            return acc;
        }, {});
        
        res.json({
            success: true,
            data: {
                events: paginatedEvents,
                pagination: {
                    total: events.length,
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    hasMore: endIndex < events.length
                },
                summary: {
                    total_events: allEvents.length,
                    event_type_counts: eventTypeCounts
                }
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Logs endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// GET /api/logs/stats - Get event statistics
router.get('/logs/stats', async (req, res) => {
    try {
        const { period = '24h' } = req.query;
        
        // Calculate time threshold based on period
        let timeThreshold;
        const now = new Date();
        
        switch (period) {
            case '1h':
                timeThreshold = new Date(now.getTime() - 60 * 60 * 1000);
                break;
            case '24h':
                timeThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case '7d':
                timeThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                timeThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            default:
                timeThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        }
        
        const allEvents = getRecentEvents(10000); // Get more events for stats
        const filteredEvents = allEvents.filter(event => 
            new Date(event.timestamp) >= timeThreshold
        );
        
        // Calculate statistics
        const stats = {
            period: period,
            total_events: filteredEvents.length,
            event_types: {},
            unique_users: new Set(),
            hourly_distribution: {},
            total_amounts: {
                bets: 0,
                deposits: 0,
                withdrawals: 0
            }
        };
        
        filteredEvents.forEach(event => {
            // Count by event type
            stats.event_types[event.event] = (stats.event_types[event.event] || 0) + 1;
            
            // Track unique users
            stats.unique_users.add(event.user);
            
            // Track hourly distribution
            const hour = new Date(event.timestamp).getHours();
            stats.hourly_distribution[hour] = (stats.hourly_distribution[hour] || 0) + 1;
            
            // Track amounts for financial events
            if (event.event === 'bet_placed' && event.amount) {
                stats.total_amounts.bets += parseFloat(event.amount) || 0;
            } else if (event.event === 'deposit' && event.amount) {
                stats.total_amounts.deposits += parseFloat(event.amount) || 0;
            } else if (event.event === 'withdraw' && event.amount) {
                stats.total_amounts.withdrawals += parseFloat(event.amount) || 0;
            }
        });
        
        // Convert Set to number
        stats.unique_users = stats.unique_users.size;
        
        res.json({
            success: true,
            data: stats,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Logs stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// POST /api/logs/clear - Clear event logs (admin only)
router.post('/logs/clear', async (req, res) => {
    try {
        clearEventLogs();
        
        res.json({
            success: true,
            message: 'Event logs cleared successfully',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Clear logs error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

module.exports = router;


