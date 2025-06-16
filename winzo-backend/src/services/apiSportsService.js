// WINZO API-Sports.io Integration Service

const axios = require('axios');
const Sport = require('../models/Sport');
const SportsEvent = require('../models/SportsEvent');
const Odds = require('../models/Odds');

/**
 * @typedef {Object} ApiResponse
 * @property {number} results - Number of results returned
 * @property {Array} response - Array of data items
 */

/**
 * @typedef {Object} FixtureResponse
 * @property {number} fixture_id
 * @property {Object} teams
 * @property {Object} league
 * @property {Object} goals
 * @property {Object} score
 */

/**
 * ApiSportsService handles all communications with the API-Sports.io service.
 * It provides caching, quota monitoring, exponential backoff and
 * transformation utilities for WINZO's sports betting platform.
 */
class ApiSportsService {
  constructor() {
    this.baseUrl = 'https://v3.football.api-sports.io';
    this.apiKey = process.env.APISPORTS_KEY || '53b20094967a304692910a8226b3409d';
    this.httpClient = axios;
    this.quotaRemaining = null;
    this.quotaLimit = null;
    this.cache = new Map();
  }

  /**
   * Update internal quota tracking from API response headers.
   * @param {Object} headers - Response headers
   */
  updateQuotaInfo(headers) {
    if ('x-ratelimit-requests-remaining' in headers) {
      this.quotaRemaining = parseInt(headers['x-ratelimit-requests-remaining'], 10);
    }
    if ('x-ratelimit-requests-limit' in headers) {
      this.quotaLimit = parseInt(headers['x-ratelimit-requests-limit'], 10);
    }
    if (this.quotaRemaining !== null) {
      console.log(`WINZO ⚡ API-Sports quota remaining: ${this.quotaRemaining}/${this.quotaLimit}`);
    }
  }

  /**
   * Retrieve quota information.
   * @returns {{remaining:number|null, limit:number|null}}
   */
  getQuotaInfo() {
    return {
      remaining: this.quotaRemaining,
      limit: this.quotaLimit
    };
  }

  /**
   * Get data from cache if present and valid.
   * @param {string} key cache key
   * @returns {*|null}
   */
  _getCache(key) {
    const entry = this.cache.get(key);
    if (entry && entry.expiry > Date.now()) {
      return entry.data;
    }
    if (entry) this.cache.delete(key);
    return null;
  }

  /**
   * Save data to cache with a TTL.
   * @param {string} key cache key
   * @param {*} data cached data
   * @param {number} ttl seconds to keep data
   */
  _setCache(key, data, ttl) {
    this.cache.set(key, { data, expiry: Date.now() + ttl * 1000 });
  }

