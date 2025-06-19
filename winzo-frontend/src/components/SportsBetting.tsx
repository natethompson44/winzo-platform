import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useBetSlip } from '../contexts/BetSlipContext';
import { 
  SportsIcon, 
  FireIcon,
  ClockIcon, 
  LiveIcon
} from './icons/IconLibrary';
import './SportsBetting.css';

interface Sport {
  id: string;
  name: string;
  icon: React.FC<any>;
  isLive: boolean;
  eventCount: number;
}

interface OddsEvent {
  id: string;
  sport_key: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
  timing: {
    date: string;
    time: string;
    hoursFromNow: number;
    isLive: boolean;
    isUpcoming: boolean;
  };
  featured: boolean;
  markets_count: number;
  live_score?: {
    home: number;
    away: number;
    period: string;
    time_remaining?: string;
  };
  odds_changes?: {
    home: number;
    away: number;
    draw?: number;
  };
  popularity_score?: number;
  confidence_level?: number;
}

interface Bookmaker {
  key: string;
  title: string;
  markets: Market[];
  last_update?: string;
}

interface Market {
  key: string;
  outcomes: Outcome[];
  last_update?: string;
}

interface Outcome {
  name: string;
  price: number;
  point?: number;
  is_winner?: boolean;
  odds_movement?: 'up' | 'down' | 'stable';
}

interface QuotaInfo {
  used: number;
  total: number;
  percentUsed: number;
}

const formatOdds = (price: number): string => {
  if (price > 0) {
    return `+${price}`;
  }
  return price.toString();
};

