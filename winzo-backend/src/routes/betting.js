const express = require('express')
const router = express.Router()
const { Bet, User, SportsEvent, Transaction, sequelize } = require('../models')
const auth = require('../middleware/auth')
const { calculatePayout, formatOdds } = require('../utils/apiUtils')
const { validateBettingRequest, validateBetTiming, calculateTeaserOdds, calculateIfBetPayout } = require('../utils/bettingValidation')
const { Op } = require('sequelize')

/**
 * POST /api/bets/place - Place a bet or multiple bets
 * Supports single bets and parlays
 */
router.post('/place', auth, async (req, res) => {
  const transaction = await sequelize.transaction()
  try {
    const { bets, betType = 'straight', totalStake, potentialPayout, teaserPoints } = req.body
    const userId = req.user.id
    console.log(` Processing ${betType} bet for user ${userId}...`)

    // Validate request data
    if (!bets || !Array.isArray(bets) || bets.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Bets array is required and must not be empty'
      })
    }
    if (!totalStake || totalStake <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Total stake must be greater than 0'
      })
    }

    // Use comprehensive betting rules validation
    const validationOptions = { teaserPoints: teaserPoints || 6 }
    const validation = validateBettingRequest(bets, betType, validationOptions)

    if (!validation.isValid) {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        error: 'Bet validation failed',
        errors: validation.errors,
        warnings: validation.warnings
      })
    }
    // Get user and validate balance
    const user = await User.findByPk(userId, { transaction })
    if (!user) {
      await transaction.rollback()
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }
    if (user.wallet_balance < totalStake) {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        error: 'Insufficient funds',
        available: user.wallet_balance,
        required: totalStake
      })
    }
    // Validate each bet
    for (const bet of bets) {
      if (!bet.eventId || !bet.selectedTeam || !bet.odds || !bet.stake) {
        await transaction.rollback()
        return res.status(400).json({
          success: false,
          error: 'Each bet must have eventId, selectedTeam, odds, and stake'
        })
      }
      // Verify event exists
      const event = await SportsEvent.findOne({
        where: { external_id: bet.eventId },
        transaction
      })
      if (!event) {
        await transaction.rollback()
        return res.status(400).json({
          success: false,
          error: `Event ${bet.eventId} not found`
        })
      }
      // Check if event has already started using enhanced timing validation
      if (!validateBetTiming(event.commence_time, 5)) {
        await transaction.rollback()
        return res.status(400).json({
          success: false,
          error: `Betting is closed for event: ${event.home_team} vs ${event.away_team}`
        })
      }
    }
    // Create bet records with enhanced bet type support
    const createdBets = []
    let calculatedPayout = potentialPayout

    // Calculate payout based on bet type
    if (betType === 'teaser') {
      const teaserOdds = calculateTeaserOdds(bets.length, teaserPoints || 6, bets[0]?.sport)
      calculatedPayout = teaserOdds > 0 ? totalStake * (teaserOdds / 100) : totalStake * (100 / Math.abs(teaserOdds))
    } else if (betType === 'if-bet') {
      calculatedPayout = calculateIfBetPayout(bets)
    }

    for (const bet of bets) {
      const betRecord = await Bet.create({
        user_id: userId,
        sports_event_id: bet.eventId,
        selected_team: bet.selectedTeam,
        odds: bet.odds,
        stake: bet.stake,
        market_type: bet.marketType || 'h2h',
        point: bet.point || null,
        bookmakerName: bet.bookmaker || 'winzo',
        bet_type: betType,
        status: 'pending',
        potential_payout: betType === 'straight' ? calculatePayout(bet.stake, bet.odds) : calculatedPayout / bets.length,
        teaser_points: betType === 'teaser' ? (teaserPoints || 6) : null,
        placed_at: new Date()
      }, { transaction })
      createdBets.push(betRecord)
    }
    // Update user balance
    await user.update({
      wallet_balance: user.wallet_balance - totalStake
    }, { transaction })
    // Create transaction record
    await Transaction.create({
      user_id: userId,
      type: 'bet_placed',
      amount: -totalStake,
      description: `${betType} bet placed - ${bets.length} selection(s)`,
      reference_id: createdBets[0].id,
      balance_after: user.wallet_balance - totalStake
    }, { transaction })
    await transaction.commit()
    res.json({
      success: true,
      message: 'Bet(s) placed successfully',
      data: {
        betIds: createdBets.map(b => b.id),
        betType,
        totalStake,
        potentialPayout: calculatedPayout,
        newBalance: user.wallet_balance - totalStake,
        warnings: validation.warnings || []
      }
    })
    console.log(` ${betType} bet placed successfully for user ${userId}`)
  } catch (error) {
    await transaction.rollback()
    console.error(' Error placing bet:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to place bet',
      message: error.message
    })
  }
})

