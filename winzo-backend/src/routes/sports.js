const express = require('express')
const router = express.Router()
const oddsApiService = require('../services/oddsApiService')
const { SportsEvent, Odds, Bookmaker } = require('../models')
const {
  validateApiResponse,
  isValidSportKey,
  parseCommenceTime
} = require('../utils/apiUtils')
const {
  checkQuota,
  addCorsHeaders,
  logApiRequest,
  validateSportParam
} = require('../middleware/sportsMiddleware')

// Apply middleware to all routes
router.use(addCorsHeaders)
router.use(logApiRequest)
router.use('/:sport/odds', checkQuota)
router.use('/:sport/scores', checkQuota)
router.use('/:sport/*', validateSportParam)

/**
 * GET /api/sports - Get all available sports
 * Returns list of active sports from The Odds API
 */
router.get('/', async (req, res) => {
  try {
    console.log('Fetching sports list...')
    const { include_inactive = false } = req.query
    const sports = await oddsApiService.getSports(include_inactive === 'true')
    // Validate API response
    if (!validateApiResponse(sports, 'sports')) {
      throw new Error('Invalid sports data received from API')
    }
    // Filter to active sports only unless requested otherwise
    const activeSports =
      include_inactive === 'true' ? sports : sports.filter(s => s.active)
    // Add additional metadata
    const enrichedSports = activeSports.map(sport => ({
      ...sport,
      icon: getSportIcon(sport.group),
      category: categorizeSport(sport.group),
      popularity: getSportPopularity(sport.key)
    }))
    res.json({
      success: true,
      data: enrichedSports,
      count: enrichedSports.length,
      quota: oddsApiService.getQuotaStatus(),
      timestamp: new Date().toISOString()
    })
    console.log(`Returned ${enrichedSports.length} sports`)
  } catch (error) {
    console.error('Error in GET /api/sports:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sports data',
      message: error.message,
      quota: oddsApiService.getQuotaStatus()
    })
  }
})

/**
 * GET /api/sports/:sport/odds - Get odds for specific sport
 * Returns live odds data for all events in the specified sport
 */
router.get('/:sport/odds', async (req, res) => {
  try {
    const { sport } = req.params
    const {
      regions = 'us',
      markets = 'h2h',
      bookmakers = null,
      limit = null
    } = req.query
    console.log(`Fetching odds for ${sport}...`)
    // Validate sport key
    if (!isValidSportKey(sport)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid sport key format'
      })
    }
    const odds = await oddsApiService.getOdds(sport, {
      regions,
      markets,
      bookmakers
    })
    // Validate API response
    if (!validateApiResponse(odds, 'odds')) {
      throw new Error('Invalid odds data received from API')
    }
    // Store odds in database for persistence
    await storeOddsInDatabase(odds)
    // Apply limit if specified
    const limitedOdds = limit ? odds.slice(0, parseInt(limit)) : odds
    // Enrich odds data with additional information
    const enrichedOdds = limitedOdds.map(event => ({
      ...event,
      timing: parseCommenceTime(event.commence_time),
      featured: isFeaturedEvent(event),
      markets_count:
        event.bookmakers?.reduce(
          (sum, bm) => sum + (bm.markets?.length || 0),
          0
        ) || 0
    }))
    res.json({
      success: true,
      data: enrichedOdds,
      count: enrichedOdds.length,
      sport,
      markets: markets.split(','),
      quota: oddsApiService.getQuotaStatus(),
      timestamp: new Date().toISOString()
    })
    console.log(`Returned ${enrichedOdds.length} events with odds for ${sport}`)
  } catch (error) {
    console.error(`Error in GET /api/sports/${req.params.sport}/odds:`, error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch odds data',
      message: error.message,
      sport: req.params.sport,
      quota: oddsApiService.getQuotaStatus()
    })
  }
})

/**
 * GET /api/sports/:sport/scores - Get scores for specific sport
 * Returns live and completed game scores
 */