const SportsBetting: React.FC = () => {
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [events, setEvents] = useState<OddsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming'>('all');

  // Use global bet slip context
  const { addToBetSlip } = useBetSlip();
  const oddsUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  const handleSportSelect = (sportId: string) => {
    setSelectedSport(sportId);
    // Simulate loading events for the selected sport
    setTimeout(() => {
      // Loading simulation
    }, 1000);
  };

  const fetchOdds = useCallback(async (sportKey: string) => {
    try {
      setError('');
      // Mock API call - replace with actual API
      const mockEvents: OddsEvent[] = [
        {
          id: '1',
          sport_key: sportKey,
          commence_time: new Date(Date.now() + 3600000).toISOString(),
          home_team: 'Lakers',
          away_team: 'Warriors',
          bookmakers: [{
            key: 'mock',
            title: 'Mock Bookmaker',
            markets: [{
              key: 'h2h',
              outcomes: [
                { name: 'Lakers', price: -110 },
                { name: 'Warriors', price: -110 }
              ]
            }]
          }],
          timing: {
            date: new Date().toDateString(),
            time: '8:00 PM',
            hoursFromNow: 1,
            isLive: false,
            isUpcoming: true
          },
          featured: true,
          markets_count: 1
        }
      ];
      
      setEvents(mockEvents);
      setQuotaInfo({ used: 50, total: 100, percentUsed: 50 });
    } catch (error: any) {
      console.error('Error fetching odds:', error);
      setError(error.message || 'Failed to load odds');
      setEvents([]);
    }
  }, []);

  const updateLiveOdds = useCallback(async () => {
    if (selectedSport && filter === 'live') {
      try {
        // Mock live odds update
        console.log('Updating live odds...');
      } catch (error) {
        console.error('Error updating live odds:', error);
      }
    }
  }, [selectedSport, filter]);

  const handleOddsClick = (event: OddsEvent, outcome: Outcome, marketType: string = 'h2h') => {
    // Map market types to standardized values
    const marketTypeMap: Record<string, 'h2h' | 'spreads' | 'totals' | 'player_props' | 'team_props'> = {
      'h2h': 'h2h',
      'spreads': 'spreads',
      'totals': 'totals',
      'player_props': 'player_props',
      'team_props': 'team_props'
    };

    const bookmaker = event.bookmakers?.[0];
    const betItem = {
      eventId: event.id,
      sport: event.sport_key,
      homeTeam: event.home_team,
      awayTeam: event.away_team,
      selectedTeam: outcome.name,
      odds: outcome.price,
      bookmaker: bookmaker?.title || 'Unknown',
      marketType: marketTypeMap[marketType] || 'h2h',
      commenceTime: event.commence_time,
    };
    
    addToBetSlip(betItem);
  };

  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events.filter(event => {
      const matchesFilter = filter === 'all' || 
        (filter === 'live' && event.timing?.isLive) ||
        (filter === 'upcoming' && !event.timing?.isLive);
      
      return matchesFilter;
    });

    // Sort events
    filtered.sort((a, b) => {
      let comparison = 0;
      
      comparison = new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime();
      
      return comparison;
    });

    return filtered;
  }, [events, filter]);

  useEffect(() => {
    if (selectedSport) {
      fetchOdds(selectedSport);
    }
  }, [selectedSport, fetchOdds]);

  useEffect(() => {
    // Set up real-time odds updates for live events
    if (filter === 'live') {
      oddsUpdateInterval.current = setInterval(updateLiveOdds, 15000); // Update every 15 seconds
    } else {
      if (oddsUpdateInterval.current) {
        clearInterval(oddsUpdateInterval.current);
      }
    }

    return () => {
      if (oddsUpdateInterval.current) {
        clearInterval(oddsUpdateInterval.current);
      }
    };
  }, [filter, updateLiveOdds]);

  // Mock sports data
  useEffect(() => {
    const mockSports: Sport[] = [
      {
        id: 'basketball_nba',
        name: 'NBA Basketball',
        icon: SportsIcon,
        isLive: true,
        eventCount: 12
      },
      {
        id: 'americanfootball_nfl',
        name: 'NFL Football',
        icon: SportsIcon,
        isLive: false,
        eventCount: 8
      },
      {
        id: 'soccer_epl',
        name: 'Premier League',
        icon: SportsIcon,
        isLive: true,
        eventCount: 15
      }
    ];
    setSports(mockSports);
    setLoading(false);
  }, []);

  if (error) {
    return (
      <div className="error-banner">
        <p>{error}</p>
        <button onClick={() => setError(null)} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="sports-betting-container">
      <header className="sports-header">
        <h1><SportsIcon size="lg" /> Sports Betting</h1>
        <p>Real-time odds and live betting</p>
        {quotaInfo && (
          <div className="quota-info">
            <div className="quota-bar">
              <div 
                className="quota-fill" 
                style={{ width: `${quotaInfo.percentUsed}%` }}
              ></div>
            </div>
            <span className="quota-text">
              API Quota: {quotaInfo.used}/{quotaInfo.total} ({quotaInfo.percentUsed}%)
            </span>
          </div>
        )}
      </header>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading events...</p>
        </div>
      ) : (
        <div className="sports-grid">
          {sports.map((sport) => {
            const Icon = sport.icon;
            return (
              <button
                key={sport.id}
                className={`sport-card ${selectedSport === sport.id ? 'selected' : ''}`}
                onClick={() => handleSportSelect(sport.id)}
              >
                <div className="sport-icon">
                  <Icon size="lg" color="primary" className="sport-icon-svg" />
                  {sport.isLive && (
                    <div className="live-indicator">
                      <LiveIcon size="sm" color="danger" />
                      <span>LIVE</span>
                    </div>
                  )}
                </div>
                <h3>{sport.name}</h3>
                <p className="event-count">{sport.eventCount} Events</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Controls */}
      <div className="controls-section">
        <div className="filter-controls">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Events ({events.length})
            </button>
            <button
              className={`filter-btn ${filter === 'live' ? 'active' : ''}`}
              onClick={() => setFilter('live')}
            >
              <FireIcon size="sm" /> Live ({events.filter(e => e.timing?.isLive).length})
            </button>
            <button
              className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
              onClick={() => setFilter('upcoming')}
            >
              <ClockIcon size="sm" /> Upcoming ({events.filter(e => !e.timing?.isLive).length})
            </button>
          </div>
        </div>
      </div>

      {/* Events List */}
      {selectedSport && events.length > 0 && (
        <div className="events-section">
          <h2>{selectedSport} Events</h2>
          <div className="events-grid">
            {filteredAndSortedEvents.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-header">
                  <h3>{event.home_team} vs {event.away_team}</h3>
                  <span className="event-time">{event.timing?.time}</span>
                </div>
                <div className="odds-section">
                  {event.bookmakers.map((bookmaker) => (
                    <div key={bookmaker.key} className="bookmaker-odds">
                      <h4>{bookmaker.title}</h4>
                      <div className="odds-grid">
                        {bookmaker.markets.map((market) => (
                          <div key={market.key} className="market-odds">
                            <h5>{market.key}</h5>
                            <div className="odds-buttons">
                              {market.outcomes.map((outcome) => (
                                <button
                                  key={outcome.name}
                                  className="odds-button"
                                  onClick={() => handleOddsClick(event, outcome, market.key)}
                                >
                                  <span className="team-name">{outcome.name}</span>
                                  <span className="odds-value">{formatOdds(outcome.price)}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {selectedSport && events.length === 0 && !loading && (
        <div className="empty-state">
          <p>No events available for {selectedSport} at the moment.</p>
          <p>Please check back later or try another sport.</p>
        </div>
      )}
    </div>
  );
};

export default SportsBetting;
