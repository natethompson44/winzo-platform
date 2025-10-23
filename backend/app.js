const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');
const { expressjwt: jwt } = require('express-jwt');

// Import route modules
const userRoutes = require('./routes/users');
const betRoutes = require('./routes/bets');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from root directory

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'winzo-secret-key-change-in-production';

// JWT middleware for protected routes
const authenticateToken = jwt({
    secret: JWT_SECRET,
    algorithms: ['HS256'],
    requestProperty: 'user'
}).unless({
    path: [
        '/api/register',
        '/api/login',
        '/api/odds',
        '/api/health',
        '/'
    ]
});

app.use(authenticateToken);

// Configuration
const API_KEY = 'ae09b5ce0e57ca5b0ae4ccd0f852ba12';
const API_URL = `https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?regions=us&markets=h2h&apiKey=${API_KEY}`;
const CACHE_DURATION = 60 * 1000; // 60 seconds in milliseconds

// In-memory cache
let oddsCache = {
    data: null,
    timestamp: null
};

// Helper function to check if cache is valid
function isCacheValid() {
    if (!oddsCache.data || !oddsCache.timestamp) {
        return false;
    }
    
    const now = Date.now();
    const cacheAge = now - oddsCache.timestamp;
    
    return cacheAge < CACHE_DURATION;
}

// Helper function to process API response
function processOddsData(apiData) {
    if (!Array.isArray(apiData)) {
        throw new Error('Invalid API response format');
    }

    return apiData.map((game, index) => {
        const homeTeam = game.home_team || 'Home Team';
        const awayTeam = game.away_team || 'Away Team';
        
        // Extract odds from bookmakers
        let homeOdds = null;
        let awayOdds = null;
        
        if (game.bookmakers && game.bookmakers.length > 0) {
            const bookmaker = game.bookmakers[0];
            if (bookmaker.markets && bookmaker.markets.length > 0) {
                const market = bookmaker.markets[0];
                if (market.outcomes && market.outcomes.length >= 2) {
                    homeOdds = market.outcomes.find(outcome => 
                        outcome.name === homeTeam || 
                        outcome.name.includes(homeTeam.split(' ').pop())
                    );
                    awayOdds = market.outcomes.find(outcome => 
                        outcome.name === awayTeam || 
                        outcome.name.includes(awayTeam.split(' ').pop())
                    );
                    
                    if (homeOdds) homeOdds = homeOdds.price;
                    if (awayOdds) awayOdds = awayOdds.price;
                }
            }
        }
        
        // Fallback odds if not found
        if (!homeOdds || !awayOdds) {
            homeOdds = 1.85 + (Math.random() * 0.5);
            awayOdds = 1.85 + (Math.random() * 0.5);
        }
        
        return {
            id: game.id || index + 1,
            matchup: `${awayTeam} vs ${homeTeam}`,
            home_team: homeTeam,
            away_team: awayTeam,
            home_odds: parseFloat(homeOdds.toFixed(2)),
            away_odds: parseFloat(awayOdds.toFixed(2)),
            date: formatGameDate(game.commence_time),
            time: formatGameTime(game.commence_time),
            commenceTime: game.commence_time
        };
    });
}

// Helper function to format game date
function formatGameDate(commenceTime) {
    if (!commenceTime) return 'TBD';
    const date = new Date(commenceTime);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
    });
}

// Helper function to format game time
function formatGameTime(commenceTime) {
    if (!commenceTime) return 'TBD';
    const date = new Date(commenceTime);
    return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
}

// Helper function to load fallback data
async function loadFallbackData() {
    try {
        const fallbackPath = path.join(__dirname, 'odds.json');
        const data = await fs.readFile(fallbackPath, 'utf8');
        const jsonData = JSON.parse(data);
        
        return jsonData.games.map(game => ({
            id: game.id,
            matchup: `${game.awayTeam} vs ${game.homeTeam}`,
            home_team: game.homeTeam,
            away_team: game.awayTeam,
            home_odds: parseFloat(game.homeOdds),
            away_odds: parseFloat(game.awayOdds),
            date: game.date,
            time: game.time
        }));
    } catch (error) {
        console.error('Error loading fallback data:', error);
        throw error;
    }
}

// Main API endpoint
app.get('/api/odds', async (req, res) => {
    try {
        console.log('Odds API request received');
        
        // Check if we have valid cached data
        if (isCacheValid()) {
            console.log('Serving cached data');
            return res.json({
                success: true,
                data: oddsCache.data,
                cached: true,
                timestamp: new Date(oddsCache.timestamp).toISOString()
            });
        }
        
        console.log('Cache expired or missing, fetching fresh data');
        
        try {
            // Fetch fresh data from The Odds API
            const response = await fetch(API_URL);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const apiData = await response.json();
            const processedData = processOddsData(apiData);
            
            // Update cache
            oddsCache.data = processedData;
            oddsCache.timestamp = Date.now();
            
            console.log('Fresh data fetched and cached successfully');
            
            res.json({
                success: true,
                data: processedData,
                cached: false,
                timestamp: new Date(oddsCache.timestamp).toISOString()
            });
            
        } catch (apiError) {
            console.error('API fetch failed:', apiError.message);
            
            // Fallback to local JSON file
            console.log('Falling back to local odds data');
            const fallbackData = await loadFallbackData();
            
            // Update cache with fallback data
            oddsCache.data = fallbackData;
            oddsCache.timestamp = Date.now();
            
            res.json({
                success: true,
                data: fallbackData,
                cached: false,
                fallback: true,
                timestamp: new Date(oddsCache.timestamp).toISOString(),
                message: 'Using fallback data due to API unavailability'
            });
        }
        
    } catch (error) {
        console.error('Error in /api/odds endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        cache: {
            hasData: !!oddsCache.data,
            isValid: isCacheValid(),
            age: oddsCache.timestamp ? Date.now() - oddsCache.timestamp : null
        }
    });
});

// API Routes
app.use('/api', userRoutes);
app.use('/api', betRoutes);

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`🏈 WINZO NFL Backend running on port ${PORT}`);
    console.log(`📊 API endpoint: http://localhost:${PORT}/api/odds`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});