router.get('/:sport/scores', async (req, res) => {
  try {
    const { sport } = req.params
    const { daysFrom = 1, completed_only = false, live_only = false } = req.query
    console.log(`Fetching scores for ${sport}...`)
    // Validate sport key
    if (!isValidSportKey(sport)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid sport key format'
      })
    }
    const scores = await oddsApiService.getScores(sport, {
      daysFrom: parseInt(daysFrom)
    })
    // Validate API response
    if (!validateApiResponse(scores, 'scores')) {
      throw new Error('Invalid scores data received from API')
    }
    // Store scores in database for persistence
    await storeScoresInDatabase(scores)
    // Filter based on query parameters
    let filteredScores = scores
    if (completed_only === 'true') {
      filteredScores = scores.filter(game => game.completed)
    } else if (live_only === 'true') {
      filteredScores = scores.filter(game => !game.completed && isGameLive(game))
    }
    // Enrich scores data
    const enrichedScores = filteredScores.map(game => ({
      ...game,
      timing: parseCommenceTime(game.commence_time),
      status: getGameStatus(game),
      score_summary: getScoreSummary(game)
    }))
    res.json({
      success: true,
      data: enrichedScores,
      count: enrichedScores.length,
      sport,
      filters: {
        daysFrom: parseInt(daysFrom),
        completed_only: completed_only === 'true',
        live_only: live_only === 'true'
      },
      quota: oddsApiService.getQuotaStatus(),
      timestamp: new Date().toISOString()
    })
    console.log(`Returned ${enrichedScores.length} games with scores for ${sport}`)
  } catch (error) {
    console.error(`Error in GET /api/sports/${req.params.sport}/scores:`, error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scores data',
      message: error.message,
      sport: req.params.sport,
      quota: oddsApiService.getQuotaStatus()
    })
  }
})

/**
 * GET /api/sports/:sport/participants - Get participants for specific sport
 * Returns teams/players for the specified sport
 */
router.get('/:sport/participants', async (req, res) => {
  try {
    const { sport } = req.params
    console.log(`Fetching participants for ${sport}...`)
    // Validate sport key
    if (!isValidSportKey(sport)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid sport key format'
      })
    }
    const participants = await oddsApiService.getParticipants(sport)
    // Validate API response
    if (!validateApiResponse(participants, 'participants')) {
      throw new Error('Invalid participants data received from API')
    }
    res.json({
      success: true,
      data: participants,
      count: participants.length,
      sport,
      quota: oddsApiService.getQuotaStatus(),
      timestamp: new Date().toISOString()
    })
    console.log(`Returned ${participants.length} participants for ${sport}`)
  } catch (error) {
    console.error(
      `Error in GET /api/sports/${req.params.sport}/participants:`,
      error
    )
    res.status(500).json({
      success: false,
      error: 'Failed to fetch participants data',
      message: error.message,
      sport: req.params.sport,
      quota: oddsApiService.getQuotaStatus()
    })
  }
})

/**
 * GET /api/sports/:sport/events/:eventId - Get specific event details
 * Returns detailed information for a single event
 */
router.get('/:sport/events/:eventId', async (req, res) => {
  try {
    const { sport, eventId } = req.params
    console.log(`Fetching event ${eventId} for ${sport}...`)
    // Get odds for the specific event
    const odds = await oddsApiService.getOdds(sport, {
      eventIds: eventId
    })
    if (!odds || odds.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
        eventId,
        sport
      })
    }
    const event = odds[0]
    // Get scores for the event
    let scores = []
    try {
      const scoresData = await oddsApiService.getScores(sport)
      scores = scoresData.filter(game => game.id === eventId)
    } catch (error) {
      console.log('No scores available for this event')
    }
    // Combine odds and scores data
    const eventDetails = {
      ...event,
      scores: scores.length > 0 ? scores[0] : null,
      timing: parseCommenceTime(event.commence_time),
      all_markets: getAllMarketsForEvent(event)
    }
    res.json({
      success: true,
      data: eventDetails,
      eventId,
      sport,
      quota: oddsApiService.getQuotaStatus(),
      timestamp: new Date().toISOString()
    })
    console.log(`Returned detailed event data for ${eventId}`)
  } catch (error) {
    console.error(
      `Error in GET /api/sports/${req.params.sport}/events/${req.params.eventId}:`,
      error
    )
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event details',
      message: error.message,
      eventId: req.params.eventId,
      sport: req.params.sport,
      quota: oddsApiService.getQuotaStatus()
    })
  }
})

// Helper Functions
/**
 * Store odds data in database for persistence
 */
