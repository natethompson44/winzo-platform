const axios = require('axios');
const Sport = require('../models/Sport');
const SportsEvent = require('../models/SportsEvent');
const Odds = require('../models/Odds');

/**
 * OddsService handles all interactions with The Odds API and manages
 * synchronization of sports data, events, and odds for the WINZO platform.
 * This service ensures that users always have access to current and accurate
 * betting information with proper error handling and rate limiting.
 */
class OddsService {
  constructor() {
    this.apiKey = process.env.ODDS_API_KEY;
    this.baseUrl = 'https://api.the-odds-api.com/v4';
    this.requestsRemaining = null;
    this.requestsUsed = null;
  }

  /**
   * Convert American odds to decimal format for easier calculation
   * @param {number} americanOdds - Odds in American format (+/-100)
   * @returns {number} Decimal odds
   */
  americanToDecimal(americanOdds) {
    if (americanOdds > 0) {
      return (americanOdds / 100) + 1;
    } else {
      return (100 / Math.abs(americanOdds)) + 1;
    }
  }

  /**
   * Update request quota information from API response headers
   * @param {Object} headers - Response headers from The Odds API
   */
  updateQuotaInfo(headers) {
    this.requestsRemaining = headers['x-requests-remaining'];
    this.requestsUsed = headers['x-requests-used'];
    console.log(`WINZO Odds API Usage - Remaining: ${this.requestsRemaining}, Used: ${this.requestsUsed}`);
  }

  /**
   * Fetch and synchronize all available sports from The Odds API
   * @returns {Promise<Array>} Array of synchronized sports
   */
  async syncSports() {
    try {
      console.log('WINZO: Synchronizing sports data from The Odds API...');
      
      const response = await axios.get(`${this.baseUrl}/sports`, {
        params: {
          apiKey: this.apiKey,
          all: false // Only get in-season sports
        }
      });

      this.updateQuotaInfo(response.headers);
      const sportsData = response.data;

      const syncedSports = [];
      
      for (const sportData of sportsData) {
        const [sport, created] = await Sport.findOrCreate({
          where: { key: sportData.key },
          defaults: {
            key: sportData.key,
            group: sportData.group,
            title: sportData.title,
            description: sportData.description,
            active: sportData.active,
            hasOutrights: sportData.has_outrights || false,
          }
        });

        // Update existing sports with latest data
        if (!created) {
          await sport.update({
            group: sportData.group,
            title: sportData.title,
            description: sportData.description,
            active: sportData.active,
            hasOutrights: sportData.has_outrights || false,
          });
        }

        syncedSports.push(sport);
        console.log(`WINZO: ${created ? 'Created' : 'Updated'} sport: ${sport.title}`);
      }

      console.log(`WINZO: Successfully synchronized ${syncedSports.length} sports`);
      return syncedSports;

    } catch (error) {
      console.error('WINZO: Error synchronizing sports:', error.message);
      throw new Error('Failed to sync sports data for WINZO platform');
    }
  }

  /**
   * Fetch and synchronize events and odds for a specific sport
   * @param {string} sportKey - Sport key from The Odds API
   * @returns {Promise<Object>} Synchronized events and odds data
   */
  async syncSportData(sportKey) {
    try {
      console.log(`WINZO: Synchronizing data for sport: ${sportKey}`);

      const response = await axios.get(`${this.baseUrl}/sports/${sportKey}/odds`, {
        params: {
          apiKey: this.apiKey,
          regions: 'us',
          markets: 'h2h,spreads,totals',
          oddsFormat: 'american',
          dateFormat: 'iso'
        }
      });

      this.updateQuotaInfo(response.headers);
      const eventsData = response.data;

      const sport = await Sport.findOne({ where: { key: sportKey } });
      if (!sport) {
        throw new Error(`Sport ${sportKey} not found in WINZO database`);
      }

      const syncedEvents = [];
      const syncedOdds = [];

      for (const eventData of eventsData) {
        // Sync event
        const [event, eventCreated] = await SportsEvent.findOrCreate({
          where: { externalId: eventData.id },
          defaults: {
            externalId: eventData.id,
            sport_id: sport.id,
            homeTeam: eventData.home_team,
            awayTeam: eventData.away_team,
            commenceTime: new Date(eventData.commence_time),
            status: 'upcoming',
            lastUpdated: new Date(),
          }
        });

        if (!eventCreated) {
          await event.update({
            homeTeam: eventData.home_team,
            awayTeam: eventData.away_team,
            commenceTime: new Date(eventData.commence_time),
            lastUpdated: new Date(),
          });
        }

        syncedEvents.push(event);

        // Clear existing odds for this event to avoid duplicates
        await Odds.destroy({ where: { sports_event_id: event.id } });

        // Sync odds from all bookmakers
        for (const bookmaker of eventData.bookmakers) {
          for (const market of bookmaker.markets) {
            for (const outcome of market.outcomes) {
              const odds = await Odds.create({
                sports_event_id: event.id,
                bookmaker: bookmaker.key,
                bookmakerTitle: bookmaker.title,
                market: market.key,
                outcome: outcome.name,
                price: outcome.price,
                decimalPrice: this.americanToDecimal(outcome.price),
                point: outcome.point || null,
                lastUpdated: new Date(bookmaker.last_update),
                active: true,
              });

              syncedOdds.push(odds);
            }
          }
        }

        console.log(`WINZO: Synchronized ${eventData.bookmakers.length} bookmakers for ${event.homeTeam} vs ${event.awayTeam}`);
      }

      console.log(`WINZO: Successfully synchronized ${syncedEvents.length} events and ${syncedOdds.length} odds for ${sportKey}`);
      
      return {
        sport,
        events: syncedEvents,
        odds: syncedOdds,
        quotaRemaining: this.requestsRemaining
      };

    } catch (error) {
      console.error(`WINZO: Error synchronizing ${sportKey}:`, error.message);
      throw new Error(`Failed to sync ${sportKey} data for WINZO platform`);
    }
  }

  /**
   * Get current quota usage information
   * @returns {Object} Quota usage details
   */
  getQuotaInfo() {
    return {
      remaining: this.requestsRemaining,
      used: this.requestsUsed,
      hasApiKey: !!this.apiKey
    };
  }

  /**
   * Sync all active sports data (events and odds)
   * @returns {Promise<Object>} Complete sync results
   */
  async syncAllSportsData() {
    try {
      console.log('WINZO: Starting full sports data synchronization...');
      
      const sports = await this.syncSports();
      const activeSports = sports.filter(sport => sport.active);
      
      const syncResults = [];
      
      for (const sport of activeSports.slice(0, 5)) { // Limit to 5 sports to conserve API quota
        try {
          const result = await this.syncSportData(sport.key);
          syncResults.push(result);
          
          // Add delay between requests to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`WINZO: Failed to sync ${sport.key}:`, error.message);
        }
      }

      console.log(`WINZO: Completed synchronization of ${syncResults.length} sports`);
      
      return {
        totalSports: sports.length,
        syncedSports: syncResults.length,
        quotaRemaining: this.requestsRemaining,
        results: syncResults
      };

    } catch (error) {
      console.error('WINZO: Error in full sync:', error.message);
      throw new Error('Failed to complete WINZO sports data synchronization');
    }
  }
}

module.exports = new OddsService();

