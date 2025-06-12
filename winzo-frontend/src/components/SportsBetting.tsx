import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../utils/axios';
import { API_ENDPOINTS, handleApiError } from '../config/api';
import { useBetSlip } from '../contexts/BetSlipContext';
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
}

interface Bookmaker {
  key: string;
  title: string;
  markets: Market[];
}

interface Market {
  key: string;
  outcomes: Outcome[];
}

interface Outcome {
  name: string;
  price: number;
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

const formatOdds = (price: number): string => {
  if (price > 0) {
    return `+${price}`;
  }
  return price.toString();
};

const SportsBetting: React.FC = () => {
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [events, setEvents] = useState<OddsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [quotaInfo, setQuotaInfo] = useState<any>(null);

  const { addToBetSlip } = useBetSlip();

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
        API_ENDPOINTS.SPORT_ODDS(sportKey) + '?limit=20'
      );
      if (response.data.success) {
        setEvents(response.data.data);
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
  }, []);

  useEffect(() => {
    fetchSports();
  }, [fetchSports]);

  useEffect(() => {
    if (selectedSport) {
      fetchOdds(selectedSport);
    }
  }, [selectedSport, fetchOdds]);

  const handleSportSelect = (sportKey: string) => {
    setSelectedSport(sportKey);
    setEvents([]);
  };

  const handleOddsClick = (event: OddsEvent, outcome: Outcome) => {
    const bookmaker = event.bookmakers?.[0];
    addToBetSlip({
      eventId: event.id,
      sport: event.sport_key,
      homeTeam: event.home_team,
      awayTeam: event.away_team,
      selectedTeam: outcome.name,
      odds: outcome.price,
      bookmaker: bookmaker?.title || 'Unknown',
      marketType: 'h2h',
      commenceTime: event.commence_time,
    });
  };

  if (loading) {
    return (
      <div className="sports-betting-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading sports data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sports-betting-container">
      <header className="sports-header">
        <h1>Sports Betting</h1>
        <p>Live odds from top sportsbooks</p>
        {quotaInfo && (
          <div className="quota-info">
            <small>
              API Usage: {quotaInfo.used}/{quotaInfo.total} ({quotaInfo.percentUsed}%)
            </small>
          </div>
        )}
      </header>
      {error && (
        <div className="error-banner">
          <span>⚠ {error}</span>
          <button onClick={() => window.location.reload()} className="retry-button">
            Retry
          </button>
        </div>
      )}
      <div className="sports-navigation">
        <h2>Choose Your Sport</h2>
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
      {selectedSport && (
        <div className="events-section">
          <div className="events-header">
            <h2>Live Odds - {sports.find((s) => s.key === selectedSport)?.title}</h2>
            <button
              onClick={() => fetchOdds(selectedSport)}
              className="refresh-button"
              disabled={eventsLoading}
            >
              Refresh
            </button>
          </div>
          {eventsLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading odds...</p>
            </div>
          ) : events.length > 0 ? (
            <div className="events-grid">
              {events.map((event) => (
                <EventCard key={event.id} event={event} onOddsClick={handleOddsClick} />
              ))}
            </div>
          ) : (
            <div className="no-events">
              <div className="no-events-icon"></div>
              <h3>No upcoming events</h3>
              <p>Check back later for new games in this sport.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface SportCardProps {
  sport: Sport;
  isSelected: boolean;
  onClick: () => void;
}

const SportCard: React.FC<SportCardProps> = ({ sport, isSelected, onClick }) => {
  return (
    <div className={`sport-card ${isSelected ? 'selected' : ''}`} onClick={onClick}>
      <div className="sport-icon">{sport.icon}</div>
      <h3>{sport.title}</h3>
      <p className="sport-category">{sport.category}</p>
      <div className="sport-status">
        <span className="live-indicator">Live</span>
        <span className="popularity">★ {sport.popularity}/10</span>
      </div>
    </div>
  );
};

interface EventCardProps {
  event: OddsEvent;
  onOddsClick: (event: OddsEvent, outcome: Outcome) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onOddsClick }) => {
  const primaryBookmaker = event.bookmakers?.[0];
  const h2hMarket = primaryBookmaker?.markets?.find((m) => m.key === 'h2h');

  const getEventStatus = () => {
    if (event.timing.isLive) {
      return <span className="status-live">LIVE</span>;
    } else if (event.timing.hoursFromNow <= 24) {
      return <span className="status-soon">{event.timing.hoursFromNow}h</span>;
    } else {
      return <span className="status-scheduled">{event.timing.date}</span>;
    }
  };

  return (
    <div className="event-card">
      <div className="event-header">
        <div className="teams">
          <div className="away-team">{event.away_team}</div>
          <div className="vs">@</div>
          <div className="home-team">{event.home_team}</div>
        </div>
        <div className="event-meta">
          <div className="event-time">{event.timing.time}</div>
          {getEventStatus()}
        </div>
      </div>
      {event.featured && <div className="featured-badge">Featured</div>}
      {h2hMarket ? (
        <div className="odds-section">
          <div className="bookmaker-info">
            <span className="bookmaker-name">{primaryBookmaker.title}</span>
            <span className="markets-count">{event.markets_count} markets</span>
          </div>
          <div className="odds-grid">
            {h2hMarket.outcomes.map((outcome) => (
              <button
                key={outcome.name}
                className="odds-button"
                onClick={() => onOddsClick(event, outcome)}
              >
                <div className="team-name">{outcome.name}</div>
                <div className="odds-value">{formatOdds(outcome.price)}</div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="no-odds">
          <p>Odds not available</p>
        </div>
      )}
    </div>
  );
};

export default SportsBetting;
