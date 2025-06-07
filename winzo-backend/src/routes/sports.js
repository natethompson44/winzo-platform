const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Sport = require('../models/Sport');
const SportsEvent = require('../models/SportsEvent');
const Odds = require('../models/Odds');
const Bet = require('../models/Bet');
const User = require('../models/User');
const oddsService = require('../services/oddsService');
const walletService = require('../services/walletService');

/**
 * WINZO Sports Betting Routes
 * 
 * These routes handle all sports betting functionality for the WINZO platform,
 * embodying the "BIG WIN ENERGY" philosophy with confident, energetic responses
 * and seamless user experiences. All routes are mobile-first and optimized for
 * the exclusive WINZO community.
 */

/**
 * GET /api/sports - Get all available sports for WINZO betting
 * Returns active sports with "Big Win Energy" messaging
 */
router.get('/', auth, async (req, res) => {
  try {
    const sports = await Sport.findAll({
      where: { active: true },
      order: [['title', 'ASC']]
    });

    res.json({
      success: true,
      message: "Ready to unleash your Big Win Energy? Here are today's hottest sports!",
      data: {
        sports: sports.map(sport => ({
          id: sport.id,
          key: sport.key,
          title: sport.title,
          group: sport.group,
          description: sport.description,
          hasOutrights: sport.hasOutrights
        })),
        count: sports.length
      }
    });

  } catch (error) {
    console.error('WINZO Sports: Error fetching sports:', error.message);
    res.status(500).json({
      success: false,
      message: "Oops! Let's try getting those sports again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/sports/:sportKey/events - Get upcoming events for a specific sport
 * Returns events with live odds and "winning opportunity" messaging
 */
router.get('/:sportKey/events', auth, async (req, res) => {
  try {
    const { sportKey } = req.params;
    const { limit = 20, upcoming = true } = req.query;

    const sport = await Sport.findOne({ where: { key: sportKey } });
    if (!sport) {
      return res.status(404).json({
        success: false,
        message: "Hmm, we couldn't find that sport. Let's check out what's available!"
      });
    }

    const whereClause = { sport_id: sport.id };
    if (upcoming === 'true') {
      whereClause.commenceTime = { [require('sequelize').Op.gt]: new Date() };
      whereClause.status = 'upcoming';
    }

    const events = await SportsEvent.findAll({
      where: whereClause,
      attributes: ['id', 'homeTeam', 'awayTeam', 'commenceTime', 'status'],
      include: [{
        model: Odds,
        attributes: ['id', 'bookmakerTitle', 'market', 'outcome', 'price', 'decimalPrice', 'point'],
        where: { active: true },
        required: false
      }],
      order: [['commenceTime', 'ASC']],
      limit: parseInt(limit)
    });

    // Group odds by event and market for easier frontend consumption
    const eventsWithOdds = events.map(event => {
      const eventData = {
        id: event.id,
        homeTeam: event.homeTeam,
        awayTeam: event.awayTeam,
        commenceTime: event.commenceTime,
        status: event.status,
        markets: {}
      };

      // Group odds by market type
      event.odds.forEach(odd => {
        if (!eventData.markets[odd.market]) {
          eventData.markets[odd.market] = [];
        }
        eventData.markets[odd.market].push({
          id: odd.id,
          bookmaker: odd.bookmakerTitle,
          outcome: odd.outcome,
          price: odd.price,
          decimalPrice: odd.decimalPrice,
          point: odd.point
        });
      });

      return eventData;
    });

    res.json({
      success: true,
      message: `🔥 ${events.length} winning opportunities found in ${sport.title}! Your Big Win Energy is about to activate!`,
      data: {
        sport: {
          title: sport.title,
          key: sport.key,
          group: sport.group
        },
        events: eventsWithOdds,
        count: events.length
      }
    });

  } catch (error) {
    console.error('WINZO Sports: Error fetching events:', error.message);
    res.status(500).json({
      success: false,
      message: "Almost there! Let's try loading those winning opportunities again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/sports/place-bet - Place a sports bet with WINZO Wallet
 * Handles bet placement with celebration messaging and wallet integration
 */
router.post('/place-bet', [
  auth,
  body('eventId').isUUID().withMessage('Valid event required for your winning bet'),
  body('oddsId').isUUID().withMessage('Valid odds selection required'),
  body('amount').isFloat({ min: 1 }).withMessage('Minimum bet is $1 to activate Big Win Energy'),
  body('market').notEmpty().withMessage('Betting market selection required'),
  body('outcome').notEmpty().withMessage('Outcome selection required for your win')
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Almost there! Just need to fix one thing for your winning bet.",
        errors: errors.array()
      });
    }

    const { eventId, oddsId, amount, market, outcome } = req.body;
    const userId = req.user.id;

    // Verify user has sufficient WINZO Wallet balance
    const hasBalance = await walletService.validateBalance(userId, amount);
    if (!hasBalance) {
      return res.status(400).json({
        success: false,
        message: "Time to add some funds to your WINZO Wallet! Let's get you ready for that big win.",
        action: 'add_funds'
      });
    }

    // Get event and odds details
    const event = await SportsEvent.findByPk(eventId, {
      include: [Sport]
    });
    
    const odds = await Odds.findByPk(oddsId);

    if (!event || !odds) {
      return res.status(404).json({
        success: false,
        message: "Oops! That betting opportunity just expired. Let's find you another winner!"
      });
    }

    // Verify event is still bettable
    if (event.status !== 'upcoming' || new Date(event.commenceTime) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "This game has already started! Let's find you another winning opportunity."
      });
    }

    // Calculate potential payout
    const betAmount = parseFloat(amount);
    const decimalOdds = odds.decimalPrice;
    const potentialPayout = betAmount * decimalOdds;
    const potentialProfit = potentialPayout - betAmount;

    // Process bet placement (deduct from wallet)
    const walletTransaction = await walletService.processBetPlacement(userId, betAmount);

    // Create bet record
    const bet = await Bet.create({
      user_id: userId,
      event_id: eventId,
      odds_id: oddsId,
      bet_type: 'sports',
      market,
      outcome,
      point: odds.point,
      amount: betAmount,
      odds: odds.price,
      decimalOdds: odds.decimalPrice,
      potentialPayout,
      potentialProfit,
      status: 'pending',
      placedAt: new Date()
    });

    // Get updated user info
    const user = await User.findByPk(userId);

    res.json({
      success: true,
      message: `🎯 Bet placed! Your Big Win Energy is locked and loaded for ${event.homeTeam} vs ${event.awayTeam}!`,
      data: {
        bet: {
          id: bet.id,
          event: `${event.homeTeam} vs ${event.awayTeam}`,
          sport: event.sport.title,
          market,
          outcome,
          amount: betAmount,
          odds: odds.price,
          potentialPayout,
          potentialProfit,
          status: bet.status,
          placedAt: bet.placedAt
        },
        wallet: {
          previousBalance: walletTransaction.previousBalance,
          newBalance: walletTransaction.newBalance,
          amountWagered: betAmount
        },
        celebration: {
          message: "🔥 You're locked in! Time to watch the magic happen!",
          potentialWin: `Win $${potentialProfit.toFixed(2)} profit!`
        }
      }
    });

  } catch (error) {
    console.error('WINZO Sports: Error placing bet:', error.message);
    res.status(500).json({
      success: false,
      message: "No worries! Let's try placing that winning bet again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/sports/my-bets - Get user's betting history with WINZO energy
 * Returns bet history with celebratory messaging for wins
 */
router.get('/my-bets', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, limit = 50, page = 1 } = req.query;

    const whereClause = { user_id: userId, bet_type: 'sports' };
    if (status) {
      whereClause.status = status;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: bets } = await Bet.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['updatedAt'] },
      include: [{
        model: SportsEvent,
        attributes: ['homeTeam', 'awayTeam', 'commenceTime', 'status', 'sport_id'],
        include: [{
          model: Sport,
          attributes: ['title']
        }]
      }],
      order: [['placedAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    // Calculate statistics
    const totalWagered = bets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0);
    const totalWinnings = bets
      .filter(bet => bet.status === 'won')
      .reduce((sum, bet) => sum + parseFloat(bet.actualPayout || 0), 0);
    
    const wonBets = bets.filter(bet => bet.status === 'won').length;
    const lostBets = bets.filter(bet => bet.status === 'lost').length;
    const pendingBets = bets.filter(bet => bet.status === 'pending').length;

    const winRate = (wonBets + lostBets) > 0 ? ((wonBets / (wonBets + lostBets)) * 100) : 0;

    res.json({
      success: true,
      message: wonBets > 0 ? 
        `🏆 ${wonBets} wins and counting! Your Big Win Energy is unstoppable!` :
        "Your betting journey is just getting started! Big wins are coming!",
      data: {
        bets: bets.map(bet => ({
          id: bet.id,
          event: bet.sportsEvent ? 
            `${bet.sportsEvent.homeTeam} vs ${bet.sportsEvent.awayTeam}` : 
            'Event not found',
          sport: bet.sportsEvent?.sport?.title || 'Unknown',
          market: bet.market,
          outcome: bet.outcome,
          amount: parseFloat(bet.amount),
          odds: bet.odds,
          potentialPayout: parseFloat(bet.potentialPayout),
          actualPayout: bet.actualPayout ? parseFloat(bet.actualPayout) : null,
          status: bet.status,
          placedAt: bet.placedAt,
          settledAt: bet.settledAt
        })),
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        },
        statistics: {
          totalBets: count,
          pendingBets,
          wonBets,
          lostBets,
          winRate: winRate.toFixed(1),
          totalWagered: totalWagered.toFixed(2),
          totalWinnings: totalWinnings.toFixed(2),
          netProfit: (totalWinnings - totalWagered).toFixed(2)
        }
      }
    });

  } catch (error) {
    console.error('WINZO Sports: Error fetching bet history:', error.message);
    res.status(500).json({
      success: false,
      message: "Let's try loading your betting history again!",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/sports/sync-data - Manually trigger sports data synchronization
 * Admin/development route to refresh odds and events
 */
router.post('/sync-data', auth, async (req, res) => {
  try {
    const { sportKey } = req.body;

    let result;
    if (sportKey) {
      // Sync specific sport
      result = await oddsService.syncSportData(sportKey);
    } else {
      // Sync all sports
      result = await oddsService.syncAllSportsData();
    }

    res.json({
      success: true,
      message: "🔄 WINZO data synchronized! Fresh odds and Big Win Energy activated!",
      data: {
        syncResult: result,
        quota: oddsService.getQuotaInfo()
      }
    });

  } catch (error) {
    console.error('WINZO Sports: Error syncing data:', error.message);
    res.status(500).json({
      success: false,
      message: "Sync hit a snag! Let's try refreshing that data again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/sports/quota - Get current API quota usage
 * Monitoring route for API usage
 */
router.get('/quota', auth, async (req, res) => {
  try {
    const quotaInfo = oddsService.getQuotaInfo();
    
    res.json({
      success: true,
      message: "WINZO API status check complete!",
      data: quotaInfo
    });

  } catch (error) {
    console.error('WINZO Sports: Error checking quota:', error.message);
    res.status(500).json({
      success: false,
      message: "Couldn't check API status right now.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