  /**
   * Perform GET request with exponential backoff and caching.
   * @param {string} endpoint API endpoint
   * @param {Object} params query params
   * @param {boolean} [useCache=true] whether to use cache
   * @param {number} [ttl=60] cache TTL in seconds
   * @returns {Promise<ApiResponse>}
   */
  async request(endpoint, params = {}, useCache = true, ttl = 60) {
    const cacheKey = `${endpoint}:${JSON.stringify(params)}`;
    if (useCache) {
      const cached = this._getCache(cacheKey);
      if (cached) {
        console.log(`WINZO 🔥 Cache hit for ${endpoint}`);
        return cached;
      }
    }

    const url = `${this.baseUrl}${endpoint}`;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await this.httpClient.get(url, {
          headers: { 'x-apisports-key': this.apiKey },
          params
        });

        this.updateQuotaInfo(response.headers);

        if (useCache) this._setCache(cacheKey, response.data, ttl);
        console.log(`WINZO 🎯 Fetched ${endpoint} successfully!`);
        return response.data;
      } catch (err) {
        console.error(`WINZO API error (${endpoint}):`, err.message);
        if (attempt < 2) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`WINZO 🔄 Retrying in ${delay / 1000}s...`);
          await new Promise(res => setTimeout(res, delay));
        } else {
          throw new Error("No worries! Let's try refreshing that data again.");
        }
      }
    }
  }

  /** Basic endpoints **/

  /**
   * Get API service status.
   * @returns {Promise<ApiResponse>}
   */
  async getStatus() {
    return this.request('/status', {}, true, 30);
  }

  /**
   * Get available time zones.
   * @returns {Promise<ApiResponse>}
   */
  async getTimezones() {
    return this.request('/timezone');
  }

  /**
   * Get list of countries.
   * @returns {Promise<ApiResponse>}
   */
  async getCountries() {
    return this.request('/countries');
  }

  /**
   * Get leagues information.
   * @param {Object} params Query params (e.g., {country:'England', season:2023})
   * @returns {Promise<ApiResponse>}
   */
  async getLeagues(params = {}) {
    return this.request('/leagues', params);
  }

  /**
   * Get teams information.
   * @param {Object} params Query params (league, season etc.)
   */
  async getTeams(params = {}) {
    return this.request('/teams', params);
  }

  /**
   * Get fixtures (matches).
   * @param {Object} params Query params
   */
  async getFixtures(params = {}) {
    return this.request('/fixtures', params, false); // frequently updated, skip cache
  }

  /**
   * Get odds from bookmakers.
   * @param {Object} params Query params
   */
  async getOdds(params = {}) {
    return this.request('/odds', params, false);
  }

  /**
   * Get players stats.
   * @param {Object} params Query params
   */
  async getPlayers(params = {}) {
    return this.request('/players', params);
  }

  /**
   * Get standings table.
   * @param {Object} params Query params
   */
  async getStandings(params = {}) {
    return this.request('/standings', params, true, 300);
  }

  /**
   * Transform fixture data from API into internal format for database storage.
   * @param {FixtureResponse} fixture
   * @returns {{externalId:string, homeTeam:string, awayTeam:string, commenceTime:Date}}
   */
  transformFixture(fixture) {
    return {
      externalId: String(fixture.fixture.id),
      homeTeam: fixture.teams.home.name,
      awayTeam: fixture.teams.away.name,
      commenceTime: new Date(fixture.fixture.date)
    };
  }

  /**
   * Transform odds data from API.
   * @param {Object} odd
   */
  transformOdds(odd) {
    const decimal = parseFloat(odd.odds[0]);
    return {
      bookmakerName: odd.bookmaker,
      bookmakerTitle: odd.bookmaker,
      market: odd.name,
      outcome: odd.value,
      price: decimal,
      decimalPrice: decimal,
      point: odd.handicap ? parseFloat(odd.handicap) : null
    };
  }

  /**
   * Synchronize live fixtures and odds with the database.
   * Only a sample implementation for demonstration.
   */
  async syncLiveData(leagueId, season) {
    console.log('WINZO 🔄 Synchronizing live data...');
    const fixturesData = await this.getFixtures({ league: leagueId, season });
    const fixtures = fixturesData.response || [];

    const syncedEvents = [];
    const syncedOdds = [];

    for (const fixture of fixtures) {
      const eventData = this.transformFixture(fixture);
      const [event] = await SportsEvent.findOrCreate({
        where: { externalId: eventData.externalId },
        defaults: {
          sport_id: null,
          homeTeam: eventData.homeTeam,
          awayTeam: eventData.awayTeam,
          commenceTime: eventData.commenceTime,
          status: 'upcoming',
          lastUpdated: new Date()
        }
      });

      await event.update({
        homeTeam: eventData.homeTeam,
        awayTeam: eventData.awayTeam,
        commenceTime: eventData.commenceTime,
        lastUpdated: new Date()
      });

      syncedEvents.push(event);

      // Odds per fixture
      const oddsRes = await this.getOdds({ fixture: eventData.externalId });
      await Odds.destroy({ where: { sports_event_id: event.id } });
      for (const book of oddsRes.response || []) {
        for (const bet of book.bookmakers || []) {
          for (const odd of bet.bets || []) {
            const oddData = this.transformOdds(odd);
            const created = await Odds.create({
              sports_event_id: event.id,
              bookmakerName: oddData.bookmakerName,
              bookmakerTitle: oddData.bookmakerTitle,
              market: oddData.market,
              outcome: oddData.outcome,
              price: oddData.price,
              decimalPrice: oddData.decimalPrice,
              point: oddData.point,
              lastUpdated: new Date(),
              active: true
            });
            syncedOdds.push(created);
          }
        }
      }
    }

    console.log(`🎯 Data synchronized! Your Big Win Energy is locked and loaded!`);
    return { events: syncedEvents.length, odds: syncedOdds.length };
  }
}

module.exports = new ApiSportsService();
