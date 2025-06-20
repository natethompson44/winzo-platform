/**
 * WINZO Sportsbook Betting Rules Validation
 * Comprehensive backend validation for all bet types
 */

/**
 * Betting Rules Configuration
 */
const BETTING_RULES = {
  straight: {
    allowedMarkets: ['h2h', 'spreads', 'totals', 'player_props', 'team_props'],
    minSelections: 1,
    maxSelections: 1
  },
  parlay: {
    allowedMarkets: ['h2h', 'spreads', 'totals'],
    minSelections: 2,
    maxSelections: 12,
    maxSameGameSelections: 0 // No same game selections in regular parlays
  },
  sgp: {
    allowedMarkets: ['h2h', 'spreads', 'totals', 'player_props', 'team_props'],
    minSelections: 2,
    maxSelections: 8,
    requireSameGame: true,
    allowedCombinations: [
      ['h2h', 'totals'],
      ['spreads', 'totals'],
      ['spreads', 'player_props'],
      ['player_props', 'team_props'],
      ['h2h', 'player_props']
    ]
  },
  teaser: {
    allowedMarkets: ['spreads', 'totals'],
    allowedSports: ['american_football', 'basketball'],
    minSelections: 2,
    maxSelections: 8,
    pointOptions: {
      american_football: [6, 6.5, 7],
      basketball: [4, 4.5, 5]
    }
  },
  'if-bet': {
    allowedMarkets: ['h2h', 'spreads', 'totals'],
    minSelections: 2,
    maxSelections: 4,
    sequentialOnly: true
  }
}

/**
 * Validate betting request
 */
function validateBettingRequest (bets, betType = 'straight', options = {}) {
  const result = {
    isValid: true,
    errors: [],
    warnings: [],
    validatedBets: []
  }

  // Get rules for bet type
  const rules = BETTING_RULES[betType]
  if (!rules) {
    result.isValid = false
    result.errors.push(`Invalid bet type: ${betType}`)
    return result
  }

  // Validate number of selections
  if (bets.length < rules.minSelections) {
    result.isValid = false
    result.errors.push(`${betType} requires at least ${rules.minSelections} selection(s)`)
    return result
  }

  if (bets.length > rules.maxSelections) {
    result.isValid = false
    result.errors.push(`${betType} cannot exceed ${rules.maxSelections} selections`)
    return result
  }

  // Validate each bet and check for conflicts
  const eventIds = new Set()
  const marketsByEvent = new Map()

  for (let i = 0; i < bets.length; i++) {
    const bet = bets[i]
    const betValidation = validateIndividualBet(bet, rules)

    if (!betValidation.isValid) {
      result.isValid = false
      result.errors.push(...betValidation.errors)
      continue
    }

    // Track events and markets for conflict detection
    eventIds.add(bet.eventId)
    if (!marketsByEvent.has(bet.eventId)) {
      marketsByEvent.set(bet.eventId, [])
    }
    marketsByEvent.get(bet.eventId).push({
      market: bet.marketType,
      selection: bet.selectedTeam,
      point: bet.point
    })

    result.validatedBets.push(bet)
  }

  // Bet type specific validations
  switch (betType) {
    case 'parlay': {
      const parlayValidation = validateParlayRules(bets, marketsByEvent, eventIds)
      if (!parlayValidation.isValid) {
        result.isValid = false
        result.errors.push(...parlayValidation.errors)
      }
      break
    }

    case 'sgp': {
      const sgpValidation = validateSameGameParlayRules(bets, marketsByEvent, eventIds, rules)
      if (!sgpValidation.isValid) {
        result.isValid = false
        result.errors.push(...sgpValidation.errors)
      }
      break
    }

    case 'teaser': {
      const teaserValidation = validateTeaserRules(bets, rules, options.teaserPoints)
      if (!teaserValidation.isValid) {
        result.isValid = false
        result.errors.push(...teaserValidation.errors)
      }
      break
    }

    case 'if-bet': {
      const ifBetValidation = validateIfBetRules(bets, rules)
      if (!ifBetValidation.isValid) {
        result.isValid = false
        result.errors.push(...ifBetValidation.errors)
      }
      break
    }
  }

  return result
}

