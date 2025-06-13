import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import apiClient from '../utils/axios';
import { API_ENDPOINTS, handleApiError } from '../config/api';
import { useBetSlip } from '../contexts/BetSlipContext';
import { formatCurrency } from '../utils/numberUtils';
import './SportsBetting.css';

interface Sport {
  key: string;
  title: string;
  group: string;
  description: string;
  active: boolean;
  has_outrights: boolean;
  icon: string;
  category: string;
  popularity: number;
  live_events_count?: number;
  upcoming_events_count?: number;
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

interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  error?: string;
  message?: string;
  quota?: {
    used: number;
    remaining: number;
    total: number;
    percentUsed: number;
  };
}

interface BetSlipSummary {
  totalBets: number;
  totalStake: number;
  potentialPayout: number;
  averageOdds: number;
  confidence: number;
}

const formatOdds = (price: number): string => {
  if (price > 0) {
    return `+${price}`;
  }
  return price.toString();
};

const calculatePayout = (stake: number, odds: number): number => {
  if (odds > 0) {
    return stake + (stake * odds / 100);
  } else {
    return stake + (stake * 100 / Math.abs(odds));
  }
};

const getOddsMovementColor = (movement?: string): string => {
  switch (movement) {
    case 'up': return '#48bb78';
    case 'down': return '#e53e3e';
    default: return '#a0aec0';
  }
};

const getOddsMovementIcon = (movement?: string): string => {
  switch (movement) {
    case 'up': return '↗️';
    case 'down': return '↘️';
    default: return '➡️';
  }
};

