import apiClient from '@/utils/apiClient';

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
  // ===== SPORTS DATA =====
  
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
   * Get games by sport
   */
  async getGamesBySport(sport: string, limit: number = 20): Promise<Game[]> {
    try {
      const response = await apiClient.getSportsGames({
        sport,
        limit,
        status: 'upcoming'
      });
      
      if (response.success && response.data && response.data.success) {
        return this.formatGamesData(response.data.data);
      }
      return this.getMockGames(sport);
    } catch (error) {
      console.error(`Failed to fetch ${sport} games:`, error);
      return this.getMockGames(sport);
    }
  }

  /**
   * Get live games
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

  private formatGamesData(rawGames: any[]): Game[] {
    return rawGames.map(game => ({
      id: game.id || game.game_id,
      sport: game.sport || 'football',
      league: game.league || game.tournament,
      homeTeam: game.home_team || game.homeTeam,
      awayTeam: game.away_team || game.awayTeam,
      homeTeamLogo: game.home_team_logo,
      awayTeamLogo: game.away_team_logo,
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
      { id: 'soccer', name: 'Soccer', icon: '/images/icon/football.png', activeGames: 45 },
      { id: 'basketball', name: 'Basketball', icon: '/images/icon/basketball.png', activeGames: 23 },
      { id: 'tennis', name: 'Tennis', icon: '/images/icon/tennis.png', activeGames: 18 },
      { id: 'american_football', name: 'American Football', icon: '/images/icon/american-football.png', activeGames: 12 },
      { id: 'ice_hockey', name: 'Ice Hockey', icon: '/images/icon/ice-hockey.png', activeGames: 15 },
      { id: 'baseball', name: 'Baseball', icon: '/images/icon/baseball.png', activeGames: 8 }
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