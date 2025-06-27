import apiClient from '@/utils/apiClient';

// Client-side logo cache to prevent duplicate HTTP requests
class TeamLogoCache {
  private static logoCache = new Map<string, string>();
  private static defaultLogoCached = false;
  private static defaultLogoUrl = '/images/clubs/default-team.png';
  private static preloadInitialized = false;

  /**
   * Get cached logo URL or cache it if first time
   * This prevents multiple HTTP requests for the same logo
   */
  static getCachedLogoUrl(originalUrl: string | undefined): string {
    // Initialize preloader on first use
    if (!this.preloadInitialized) {
      this.preloadDefaultLogo();
      this.preloadInitialized = true;
    }

    if (!originalUrl) {
      return this.getDefaultLogo();
    }

    // If it's already cached, return the cached version
    if (this.logoCache.has(originalUrl)) {
      return this.logoCache.get(originalUrl)!;
    }

    // Cache the URL for future use
    this.logoCache.set(originalUrl, originalUrl);
    return originalUrl;
  }

  /**
   * Get default logo with caching to prevent multiple requests
   * This is the main fix - ensures only one request for default-team.png
   */
  private static getDefaultLogo(): string {
    if (!this.defaultLogoCached) {
      this.logoCache.set(this.defaultLogoUrl, this.defaultLogoUrl);
      this.defaultLogoCached = true;
    }
    return this.defaultLogoUrl;
  }

  /**
   * Preload the default team logo to eliminate HTTP requests on page load
   * This ensures the browser has the image cached before any img elements request it
   */
  private static preloadDefaultLogo(): void {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = this.defaultLogoUrl;
      link.type = 'image/png';
      document.head.appendChild(link);
      
      // Also create an Image object to force immediate loading
      const img = new Image();
      img.src = this.defaultLogoUrl;
    }
  }

  /**
   * Clear cache if needed (for testing or memory management)
   */
  static clearCache(): void {
    this.logoCache.clear();
    this.defaultLogoCached = false;
    this.preloadInitialized = false;
  }
}

export interface Game {
  id: string;
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  startTime: string;
  status: 'upcoming' | 'live' | 'finished';
  odds?: {
    homeWin: number;
    draw?: number;
    awayWin: number;
  };
  score?: {
    home: number;
    away: number;
  };
  period?: string;
  timeInPeriod?: string;
  // Enhanced properties for live data integration
  sport_key?: string;
  sport_icon?: string;
  league_name?: string;
  game_time?: string;
  home_team?: string;
  away_team?: string;
  home_team_logo?: string;
  away_team_logo?: string;
  markets?: any;
  best_odds?: any;
  bookmaker_count?: number;
  last_updated?: string;
  featured?: boolean;
}

export interface BestOdds {
  game_id: string;
  sport_key: string;
  home_team: string;
  away_team: string;
  best_odds: any;
  prioritized_bookmakers: any[];
  total_bookmakers: number;
}

export interface Bet {
  id: string;
  gameId: string;
  betType: string;
  selection: string;
  odds: number;
  stake: number;
  status: 'pending' | 'won' | 'lost' | 'cancelled';
  potentialWin: number;
  placedAt: string;
  settledAt?: string;
  game?: Game;
}

export interface BetSlipItem {
  gameId: string;
  selection: string;
  odds: number;
  betType: string;
  game: Game;
}

export interface Sports {
  id: string;
  name: string;
  icon: string;
  activeGames: number;
}

class SportsService {
  
  // ===== ENHANCED SPORT-SPECIFIC METHODS (PHASE 1) =====

  /**
   * Get NFL games for American Football page
   */
  async getNFLGames(options?: {
    week?: number;
    season?: number;
    limit?: number;
  }): Promise<Game[]> {
    try {
      const params = {
        week: options?.week,
        season: options?.season || 2025,
        limit: options?.limit || 20
      };

      console.log('Fetching NFL games with params:', params);
      const response = await apiClient.get('/sports/nfl/games', { params });
      
      console.log('NFL API response:', response);
      
      if (response.success && response.data) {
        // Enhanced response validation
        if (response.data.success === false) {
          console.warn('NFL API returned success:false, falling back to mock data:', response.data.message);
          return this.getMockNFLGames();
        }
        
        // Handle different response structures
        let gamesData = response.data;
        if (response.data.data) {
          gamesData = response.data.data;
        }
        
        console.log('Processing NFL games data:', gamesData);
        return this.formatLiveGamesData(gamesData);
      }
      
      console.warn('NFL API response not successful, falling back to mock data');
      return this.getMockNFLGames();
    } catch (error: any) {
      console.error('Failed to fetch NFL games:', error);
      
      // Provide more specific error information
      if (error.response?.status === 401) {
        console.warn('Authentication required for NFL data - this should not cause logout for non-auth endpoints');
      } else if (error.response?.status === 404) {
        console.warn('NFL games endpoint not found - API may not be implemented yet');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        console.warn('Network error while fetching NFL games - using fallback data');
      }
      
      return this.getMockNFLGames();
    }
  }

