import React, { useState, useEffect, useCallback } from 'react';
import { APIError, WinzoLoading, EmptyState } from './ErrorBoundary';
import EnhancedBetSlip from './EnhancedBetSlip';
import './SportsBetting.css';

interface Sport {
  key: string;
  title: string;
  description: string;
  active: boolean;
}

interface SportsEvent {
  id: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  status: string;
  markets: {
    [key: string]: Array<{
      id: string;
      bookmaker: string;
      outcome: string;
      price: string;
      decimalPrice: number;
      point?: number;
    }>;
  };
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
 * Enhanced SportsBetting Component with Full Betting Functionality
 * 
 * Provides complete sports betting interface with bet slip, odds selection,
 * and bet placement capabilities. Includes real API integration with fallback data.
 */
const SportsBettingEnhanced: React.FC = () => {
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  
  // Bet Slip State
  const [betSlipItems, setBetSlipItems] = useState<BetSlipItem[]>([]);
  const [isBetSlipOpen, setIsBetSlipOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);

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
      homeTeam: 'Kansas City Chiefs',
      awayTeam: 'Buffalo Bills',
      commenceTime: new Date(Date.now() + 86400000).toISOString(),
      status: 'upcoming',
      markets: {
        h2h: [
          {
            id: 'odds-1',
            bookmaker: 'DraftKings',
            outcome: 'Kansas City Chiefs',
            price: '1.85',
            decimalPrice: 1.85
          },
          {
            id: 'odds-2',
            bookmaker: 'DraftKings',
            outcome: 'Buffalo Bills',
            price: '1.95',
            decimalPrice: 1.95
          }
        ]
      }
    },
    {
      id: 'mock-2',
      homeTeam: 'Los Angeles Lakers',
      awayTeam: 'Boston Celtics',
      commenceTime: new Date(Date.now() + 172800000).toISOString(),
      status: 'upcoming',
      markets: {
        h2h: [
          {
            id: 'odds-3',
            bookmaker: 'FanDuel',
            outcome: 'Los Angeles Lakers',
            price: '2.10',
            decimalPrice: 2.10
          },
          {
            id: 'odds-4',
            bookmaker: 'FanDuel',
            outcome: 'Boston Celtics',
            price: '1.75',
            decimalPrice: 1.75
          }
        ]
      }
    }
  ];

  const fetchWalletBalance = useCallback(async () => {
    try {
      const response = await fetch('/api/wallet/balance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWalletBalance(data.data?.balance || 0);
      } else {
        // Fallback balance for demo
        setWalletBalance(100.00);
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      setWalletBalance(100.00); // Demo balance
    }
  }, []);

  const fetchSports = useCallback(async () => {
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
      setSports(data.data?.sports || mockSports);
      
    } catch (err) {
      console.error('Sports API error:', err);
      setError('Failed to load sports data');
      setSports(mockSports);
    } finally {
      setLoading(false);
    }
  }, []);

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
      setEvents(data.data?.events || mockEvents.filter(e => e.id.includes(sportKey.includes('nfl') ? '1' : '2')));
      
    } catch (err) {
      console.error('Events API error:', err);
      setError('Failed to load events data');
      const mockEventsForSport = mockEvents.filter(e => 
        (sportKey.includes('nfl') && e.id.includes('1')) ||
        (sportKey.includes('nba') && e.id.includes('2'))
      );
      setEvents(mockEventsForSport);
    } finally {
      setLoading(false);
    }
  };

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
    
    // Check if bet already exists
    if (betSlipItems.find(item => item.id === betId)) {
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
    setBetSlipItems(prev => prev.filter(item => item.id !== betId));
  };

  const clearBetSlip = () => {
    setBetSlipItems([]);
  };

  const placeBets = async (bets: BetSlipItem[], amounts: { [key: string]: number }) => {
    try {
      const betPromises = bets.map(async (bet) => {
        const amount = amounts[bet.id];
        if (!amount || amount < 1) return null;

        const response = await fetch('/api/sports/place-bet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            eventId: bet.eventId,
            oddsId: bet.oddsId,
            amount,
            market: bet.market,
            outcome: bet.outcome
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to place bet: ${response.statusText}`);
        }

        return await response.json();
      });

      const results = await Promise.all(betPromises);
      const successfulBets = results.filter(result => result !== null);

      if (successfulBets.length > 0) {
        // Update wallet balance
        await fetchWalletBalance();
        
        // Show success message
        alert(`🎉 ${successfulBets.length} bet(s) placed successfully! Big Win Energy activated!`);
        
        // Close bet slip
        setIsBetSlipOpen(false);
      }

    } catch (error) {
      console.error('Error placing bets:', error);
      alert('Error placing bets. Please try again.');
      throw error;
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
        
        <div className="header-controls">
          <div className="wallet-display">
            💰 ${walletBalance.toFixed(2)}
          </div>
          
          {betSlipItems.length > 0 && (
            <button 
              onClick={() => setIsBetSlipOpen(true)}
              className="bet-slip-toggle"
            >
              🎲 Bet Slip ({betSlipItems.length})
            </button>
          )}
        </div>
        
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
                      {new Date(event.commenceTime).toLocaleDateString()} at{' '}
                      {new Date(event.commenceTime).toLocaleTimeString()}
                    </div>
                  </div>
                  
                  <div className="event-matchup">
                    <div className="team away-team">
                      <span className="team-name">{event.awayTeam}</span>
                      <span className="team-label">Away</span>
                    </div>
                    
                    <div className="vs-divider">VS</div>
                    
                    <div className="team home-team">
                      <span className="team-name">{event.homeTeam}</span>
                      <span className="team-label">Home</span>
                    </div>
                  </div>

                  {event.markets && Object.keys(event.markets).length > 0 && (
                    <div className="betting-options">
                      <h4>Betting Odds</h4>
                      {Object.entries(event.markets).map(([marketKey, outcomes]) => (
                        <div key={marketKey} className="market">
                          <div className="market-title">
                            {marketKey === 'h2h' ? 'Match Winner' : marketKey}
                          </div>
                          <div className="outcomes-grid">
                            {outcomes.map((outcome) => (
                              <button
                                key={outcome.id}
                                className="odds-btn"
                                onClick={() => addToBetSlip(
                                  event.id,
                                  outcome.id,
                                  `${event.awayTeam} vs ${event.homeTeam}`,
                                  marketKey === 'h2h' ? 'Match Winner' : marketKey,
                                  outcome.outcome,
                                  outcome.price,
                                  outcome.decimalPrice,
                                  sports.find(s => s.key === selectedSport)?.title || selectedSport
                                )}
                              >
                                <span className="outcome-name">{outcome.outcome}</span>
                                <span className="outcome-odds">{outcome.price}</span>
                              </button>
                            ))}
                          </div>
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

      <EnhancedBetSlip
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

export default SportsBettingEnhanced;

