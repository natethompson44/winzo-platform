const axios = require('axios')

/**
 * OddsApiService - Handles all communication with The Odds API
 * Provides caching, quota management, and error handling
 */
class OddsApiService {
  constructor () {
    this.apiKey = process.env.ODDS_API_KEY
    this.baseUrl = process.env.ODDS_API_BASE_URL || 'https://api.the-odds-api.com'
    this.cache = new Map()
    this.quotaUsed = 0
    this.quotaRemaining = 500
    // Cache durations in seconds
    this.cacheDurations = {
      sports: parseInt(process.env.ODDS_API_CACHE_DURATION_SPORTS) || 86400,
      odds: parseInt(process.env.ODDS_API_CACHE_DURATION_ODDS) || 30,
      scores: parseInt(process.env.ODDS_API_CACHE_DURATION_SCORES) || 15
    }

    // Don't throw error if API key is missing - just log warning
    if (!this.apiKey) {
      console.warn('⚠️ ODDS_API_KEY not found in environment variables - OddsApiService will be limited')
      this.apiKey = 'dummy-key' // Use dummy key to prevent crashes
    } else {
      console.log('OddsApiService initialized with API key:', this.apiKey.substring(0, 8) + '...')
    }
  }

  /**
   * Get all available sports
   * @param {boolean} includeInactive - Include inactive sports
   * @returns {Promise<Array>} Array of sport objects
   */
  async getSports (includeInactive = false) {
    const cacheKey = `sports_${includeInactive}`
    const cached = this.getCachedData(cacheKey, this.cacheDurations.sports)
    if (cached) {
      console.log('Returning cached sports data')
      return cached
    }
    try {
      console.log('Fetching sports from API...')
      const params = { apiKey: this.apiKey }
      if (includeInactive) {
        params.all = 'true'
      }
      const response = await axios.get(`${this.baseUrl}/v4/sports`, { params, timeout: 10000 })
      const sports = response.data
      this.setCachedData(cacheKey, sports, this.cacheDurations.sports)
      console.log(`Fetched ${sports.length} sports from API`)
      return sports
    } catch (error) {
      console.error('Error fetching sports:', error.message)
      throw new Error(`Failed to fetch sports data: ${error.message}`)
    }
  }

  /**
   * Get odds for a specific sport
   * @param {string} sportKey - Sport key from getSports()
   * @param {Object} options - Options for odds request
   * @returns {Promise<Array>} Array of event objects with odds
   */
  async getOdds (sportKey, options = {}) {
    const {
      regions = 'us',
      markets = 'h2h',
      oddsFormat = 'american',
      bookmakers = null,
      eventIds = null
    } = options
    const cacheKey = `odds_${sportKey}_${regions}_${markets}_${bookmakers || 'all'}`
    const cached = this.getCachedData(cacheKey, this.cacheDurations.odds)
    if (cached) {
      console.log(`Returning cached odds for ${sportKey}`)
      return cached
    }
    try {
      console.log(`Fetching odds for ${sportKey} from API...`)
      const params = { apiKey: this.apiKey, regions, markets, oddsFormat }
      if (bookmakers) params.bookmakers = bookmakers
      if (eventIds) params.eventIds = eventIds
      const response = await axios.get(`${this.baseUrl}/v4/sports/${sportKey}/odds`, { params, timeout: 15000 })
      this.updateQuotaFromHeaders(response.headers)
      const odds = response.data
      this.setCachedData(cacheKey, odds, this.cacheDurations.odds)
      console.log(`Fetched ${odds.length} events with odds for ${sportKey}`)
      console.log(`Quota status: ${this.quotaUsed} used, ${this.quotaRemaining} remaining`)
      return odds
    } catch (error) {
      console.error(`Error fetching odds for ${sportKey}:`, error.message)
      throw new Error(`Failed to fetch odds for ${sportKey}: ${error.message}`)
    }
  }