/**
 * GET /api/bets/history - Get user betting history
 * Supports advanced filtering, pagination, and export
 */
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.id
    const {
      status = null,
      betType = null,
      sport = null,
      minStake = null,
      maxStake = null,
      minOdds = null,
      maxOdds = null,
      search = null,
      limit = 50,
      offset = 0,
      startDate = null,
      endDate = null,
      sortBy = 'placed_at',
      sortOrder = 'DESC',
      includeAnalytics = false
    } = req.query

    console.log(`🏈 Fetching betting history for user ${userId} with filters:`, {
      status, betType, sport, minStake, maxStake, search
    })

    // Build where clause with advanced filtering
    const whereClause = { user_id: userId }

    if (status) {
      whereClause.status = status
    }
    if (betType) {
      whereClause.bet_type = betType
    }
    if (minStake || maxStake) {
      whereClause.stake = {}
      if (minStake) whereClause.stake[Op.gte] = parseFloat(minStake)
      if (maxStake) whereClause.stake[Op.lte] = parseFloat(maxStake)
    }
    if (minOdds || maxOdds) {
      whereClause.odds = {}
      if (minOdds) whereClause.odds[Op.gte] = parseFloat(minOdds)
      if (maxOdds) whereClause.odds[Op.lte] = parseFloat(maxOdds)
    }
    if (startDate || endDate) {
      whereClause.placed_at = {}
      if (startDate) whereClause.placed_at[Op.gte] = new Date(startDate)
      if (endDate) whereClause.placed_at[Op.lte] = new Date(endDate)
    }

    // Build include clause for sports filtering and search
    const includeClause = {
      model: SportsEvent,
      as: 'sportsEvent',
      attributes: ['external_id', 'sport_key', 'home_team', 'away_team',
        'commence_time', 'completed', 'home_score', 'away_score'],
      required: false
    }

    if (sport) {
      includeClause.where = { sport_key: sport }
      includeClause.required = true
    }

    if (search) {
      includeClause.where = {
        ...includeClause.where,
        [Op.or]: [
          { home_team: { [Op.iLike]: `%${search}%` } },
          { away_team: { [Op.iLike]: `%${search}%` } },
          { sport_key: { [Op.iLike]: `%${search}%` } }
        ]
      }
      includeClause.required = true
    }

    // Validate sort parameters
    const validSortFields = ['placed_at', 'stake', 'odds', 'potential_payout', 'status']
    const validSortOrders = ['ASC', 'DESC']
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'placed_at'
    const finalSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC'

    const bets = await Bet.findAndCountAll({
      where: whereClause,
      include: [includeClause],
      order: [[finalSortBy, finalSortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    })

    // Calculate summary statistics if requested
    let summary = null
    if (includeAnalytics || bets.count > 0) {
      summary = await calculateBettingSummary(userId, whereClause)
    }

    // Format response data with enhanced information
    const formattedBets = bets.rows.map(bet => ({
      id: bet.id,
      date: bet.placed_at,
      sport: bet.sportsEvent?.sport_key || 'Unknown',
      event: bet.sportsEvent ? `${bet.sportsEvent.home_team} vs ${bet.sportsEvent.away_team}` : 'Unknown Event',
      betType: bet.bet_type || 'straight',
      market: bet.market_type || 'h2h',
      selection: bet.selected_team,
      stake: parseFloat(bet.stake || 0),
      odds: parseFloat(bet.odds || 0),
      potentialPayout: parseFloat(bet.potential_payout || 0),
      actualPayout: bet.status === 'won' ? parseFloat(bet.potential_payout || 0) : 0,
      status: bet.status,
      profit: bet.status === 'won'
        ? parseFloat(bet.potential_payout || 0) - parseFloat(bet.stake || 0)
        : bet.status === 'lost' ? -parseFloat(bet.stake || 0) : 0,
      teams: bet.sportsEvent
        ? {
            home: bet.sportsEvent.home_team,
            away: bet.sportsEvent.away_team
          }
        : null,
      eventTime: bet.sportsEvent?.commence_time,
      bookmaker: bet.bookmakerName || 'winzo',
      point: bet.point,
      teaserPoints: bet.teaser_points
    }))

    res.json({
      success: true,
      message: `Found ${bets.count} betting records`,
      data: formattedBets,
      pagination: {
        total: bets.count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: bets.count > (parseInt(offset) + parseInt(limit)),
        page: Math.floor(parseInt(offset) / parseInt(limit)) + 1,
        totalPages: Math.ceil(bets.count / parseInt(limit))
      },
      summary,
      filters: {
        status,
        betType,
        sport,
        minStake,
        maxStake,
        minOdds,
        maxOdds,
        search,
        startDate,
        endDate,
        sortBy: finalSortBy,
        sortOrder: finalSortOrder
      },
      availableFilters: {
        sports: await getAvailableSports(userId),
        betTypes: await getAvailableBetTypes(userId),
        statuses: ['pending', 'won', 'lost', 'cancelled']
      }
    })

    console.log(`🏈 Returned ${bets.rows.length} betting records for user ${userId}`)
  } catch (error) {
    console.error('Error fetching betting history:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch betting history',
      message: error.message
    })
  }
})