/**
 * Validate individual bet
 */
function validateIndividualBet (bet, rules) {
  const result = { isValid: true, errors: [] }

  // Required fields
  const requiredFields = ['eventId', 'selectedTeam', 'odds', 'stake', 'marketType']
  for (const field of requiredFields) {
    if (!bet[field] && bet[field] !== 0) {
      result.isValid = false
      result.errors.push(`Missing required field: ${field}`)
    }
  }

  // Market type validation
  if (bet.marketType && !rules.allowedMarkets.includes(bet.marketType)) {
    result.isValid = false
    result.errors.push(`Market type '${bet.marketType}' not allowed for this bet type`)
  }

  // Stake validation
  if (bet.stake && (bet.stake < 1 || bet.stake > 10000)) {
    result.isValid = false
    result.errors.push('Stake must be between $1 and $10,000')
  }

  // Odds validation
  if (bet.odds && (bet.odds < -10000 || bet.odds > 10000 || bet.odds === 0)) {
    result.isValid = false
    result.errors.push('Invalid odds value')
  }

  return result
}

/**
 * Validate parlay rules
 */
function validateParlayRules (bets, marketsByEvent, eventIds) {
  const result = { isValid: true, errors: [] }

  // Check for same game conflicts
  for (const [eventId, markets] of marketsByEvent) {
    if (markets.length > 1) {
      // Multiple selections from same game - check for conflicts
      const mlSelections = markets.filter(m => m.market === 'h2h')

      // Cannot have both team MLs in same game
      if (mlSelections.length > 1) {
        result.isValid = false
        result.errors.push('Cannot parlay both team moneylines in the same game')
      }

      // Cannot have ML + Spread for same team
      const spreadSelections = markets.filter(m => m.market === 'spreads')
      for (const ml of mlSelections) {
        for (const spread of spreadSelections) {
          if (ml.selection === spread.selection) {
            result.isValid = false
            result.errors.push(`Cannot combine Moneyline and Spread for the same team: ${ml.selection}`)
          }
        }
      }

      // Cannot have player props with team markets in same game (use SGP)
      const playerProps = markets.filter(m => m.market === 'player_props')
      const teamMarkets = markets.filter(m => ['h2h', 'spreads', 'totals'].includes(m.market))
      if (playerProps.length > 0 && teamMarkets.length > 0) {
        result.isValid = false
        result.errors.push('Cannot combine Player Props with team markets in same game (use Same Game Parlay)')
      }
    }
  }

  return result
}

/**
 * Validate Same Game Parlay rules
 */
function validateSameGameParlayRules (bets, marketsByEvent, eventIds, rules) {
  const result = { isValid: true, errors: [] }

  // All selections must be from same game
  if (eventIds.size !== 1) {
    result.isValid = false
    result.errors.push('All selections must be from the same game for Same Game Parlay')
    return result
  }

  const eventId = Array.from(eventIds)[0]
  const markets = marketsByEvent.get(eventId)

  // Check for restricted combinations
  const mlSelections = markets.filter(m => m.market === 'h2h')
  const spreadSelections = markets.filter(m => m.market === 'spreads')
  const totalSelections = markets.filter(m => m.market === 'totals')

  // Cannot have ML + Spread for same team
  for (const ml of mlSelections) {
    for (const spread of spreadSelections) {
      if (ml.selection === spread.selection) {
        result.isValid = false
        result.errors.push(`Cannot combine Moneyline and Spread for the same team: ${ml.selection}`)
      }
    }
  }

  // Cannot have conflicting totals (Over + Under same point)
  for (let i = 0; i < totalSelections.length; i++) {
    for (let j = i + 1; j < totalSelections.length; j++) {
      if (totalSelections[i].point === totalSelections[j].point) {
        result.isValid = false
        result.errors.push('Cannot combine Over and Under for the same total points')
      }
    }
  }

  // Check if combination is in allowed list
  const marketTypes = [...new Set(markets.map(m => m.market))]
  const hasAllowedCombination = rules.allowedCombinations.some(combo =>
    combo.every(market => marketTypes.includes(market))
  )

  if (!hasAllowedCombination && marketTypes.length > 1) {
    result.warnings = [`This market combination may have limited availability: ${marketTypes.join(' + ')}`]
  }

  return result
}