const SportsBetting: React.FC = () => {
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [events, setEvents] = useState<OddsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [quotaInfo, setQuotaInfo] = useState<any>(null);
  const [liveEvents, setLiveEvents] = useState<OddsEvent[]>([]);
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'time' | 'popularity' | 'odds' | 'confidence'>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedMarket, setSelectedMarket] = useState<string>('h2h');
  const [showBetSlip, setShowBetSlip] = useState(false);
  const [betSlipStake, setBetSlipStake] = useState<string>('');
  const [betSlipSummary, setBetSlipSummary] = useState<BetSlipSummary>({
    totalBets: 0,
    totalStake: 0,
    potentialPayout: 0,
    averageOdds: 0,
    confidence: 0
  });
  
  const { addToBetSlip, removeFromBetSlip, betSlipItems, clearBetSlip } = useBetSlip();
  const oddsUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchSports = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.get<ApiResponse<Sport[]>>(API_ENDPOINTS.SPORTS);
      if (response.data.success) {
        const sportsData = response.data.data;
        setSports(sportsData);
        setQuotaInfo(response.data.quota);
        const popularSports = ['americanfootball_nfl', 'basketball_nba', 'baseball_mlb', 'icehockey_nhl'];
        const defaultSport = sportsData.find((sport: Sport) =>
          popularSports.includes(sport.key) && sport.active
        );
        if (defaultSport) {
          setSelectedSport(defaultSport.key);
        } else if (sportsData.length > 0) {
          setSelectedSport(sportsData[0].key);
        }
      } else {
        setError(response.data.error || 'Failed to load sports');
      }
    } catch (error: any) {
      console.error('Error fetching sports:', error);
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOdds = useCallback(async (sportKey: string) => {
    try {
      setEventsLoading(true);
      setError('');
      const response = await apiClient.get<ApiResponse<OddsEvent[]>>(
        API_ENDPOINTS.SPORT_ODDS(sportKey) + '?limit=100&markets=' + selectedMarket
      );
      if (response.data.success) {
        const eventsData = response.data.data;
        setEvents(eventsData);
        setLiveEvents(eventsData.filter(event => event.timing?.isLive));
        setQuotaInfo(response.data.quota);
      } else {
        setError(response.data.error || 'Failed to load odds');
        setEvents([]);
      }
    } catch (error: any) {
      console.error('Error fetching odds:', error);
      setError(handleApiError(error));
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  }, [selectedMarket]);

  const updateLiveOdds = useCallback(async () => {
    if (selectedSport && (filter === 'live' || liveEvents.length > 0)) {
      try {
        const response = await apiClient.get<ApiResponse<OddsEvent[]>>(
          API_ENDPOINTS.SPORT_ODDS(selectedSport) + '?live=true&limit=50&markets=' + selectedMarket
        );
        if (response.data.success) {
          const newLiveEvents = response.data.data;
          setLiveEvents(newLiveEvents);
          
          // Update events with live data
          setEvents(prevEvents => 
            prevEvents.map(event => {
              const liveEvent = newLiveEvents.find(le => le.id === event.id);
              return liveEvent || event;
            })
          );
        }
      } catch (error) {
        console.error('Error updating live odds:', error);
      }
    }
  }, [selectedSport, filter, liveEvents.length, selectedMarket]);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      // Trigger search with debounce
    }, 300);
  }, []);

  const handleOddsClick = (event: OddsEvent, outcome: Outcome, marketType: string = 'h2h') => {
    const bookmaker = event.bookmakers?.[0];
    const betItem = {
      eventId: event.id,
      sport: event.sport_key,
      homeTeam: event.home_team,
      awayTeam: event.away_team,
      selectedTeam: outcome.name,
      odds: outcome.price,
      bookmaker: bookmaker?.title || 'Unknown',
      marketType: marketType,
      commenceTime: event.commence_time,
    };
    
    addToBetSlip(betItem);
    updateBetSlipSummary();
  };

  const updateBetSlipSummary = useCallback(() => {
    const totalBets = betSlipItems.length;
    const totalStake = betSlipItems.reduce((sum: number, item: any) => sum + (item.stake || 0), 0);
    const averageOdds = betSlipItems.length > 0 ? betSlipItems.reduce((sum: number, item: any) => sum + item.odds, 0) / betSlipItems.length : 0;
    const confidence = betSlipItems.length > 0 ? betSlipItems.reduce((sum: number, item: any) => sum + (item.confidence || 0), 0) / betSlipItems.length : 0;
    
    let potentialPayout = 0;
    if (totalStake > 0 && averageOdds > 0) {
      potentialPayout = calculatePayout(totalStake, averageOdds);
    }
    
    setBetSlipSummary({
      totalBets,
      totalStake,
      potentialPayout,
      averageOdds,
      confidence
    });
  }, [betSlipItems]);

  const handleStakeChange = (value: string) => {
    setBetSlipStake(value);
    const stake = parseFloat(value) || 0;
    
    // Update bet slip items with new stake distribution
    betSlipItems.forEach((item: any) => {
      item.stake = stake / betSlipItems.length;
      item.potentialPayout = calculatePayout(item.stake, item.odds);
    });
    
    updateBetSlipSummary();
  };

  const placeBet = async () => {
    const stake = parseFloat(betSlipStake);
    if (stake <= 0 || betSlipSummary.totalBets === 0) {
      alert('Please enter a valid stake and add selections to your bet slip');
      return;
    }

    try {
      const betData = {
        bets: betSlipItems.map((item: any) => ({
          event_id: item.eventId,
          selection: item.selectedTeam,
          odds: item.odds,
          stake: item.stake,
          market_type: item.marketType
        })),
        total_stake: stake
      };

      const response = await apiClient.post(API_ENDPOINTS.PLACE_BET, betData);
      
      if (response.data.success) {
        alert('Bet placed successfully!');
        clearBetSlip();
        setBetSlipStake('');
        setShowBetSlip(false);
        updateBetSlipSummary();
      } else {
        alert(response.data.error || 'Failed to place bet');
      }
    } catch (error: any) {
      alert(handleApiError(error));
    }
  };

  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events.filter(event => {
      const matchesSearch = searchTerm === '' || 
        event.home_team.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.away_team.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filter === 'all' || 
        (filter === 'live' && event.timing?.isLive) ||
        (filter === 'upcoming' && !event.timing?.isLive);
      
      return matchesSearch && matchesFilter;
    });

    // Sort events
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'time':
          comparison = new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime();
          break;
        case 'popularity':
          comparison = (b.popularity_score || 0) - (a.popularity_score || 0);
          break;
        case 'odds':
          const aOdds = a.bookmakers?.[0]?.markets?.[0]?.outcomes?.[0]?.price || 0;
          const bOdds = b.bookmakers?.[0]?.markets?.[0]?.outcomes?.[0]?.price || 0;
          comparison = aOdds - bOdds;
          break;
        case 'confidence':
          comparison = (b.confidence_level || 0) - (a.confidence_level || 0);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [events, searchTerm, filter, sortBy, sortOrder]);

  useEffect(() => {
    fetchSports();
  }, [fetchSports]);

  useEffect(() => {
    if (selectedSport) {
      fetchOdds(selectedSport);
    }
  }, [selectedSport, fetchOdds]);

  useEffect(() => {
    // Set up real-time odds updates for live events
    if (filter === 'live' || liveEvents.length > 0) {
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
  }, [filter, liveEvents.length, updateLiveOdds]);

  useEffect(() => {
    updateBetSlipSummary();
  }, [updateBetSlipSummary]);

  const handleSportSelect = (sportKey: string) => {
    setSelectedSport(sportKey);
    setEvents([]);
    setLiveEvents([]);
    setFilter('all');
  };

  const getEventStatus = (event: OddsEvent) => {
    if (event.timing?.isLive) {
      return {
        status: 'live',
        text: 'LIVE',
        color: '#e53e3e',
        icon: '🔥'
      };
    } else if (event.timing?.hoursFromNow <= 1) {
      return {
        status: 'starting-soon',
        text: 'Starting Soon',
        color: '#ed8936',
        icon: '⏰'
      };
    } else if (event.timing?.hoursFromNow <= 24) {
      return {
        status: 'today',
        text: 'Today',
        color: '#48bb78',
        icon: '📅'
      };
    } else {
      return {
        status: 'upcoming',
        text: 'Upcoming',
        color: '#a0aec0',
        icon: '📆'
      };
    }
  };

  if (loading) {
    return (
      <div className="sports-betting-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading sports and odds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sports-betting-container">
      <header className="sports-header">
        <h1>🏈 Sports Betting</h1>
        <p>Real-time odds and live betting</p>
      </header>

      {error && (
        <div className="error-banner">
          <span>⚠ {error}</span>
          <button onClick={() => fetchOdds(selectedSport)} className="retry-button">
            Retry
          </button>
        </div>
      )}

      <div className="sports-content">
        {/* Sports Selection */}
        <div className="sports-selection">
          <div className="sports-grid">
            {sports.map((sport) => (
              <SportCard
                key={sport.key}
                sport={sport}
                isSelected={selectedSport === sport.key}
                onClick={() => handleSportSelect(sport.key)}
              />
            ))}
          </div>
        </div>

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
                🔥 Live ({liveEvents.length})
              </button>
              <button
                className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
                onClick={() => setFilter('upcoming')}
              >
                ⏰ Upcoming ({events.filter(e => !e.timing?.isLive).length})
              </button>
            </div>
          </div>

          <div className="search-sort-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>

            <div className="sort-controls">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="sort-select"
              >
                <option value="time">Time</option>
                <option value="popularity">Popularity</option>
                <option value="odds">Best Odds</option>
                <option value="confidence">Confidence</option>
              </select>
              <button
                className="sort-order-btn"
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>

            <div className="market-selector">
              <select
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
                className="market-select"
              >
                <option value="h2h">Head to Head</option>
                <option value="spreads">Spreads</option>
                <option value="totals">Totals</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="events-section">
          {eventsLoading ? (
            <div className="loading-events">
              <div className="loading-spinner"></div>
              <p>Loading events...</p>
            </div>
          ) : (
            <div className="events-grid">
              {filteredAndSortedEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onOddsClick={handleOddsClick}
                  getEventStatus={getEventStatus}
                />
              ))}
            </div>
          )}

          {filteredAndSortedEvents.length === 0 && !eventsLoading && (
            <div className="no-events">
              <p>No events found matching your criteria</p>
              <button onClick={() => setFilter('all')} className="reset-filters-btn">
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* Bet Slip */}
        {showBetSlip && (
          <div className="bet-slip-overlay">
            <div className="bet-slip-modal">
              <div className="bet-slip-header">
                <h3>📋 Bet Slip</h3>
                <button onClick={() => setShowBetSlip(false)} className="close-btn">×</button>
              </div>
              
              <div className="bet-slip-content">
                {betSlipItems.length > 0 ? (
                  <>
                    <div className="bet-slip-items">
                      {betSlipItems.map((item, index) => (
                        <div key={index} className="bet-slip-item">
                          <div className="item-header">
                            <span className="item-teams">{item.awayTeam} @ {item.homeTeam}</span>
                            <button 
                              onClick={() => removeFromBetSlip(item.id)}
                              className="remove-btn"
                            >
                              ×
                            </button>
                          </div>
                          <div className="item-selection">
                            {item.selectedTeam} @ {formatOdds(item.odds)}
                          </div>
                          <div className="item-stake">
                            Stake: {formatCurrency(item.stake || 0)}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bet-slip-summary">
                      <div className="summary-row">
                        <span>Total Bets:</span>
                        <span>{betSlipSummary.totalBets}</span>
                      </div>
                      <div className="summary-row">
                        <span>Average Odds:</span>
                        <span>{betSlipSummary.averageOdds.toFixed(2)}</span>
                      </div>
                      <div className="summary-row">
                        <span>Confidence:</span>
                        <span>{(betSlipSummary.confidence * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                    
                    <div className="stake-input">
                      <label>Total Stake:</label>
                      <input
                        type="number"
                        value={betSlipStake}
                        onChange={(e) => handleStakeChange(e.target.value)}
                        placeholder="Enter stake amount"
                        min="0"
                        step="0.01"
                        className="stake-input-field"
                      />
                    </div>
                    
                    <div className="potential-payout">
                      <span>Potential Payout:</span>
                      <span className="payout-amount">{formatCurrency(betSlipSummary.potentialPayout)}</span>
                    </div>
                    
                    <div className="bet-slip-actions">
                      <button onClick={placeBet} className="place-bet-btn">
                        Place Bet
                      </button>
                      <button onClick={clearBetSlip} className="clear-bet-btn">
                        Clear All
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="empty-bet-slip">
                    <p>No selections in bet slip</p>
                    <p>Click on odds to add selections</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Floating Bet Slip Toggle */}
        <button
          className="bet-slip-toggle"
          onClick={() => setShowBetSlip(!showBetSlip)}
        >
          📋 Bet Slip ({betSlipItems.length})
        </button>
      </div>

      {/* Quota Info */}
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
    </div>
  );
};

// Sport Card Component
interface SportCardProps {
  sport: Sport;
  isSelected: boolean;
  onClick: () => void;
}

const SportCard: React.FC<SportCardProps> = ({ sport, isSelected, onClick }) => {
  return (
    <div
      className={`sport-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="sport-icon">{sport.icon}</div>
      <div className="sport-info">
        <h3>{sport.title}</h3>
        <p>{sport.description}</p>
        {sport.live_events_count !== undefined && (
          <div className="sport-stats">
            <span className="live-count">🔥 {sport.live_events_count} live</span>
            <span className="upcoming-count">⏰ {sport.upcoming_events_count} upcoming</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Event Card Component
interface EventCardProps {
  event: OddsEvent;
  onOddsClick: (event: OddsEvent, outcome: Outcome, marketType?: string) => void;
  getEventStatus: (event: OddsEvent) => { status: string; text: string; color: string; icon: string };
}

const EventCard: React.FC<EventCardProps> = ({ event, onOddsClick, getEventStatus }) => {
  const status = getEventStatus(event);
  const bookmaker = event.bookmakers?.[0];
  const market = bookmaker?.markets?.find(m => m.key === 'h2h');

  return (
    <div className="event-card">
      <div className="event-header">
        <div className="event-status">
          <span 
            className="status-badge"
            style={{ color: status.color }}
          >
            {status.icon} {status.text}
          </span>
        </div>
        <div className="event-time">
          {event.timing?.time}
        </div>
      </div>

      <div className="event-teams">
        <div className="team away-team">
          <span className="team-name">{event.away_team}</span>
          {event.live_score && (
            <span className="team-score">{event.live_score.away}</span>
          )}
        </div>
        <div className="vs-separator">vs</div>
        <div className="team home-team">
          <span className="team-name">{event.home_team}</span>
          {event.live_score && (
            <span className="team-score">{event.live_score.home}</span>
          )}
        </div>
      </div>

      {event.live_score && (
        <div className="live-info">
          <span className="period">{event.live_score.period}</span>
          {event.live_score.time_remaining && (
            <span className="time-remaining">{event.live_score.time_remaining}</span>
          )}
        </div>
      )}

      <div className="odds-section">
        {market?.outcomes.map((outcome, index) => (
          <button
            key={index}
            className="odds-button"
            onClick={() => onOddsClick(event, outcome, market.key)}
          >
            <div className="odds-content">
              <span className="outcome-name">{outcome.name}</span>
              <span className="odds-value">{formatOdds(outcome.price)}</span>
              {outcome.odds_movement && (
                <span 
                  className="odds-movement"
                  style={{ color: getOddsMovementColor(outcome.odds_movement) }}
                >
                  {getOddsMovementIcon(outcome.odds_movement)}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {event.confidence_level && (
        <div className="confidence-indicator">
          <div className="confidence-bar">
            <div 
              className="confidence-fill" 
              style={{ width: `${event.confidence_level * 100}%` }}
            ></div>
          </div>
          <span className="confidence-text">
            Confidence: {(event.confidence_level * 100).toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default SportsBetting;