  /**
   * Get Soccer games for Soccer page
   */
  async getSoccerGames(options?: {
    league?: string;
    limit?: number;
  }): Promise<Game[]> {
    try {
      const params = {
        league: options?.league || 'epl',
        limit: options?.limit || 20
      };

      console.log('Fetching Soccer games with params:', params);
      const response = await apiClient.get('/sports/soccer/games', { params });
      
      console.log('Soccer API response:', response);
      
      if (response.success && response.data) {
        if (response.data.success === false) {
          console.warn('Soccer API returned success:false, falling back to mock data:', response.data.message);
          return this.getMockSoccerGames();
        }
        
        let gamesData = response.data;
        if (response.data.data) {
          gamesData = response.data.data;
        }
        
        console.log('Processing Soccer games data:', gamesData);
        return this.formatLiveGamesData(gamesData);
      }
      
      console.warn('Soccer API response not successful, falling back to mock data');
      return this.getMockSoccerGames();
    } catch (error: any) {
      console.error('Failed to fetch Soccer games:', error);
      
      if (error.response?.status === 401) {
        console.warn('Authentication required for Soccer data - this should not cause logout for non-auth endpoints');
      } else if (error.response?.status === 404) {
        console.warn('Soccer games endpoint not found - API may not be implemented yet');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        console.warn('Network error while fetching Soccer games - using fallback data');
      }
      
      return this.getMockSoccerGames();
    }
  }

  /**
   * Get Basketball games for Basketball page
   */
  async getBasketballGames(options?: {
    league?: string;
    limit?: number;
  }): Promise<Game[]> {
    try {
      const params = {
        league: options?.league || 'nba',
        limit: options?.limit || 20
      };

      console.log('Fetching Basketball games with params:', params);
      const response = await apiClient.get('/sports/basketball/games', { params });
      
      console.log('Basketball API response:', response);
      
      if (response.success && response.data) {
        if (response.data.success === false) {
          console.warn('Basketball API returned success:false, falling back to mock data:', response.data.message);
          return this.getMockBasketballGames();
        }
        
        let gamesData = response.data;
        if (response.data.data) {
          gamesData = response.data.data;
        }
        
        console.log('Processing Basketball games data:', gamesData);
        return this.formatLiveGamesData(gamesData);
      }
      
      console.warn('Basketball API response not successful, falling back to mock data');
      return this.getMockBasketballGames();
    } catch (error: any) {
      console.error('Failed to fetch Basketball games:', error);
      
      if (error.response?.status === 401) {
        console.warn('Authentication required for Basketball data - this should not cause logout for non-auth endpoints');
      } else if (error.response?.status === 404) {
        console.warn('Basketball games endpoint not found - API may not be implemented yet');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        console.warn('Network error while fetching Basketball games - using fallback data');
      }
      
      return this.getMockBasketballGames();
    }
  }

  /**
   * Get Ice Hockey games for Ice Hockey page
   */
  async getIceHockeyGames(options?: {
    league?: string;
    limit?: number;
  }): Promise<Game[]> {
    try {
      const params = {
        league: options?.league || 'nhl',
        limit: options?.limit || 20
      };

      console.log('Fetching Ice Hockey games with params:', params);
      const response = await apiClient.get('/sports/icehockey/games', { params });
      
      console.log('Ice Hockey API response:', response);
      
      if (response.success && response.data) {
        if (response.data.success === false) {
          console.warn('Ice Hockey API returned success:false, falling back to mock data:', response.data.message);
          return this.getMockIceHockeyGames();
        }
        
        let gamesData = response.data;
        if (response.data.data) {
          gamesData = response.data.data;
        }
        
        console.log('Processing Ice Hockey games data:', gamesData);
        return this.formatLiveGamesData(gamesData);
      }
      
      console.warn('Ice Hockey API response not successful, falling back to mock data');
      return this.getMockIceHockeyGames();
    } catch (error: any) {
      console.error('Failed to fetch Ice Hockey games:', error);
      
      if (error.response?.status === 401) {
        console.warn('Authentication required for Ice Hockey data - this should not cause logout for non-auth endpoints');
      } else if (error.response?.status === 404) {
        console.warn('Ice Hockey games endpoint not found - API may not be implemented yet');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        console.warn('Network error while fetching Ice Hockey games - using fallback data');
      }
      
      return this.getMockIceHockeyGames();
    }
  }

