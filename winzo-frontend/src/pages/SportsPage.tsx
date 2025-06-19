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
}

export const mockCategories: SportCategory[] = [
  { id: 'all', name: 'All Sports', icon: 'bi-trophy', eventCount: 28, isActive: false },
  { id: 'football', name: 'NFL', icon: 'bi-shield-check', eventCount: 12, isActive: false },
  { id: 'basketball', name: 'NBA', icon: 'bi-circle', eventCount: 8, isActive: false },
  { id: 'baseball', name: 'MLB', icon: 'bi-diamond', eventCount: 6, isActive: false },
  { id: 'hockey', name: 'NHL', icon: 'bi-snow', eventCount: 2, isActive: false },
  { id: 'soccer', name: 'Soccer', icon: 'bi-globe', eventCount: 15, isActive: false },
];

export const mockEvents: GameEvent[] = [
  {
    id: '1',
    homeTeam: 'Los Angeles Lakers',
    awayTeam: 'Golden State Warriors',
    gameTime: new Date(Date.now() + 3600000),
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
    gameTime: new Date(Date.now() + 7200000),
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
    gameTime: new Date(Date.now() + 5400000),
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
    gameTime: new Date(Date.now() + 10800000),
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
  },
  {
    id: '5',
    homeTeam: 'Tampa Bay Lightning',
    awayTeam: 'Boston Bruins',
    gameTime: new Date(Date.now() + 9000000),
    rotationNumbers: { home: '901', away: '902' },
    odds: {
      spread: { home: -1.5, away: 1.5, odds: -110 },
      total: { over: 6.5, under: 6.5, odds: -110 },
      moneyline: { home: -130, away: +110 }
    },
    sport: 'hockey',
    league: 'NHL',
    venue: 'Amalie Arena',
    status: 'upcoming',
    lastOddsUpdate: new Date()
  },
  {
    id: '6',
    homeTeam: 'Denver Nuggets',
    awayTeam: 'Phoenix Suns',
    gameTime: new Date(Date.now() + 12600000),
    rotationNumbers: { home: '503', away: '504' },
    odds: {
      spread: { home: -2.5, away: 2.5, odds: -110 },
      total: { over: 218.5, under: 218.5, odds: -110 },
      moneyline: { home: -125, away: +105 }
    },
    sport: 'basketball',
    league: 'NBA',
    venue: 'Ball Arena',
    status: 'upcoming',
    lastOddsUpdate: new Date()
  },
  {
    id: '7',
    homeTeam: 'Green Bay Packers',
    awayTeam: 'Chicago Bears',
    gameTime: new Date(Date.now() + 14400000),
    rotationNumbers: { home: '603', away: '604' },
    odds: {
      spread: { home: -4.5, away: 4.5, odds: -110 },
      total: { over: 42.5, under: 42.5, odds: -110 },
      moneyline: { home: -200, away: +170 }
    },
    sport: 'football',
    league: 'NFL',
    venue: 'Lambeau Field',
    status: 'upcoming',
    lastOddsUpdate: new Date()
  },
  {
    id: '8',
    homeTeam: 'Los Angeles Dodgers',
    awayTeam: 'San Francisco Giants',
    gameTime: new Date(Date.now() + 16200000),
    rotationNumbers: { home: '703', away: '704' },
    odds: {
      spread: { home: -1.5, away: 1.5, odds: -110 },
      total: { over: 7.5, under: 7.5, odds: -110 },
      moneyline: { home: -160, away: +140 }
    },
    sport: 'baseball',
    league: 'MLB',
    venue: 'Dodger Stadium',
    status: 'upcoming',
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

  const highlightedEventId = searchParams.get('highlight');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const updatedCategories = mockCategories.map(cat => ({
        ...cat,
        isActive: cat.id === selectedSport
      }));
      
      setCategories(updatedCategories);
      
      let filteredEvents = mockEvents;
      if (selectedSport !== 'all') {
        filteredEvents = mockEvents.filter(event => event.sport === selectedSport);
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
    } catch (err) {
      setError('Failed to load sports events. Please try again.');
      console.error('Error loading sports data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSport, searchTerm]);

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
    
    if (diffInHours < 24) {
      return gameTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return gameTime.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (error) {
    return (
      <div className="sports-page-error">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button className="btn btn-sm btn-outline-danger ms-3" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sports-page">
      {/* Header Controls */}
      <div className="sports-header">
        <div className="sports-nav">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`sport-tab ${category.isActive ? 'active' : ''}`}
              onClick={() => handleSportChange(category.id)}
            >
              <i className={category.icon}></i>
              <span>{category.name}</span>
              <span className="count">{category.eventCount}</span>
            </button>
          ))}
        </div>
        
        <div className="search-controls">
          <div className="search-input">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search teams, leagues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="refresh-btn" onClick={loadData} disabled={isLoading}>
            <i className={`bi bi-arrow-clockwise ${isLoading ? 'spin' : ''}`}></i>
          </button>
        </div>
      </div>

      {/* Betting Table */}
      <div className="betting-table-container">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-search"></i>
            <h5>No events found</h5>
            <p>Try adjusting your search or sport selection.</p>
          </div>
        ) : (
          <table className="betting-table">
            <thead>
              <tr>
                <th className="game-col">Game</th>
                <th className="spread-col">Spread</th>
                <th className="total-col">Total</th>
                <th className="moneyline-col">Moneyline</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className={`game-row ${event.id === highlightedEventId ? 'highlighted' : ''} ${event.isFeatured ? 'featured' : ''}`}>
                  <td className="game-cell">
                    <div className="game-info">
                      <div className="teams">
                        <div className="away-team">
                          <span className="team-name">{event.awayTeam}</span>
                          <span className="rotation">#{event.rotationNumbers.away}</span>
                        </div>
                        <div className="home-team">
                          <span className="team-name">{event.homeTeam}</span>
                          <span className="rotation">#{event.rotationNumbers.home}</span>
                        </div>
                      </div>
                      <div className="game-meta">
                        <span className="time">{formatGameTime(event.gameTime)}</span>
                        <span className="league">{event.league}</span>
                        {event.isFeatured && <span className="featured-badge">Featured</span>}
                      </div>
                    </div>
                  </td>
                  
                  <td className="spread-cell">
                    <div className="bet-options">
                      <button
                        className="bet-btn"
                        onClick={() => handleAddToBetSlip(event, 'spread', event.odds.spread.odds, `${event.awayTeam} ${formatOdds(event.odds.spread.away)}`)}
                      >
                        <span className="line">{formatOdds(event.odds.spread.away)}</span>
                        <span className="odds">{formatOdds(event.odds.spread.odds)}</span>
                      </button>
                      <button
                        className="bet-btn"
                        onClick={() => handleAddToBetSlip(event, 'spread', event.odds.spread.odds, `${event.homeTeam} ${formatOdds(event.odds.spread.home)}`)}
                      >
                        <span className="line">{formatOdds(event.odds.spread.home)}</span>
                        <span className="odds">{formatOdds(event.odds.spread.odds)}</span>
                      </button>
                    </div>
                  </td>
                  
                  <td className="total-cell">
                    <div className="bet-options">
                      <button
                        className="bet-btn"
                        onClick={() => handleAddToBetSlip(event, 'total', event.odds.total.odds, `Over ${event.odds.total.over}`)}
                      >
                        <span className="line">O {event.odds.total.over}</span>
                        <span className="odds">{formatOdds(event.odds.total.odds)}</span>
                      </button>
                      <button
                        className="bet-btn"
                        onClick={() => handleAddToBetSlip(event, 'total', event.odds.total.odds, `Under ${event.odds.total.under}`)}
                      >
                        <span className="line">U {event.odds.total.under}</span>
                        <span className="odds">{formatOdds(event.odds.total.odds)}</span>
                      </button>
                    </div>
                  </td>
                  
                  <td className="moneyline-cell">
                    <div className="bet-options">
                      <button
                        className="bet-btn"
                        onClick={() => handleAddToBetSlip(event, 'moneyline', event.odds.moneyline.away, `${event.awayTeam} ML`)}
                      >
                        <span className="odds">{formatOdds(event.odds.moneyline.away)}</span>
                      </button>
                      <button
                        className="bet-btn"
                        onClick={() => handleAddToBetSlip(event, 'moneyline', event.odds.moneyline.home, `${event.homeTeam} ML`)}
                      >
                        <span className="odds">{formatOdds(event.odds.moneyline.home)}</span>
                      </button>
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

export default SportsPage;