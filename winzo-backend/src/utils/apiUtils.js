/**
 * API Utilities for The Odds API integration
 */

/**
 * Format odds for display
 * @param {number} price - Odds price from API
 * @returns {string} Formatted odds string
 */
function formatOdds (price) {
  if (typeof price !== 'number') {
    return 'N/A'
  }
  if (price > 0) {
    return `+${price}`
  }
  return price.toString()
}

/**
 * Convert American odds to decimal odds
 * @param {number} americanOdds - American odds format
 * @returns {number} Decimal odds
 */
function americanToDecimal (americanOdds) {
  if (americanOdds > 0) {
    return americanOdds / 100 + 1
  } else {
    return 100 / Math.abs(americanOdds) + 1
  }
}

/**
 * Calculate potential payout from stake and odds
 * @param {number} stake - Bet amount
 * @param {number} americanOdds - American odds format
 * @returns {number} Potential payout
 */
function calculatePayout (stake, americanOdds) {
  if (americanOdds > 0) {
    return stake * (americanOdds / 100)
  } else {
    return stake * (100 / Math.abs(americanOdds))
  }
}

/**
 * Validate sport key format
 * @param {string} sportKey - Sport key to validate
 * @returns {boolean} True if valid
 */
function isValidSportKey (sportKey) {
  return (
    typeof sportKey === 'string' &&
    sportKey.length > 0 &&
    /^[a-z0-9_]+$/.test(sportKey)
  )
}

/**
 * Get sport icon emoji based on sport group
 * @param {string} group - Sport group from API
 * @returns {string} Emoji icon
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
    'Mixed Martial Arts': '',
    Cricket: '',
    Rugby: '',
    'Aussie Rules': ''
  }
  return icons[group] || ''
}

/**
 * Parse commence time to readable format
 * @param {string} commenceTime - ISO timestamp from API
 * @returns {Object} Parsed time information
 */
function parseCommenceTime (commenceTime) {
  const date = new Date(commenceTime)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffHours = Math.round(diffMs / (1000 * 60 * 60))
  return {
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    timestamp: date.getTime(),
    hoursFromNow: diffHours,
    isLive: diffHours <= 0 && diffHours > -4,
    isUpcoming: diffHours > 0
  }
}

/**
 * Validate API response structure
 * @param {*} data - Response data to validate
 * @param {string} type - Expected data type (sports, odds, scores, participants)
 * @returns {boolean} True if valid
 */
function validateApiResponse (data, type) {
  if (!Array.isArray(data)) {
    return false
  }
  switch (type) {
    case 'sports':
      return data.every(
        sport => sport.key && sport.title && typeof sport.active === 'boolean'
      )
    case 'odds':
      return data.every(
        event => event.id && event.sport_key && event.home_team && event.away_team
      )
    case 'scores':
      return data.every(
        game => game.id && game.sport_key && game.home_team && game.away_team
      )
    case 'participants':
      return data.every(
        participant => participant.full_name || typeof participant === 'string'
      )
    default:
      return false
  }
}

module.exports = {
  formatOdds,
  americanToDecimal,
  calculatePayout,
  isValidSportKey,
  getSportIcon,
  parseCommenceTime,
  validateApiResponse
}
