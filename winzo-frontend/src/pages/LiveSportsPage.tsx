import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBetSlip } from '../contexts/BetSlipContext';
import './LiveSportsPage.css';

export interface LiveGameEvent {
  id: string;
  homeTeam: string;
  awayTeam: string;
  gameTime: Date;
  rotationNumbers: { home: string; away: string };
  odds: {
    spread: { home: number; away: number; odds: number };
    total: { over: number; under: number; odds: number };
    moneyline: { home: number; away: number };
  };
  sport: string;
  league: string;
  isLive: true;
  currentScore: { home: number; away: number };
  gameStatus: string;
  timeRemaining: string;
  venue?: string;
  lastOddsUpdate: Date;
  oddsMovement: 'up' | 'down' | 'stable';
  isFeatured?: boolean;
}

export interface SportCategory {
  id: string;
  name: string;
  icon: string;
  eventCount: number;
  isActive: boolean;
}

export const mockCategories: SportCategory[] = [
  { id: 'all', name: 'All Live', icon: 'bi-broadcast', eventCount: 8, isActive: false },
  { id: 'football', name: 'NFL Live', icon: 'bi-shield-check', eventCount: 3, isActive: false },
  { id: 'basketball', name: 'NBA Live', icon: 'bi-circle', eventCount: 4, isActive: false },
  { id: 'hockey', name: 'NHL Live', icon: 'bi-snow', eventCount: 1, isActive: false },
  { id: 'soccer', name: 'Soccer Live', icon: 'bi-globe', eventCount: 5, isActive: false },
];

export const mockLiveEvents: LiveGameEvent[] = [
  {
    id: '1',
    homeTeam: 'Los Angeles Lakers',
    awayTeam: 'Golden State Warriors',
    gameTime: new Date(),
    rotationNumbers: { home: '501', away: '502' },
    odds: {
      spread: { home: -2.5, away: 2.5, odds: -110 },
      total: { over: 215.5, under: 215.5, odds: -110 },
      moneyline: { home: -130, away: +110 }
    },
    sport: 'basketball',
    league: 'NBA',
    isLive: true,
    currentScore: { home: 78, away: 82 },
    gameStatus: 'Q3 8:32',
    timeRemaining: '8:32',
    venue: 'Crypto.com Arena',
    lastOddsUpdate: new Date(),
    oddsMovement: 'up',
    isFeatured: true
  },
  {
    id: '2',
    homeTeam: 'Dallas Cowboys',
    awayTeam: 'Philadelphia Eagles',
    gameTime: new Date(),
    rotationNumbers: { home: '601', away: '602' },
    odds: {
      spread: { home: -3, away: 3, odds: -110 },
      total: { over: 42.5, under: 42.5, odds: -110 },
      moneyline: { home: -150, away: +130 }
    },
    sport: 'football',
    league: 'NFL',
    isLive: true,
    currentScore: { home: 14, away: 21 },
    gameStatus: '2nd Quarter',
    timeRemaining: '3:45',
    venue: 'AT&T Stadium',
    lastOddsUpdate: new Date(Date.now() - 30000),
    oddsMovement: 'down',
    isFeatured: true
  },
  {
    id: '3',
    homeTeam: 'Manchester City',
    awayTeam: 'Arsenal',
    gameTime: new Date(),
    rotationNumbers: { home: '801', away: '802' },
    odds: {
      spread: { home: -0.5, away: 0.5, odds: -110 },
      total: { over: 2.5, under: 2.5, odds: -110 },
      moneyline: { home: -120, away: +200 }
    },
    sport: 'soccer',
    league: 'Premier League',
    isLive: true,
    currentScore: { home: 1, away: 1 },
    gameStatus: '67\' 2nd Half',
    timeRemaining: '23 min',
    venue: 'Etihad Stadium',
    lastOddsUpdate: new Date(Date.now() - 60000),
    oddsMovement: 'stable'
  }
];

const LiveSportsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { addToBetSlip } = useBetSlip();
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [events, setEvents] = useState<LiveGameEvent[]>([]);
  const [categories, setCategories] = useState<SportCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const highlightedEventId = searchParams.get('highlight');

  const loadData = useCallback(async () => {
    if (!autoRefresh && !isLoading) return;
    
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const updatedCategories = mockCategories.map(cat => ({
        ...cat,
        isActive: cat.id === selectedSport
      }));
      
      setCategories(updatedCategories);
      
      let filteredEvents = mockLiveEvents;
      if (selectedSport !== 'all') {
        filteredEvents = mockLiveEvents.filter(event => event.sport === selectedSport);
      }

      if (searchTerm) {
        filteredEvents = filteredEvents.filter(event => 
          event.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.awayTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.league.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      filteredEvents.sort((a, b) => a.gameTime.getTime() - b.gameTime.getTime());
      
      setEvents(filteredEvents);
      setLastUpdate(new Date());
    } catch (err) {
      setError('Failed to load live events. Connection issues detected.');
      console.error('Error loading live sports data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSport, autoRefresh, isLoading, searchTerm]);

  useEffect(() => {
    loadData();

    if (autoRefresh) {
      const refreshInterval = setInterval(loadData, 5000);
      return () => clearInterval(refreshInterval);
    }
  }, [loadData, autoRefresh]);

  const handleSportChange = (sportId: string) => {
    setSelectedSport(sportId);
  };

  const handleAddToBetSlip = (event: LiveGameEvent, betType: string, odds: number, selection: string) => {
    const marketTypeMap: { [key: string]: 'h2h' | 'spreads' | 'totals' } = {
      'moneyline': 'h2h',
      'spread': 'spreads',
      'total': 'totals'
    };

    const betSelection = {
      eventId: event.id,
      sport: event.sport,
      homeTeam: event.homeTeam,
      awayTeam: event.awayTeam,
      selectedTeam: selection,
      odds,
      bookmaker: 'WINZO',
      marketType: marketTypeMap[betType] || 'h2h',
      commenceTime: event.gameTime.toISOString()
    };
    
    addToBetSlip(betSelection);
  };

  const formatOdds = (odds: number): string => {
    return odds > 0 ? `+${odds}` : odds.toString();
  };

  const getOddsMovementIcon = (movement: string) => {
    switch (movement) {
      case 'up':
        return <i className="bi bi-arrow-up text-success"></i>;
      case 'down':
        return <i className="bi bi-arrow-down text-danger"></i>;
      default:
        return <i className="bi bi-dash text-muted"></i>;
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  if (error) {
    return (
      <div className="live-sports-error">
        <div className="alert alert-danger">
          <i className="bi bi-wifi-off me-2"></i>
          {error}
          <div className="ms-auto">
            <button className="btn btn-sm btn-outline-danger me-2" onClick={() => window.location.reload()}>
              Reconnect
            </button>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setAutoRefresh(!autoRefresh)}>
              {autoRefresh ? 'Pause' : 'Resume'} Updates
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="live-sports-page">
      {/* Live Header */}
      <div className="live-header">
        <div className="live-status">
          <div className="live-indicator">
            <div className="live-dot pulsing"></div>
            <span className="live-text">LIVE BETTING</span>
          </div>
          <div className="live-stats">
            <span className="event-count">{events.length} Live Events</span>
            <span className="last-updated">Updated {formatTimeAgo(lastUpdate)}</span>
          </div>
        </div>
        
        <div className="live-controls">
          <button 
            className={`auto-refresh-btn ${autoRefresh ? 'active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <i className={`bi ${autoRefresh ? 'bi-pause-fill' : 'bi-play-fill'}`}></i>
            {autoRefresh ? 'Auto-updating' : 'Paused'}
          </button>
          <button className="refresh-btn" onClick={loadData} disabled={isLoading}>
            <i className={`bi bi-arrow-clockwise ${isLoading ? 'spin' : ''}`}></i>
          </button>
        </div>
      </div>

      {/* Sports Navigation */}
      <div className="sports-header">
        <div className="sports-nav">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`sport-tab live-tab ${category.isActive ? 'active' : ''}`}
              onClick={() => handleSportChange(category.id)}
            >
              <i className={category.icon}></i>
              <span>{category.name}</span>
              <span className="count live-count">{category.eventCount}</span>
            </button>
          ))}
        </div>
        
        <div className="search-controls">
          <div className="search-input">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search live games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Live Betting Table */}
      <div className="betting-table-container live-table-container">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Loading live events...</span>
            </div>
            <p>Loading live events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-broadcast"></i>
            <h5>No live events found</h5>
            <p>Check back soon for live games or adjust your filters.</p>
          </div>
        ) : (
          <table className="betting-table live-table">
            <thead>
              <tr>
                <th className="game-col">Live Game</th>
                <th className="spread-col">Live Spread</th>
                <th className="total-col">Live Total</th>
                <th className="moneyline-col">Live Moneyline</th>
                <th className="odds-col">Movement</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className={`game-row live-row ${event.id === highlightedEventId ? 'highlighted' : ''} ${event.isFeatured ? 'featured' : ''}`}>
                  <td className="game-cell live-game-cell">
                    <div className="live-badge-mini">
                      <div className="live-dot pulsing"></div>
                    </div>
                    <div className="game-info">
                      <div className="teams">
                        <div className="away-team">
                          <span className="team-name">{event.awayTeam}</span>
                          <span className="score">{event.currentScore.away}</span>
                        </div>
                        <div className="home-team">
                          <span className="team-name">{event.homeTeam}</span>
                          <span className="score">{event.currentScore.home}</span>
                        </div>
                      </div>
                      <div className="game-meta">
                        <span className="status">{event.gameStatus}</span>
                        <span className="league">{event.league}</span>
                        {event.isFeatured && <span className="featured-badge">Featured</span>}
                      </div>
                    </div>
                  </td>
                  
                  <td className="spread-cell">
                    <div className="bet-options">
                      <button
                        className="bet-btn live-bet-btn"
                        onClick={() => handleAddToBetSlip(event, 'spread', event.odds.spread.odds, `${event.awayTeam} ${formatOdds(event.odds.spread.away)} (Live)`)}
                      >
                        <span className="line">{formatOdds(event.odds.spread.away)}</span>
                        <span className="odds">{formatOdds(event.odds.spread.odds)}</span>
                      </button>
                      <button
                        className="bet-btn live-bet-btn"
                        onClick={() => handleAddToBetSlip(event, 'spread', event.odds.spread.odds, `${event.homeTeam} ${formatOdds(event.odds.spread.home)} (Live)`)}
                      >
                        <span className="line">{formatOdds(event.odds.spread.home)}</span>
                        <span className="odds">{formatOdds(event.odds.spread.odds)}</span>
                      </button>
                    </div>
                  </td>
                  
                  <td className="total-cell">
                    <div className="bet-options">
                      <button
                        className="bet-btn live-bet-btn"
                        onClick={() => handleAddToBetSlip(event, 'total', event.odds.total.odds, `Over ${event.odds.total.over} (Live)`)}
                      >
                        <span className="line">O {event.odds.total.over}</span>
                        <span className="odds">{formatOdds(event.odds.total.odds)}</span>
                      </button>
                      <button
                        className="bet-btn live-bet-btn"
                        onClick={() => handleAddToBetSlip(event, 'total', event.odds.total.odds, `Under ${event.odds.total.under} (Live)`)}
                      >
                        <span className="line">U {event.odds.total.under}</span>
                        <span className="odds">{formatOdds(event.odds.total.odds)}</span>
                      </button>
                    </div>
                  </td>
                  
                  <td className="moneyline-cell">
                    <div className="bet-options">
                      <button
                        className="bet-btn live-bet-btn"
                        onClick={() => handleAddToBetSlip(event, 'moneyline', event.odds.moneyline.away, `${event.awayTeam} ML (Live)`)}
                      >
                        <span className="odds">{formatOdds(event.odds.moneyline.away)}</span>
                      </button>
                      <button
                        className="bet-btn live-bet-btn"
                        onClick={() => handleAddToBetSlip(event, 'moneyline', event.odds.moneyline.home, `${event.homeTeam} ML (Live)`)}
                      >
                        <span className="odds">{formatOdds(event.odds.moneyline.home)}</span>
                      </button>
                    </div>
                  </td>
                  
                  <td className="odds-cell">
                    <div className="odds-movement">
                      {getOddsMovementIcon(event.oddsMovement)}
                      <span className="update-time">{formatTimeAgo(event.lastOddsUpdate)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LiveSportsPage;