async function storeOddsInDatabase (oddsData) {
  try {
    for (const event of oddsData) {
      // Create or update sports event
      const [sportsEvent] = await SportsEvent.findOrCreate({
        where: { external_id: event.id },
        defaults: {
          external_id: event.id,
          sport_key: event.sport_key,
          home_team: event.home_team,
          away_team: event.away_team,
          commence_time: new Date(event.commence_time),
          completed: event.completed || false,
          last_update: new Date()
        }
      })
      // Update existing event if needed
      if (sportsEvent) {
        await sportsEvent.update({
          home_team: event.home_team,
          away_team: event.away_team,
          commence_time: new Date(event.commence_time),
          completed: event.completed || false,
          last_update: new Date()
        })
      }
      // Store odds for each bookmaker
      for (const bookmaker of event.bookmakers || []) {
        const [bookmakerId] = await Bookmaker.findOrCreate({
          where: { key: bookmaker.key },
          defaults: {
            key: bookmaker.key,
            title: bookmaker.title,
            active: true
          }
        })
        // Store odds for each market
        for (const market of bookmaker.markets || []) {
          for (const outcome of market.outcomes || []) {
            await Odds.upsert({
              sports_event_id: sportsEvent.id,
              bookmaker_id: bookmakerId.id,
              market_type: market.key,
              outcome_name: outcome.name,
              price: outcome.price,
              last_update: new Date()
            })
          }
        }
      }
    }
    console.log(`Stored ${oddsData.length} events in database`)
  } catch (error) {
    console.error('Error storing odds in database:', error)
  }
}

/**
 * Store scores data in database for persistence
 */
async function storeScoresInDatabase (scoresData) {
  try {
    for (const game of scoresData) {
      const homeScore = game.scores
        ? game.scores.find(s => s.name === game.home_team)?.score
        : null
      const awayScore = game.scores
        ? game.scores.find(s => s.name === game.away_team)?.score
        : null
      await SportsEvent.upsert({
        external_id: game.id,
        sport_key: game.sport_key,
        home_team: game.home_team,
        away_team: game.away_team,
        commence_time: new Date(game.commence_time),
        completed: game.completed || false,
        home_score: homeScore,
        away_score: awayScore,
        last_update: new Date()
      })
    }
    console.log(`Stored ${scoresData.length} game scores in database`)
  } catch (error) {
    console.error('Error storing scores in database:', error)
  }
}

/**
 * Get sport icon based on group
 */
function getSportIcon (group) {
  const icons = {
    'American Football': '',
    Basketball: '',
    Baseball: '⚾',
    'Ice Hockey': '',
    Soccer: '⚽',
    Tennis: '',
    Golf: '',
    Boxing: '',
    'Mixed Martial Arts': ''
  }
  return icons[group] || ''
}

/**
 * Categorize sport for UI grouping
 */
function categorizeSport (group) {
  const categories = {
    'American Football': 'US Sports',
    Basketball: 'US Sports',
    Baseball: 'US Sports',
    'Ice Hockey': 'US Sports',
    Soccer: 'International',
    Tennis: 'Individual',
    Golf: 'Individual',
    Boxing: 'Combat',
    'Mixed Martial Arts': 'Combat'
  }
  return categories[group] || 'Other'
}

/**
 * Get sport popularity ranking
 */
function getSportPopularity (sportKey) {
  const popularity = {
    americanfootball_nfl: 10,
    basketball_nba: 9,
    baseball_mlb: 8,
    icehockey_nhl: 7,
    soccer_epl: 6,
    americanfootball_ncaaf: 5,
    basketball_ncaab: 4
  }
  return popularity[sportKey] || 1
}

/**
 * Check if event is featured
 */
function isFeaturedEvent (event) {
  // Consider events with multiple bookmakers as featured
  return event.bookmakers && event.bookmakers.length >= 3
}

/**
 * Check if game is currently live
 */
function isGameLive (game) {
  const now = new Date()
  const commenceTime = new Date(game.commence_time)
  const hoursSinceStart = (now - commenceTime) / (1000 * 60 * 60)
  // Consider live if started within last 4 hours and not completed
  return hoursSinceStart > 0 && hoursSinceStart < 4 && !game.completed
}

/**
 * Get game status description
 */
function getGameStatus (game) {
  if (game.completed) {
    return 'Final'
  }
  const timing = parseCommenceTime(game.commence_time)
  if (timing.isLive) {
    return 'Live'
  } else if (timing.isUpcoming) {
    return `${timing.hoursFromNow}h`
  } else {
    return 'Scheduled'
  }
}

/**
 * Get score summary
 */
function getScoreSummary (game) {
  if (!game.scores || game.scores.length === 0) {
    return null
  }
  const homeScore = game.scores.find(s => s.name === game.home_team)
  const awayScore = game.scores.find(s => s.name === game.away_team)
  return {
    home: homeScore?.score || 0,
    away: awayScore?.score || 0,
    display: `${awayScore?.score || 0} - ${homeScore?.score || 0}`
  }
}

/**
 * Get all markets for an event
 */
function getAllMarketsForEvent (event) {
  const markets = new Set()
  for (const bookmaker of event.bookmakers || []) {
    for (const market of bookmaker.markets || []) {
      markets.add(market.key)
    }
  }
  return Array.from(markets)
}

module.exports = router
