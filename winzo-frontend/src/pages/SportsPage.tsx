import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBetSlip } from '../contexts/BetSlipContext';
import './SportsPage.css';

export interface GameEvent {
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
  venue?: string;
  status: 'upcoming' | 'live' | 'finished';
  isFeatured?: boolean;
  lastOddsUpdate?: Date;
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
    name: 'All Sports', 
    icon: 'bi-trophy', 
    eventCount: 28, 
    isActive: false,
    description: 'All available sports',
    color: '#4154f1'
  },
  { 
    id: 'football', 
    name: 'NFL Football', 
    icon: 'bi-shield-check', 
    eventCount: 12, 
    isActive: false,
    description: 'National Football League',
    color: '#2eca6a'
  },
  { 
    id: 'basketball', 
    name: 'NBA Basketball', 
    icon: 'bi-circle', 
    eventCount: 8, 
    isActive: false,
    description: 'National Basketball Association',
    color: '#ff771d'
  },
  { 
    id: 'baseball', 
    name: 'MLB Baseball', 
    icon: 'bi-diamond', 
    eventCount: 6, 
    isActive: false,
    description: 'Major League Baseball',
    color: '#e83e8c'
  },
  { 
    id: 'hockey', 
    name: 'NHL Hockey', 
    icon: 'bi-snow', 
    eventCount: 2, 
    isActive: false,
    description: 'National Hockey League',
    color: '#6f42c1'
  },
  { 
    id: 'soccer', 
    name: 'Soccer', 
    icon: 'bi-globe', 
    eventCount: 15, 
    isActive: false,
    description: 'Premier League & More',
    color: '#20c997'
  },
];

export const mockEvents: GameEvent[] = [
  {
    id: '1',
    homeTeam: 'Los Angeles Lakers',
    awayTeam: 'Golden State Warriors',
    gameTime: new Date(Date.now() + 3600000), // 1 hour from now
    rotationNumbers: { home: '501', away: '502' },
    odds: {
      spread: { home: -3.5, away: 3.5, odds: -110 },
      total: { over: 220.5, under: 220.5, odds: -110 },
      moneyline: { home: -150, away: +130 }
    },
    sport: 'basketball',
    league: 'NBA',
    venue: 'Crypto.com Arena',
    status: 'upcoming',
    isFeatured: true,
    lastOddsUpdate: new Date()
  },
  {
    id: '2',
    homeTeam: 'Dallas Cowboys',
    awayTeam: 'Philadelphia Eagles',
    gameTime: new Date(Date.now() + 7200000), // 2 hours from now
    rotationNumbers: { home: '601', away: '602' },
    odds: {
      spread: { home: -7, away: 7, odds: -110 },
      total: { over: 45.5, under: 45.5, odds: -110 },
      moneyline: { home: -280, away: +220 }
    },
    sport: 'football',
    league: 'NFL',
    venue: 'AT&T Stadium',
    status: 'upcoming',
    isFeatured: true,
    lastOddsUpdate: new Date()
  },
  {
    id: '3',
    homeTeam: 'New York Yankees',
    awayTeam: 'Boston Red Sox',
    gameTime: new Date(Date.now() + 5400000), // 1.5 hours from now
    rotationNumbers: { home: '701', away: '702' },
    odds: {
      spread: { home: -1.5, away: 1.5, odds: -110 },
      total: { over: 8.5, under: 8.5, odds: -110 },
      moneyline: { home: -140, away: +120 }
    },
    sport: 'baseball',
    league: 'MLB',
    venue: 'Yankee Stadium',
    status: 'upcoming',
    lastOddsUpdate: new Date()
  },
  {
    id: '4',
    homeTeam: 'Manchester City',
    awayTeam: 'Arsenal',
    gameTime: new Date(Date.now() + 10800000), // 3 hours from now
    rotationNumbers: { home: '801', away: '802' },
    odds: {
      spread: { home: -0.5, away: 0.5, odds: -110 },
      total: { over: 2.5, under: 2.5, odds: -110 },
      moneyline: { home: -120, away: +200 }
    },
    sport: 'soccer',
    league: 'Premier League',
    venue: 'Etihad Stadium',
    status: 'upcoming',
    isFeatured: true,
    lastOddsUpdate: new Date()
  }
];

const SportsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { addToBetSlip } = useBetSlip();
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [categories, setCategories] = useState<SportCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'time' | 'popular' | 'odds'>('time');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  // Get highlighted event from search
  const highlightedEventId = searchParams.get('highlight');

  // Load data on component mount
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Set active category
      const updatedCategories = mockCategories.map(cat => ({
        ...cat,
        isActive: cat.id === selectedSport
      }));
      
      setCategories(updatedCategories);
      
      // Filter events by selected sport
      let filteredEvents = mockEvents;
      if (selectedSport !== 'all') {
        filteredEvents = mockEvents.filter(event => event.sport === selectedSport);
      }

      // Apply search filter
      if (searchTerm) {
        filteredEvents = filteredEvents.filter(event => 
          event.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.awayTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.league.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply featured filter
      if (showFeaturedOnly) {
        filteredEvents = filteredEvents.filter(event => event.isFeatured);
      }

      // Sort events
      filteredEvents.sort((a, b) => {
        switch (sortBy) {
          case 'time':
            return a.gameTime.getTime() - b.gameTime.getTime();
          case 'popular':
            return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
          case 'odds':
            return Math.abs(a.odds.moneyline.home) - Math.abs(b.odds.moneyline.home);
          default:
            return 0;
        }
      });
      
      setEvents(filteredEvents);
    } catch (err) {
      setError('Failed to load sports events. Please try again.');
      console.error('Error loading sports data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSport, searchTerm, sortBy, showFeaturedOnly]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSportChange = (sportId: string) => {
    setSelectedSport(sportId);
  };

  const handleAddToBetSlip = (event: GameEvent, betType: string, odds: number, selection: string) => {
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

  const formatGameTime = (gameTime: Date): string => {
    const now = new Date();
    const diffInHours = (gameTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.round((gameTime.getTime() - now.getTime()) / (1000 * 60));
      return `${diffInMinutes}min`;
    } else if (diffInHours < 24) {
      return `${Math.round(diffInHours)}h`;
    } else {
      return gameTime.toLocaleDateString();
    }
  };

  if (error) {
    return (
      <div className="sports-page-error">
        <div className="card">
          <div className="card-body text-center">
            <i className="bi bi-exclamation-triangle text-warning" style={{fontSize: '3rem'}}></i>
            <h3 className="mt-3">Something went wrong</h3>
            <p className="text-muted">{error}</p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sports-page">
      {/* Search and Filters */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-4">
                  <div className="search-box">
                    <i className="bi bi-search"></i>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search teams, leagues..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <select 
                    className="form-select" 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value as 'time' | 'popular' | 'odds')}
                  >
                    <option value="time">Sort by Time</option>
                    <option value="popular">Sort by Popular</option>
                    <option value="odds">Sort by Odds</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="featuredOnly"
                      checked={showFeaturedOnly}
                      onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="featuredOnly">
                      Featured Only
                    </label>
                  </div>
                </div>
                <div className="col-md-2">
                  <button className="btn btn-outline-secondary w-100" onClick={loadData}>
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Refresh
                  </button>
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
                className={`sport-category-card ${category.isActive ? 'active' : ''}`}
                onClick={() => handleSportChange(category.id)}
                style={{ '--category-color': category.color } as React.CSSProperties}
              >
                <div className="category-icon">
                  <i className={category.icon}></i>
                </div>
                <div className="category-info">
                  <h6>{category.name}</h6>
                  <p>{category.description}</p>
                  <span className="event-count">{category.eventCount} events</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="row">
        {isLoading ? (
          <div className="col-12">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading events...</p>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="bi bi-search text-muted" style={{fontSize: '3rem'}}></i>
                <h5 className="mt-3">No events found</h5>
                <p className="text-muted">Try adjusting your search or filters.</p>
              </div>
            </div>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="col-lg-6 col-xl-4 mb-4">
              <div className={`event-card ${event.id === highlightedEventId ? 'highlighted' : ''} ${event.isFeatured ? 'featured' : ''}`}>
                {event.isFeatured && (
                  <div className="featured-badge">
                    <i className="bi bi-star-fill"></i>
                    Featured
                  </div>
                )}
                
                <div className="event-header">
                  <div className="teams">
                    <div className="team away-team">
                      <span className="team-name">{event.awayTeam}</span>
                      <span className="rotation-number">#{event.rotationNumbers.away}</span>
                    </div>
                    <div className="vs-divider">
                      <span>@</span>
                    </div>
                    <div className="team home-team">
                      <span className="team-name">{event.homeTeam}</span>
                      <span className="rotation-number">#{event.rotationNumbers.home}</span>
                    </div>
                  </div>
                  
                  <div className="game-info">
                    <div className="league-time">
                      <span className="league">{event.league}</span>
                      <span className="game-time">{formatGameTime(event.gameTime)}</span>
                    </div>
                    {event.venue && (
                      <div className="venue">
                        <i className="bi bi-geo-alt"></i>
                        {event.venue}
                      </div>
                    )}
                  </div>
                </div>

                <div className="betting-options">
                  {/* Moneyline */}
                  <div className="bet-type">
                    <h6>Moneyline</h6>
                    <div className="bet-buttons">
                      <button
                        className="bet-btn"
                        onClick={() => handleAddToBetSlip(event, 'moneyline', event.odds.moneyline.away, `${event.awayTeam} ML`)}
                      >
                        <span className="team">{event.awayTeam}</span>
                        <span className="odds">{formatOdds(event.odds.moneyline.away)}</span>
                      </button>
                      <button
                        className="bet-btn"
                        onClick={() => handleAddToBetSlip(event, 'moneyline', event.odds.moneyline.home, `${event.homeTeam} ML`)}
                      >
                        <span className="team">{event.homeTeam}</span>
                        <span className="odds">{formatOdds(event.odds.moneyline.home)}</span>
                      </button>
                    </div>
                  </div>

                  {/* Spread */}
                  <div className="bet-type">
                    <h6>Point Spread</h6>
                    <div className="bet-buttons">
                      <button
                        className="bet-btn"
                        onClick={() => handleAddToBetSlip(event, 'spread', event.odds.spread.odds, `${event.awayTeam} ${formatOdds(event.odds.spread.away)}`)}
                      >
                        <span className="team">{event.awayTeam} {formatOdds(event.odds.spread.away)}</span>
                        <span className="odds">{formatOdds(event.odds.spread.odds)}</span>
                      </button>
                      <button
                        className="bet-btn"
                        onClick={() => handleAddToBetSlip(event, 'spread', event.odds.spread.odds, `${event.homeTeam} ${formatOdds(event.odds.spread.home)}`)}
                      >
                        <span className="team">{event.homeTeam} {formatOdds(event.odds.spread.home)}</span>
                        <span className="odds">{formatOdds(event.odds.spread.odds)}</span>
                      </button>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="bet-type">
                    <h6>Total Points</h6>
                    <div className="bet-buttons">
                      <button
                        className="bet-btn"
                        onClick={() => handleAddToBetSlip(event, 'total', event.odds.total.odds, `Over ${event.odds.total.over}`)}
                      >
                        <span className="team">Over {event.odds.total.over}</span>
                        <span className="odds">{formatOdds(event.odds.total.odds)}</span>
                      </button>
                      <button
                        className="bet-btn"
                        onClick={() => handleAddToBetSlip(event, 'total', event.odds.total.odds, `Under ${event.odds.total.under}`)}
                      >
                        <span className="team">Under {event.odds.total.under}</span>
                        <span className="odds">{formatOdds(event.odds.total.odds)}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {event.lastOddsUpdate && (
                  <div className="odds-update">
                    <i className="bi bi-clock"></i>
                    Updated {formatGameTime(event.lastOddsUpdate)} ago
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SportsPage;