/**
 * GET /api/bets/:betId - Get specific bet details
 */
router.get('/:betId', auth, async (req, res) => {
  try {
    const { betId } = req.params
    const userId = req.user.id
    const bet = await Bet.findOne({
      where: { id: betId, user_id: userId },
      include: [{ model: SportsEvent, as: 'sportsEvent' }]
    })
    if (!bet) {
      return res.status(404).json({ success: false, error: 'Bet not found' })
    }
    res.json({ success: true, data: bet })
  } catch (error) {
    console.error('Error fetching bet details:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bet details',
      message: error.message
    })
  }
})

/**
 * POST /api/bets/:betId/cancel - Cancel a pending bet
 */
router.post('/:betId/cancel', auth, async (req, res) => {
  const transaction = await sequelize.transaction()
  try {
    const { betId } = req.params
    const userId = req.user.id
    const bet = await Bet.findOne({
      where: { id: betId, user_id: userId, status: 'pending' },
      include: [SportsEvent],
      transaction
    })
    if (!bet) {
      await transaction.rollback()
      return res.status(404).json({ success: false, error: 'Pending bet not found' })
    }
    // Check if event has started
    const now = new Date()
    const eventStart = new Date(bet.sportsEvent.commence_time)
    if (now > eventStart) {
      await transaction.rollback()
      return res.status(400).json({ success: false, error: 'Cannot cancel bet after event has started' })
    }
    // Update bet status
    await bet.update({ status: 'cancelled', settled_at: new Date() }, { transaction })
    // Refund user
    const user = await User.findByPk(userId, { transaction })
    await user.update({ wallet_balance: user.wallet_balance + bet.stake }, { transaction })
    // Create transaction record
    await Transaction.create({
      user_id: userId,
      type: 'bet_cancelled',
      amount: bet.stake,
      description: `Bet cancelled - ${bet.selected_team}`,
      reference_id: bet.id,
      balance_after: user.wallet_balance + bet.stake
    }, { transaction })
    await transaction.commit()
    res.json({
      success: true,
      message: 'Bet cancelled successfully',
      refundAmount: bet.stake,
      newBalance: user.wallet_balance + bet.stake
    })
  } catch (error) {
    await transaction.rollback()
    console.error(' Error cancelling bet:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to cancel bet',
      message: error.message
    })
  }
})

