import React, { useState, useEffect } from 'react';
import { APIError, WinzoLoading, EmptyState } from './ErrorBoundary';
import BetSlip from './BetSlip';
import './SportsBetting.css';

interface Sport {
  key: string;
  title: string;
  description: string;
  active: boolean;
}

interface SportsEvent {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: any[];
}

interface BetSlipItem {
  id: string;
  eventId: string;
  oddsId: string;
  event: string;
  market: string;
  outcome: string;
  odds: string;
  decimalOdds: number;
  sport: string;
}

/**
 * Enhanced SportsBetting Component with Error Handling and Fallback Data
 * 
 * Provides sports betting interface with graceful degradation when API fails.
 * Includes mock data for development and offline scenarios.
 */
const SportsBetting: React.FC = () => {
  const [sports, setSports] = useState<Sport[]>([]);
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  // Simple bet slip state
  const [betSlipItems, setBetSlipItems] = useState<BetSlipItem[]>([]);
  const [isBetSlipOpen, setIsBetSlipOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(100);

  // Mock data for fallback when API fails
  const mockSports: Sport[] = [
    {
      key: 'americanfootball_nfl',
      title: 'NFL',
      description: 'National Football League - America\'s favorite sport!',
      active: true
    },
    {
      key: 'basketball_nba',
      title: 'NBA',
      description: 'National Basketball Association - High-flying action!',
      active: true
    },
    {
      key: 'baseball_mlb',
      title: 'MLB',
      description: 'Major League Baseball - America\'s pastime!',
      active: true
    },
    {
      key: 'soccer_epl',
      title: 'Premier League',
      description: 'English Premier League - The world\'s most popular league!',
      active: true
    }
  ];

  const mockEvents: SportsEvent[] = [
    {
      id: 'mock-1',
      sport_key: 'americanfootball_nfl',
      sport_title: 'NFL',
      commence_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      home_team: 'Kansas City Chiefs',
      away_team: 'Buffalo Bills',
      bookmakers: [
        {
          key: 'draftkings',
          title: 'DraftKings',
          markets: [
            {
              key: 'h2h',
              outcomes: [
                { name: 'Kansas City Chiefs', price: 1.85 },
                { name: 'Buffalo Bills', price: 1.95 }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'mock-2',
      sport_key: 'basketball_nba',
      sport_title: 'NBA',
      commence_time: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
      home_team: 'Los Angeles Lakers',
      away_team: 'Boston Celtics',
      bookmakers: [
        {
          key: 'fanduel',
          title: 'FanDuel',
          markets: [
            {
              key: 'h2h',
              outcomes: [
                { name: 'Los Angeles Lakers', price: 2.10 },
                { name: 'Boston Celtics', price: 1.75 }
              ]
            }
          ]
        }
      ]
    }
  ];

  const fetchSports = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/sports', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setSports(data.sports || []);
      
      // If no sports data, use mock data
      if (!data.sports || data.sports.length === 0) {
        console.log('No API sports data, using mock data');
        setSports(mockSports);
      }
      
    } catch (err) {
      console.error('Sports API error:', err);
      setError('Failed to load sports data');
      
      // Use mock data as fallback
      setSports(mockSports);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async (sportKey: string) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/sports/${sportKey}/events`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setEvents(data.events || []);
      
      // If no events data, use mock data
      if (!data.events || data.events.length === 0) {
        console.log('No API events data, using mock data');
        const mockEventsForSport = mockEvents.filter(event => event.sport_key === sportKey);
        setEvents(mockEventsForSport);
      }
      
    } catch (err) {
      console.error('Events API error:', err);
      setError('Failed to load events data');
      
      // Use mock data as fallback
      const mockEventsForSport = mockEvents.filter(event => event.sport_key === sportKey);
      setEvents(mockEventsForSport);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    if (selectedSport) {
      fetchEvents(selectedSport);
    } else {
      fetchSports();
    }
  };

  const handleSportSelect = (sportKey: string) => {
    setSelectedSport(sportKey);
    fetchEvents(sportKey);
  };

  const handleBackToSports = () => {
    setSelectedSport('');
    setEvents([]);
    setError('');
  };

  // Basic bet slip helpers
  const addToBetSlip = (
    eventId: string,
    oddsId: string,
    event: string,
    market: string,
    outcome: string,
    odds: string,
    decimalOdds: number,
    sport: string
  ) => {
    const betId = `${eventId}-${oddsId}`;
    if (betSlipItems.find(b => b.id === betId)) {
      setIsBetSlipOpen(true);
      return;
    }
    const newBet: BetSlipItem = {
      id: betId,
      eventId,
      oddsId,
      event,
      market,
      outcome,
      odds,
      decimalOdds,
      sport
    };
    setBetSlipItems(prev => [...prev, newBet]);
    setIsBetSlipOpen(true);
  };

  const removeBetFromSlip = (betId: string) => {
    setBetSlipItems(prev => prev.filter(b => b.id !== betId));
  };

  const clearBetSlip = () => setBetSlipItems([]);

  const placeBets = async (
    bets: BetSlipItem[],
    amounts: { [key: string]: number }
  ) => {
    alert('Bet placement flow available in the enhanced version.');
    setIsBetSlipOpen(false);
    clearBetSlip();
  };

  const fetchWalletBalance = async () => {
    try {
      const response = await fetch('/api/wallet/balance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setWalletBalance(data.data?.balance || 0);
      }
    } catch (err) {
      console.error('Wallet balance error:', err);
    }
  };

  useEffect(() => {
    fetchSports();
    fetchWalletBalance();
  }, [retryCount]);

  if (loading && sports.length === 0) {
    return <WinzoLoading message="Loading your Big Win opportunities..." size="large" />;
  }

  if (error && sports.length === 0) {
    return (
      <APIError 
        message={error}
        onRetry={handleRetry}
        showHomeButton={true}
      />
    );
  }

  return (
    <div className="sports-betting-container">
      <div className="sports-betting-header">
        <h1>🎯 Sports Betting</h1>
        <p className="header-subtitle">Big Win Energy Activated!</p>
        
        {error && (
          <div className="api-warning">
            <span>⚠️ Using demo data - API connection issues</span>
            <button onClick={handleRetry} className="retry-small-btn">
              🔄 Retry
            </button>
          </div>
        )}
      </div>

      {!selectedSport ? (
        <div className="sports-selection">
          <h2>Choose Your Sport</h2>
          
          {sports.length === 0 ? (
            <EmptyState
              icon="🏈"
              title="No Sports Available"
              message="We're working on bringing you the best betting opportunities. Check back soon!"
              actionText="Refresh"
              onAction={handleRetry}
            />
          ) : (
            <div className="sports-grid">
              {sports.map((sport) => (
                <div
                  key={sport.key}
                  className="sport-card"
                  onClick={() => handleSportSelect(sport.key)}
                >
                  <div className="sport-icon">
                    {sport.key.includes('football') ? '🏈' :
                     sport.key.includes('basketball') ? '🏀' :
                     sport.key.includes('baseball') ? '⚾' :
                     sport.key.includes('soccer') ? '⚽' : '🏆'}
                  </div>
                  <h3>{sport.title}</h3>
                  <p>{sport.description}</p>
                  <div className="sport-status">
                    {sport.active ? '🟢 Live' : '🔴 Offline'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="events-section">
          <div className="events-header">
            <button onClick={handleBackToSports} className="back-btn">
              ← Back to Sports
            </button>
            <h2>
              {sports.find(s => s.key === selectedSport)?.title || selectedSport} Events
            </h2>
          </div>

          {loading ? (
            <WinzoLoading message="Loading events..." />
          ) : events.length === 0 ? (
            <EmptyState
              icon="📅"
              title="No Events Available"
              message="No upcoming events for this sport right now. Check back later for more Big Win opportunities!"
              actionText="Try Another Sport"
              onAction={handleBackToSports}
            />
          ) : (
            <div className="events-grid">
              {events.map((event) => (
                <div key={event.id} className="event-card">
                  <div className="event-header">
                    <div className="event-time">
                      {new Date(event.commence_time).toLocaleDateString()} at{' '}
                      {new Date(event.commence_time).toLocaleTimeString()}
                    </div>
                  </div>
                  
                  <div className="event-matchup">
                    <div className="team away-team">
                      <span className="team-name">{event.away_team}</span>
                      <span className="team-label">Away</span>
                    </div>
                    
                    <div className="vs-divider">VS</div>
                    
                    <div className="team home-team">
                      <span className="team-name">{event.home_team}</span>
                      <span className="team-label">Home</span>
                    </div>
                  </div>

                  {event.bookmakers && event.bookmakers.length > 0 && (
                    <div className="betting-options">
                      <h4>Betting Odds</h4>
                      {event.bookmakers[0].markets?.map((market: any) => (
                        <div key={market.key} className="market">
                          {market.outcomes?.map((outcome: any) => (
                            <button
                              key={outcome.name}
                              className="odds-btn"
                              onClick={() =>
                                addToBetSlip(
                                  event.id,
                                  outcome.name,
                                  `${event.away_team} vs ${event.home_team}`,
                                  market.key,
                                  outcome.name,
                                  outcome.price,
                                  parseFloat(outcome.price),
                                  event.sport_title
                                )
                              }
                            >
                              <span className="outcome-name">{outcome.name}</span>
                              <span className="outcome-odds">{outcome.price}</span>
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <BetSlip
        isOpen={isBetSlipOpen}
        onClose={() => setIsBetSlipOpen(false)}
        bets={betSlipItems}
        onRemoveBet={removeBetFromSlip}
        onClearAll={clearBetSlip}
        onPlaceBets={placeBets}
        walletBalance={walletBalance}
      />
    </div>
  );
};

export default SportsBetting;

