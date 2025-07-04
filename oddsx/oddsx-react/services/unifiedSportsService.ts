/**
 * Unified Sports Data Service
 * Eliminates duplicate API requests and provides centralized data management
 */

import apiClient from '@/utils/apiClient';

interface SportsCacheEntry {
  data: any;
  timestamp: number;
  expiry: number;
}

interface RequestInProgress {
  promise: Promise<any>;
  timestamp: number;
}

class UnifiedSportsService {
  private static instance: UnifiedSportsService;
  private cache = new Map<string, SportsCacheEntry>();
  private requestsInProgress = new Map<string, RequestInProgress>();
  
  // Cache durations in milliseconds
  private cacheDurations = {
    soccer: 30000,      // 30 seconds for live soccer data
    liveGames: 15000,   // 15 seconds for live games
    upcomingGames: 60000, // 1 minute for upcoming games
    sports: 300000      // 5 minutes for sports list
  };

  static getInstance(): UnifiedSportsService {
    if (!UnifiedSportsService.instance) {
      UnifiedSportsService.instance = new UnifiedSportsService();
    }
    return UnifiedSportsService.instance;
  }

  /**
   * Get soccer games with intelligent caching and request deduplication
   */
  async getSoccerGames(options: {
    league?: string;
    limit?: number;
    type?: 'all' | 'live' | 'upcoming';
  }): Promise<any[]> {
    const { league = 'epl', limit = 20, type = 'all' } = options;
    const cacheKey = `soccer_${league}_${limit}_${type}`;
    
    // Check cache first
    const cached = this.getFromCache(cacheKey, this.cacheDurations.soccer);
    if (cached) {
      console.log(`♻️ Using cached soccer data for ${league} (${type})`);
      return cached;
    }
    
    // Check if request is already in progress
    const inProgress = this.requestsInProgress.get(cacheKey);
    if (inProgress) {
      console.log(`⏳ Request already in progress for ${cacheKey}, waiting...`);
      return inProgress.promise;
    }
    
    // Make new request
    const promise = this.fetchSoccerGames(league, limit, type);
    this.requestsInProgress.set(cacheKey, { promise, timestamp: Date.now() });
    
    try {
      const result = await promise;
      this.setCache(cacheKey, result, this.cacheDurations.soccer);
      return result;
    } finally {
      this.requestsInProgress.delete(cacheKey);
    }
  }

  /**
   * Get live soccer games specifically
   */
  async getLiveSoccerGames(options: { league?: string; limit?: number }): Promise<any[]> {
    const allGames = await this.getSoccerGames({ ...options, type: 'all' });
    
    // Filter for live games
    return allGames.filter((game: any) => {
      const gameTime = new Date(game.game_time || game.startTime);
      const now = new Date();
      const diffHours = (now.getTime() - gameTime.getTime()) / (1000 * 60 * 60);
      
      // Consider games as live if they started within the last 2 hours but not more than 2.5 hours ago
      return game.status === 'live' || (diffHours > 0 && diffHours < 2.5);
    });
  }

  /**
   * Get upcoming soccer games specifically
   */
  async getUpcomingSoccerGames(options: { league?: string; limit?: number }): Promise<any[]> {
    const allGames = await this.getSoccerGames({ ...options, type: 'all' });
    
    // Filter for upcoming games
    return allGames.filter((game: any) => {
      const gameTime = new Date(game.game_time || game.startTime || game.commence_time);
      const now = new Date();
      const diffMs = gameTime.getTime() - now.getTime();
      
      // Consider games as upcoming if they start in the future (up to 7 days)
      return game.status === 'upcoming' || (diffMs > 0 && diffMs < 7 * 24 * 60 * 60 * 1000);
    }).sort((a: any, b: any) => {
      // Sort by match time (earliest first)
      const timeA = new Date(a.game_time || a.startTime || a.commence_time).getTime();
      const timeB = new Date(b.game_time || b.startTime || b.commence_time).getTime();
      return timeA - timeB;
    });
  }

  /**
   * Private method to fetch soccer games from API
   */
  private async fetchSoccerGames(league: string, limit: number, type: string): Promise<any[]> {
    try {
      console.log(`🌐 Fetching ${type} soccer games for ${league}`);
      
      const response = await apiClient.get('/sports/soccer/games', {
        params: { league, limit }
      });
      
      if (response.success && response.data) {
        if (response.data.success === false) {
          console.warn('Soccer API returned success:false, using mock data');
          return this.getMockSoccerGames();
        }
        
        let gamesData = response.data;
        if (response.data.data) {
          gamesData = response.data.data;
        }
        
        return this.formatGamesData(gamesData);
      }
      
      console.warn('Soccer API response not successful, using mock data');
      return this.getMockSoccerGames();
    } catch (error) {
      console.error('Error fetching soccer games:', error);
      return this.getMockSoccerGames();
    }
  }

  /**
   * Format games data to standardized structure
   */
  private formatGamesData(games: any[]): any[] {
    return games.map((game: any) => ({
      id: game.id || `game_${Date.now()}_${Math.random()}`,
      sport_key: game.sport_key || game.sport || 'soccer_epl',
      sport_icon: game.sport_icon || '/images/icon/soccer-icon.png',
      league_name: game.league_name || game.league || 'Premier League',
      game_time: game.game_time || game.startTime || game.commence_time || new Date().toISOString(),
      home_team: game.home_team || game.homeTeam || 'Home Team',
      away_team: game.away_team || game.awayTeam || 'Away Team',
      home_team_logo: game.home_team_logo || game.homeTeamLogo || '/images/clubs/default-team.png',
      away_team_logo: game.away_team_logo || game.awayTeamLogo || '/images/clubs/default-team.png',
      markets: game.markets || {},
      best_odds: game.best_odds || game.odds || { home: 2.50, draw: 3.20, away: 2.80 },
      bookmaker_count: game.bookmaker_count || game.bookmakers?.length || 5,
      last_updated: game.last_updated || new Date().toISOString(),
      status: game.status || 'upcoming',
      featured: game.featured || false
    }));
  }

  /**
   * Get data from cache if not expired
   */
  private getFromCache(key: string, maxAge: number): any | null {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < maxAge) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set data in cache
   */
  private setCache(key: string, data: any, maxAge: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + maxAge
    });
    
    // Clean up expired entries periodically
    this.cleanupCache();
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    });
  }

  /**
   * Mock data for fallback
   */
  private getMockSoccerGames(): any[] {
    return [
      {
        id: 'mock_1',
        sport_key: 'soccer_epl',
        sport_icon: '/images/icon/epl-icon.png',
        league_name: 'Premier League',
        game_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        home_team: 'Manchester United',
        away_team: 'Liverpool',
        home_team_logo: '/images/clubs/epl/manchester-united.png',
        away_team_logo: '/images/clubs/epl/liverpool.png',
        markets: {},
        best_odds: { home: 2.5, draw: 3.2, away: 2.8 },
        bookmaker_count: 8,
        last_updated: new Date().toISOString(),
        status: 'upcoming',
        featured: true
      }
    ];
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
    this.requestsInProgress.clear();
    console.log('🗑️ Unified sports service cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      requestsInProgress: this.requestsInProgress.size,
      cacheKeys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const unifiedSportsService = UnifiedSportsService.getInstance();
export default unifiedSportsService; 