// Helper Functions
/**
 * Calculate betting summary for a user with optional filtering
 */
async function calculateBettingSummary (userId, whereClause = null) {
  try {
    const baseWhereClause = whereClause || { user_id: userId }

    const summary = await Bet.findAll({
      where: baseWhereClause,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalBets'],
        [sequelize.fn('SUM', sequelize.col('stake')), 'totalStaked'],
        [sequelize.fn('SUM',
          sequelize.literal("CASE WHEN status = 'won' THEN potential_payout ELSE 0 END")
        ), 'totalWinnings'],
        [sequelize.fn('COUNT',
          sequelize.literal("CASE WHEN status = 'won' THEN 1 END")
        ), 'betsWon'],
        [sequelize.fn('COUNT',
          sequelize.literal("CASE WHEN status = 'lost' THEN 1 END")
        ), 'betsLost'],
        [sequelize.fn('COUNT',
          sequelize.literal("CASE WHEN status = 'pending' THEN 1 END")
        ), 'betsPending'],
        [sequelize.fn('AVG', sequelize.col('stake')), 'averageStake'],
        [sequelize.fn('AVG', sequelize.col('odds')), 'averageOdds'],
        [sequelize.fn('MAX', sequelize.col('stake')), 'biggestStake'],
        [sequelize.fn('MIN', sequelize.col('stake')), 'smallestStake']
      ],
      raw: true
    })

    const stats = summary[0]
    const winRate = stats.betsWon > 0 ? (stats.betsWon / (stats.betsWon + stats.betsLost)) * 100 : 0
    const profit = (stats.totalWinnings || 0) - (stats.totalStaked || 0)
    const roi = stats.totalStaked > 0 ? (profit / stats.totalStaked) * 100 : 0

    return {
      totalBets: parseInt(stats.totalBets) || 0,
      totalStaked: parseFloat(stats.totalStaked) || 0,
      totalWinnings: parseFloat(stats.totalWinnings) || 0,
      profit,
      winRate: Math.round(winRate * 100) / 100,
      roi: Math.round(roi * 100) / 100,
      betsWon: parseInt(stats.betsWon) || 0,
      betsLost: parseInt(stats.betsLost) || 0,
      betsPending: parseInt(stats.betsPending) || 0,
      averageStake: parseFloat(stats.averageStake) || 0,
      averageOdds: parseFloat(stats.averageOdds) || 0,
      biggestStake: parseFloat(stats.biggestStake) || 0,
      smallestStake: parseFloat(stats.smallestStake) || 0
    }
  } catch (error) {
    console.error('Error calculating betting summary:', error)
    return {
      totalBets: 0,
      totalStaked: 0,
      totalWinnings: 0,
      profit: 0,
      winRate: 0,
      roi: 0,
      betsWon: 0,
      betsLost: 0,
      betsPending: 0,
      averageStake: 0,
      averageOdds: 0,
      biggestStake: 0,
      smallestStake: 0
    }
  }
}

/**
 * Get available sports for a user's betting history
 */
async function getAvailableSports (userId) {
  try {
    const sports = await sequelize.query(
      `SELECT DISTINCT se.sport_key 
       FROM bets b 
       JOIN sports_events se ON b.sports_event_id = se.external_id 
       WHERE b.user_id = :userId 
       ORDER BY se.sport_key`,
      {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT
      }
    )
    return sports.map(row => row.sport_key)
  } catch (error) {
    console.error('Error fetching available sports:', error)
    return []
  }
}

/**
 * Get available bet types for a user's betting history
 */
async function getAvailableBetTypes (userId) {
  try {
    const betTypes = await Bet.findAll({
      where: { user_id: userId },
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('bet_type')), 'bet_type']],
      raw: true
    })
    return betTypes.map(row => row.bet_type || 'straight').filter(Boolean)
  } catch (error) {
    console.error('Error fetching available bet types:', error)
    return ['straight']
  }
}

module.exports = router