  /**
   * Get best odds for a specific game
   */
  async getBestOddsForGame(sport: string, gameId: string): Promise<BestOdds | null> {
    try {
      const response = await apiClient.get(`/sports/${sport}/best-odds/${gameId}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to fetch best odds for game ${gameId}:`, error);
      return null;
    }
  }

  /**
   * Get bookmaker comparison for a game
   */
  async getBookmakerComparison(sport: string, gameId: string): Promise<any[]> {
    try {
      const bestOdds = await this.getBestOddsForGame(sport, gameId);
      
      if (bestOdds?.prioritized_bookmakers) {
        return bestOdds.prioritized_bookmakers;
      }
      
      return [];
    } catch (error) {
      console.error(`Failed to fetch bookmaker comparison for game ${gameId}:`, error);
      return [];
    }
  }

  // ===== GENERAL SPORTS DATA METHODS =====
  
  /**
   * Get all available sports
   */
  async getSports(): Promise<Sports[]> {
    try {
      const response = await apiClient.get('/sports/available');
      if (response.success && response.data) {
        return response.data;
      }
      return this.getMockSports();
    } catch (error) {
      console.error('Failed to fetch sports:', error);
      return this.getMockSports();
    }
  }

  /**
   * Get games by sport (enhanced with live data integration)
   */
  async getGamesBySport(sport: string, limit: number = 20): Promise<Game[]> {
    try {
      // Use sport-specific endpoints if available
      switch (sport.toLowerCase()) {
        case 'american_football':
        case 'americanfootball':
        case 'nfl':
          return this.getNFLGames({ limit });
        case 'soccer':
        case 'football':
          return this.getSoccerGames({ limit });
        case 'basketball':
        case 'nba':
          return this.getBasketballGames({ limit });
        case 'ice_hockey':
        case 'icehockey':
        case 'hockey':
        case 'nhl':
          return this.getIceHockeyGames({ limit });
        default:
          // Fall back to general endpoint for other sports
          const response = await apiClient.getSportsGames({
            sport,
            limit,
            status: 'upcoming'
          });
          
          if (response.success && response.data && response.data.success) {
            return this.formatGamesData(response.data.data);
          }
          return this.getMockGames(sport);
      }
    } catch (error) {
      console.error(`Failed to fetch ${sport} games:`, error);
      return this.getMockGames(sport);
    }
  }

  /**
   * Get live games across all sports
   */
  async getLiveGames(): Promise<Game[]> {
    try {
      const response = await apiClient.getSportsGames({
        status: 'live',
        limit: 50
      });
      
      if (response.success && response.data && response.data.success) {
        return this.formatGamesData(response.data.data);
      }
      return this.getMockLiveGames();
    } catch (error) {
      console.error('Failed to fetch live games:', error);
      return this.getMockLiveGames();
    }
  }

  /**
   * Get upcoming games
   */
  async getUpcomingGames(limit: number = 50): Promise<Game[]> {
    try {
      const response = await apiClient.getSportsGames({
        status: 'upcoming',
        limit
      });
      
      if (response.success && response.data && response.data.success) {
        return this.formatGamesData(response.data.data);
      }
      return this.getMockUpcomingGames();
    } catch (error) {
      console.error('Failed to fetch upcoming games:', error);
      return this.getMockUpcomingGames();
    }
  }

  /**
   * Get odds for a specific game
   */
  async getGameOdds(gameId: string): Promise<any> {
    try {
      const response = await apiClient.getOdds(gameId);
      if (response.success && response.data) {
        return response.data;
      }
      return this.getMockOdds();
    } catch (error) {
      console.error(`Failed to fetch odds for game ${gameId}:`, error);
      return this.getMockOdds();
    }
  }