/**
 * Validate teaser rules
 */
function validateTeaserRules (bets, rules, teaserPoints = 6) {
  const result = { isValid: true, errors: [] }

  // All selections must be from different games
  const eventIds = new Set(bets.map(b => b.eventId))
  if (eventIds.size !== bets.length) {
    result.isValid = false
    result.errors.push('Teaser selections must be from different games')
  }

  // Check allowed sports and markets
  for (const bet of bets) {
    if (bet.sport && !rules.allowedSports.includes(bet.sport)) {
      result.isValid = false
      result.errors.push(`Sport '${bet.sport}' not allowed in teasers`)
    }

    if (!rules.allowedMarkets.includes(bet.marketType)) {
      result.isValid = false
      result.errors.push(`Market type '${bet.marketType}' not allowed in teasers`)
    }
  }

  // Validate teaser points
  const firstSport = bets[0]?.sport
  if (firstSport && rules.pointOptions[firstSport]) {
    if (!rules.pointOptions[firstSport].includes(teaserPoints)) {
      result.isValid = false
      result.errors.push(`Invalid teaser points ${teaserPoints} for sport ${firstSport}`)
    }
  }

  return result
}

/**
 * Validate If Bet rules
 */
function validateIfBetRules (bets, rules) {
  const result = { isValid: true, errors: [] }

  // Check that all stakes are equal
  const firstStake = bets[0]?.stake
  if (!bets.every(bet => bet.stake === firstStake)) {
    result.isValid = false
    result.errors.push('All bets in an If Bet sequence must have equal stakes')
  }

  // Validate markets
  for (const bet of bets) {
    if (!rules.allowedMarkets.includes(bet.marketType)) {
      result.isValid = false
      result.errors.push(`Market type '${bet.marketType}' not allowed in If Bets`)
    }
  }

  return result
}

/**
 * Calculate teaser odds based on points and legs
 */
function calculateTeaserOdds (legCount, points, sport = 'american_football') {
  const teaserOddsTable = {
    american_football: {
      6: { 2: -110, 3: 160, 4: 260, 5: 400, 6: 600 },
      6.5: { 2: -120, 3: 140, 4: 240, 5: 380, 6: 580 },
      7: { 2: -130, 3: 120, 4: 200, 5: 350, 6: 550 }
    },
    basketball: {
      4: { 2: -110, 3: 160, 4: 260, 5: 400 },
      4.5: { 2: -120, 3: 140, 4: 240, 5: 380 },
      5: { 2: -130, 3: 120, 4: 200, 5: 350 }
    }
  }

  return teaserOddsTable[sport]?.[points]?.[legCount] || -110
}

/**
 * Calculate If Bet potential payout
 */
function calculateIfBetPayout (bets) {
  let totalPayout = 0
  let currentStake = bets[0]?.stake || 0

  for (const bet of bets) {
    const betPayout = calculateSingleBetPayout(currentStake, bet.odds)
    totalPayout += betPayout
    currentStake = betPayout // Next bet uses previous payout as stake
  }

  return totalPayout
}

/**
 * Calculate single bet payout
 */
function calculateSingleBetPayout (stake, odds) {
  if (odds > 0) {
    return stake * (odds / 100)
  }
  return stake * (100 / Math.abs(odds))
}

/**
 * Validate bet against event timing
 */
function validateBetTiming (eventCommenceTime, bufferMinutes = 5) {
  const now = new Date()
  const eventStart = new Date(eventCommenceTime)
  const bufferTime = bufferMinutes * 60 * 1000

  return now <= new Date(eventStart.getTime() - bufferTime)
}

module.exports = {
  validateBettingRequest,
  validateIndividualBet,
  calculateTeaserOdds,
  calculateIfBetPayout,
  calculateSingleBetPayout,
  validateBetTiming,
  BETTING_RULES
}