  /**
   * Get scores for a specific sport
   * @param {string} sportKey - Sport key from getSports()
   * @param {Object} options - Options for scores request
   * @returns {Promise<Array>} Array of game objects with scores
   */
  async getScores (sportKey, options = {}) {
    const { daysFrom = 1, eventIds = null } = options
    const cacheKey = `scores_${sportKey}_${daysFrom}_${eventIds || 'all'}`
    const cacheTime = this.cacheDurations.scores
    const cached = this.getCachedData(cacheKey, cacheTime)
    if (cached) {
      console.log(`Returning cached scores for ${sportKey}`)
      return cached
    }
    try {
      console.log(`Fetching scores for ${sportKey} from API...`)
      const params = { apiKey: this.apiKey, daysFrom }
      if (eventIds) params.eventIds = eventIds
      const response = await axios.get(`${this.baseUrl}/v4/sports/${sportKey}/scores`, { params, timeout: 10000 })
      this.updateQuotaFromHeaders(response.headers)
      const scores = response.data
      this.setCachedData(cacheKey, scores, cacheTime)
      console.log(`Fetched ${scores.length} games with scores for ${sportKey}`)
      console.log(`Quota status: ${this.quotaUsed} used, ${this.quotaRemaining} remaining`)
      return scores
    } catch (error) {
      console.error(`Error fetching scores for ${sportKey}:`, error.message)
      throw new Error(`Failed to fetch scores for ${sportKey}: ${error.message}`)
    }
  }

  /**
   * Get participants (teams/players) for a specific sport
   * @param {string} sportKey - Sport key from getSports()
   * @returns {Promise<Array>} Array of participant objects
   */
  async getParticipants (sportKey) {
    const cacheKey = `participants_${sportKey}`
    const cached = this.getCachedData(cacheKey, this.cacheDurations.sports)
    if (cached) {
      console.log(`Returning cached participants for ${sportKey}`)
      return cached
    }
    try {
      console.log(`Fetching participants for ${sportKey} from API...`)
      const response = await axios.get(`${this.baseUrl}/v4/sports/${sportKey}/participants`, {
        params: { apiKey: this.apiKey },
        timeout: 10000
      })
      const participants = response.data
      this.setCachedData(cacheKey, participants, this.cacheDurations.sports)
      console.log(`Fetched ${participants.length} participants for ${sportKey}`)
      return participants
    } catch (error) {
      console.error(`Error fetching participants for ${sportKey}:`, error.message)
      throw new Error(`Failed to fetch participants for ${sportKey}: ${error.message}`)
    }
  }

  /**
   * Get cached data if still valid
   * @param {string} key - Cache key
   * @param {number} maxAge - Maximum age in seconds
   * @returns {*} Cached data or null
   */
  getCachedData (key, maxAge) {
    const cached = this.cache.get(key)
    if (cached && (Date.now() - cached.timestamp) < maxAge * 1000) {
      return cached.data
    }
    return null
  }

  /**
   * Set data in cache with timestamp
   * @param {string} key - Cache key
   * @param {*} data - Data to cache
   * @param {number} maxAge - Maximum age in seconds
   */
  setCachedData (key, data, maxAge) {
    this.cache.set(key, { data, timestamp: Date.now(), maxAge })
    if (this.cache.size > 100) {
      this.cleanupCache()
    }
  }

  /**
   * Clean up expired cache entries
   */
  cleanupCache () {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > value.maxAge * 1000) {
        this.cache.delete(key)
      }
    }
    console.log(`Cache cleanup completed. ${this.cache.size} entries remaining.`)
  }

  /**
   * Update quota tracking from API response headers
   * @param {Object} headers - Response headers
   */
  updateQuotaFromHeaders (headers) {
    const used = headers['x-requests-used']
    const remaining = headers['x-requests-remaining']
    if (used !== undefined) {
      this.quotaUsed = parseInt(used)
    }
    if (remaining !== undefined) {
      this.quotaRemaining = parseInt(remaining)
    }
  }

  /**
   * Get current quota status
   * @returns {Object} Quota information
   */
  getQuotaStatus () {
    return {
      used: this.quotaUsed,
      remaining: this.quotaRemaining,
      total: 500,
      percentUsed: Math.round((this.quotaUsed / 500) * 100)
    }
  }

  /**
   * Check if quota is running low
   * @returns {boolean} True if quota is below 10%
   */
  isQuotaLow () {
    return this.quotaRemaining < 50 // Less than 10% remaining
  }

  /**
   * Clear all cached data
   */
  clearCache () {
    this.cache.clear()
    console.log('All cache data cleared')
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats () {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// Export singleton instance
module.exports = new OddsApiService()