  // ===== BETTING FUNCTIONALITY =====

  /**
   * Place a bet
   */
  async placeBet(betData: {
    gameId: string;
    betType: string;
    selection: string;
    odds: number;
    stake: number;
  }): Promise<{ success: boolean; bet?: Bet; error?: string }> {
    try {
      // Convert camelCase to snake_case for API
      const apiData = {
        game_id: betData.gameId,
        bet_type: betData.betType,
        selection: betData.selection,
        odds: betData.odds,
        stake: betData.stake
      };
      const response = await apiClient.placeBet(apiData);
      
      if (response.success && response.data && response.data.success) {
        return {
          success: true,
          bet: response.data.data
        };
      }
      
      return {
        success: false,
        error: response.data?.message || 'Failed to place bet'
      };
    } catch (error) {
      console.error('Failed to place bet:', error);
      return {
        success: false,
        error: 'Failed to place bet. Please try again.'
      };
    }
  }

  /**
   * Get betting history
   */
  async getBettingHistory(params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<Bet[]> {
    try {
      const response = await apiClient.getBettingHistory(params);
      
      if (response.success && response.data && response.data.success) {
        return response.data.data;
      }
      return this.getMockBettingHistory();
    } catch (error) {
      console.error('Failed to fetch betting history:', error);
      return this.getMockBettingHistory();
    }
  }

  /**
   * Get active bets
   */
  async getActiveBets(): Promise<Bet[]> {
    try {
      const response = await apiClient.getActiveBets();
      
      if (response.success && response.data && response.data.success) {
        return response.data.data;
      }
      return this.getMockActiveBets();
    } catch (error) {
      console.error('Failed to fetch active bets:', error);
      return this.getMockActiveBets();
    }
  }

  // ===== DATA FORMATTING =====

  /**
   * Format live games data from the new API endpoints
   */
  private formatLiveGamesData(rawGames: any): Game[] {
    // Critical fix: Ensure rawGames is an array before calling .map()
    if (!rawGames) {
      console.warn('formatLiveGamesData: rawGames is null or undefined, returning empty array');
      return [];
    }
    
    if (!Array.isArray(rawGames)) {
      console.warn('formatLiveGamesData: rawGames is not an array, attempting to extract array from response');
      
      // Common API response patterns
      if (rawGames.data && Array.isArray(rawGames.data)) {
        rawGames = rawGames.data;
      } else if (rawGames.games && Array.isArray(rawGames.games)) {
        rawGames = rawGames.games;
      } else if (rawGames.results && Array.isArray(rawGames.results)) {
        rawGames = rawGames.results;
      } else {
        console.error('formatLiveGamesData: Unable to find array in response structure:', rawGames);
        return [];
      }
    }
    
    if (rawGames.length === 0) {
      console.info('formatLiveGamesData: No games data available');
      return [];
    }

    return rawGames.map((game: any) => {
      // Add safety checks for game object
      if (!game || typeof game !== 'object') {
        console.warn('formatLiveGamesData: Invalid game object, skipping:', game);
        return null;
      }

      return {
        id: game.id || `game_${Date.now()}_${Math.random()}`,
        sport: game.sport_key || game.sport || 'unknown',
        league: game.league_name || game.league || 'Unknown League',
        homeTeam: game.home_team || game.homeTeam || 'Home Team',
        awayTeam: game.away_team || game.awayTeam || 'Away Team',
        homeTeamLogo: TeamLogoCache.getCachedLogoUrl(game.home_team_logo),
        awayTeamLogo: TeamLogoCache.getCachedLogoUrl(game.away_team_logo),
        startTime: game.game_time || game.start_time || game.commence_time || new Date().toISOString(),
        status: this.determineGameStatus(game),
        odds: this.formatOddsData(game.best_odds || game.odds),
        score: game.score,
        period: game.period,
        timeInPeriod: game.time_in_period,
        // Enhanced properties
        sport_key: game.sport_key,
        sport_icon: game.sport_icon,
        league_name: game.league_name,
        game_time: game.game_time,
        home_team: game.home_team,
        away_team: game.away_team,
        home_team_logo: game.home_team_logo,
        away_team_logo: game.away_team_logo,
        markets: game.markets,
        best_odds: game.best_odds,
        bookmaker_count: game.bookmaker_count || 0,
        last_updated: game.last_updated || new Date().toISOString(),
        featured: game.featured || false
      };
    }).filter(Boolean); // Remove any null entries from invalid game objects
  }

  /**
   * Format odds data from API response
   */
  private formatOddsData(oddsData: any): { homeWin: number; draw?: number; awayWin: number } | undefined {
    if (!oddsData) return undefined;

    // Handle different odds formats
    if (oddsData.h2h) {
      const outcomes = Object.keys(oddsData.h2h);
      return {
        homeWin: oddsData.h2h[outcomes[0]]?.price || 2.0,
        draw: oddsData.h2h[outcomes[1]]?.price,
        awayWin: oddsData.h2h[outcomes[2]]?.price || oddsData.h2h[outcomes[1]]?.price || 2.0
      };
    }

    // Handle legacy format
    if (typeof oddsData === 'object' && oddsData.homeWin) {
      return oddsData;
    }

    return undefined;
  }

  /**
   * Determine game status from API data
   */
  private determineGameStatus(game: any): 'upcoming' | 'live' | 'finished' {
    if (game.status) return game.status;
    if (game.completed) return 'finished';
    
    const gameTime = new Date(game.game_time || game.start_time || game.commence_time);
    const now = new Date();
    const diffHours = (now.getTime() - gameTime.getTime()) / (1000 * 60 * 60);
    
    if (diffHours > 0 && diffHours < 4) return 'live';
    if (diffHours > 4) return 'finished';
    return 'upcoming';
  }

  /**
   * Format games data (legacy method for backward compatibility)
   */
  private formatGamesData(rawGames: any[]): Game[] {
    return rawGames.map(game => ({
      id: game.id || game.game_id,
      sport: game.sport || 'football',
      league: game.league || game.tournament,
      homeTeam: game.home_team || game.homeTeam,
      awayTeam: game.away_team || game.awayTeam,
      homeTeamLogo: TeamLogoCache.getCachedLogoUrl(game.home_team_logo),
      awayTeamLogo: TeamLogoCache.getCachedLogoUrl(game.away_team_logo),
      startTime: game.start_time || game.commence_time,
      status: game.status || 'upcoming',
      odds: game.odds ? {
        homeWin: game.odds.h2h?.[0] || 2.0,
        draw: game.odds.h2h?.[1],
        awayWin: game.odds.h2h?.[2] || game.odds.h2h?.[1] || 2.0
      } : undefined,
      score: game.score,
      period: game.period,
      timeInPeriod: game.time_in_period
    }));
  }

  // ===== MOCK DATA (Fallback) =====

  private getMockSports(): Sports[] {
    return [
      { id: 'soccer', name: 'Soccer', icon: '/images/icon/soccer-icon.png', activeGames: 45 },
      { id: 'basketball', name: 'Basketball', icon: '/images/icon/basketball.png', activeGames: 23 },
      { id: 'tennis', name: 'Tennis', icon: '/images/icon/tennis.png', activeGames: 18 },
      { id: 'american_football', name: 'American Football', icon: '/images/icon/america-football.png', activeGames: 12 },
      { id: 'ice_hockey', name: 'Ice Hockey', icon: '/images/icon/ice-hockey.png', activeGames: 15 },
      { id: 'baseball', name: 'Baseball', icon: '/images/icon/baseball.png', activeGames: 8 }
    ];
  }

  private getMockNFLGames(): Game[] {
    return [
      {
        id: 'nfl1',
        sport: 'americanfootball_nfl',
        league: 'NFL',
        homeTeam: 'Philadelphia Eagles',
        awayTeam: 'Dallas Cowboys',
        homeTeamLogo: '/images/clubs/philadelphia-eagles.png',
        awayTeamLogo: '/images/clubs/dallas-cowboys.png',
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        status: 'upcoming',
        odds: { homeWin: -140, awayWin: 120 },
        featured: true
      },
      {
        id: 'nfl2',
        sport: 'americanfootball_nfl',
        league: 'NFL',
        homeTeam: 'Green Bay Packers',
        awayTeam: 'Chicago Bears',
        homeTeamLogo: '/images/clubs/green-bay-packers.png',
        awayTeamLogo: '/images/clubs/chicago-bears.png',
        startTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        status: 'upcoming',
        odds: { homeWin: -200, awayWin: 170 }
      }
    ];
  }

  private getMockSoccerGames(): Game[] {
    return [
      {
        id: 'soccer1',
        sport: 'soccer_epl',
        league: 'Premier League',
        homeTeam: 'Manchester United',
        awayTeam: 'Liverpool',
        homeTeamLogo: '/images/icon/man-utd.png',
        awayTeamLogo: '/images/icon/liverpool.png',
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        status: 'upcoming',
        odds: { homeWin: 2.5, draw: 3.2, awayWin: 2.8 },
        featured: true
      },
      {
        id: 'soccer2',
        sport: 'soccer_epl',
        league: 'Premier League',
        homeTeam: 'Chelsea',
        awayTeam: 'Manchester City',
        homeTeamLogo: '/images/icon/chelsea.png',
        awayTeamLogo: '/images/icon/manchester-city.png',
        startTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        status: 'upcoming',
        odds: { homeWin: 3.1, draw: 3.4, awayWin: 2.2 }
      }
    ];
  }

  private getMockBasketballGames(): Game[] {
    return [
      {
        id: 'nba1',
        sport: 'basketball_nba',
        league: 'NBA',
        homeTeam: 'Los Angeles Lakers',
        awayTeam: 'Boston Celtics',
        homeTeamLogo: '/images/clubs/los-angeles-lakers.png',
        awayTeamLogo: '/images/clubs/boston-celtics.png',
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        status: 'upcoming',
        odds: { homeWin: -110, awayWin: -110 },
        featured: true
      }
    ];
  }

  private getMockIceHockeyGames(): Game[] {
    return [
      {
        id: 'nhl1',
        sport: 'icehockey_nhl',
        league: 'NHL',
        homeTeam: 'Boston Bruins',
        awayTeam: 'New York Rangers',
        homeTeamLogo: '/images/clubs/boston-bruins.png',
        awayTeamLogo: '/images/clubs/new-york-rangers.png',
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        status: 'upcoming',
        odds: { homeWin: -125, awayWin: 105 }
      }
    ];
  }

  private getMockGames(sport: string): Game[] {
    const mockGames: Game[] = [
      {
        id: '1',
        sport: sport,
        league: 'Premier League',
        homeTeam: 'Manchester United',
        awayTeam: 'Liverpool',
        homeTeamLogo: '/images/clubs/man-united.png',
        awayTeamLogo: '/images/clubs/liverpool.png',
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        status: 'upcoming',
        odds: { homeWin: 2.5, draw: 3.2, awayWin: 2.8 }
      },
      {
        id: '2',
        sport: sport,
        league: 'Champions League',
        homeTeam: 'Barcelona',
        awayTeam: 'Real Madrid',
        homeTeamLogo: '/images/clubs/barcelona.png',
        awayTeamLogo: '/images/clubs/real-madrid.png',
        startTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        status: 'upcoming',
        odds: { homeWin: 2.1, draw: 3.5, awayWin: 3.2 }
      }
    ];
    return mockGames;
  }

  private getMockLiveGames(): Game[] {
    return [
      {
        id: 'live1',
        sport: 'soccer',
        league: 'Premier League',
        homeTeam: 'Chelsea',
        awayTeam: 'Arsenal',
        startTime: new Date().toISOString(),
        status: 'live',
        score: { home: 1, away: 0 },
        period: '1st Half',
        timeInPeriod: '34\'',
        odds: { homeWin: 1.8, draw: 3.8, awayWin: 4.2 }
      }
    ];
  }

  private getMockUpcomingGames(): Game[] {
    return this.getMockGames('soccer').concat(this.getMockGames('basketball'));
  }

  private getMockOdds() {
    return {
      homeWin: 2.3,
      draw: 3.1,
      awayWin: 2.9
    };
  }

  private getMockBettingHistory(): Bet[] {
    return [
      {
        id: 'bet1',
        gameId: '1',
        betType: 'match_winner',
        selection: 'home',
        odds: 2.5,
        stake: 50,
        status: 'won',
        potentialWin: 125,
        placedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        settledAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  private getMockActiveBets(): Bet[] {
    return [
      {
        id: 'active1',
        gameId: '2',
        betType: 'match_winner',
        selection: 'away',
        odds: 3.2,
        stake: 25,
        status: 'pending',
        potentialWin: 80,
        placedAt: new Date().toISOString()
      }
    ];
  }
}

// Export singleton instance
const sportsService = new SportsService();
export default sportsService;