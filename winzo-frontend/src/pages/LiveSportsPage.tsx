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
  description: string;
  color: string;
}

export const mockCategories: SportCategory[] = [
  { 
    id: 'all', 
    name: 'All Live', 
    icon: 'bi-broadcast', 
    eventCount: 8, 
    isActive: false,
    description: 'All live events',
    color: '#dc3545'
  },
  { 
    id: 'football', 
    name: 'NFL Live', 
    icon: 'bi-shield-check', 
    eventCount: 3, 
    isActive: false,
    description: 'Live football games',
    color: '#2eca6a'
  },
  { 
    id: 'basketball', 
    name: 'NBA Live', 
    icon: 'bi-circle', 
    eventCount: 4, 
    isActive: false,
    description: 'Live basketball games',
    color: '#ff771d'
  },
  { 
    id: 'hockey', 
    name: 'NHL Live', 
    icon: 'bi-snow', 
    eventCount: 1, 
    isActive: false,
    description: 'Live hockey games',
    color: '#6f42c1'
  },
  { 
    id: 'soccer', 
    name: 'Soccer Live', 
    icon: 'bi-globe', 
    eventCount: 5, 
    isActive: false,
    description: 'Live soccer matches',
    color: '#20c997'
  },
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
    lastOddsUpdate: new Date(Date.now() - 30000), // 30 seconds ago
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
    lastOddsUpdate: new Date(Date.now() - 60000), // 1 minute ago
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
  const [sortBy, setSortBy] = useState<'score' | 'time' | 'odds'>('time');

  // Get highlighted event from search
  const highlightedEventId = searchParams.get('highlight');

  // Auto-refresh live data
  const loadData = useCallback(async () => {
    if (!autoRefresh && !isLoading) return;
    
    setError(null);
    
    try {
      // Simulate API call delay (shorter for live updates)
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Set active category
      const updatedCategories = mockCategories.map(cat => ({
        ...cat,
        isActive: cat.id === selectedSport
      }));
      
      setCategories(updatedCategories);
      
      // Filter events by selected sport
      let filteredEvents = mockLiveEvents;
      if (selectedSport !== 'all') {
        filteredEvents = mockLiveEvents.filter(event => event.sport === selectedSport);
      }

      // Apply search filter
      if (searchTerm) {
        filteredEvents = filteredEvents.filter(event => 
          event.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.awayTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.league.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Sort events
      filteredEvents.sort((a, b) => {
        switch (sortBy) {
          case 'score':
            const aTotalScore = a.currentScore.home + a.currentScore.away;
            const bTotalScore = b.currentScore.home + b.currentScore.away;
            return bTotalScore - aTotalScore;
          case 'time':
            return a.gameTime.getTime() - b.gameTime.getTime();
          case 'odds':
            return Math.abs(a.odds.moneyline.home) - Math.abs(b.odds.moneyline.home);
          default:
            return 0;
        }
      });
      
      setEvents(filteredEvents);
      setLastUpdate(new Date());
    } catch (err) {
      setError('Failed to load live events. Connection issues detected.');
      console.error('Error loading live sports data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSport, autoRefresh, isLoading, searchTerm, sortBy]);

  useEffect(() => {
    loadData();

    // Auto-refresh every 5 seconds for live data
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
        <div className="card">
          <div className="card-body text-center">
            <i className="bi bi-wifi-off text-danger" style={{fontSize: '3rem'}}></i>
            <h3 className="mt-3">Connection Error</h3>
            <p className="text-muted">{error}</p>
            <div className="d-flex gap-2 justify-content-center">
              <button className="btn btn-primary" onClick={() => window.location.reload()}>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Reconnect
              </button>
              <button className="btn btn-outline-secondary" onClick={() => setAutoRefresh(!autoRefresh)}>
                <i className={`bi ${autoRefresh ? 'bi-pause' : 'bi-play'} me-2`}></i>
                {autoRefresh ? 'Pause' : 'Resume'} Updates
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="live-sports-page">
      {/* Live Status Bar */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="live-status-card">
            <div className="live-indicator">
              <div className="live-dot pulsing"></div>
              <span className="live-text">LIVE BETTING</span>
            </div>
            <div className="live-stats">
              <span className="event-count">{events.length} Live Events</span>
              <span className="last-updated">
                <i className="bi bi-clock me-1"></i>
                Updated {formatTimeAgo(lastUpdate)}
              </span>
            </div>
            <div className="live-controls">
              <button 
                className={`btn btn-sm ${autoRefresh ? 'btn-success' : 'btn-outline-secondary'}`}
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <i className={`bi ${autoRefresh ? 'bi-pause' : 'bi-play'} me-1`}></i>
                {autoRefresh ? 'Auto-updating' : 'Paused'}
              </button>
              <button className="btn btn-sm btn-outline-primary" onClick={loadData}>
                <i className="bi bi-arrow-clockwise me-1"></i>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <div className="search-box">
                    <i className="bi bi-search"></i>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search live games..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <select 
                    className="form-select" 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value as 'score' | 'time' | 'odds')}
                  >
                    <option value="time">Sort by Start Time</option>
                    <option value="score">Sort by Total Score</option>
                    <option value="odds">Sort by Odds</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="autoRefresh"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="autoRefresh">
                      Auto-refresh
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sports Categories */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="sports-categories">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`sport-category-card live-category ${category.isActive ? 'active' : ''}`}
                onClick={() => handleSportChange(category.id)}
                style={{ '--category-color': category.color } as React.CSSProperties}
              >
                <div className="category-icon">
                  <i className={category.icon}></i>
                </div>
                <div className="category-info">
                  <h6>{category.name}</h6>
                  <p>{category.description}</p>
                  <span className="event-count">{category.eventCount} live</span>
                </div>
                {category.id === 'all' && (
                  <div className="live-pulse"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Events */}
      <div className="row">
        {isLoading ? (
          <div className="col-12">
            <div className="text-center py-5">
              <div className="spinner-border text-danger" role="status">
                <span className="visually-hidden">Loading live events...</span>
              </div>
              <p className="mt-3 text-muted">Loading live events...</p>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="bi bi-broadcast text-muted" style={{fontSize: '3rem'}}></i>
                <h5 className="mt-3">No live events found</h5>
                <p className="text-muted">Check back soon for live games or adjust your filters.</p>
              </div>
            </div>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="col-lg-6 col-xl-4 mb-4">
              <div className={`live-event-card ${event.id === highlightedEventId ? 'highlighted' : ''} ${event.isFeatured ? 'featured' : ''}`}>
                <div className="live-badge">
                  <div className="live-dot pulsing"></div>
                  LIVE
                </div>
                
                {event.isFeatured && (
                  <div className="featured-badge">
                    <i className="bi bi-star-fill"></i>
                    Featured
                  </div>
                )}

                <div className="event-header">
                  <div className="teams-score">
                    <div className="team away-team">
                      <span className="team-name">{event.awayTeam}</span>
                      <span className="team-score">{event.currentScore.away}</span>
                    </div>
                    <div className="vs-divider">
                      <span className="game-status">{event.gameStatus}</span>
                      <span className="time-remaining">{event.timeRemaining}</span>
                    </div>
                    <div className="team home-team">
                      <span className="team-name">{event.homeTeam}</span>
                      <span className="team-score">{event.currentScore.home}</span>
                    </div>
                  </div>
                  
                  <div className="game-info">
                    <div className="league-venue">
                      <span className="league">{event.league}</span>
                      {event.venue && (
                        <span className="venue">
                          <i className="bi bi-geo-alt"></i>
                          {event.venue}
                        </span>
                      )}
                    </div>
                    <div className="odds-movement">
                      {getOddsMovementIcon(event.oddsMovement)}
                      <span className="update-time">{formatTimeAgo(event.lastOddsUpdate)}</span>
                    </div>
                  </div>
                </div>

                <div className="betting-options">
                  {/* Live Moneyline */}
                  <div className="bet-type">
                    <h6>Live Moneyline</h6>
                    <div className="bet-buttons">
                      <button
                        className="bet-btn live-bet-btn"
                        onClick={() => handleAddToBetSlip(event, 'moneyline', event.odds.moneyline.away, `${event.awayTeam} ML (Live)`)}
                      >
                        <span className="team">{event.awayTeam}</span>
                        <span className="odds">{formatOdds(event.odds.moneyline.away)}</span>
                      </button>
                      <button
                        className="bet-btn live-bet-btn"
                        onClick={() => handleAddToBetSlip(event, 'moneyline', event.odds.moneyline.home, `${event.homeTeam} ML (Live)`)}
                      >
                        <span className="team">{event.homeTeam}</span>
                        <span className="odds">{formatOdds(event.odds.moneyline.home)}</span>
                      </button>
                    </div>
                  </div>

                  {/* Live Spread */}
                  <div className="bet-type">
                    <h6>Live Spread</h6>
                    <div className="bet-buttons">
                      <button
                        className="bet-btn live-bet-btn"
                        onClick={() => handleAddToBetSlip(event, 'spread', event.odds.spread.odds, `${event.awayTeam} ${formatOdds(event.odds.spread.away)} (Live)`)}
                      >
                        <span className="team">{event.awayTeam} {formatOdds(event.odds.spread.away)}</span>
                        <span className="odds">{formatOdds(event.odds.spread.odds)}</span>
                      </button>
                      <button
                        className="bet-btn live-bet-btn"
                        onClick={() => handleAddToBetSlip(event, 'spread', event.odds.spread.odds, `${event.homeTeam} ${formatOdds(event.odds.spread.home)} (Live)`)}
                      >
                        <span className="team">{event.homeTeam} {formatOdds(event.odds.spread.home)}</span>
                        <span className="odds">{formatOdds(event.odds.spread.odds)}</span>
                      </button>
                    </div>
                  </div>

                  {/* Live Total */}
                  <div className="bet-type">
                    <h6>Live Total</h6>
                    <div className="bet-buttons">
                      <button
                        className="bet-btn live-bet-btn"
                        onClick={() => handleAddToBetSlip(event, 'total', event.odds.total.odds, `Over ${event.odds.total.over} (Live)`)}
                      >
                        <span className="team">Over {event.odds.total.over}</span>
                        <span className="odds">{formatOdds(event.odds.total.odds)}</span>
                      </button>
                      <button
                        className="bet-btn live-bet-btn"
                        onClick={() => handleAddToBetSlip(event, 'total', event.odds.total.odds, `Under ${event.odds.total.under} (Live)`)}
                      >
                        <span className="team">Under {event.odds.total.under}</span>
                        <span className="odds">{formatOdds(event.odds.total.odds)}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LiveSportsPage;