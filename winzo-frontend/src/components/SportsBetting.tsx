import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './SportsBetting.css';

interface Sport {
  id: string;
  key: string;
  title: string;
  group: string;
  description: string;
  hasOutrights: boolean;
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
      price: number;
      decimalPrice: number;
      point?: number;
    }>;
  };
}

interface WalletBalance {
  balance: number;
  formatted: string;
  status: string;
}

/**
 * SportsBetting Component - The heart of WINZO's Big Win Energy
 * 
 * This component embodies the WINZO design philosophy with confident,
 * energetic messaging and mobile-first responsive design. Every interaction
 * celebrates the anticipation of winning and maintains the exclusive,
 * modern feel that makes WINZO special.
 */
const SportsBetting: React.FC = () => {
  const { user, token } = useAuth();
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<SportsEvent | null>(null);
  const [betAmount, setBetAmount] = useState<string>('');
  const [selectedOdds, setSelectedOdds] = useState<any>(null);
  const [placingBet, setPlacingBet] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Fetch wallet balance
  const fetchWalletBalance = async () => {
    try {
      const response = await axios.get(`${API_BASE}/wallet/balance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWalletBalance(response.data.data);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  // Fetch available sports
  const fetchSports = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/sports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSports(response.data.data.sports);
      if (response.data.data.sports.length > 0) {
        setSelectedSport(response.data.data.sports[0]);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load sports');
    } finally {
      setLoading(false);
    }
  };

  // Fetch events for selected sport
  const fetchEvents = async (sportKey: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/sports/${sportKey}/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(response.data.data.events);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  // Place a bet
  const placeBet = async () => {
    if (!selectedOdds || !betAmount || !selectedEvent) return;

    setPlacingBet(true);
    try {
      const response = await axios.post(`${API_BASE}/sports/place-bet`, {
        eventId: selectedEvent.id,
        oddsId: selectedOdds.id,
        amount: parseFloat(betAmount),
        market: selectedOdds.market,
        outcome: selectedOdds.outcome
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Show success message and refresh data
      alert(response.data.message);
      setBetAmount('');
      setSelectedOdds(null);
      setSelectedEvent(null);
      fetchWalletBalance();
      
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to place bet');
    } finally {
      setPlacingBet(false);
    }
  };

  // Calculate potential payout
  const calculatePayout = () => {
    if (!selectedOdds || !betAmount) return 0;
    const amount = parseFloat(betAmount);
    return amount * selectedOdds.decimalPrice;
  };

  const calculateProfit = () => {
    if (!selectedOdds || !betAmount) return 0;
    const amount = parseFloat(betAmount);
    return (amount * selectedOdds.decimalPrice) - amount;
  };

  useEffect(() => {
    fetchSports();
    fetchWalletBalance();
  }, []);

  useEffect(() => {
    if (selectedSport) {
      fetchEvents(selectedSport.key);
    }
  }, [selectedSport]);

  if (loading && sports.length === 0) {
    return (
      <div className="winzo-loading">
        <div className="winzo-spinner"></div>
        <p>🔥 Loading your winning opportunities...</p>
      </div>
    );
  }

  return (
    <div className="sports-betting">
      {/* Header with WINZO branding and wallet */}
      <div className="winzo-header">
        <div className="header-content">
          <h1 className="winzo-title">🎯 Sports Betting</h1>
          <p className="winzo-subtitle">Big Win Energy Activated!</p>
          
          {walletBalance && (
            <div className="wallet-display">
              <div className="balance-card">
                <span className="balance-label">WINZO Wallet</span>
                <span className="balance-amount">{walletBalance.formatted}</span>
                <span className={`balance-status ${walletBalance.status}`}>
                  {walletBalance.status === 'ready' ? '⚡ Ready to Win!' : '💰 Add Funds'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="winzo-error">
          <p>⚠️ {error}</p>
          <button onClick={() => setError(null)} className="dismiss-btn">
            Let's try again!
          </button>
        </div>
      )}

      {/* Sports Selection */}
      <div className="sports-selection">
        <h2 className="section-title">Choose Your Sport</h2>
        <div className="sports-grid">
          {sports.map((sport) => (
            <button
              key={sport.id}
              className={`sport-card ${selectedSport?.id === sport.id ? 'selected' : ''}`}
              onClick={() => setSelectedSport(sport)}
            >
              <div className="sport-info">
                <h3>{sport.title}</h3>
                <p>{sport.group}</p>
                {sport.hasOutrights && <span className="outright-badge">🏆 Futures</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Events Display */}
      {selectedSport && (
        <div className="events-section">
          <h2 className="section-title">
            🔥 {selectedSport.title} - Ready to Win!
          </h2>
          
          {loading ? (
            <div className="winzo-loading">
              <div className="winzo-spinner"></div>
              <p>Loading winning opportunities...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="no-events">
              <p>🎯 No events available right now. Check back soon for more Big Win Energy!</p>
            </div>
          ) : (
            <div className="events-grid">
              {events.map((event) => (
                <div key={event.id} className="event-card">
                  <div className="event-header">
                    <div className="teams">
                      <span className="away-team">{event.awayTeam}</span>
                      <span className="vs">@</span>
                      <span className="home-team">{event.homeTeam}</span>
                    </div>
                    <div className="event-time">
                      {new Date(event.commenceTime).toLocaleDateString()} at{' '}
                      {new Date(event.commenceTime).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>

                  {/* Money Line Odds */}
                  {event.markets.h2h && (
                    <div className="market-section">
                      <h4 className="market-title">💰 Money Line</h4>
                      <div className="odds-grid">
                        {event.markets.h2h.slice(0, 3).map((odd, index) => (
                          <button
                            key={index}
                            className={`odds-button ${
                              selectedOdds?.id === odd.id ? 'selected' : ''
                            }`}
                            onClick={() => {
                              setSelectedOdds({
                                ...odd,
                                market: 'h2h',
                                eventId: event.id
                              });
                              setSelectedEvent(event);
                            }}
                          >
                            <span className="outcome">{odd.outcome}</span>
                            <span className="price">
                              {odd.price > 0 ? '+' : ''}{odd.price}
                            </span>
                            <span className="bookmaker">{odd.bookmaker}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Spread Odds */}
                  {event.markets.spreads && (
                    <div className="market-section">
                      <h4 className="market-title">📊 Point Spread</h4>
                      <div className="odds-grid">
                        {event.markets.spreads.slice(0, 2).map((odd, index) => (
                          <button
                            key={index}
                            className={`odds-button ${
                              selectedOdds?.id === odd.id ? 'selected' : ''
                            }`}
                            onClick={() => {
                              setSelectedOdds({
                                ...odd,
                                market: 'spreads',
                                eventId: event.id
                              });
                              setSelectedEvent(event);
                            }}
                          >
                            <span className="outcome">
                              {odd.outcome} {odd.point ? `(${odd.point > 0 ? '+' : ''}${odd.point})` : ''}
                            </span>
                            <span className="price">
                              {odd.price > 0 ? '+' : ''}{odd.price}
                            </span>
                            <span className="bookmaker">{odd.bookmaker}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bet Slip */}
      {selectedOdds && selectedEvent && (
        <div className="bet-slip">
          <div className="bet-slip-content">
            <h3 className="bet-slip-title">🎯 Your Winning Bet</h3>
            
            <div className="bet-details">
              <div className="bet-info">
                <p className="event-name">
                  {selectedEvent.awayTeam} @ {selectedEvent.homeTeam}
                </p>
                <p className="bet-selection">
                  <strong>{selectedOdds.outcome}</strong>
                  {selectedOdds.point && ` (${selectedOdds.point > 0 ? '+' : ''}${selectedOdds.point})`}
                </p>
                <p className="odds-display">
                  Odds: {selectedOdds.price > 0 ? '+' : ''}{selectedOdds.price}
                </p>
              </div>
            </div>

            <div className="bet-amount-section">
              <label htmlFor="betAmount" className="amount-label">
                💰 Bet Amount
              </label>
              <div className="amount-input-group">
                <span className="currency-symbol">$</span>
                <input
                  id="betAmount"
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="0.00"
                  min="1"
                  step="0.01"
                  className="amount-input"
                />
              </div>
              
              <div className="quick-amounts">
                {[10, 25, 50, 100].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setBetAmount(amount.toString())}
                    className="quick-amount-btn"
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            {betAmount && parseFloat(betAmount) > 0 && (
              <div className="payout-display">
                <div className="payout-row">
                  <span>Potential Payout:</span>
                  <span className="payout-amount">
                    ${calculatePayout().toFixed(2)}
                  </span>
                </div>
                <div className="payout-row profit">
                  <span>Potential Profit:</span>
                  <span className="profit-amount">
                    ${calculateProfit().toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div className="bet-actions">
              <button
                onClick={() => {
                  setSelectedOdds(null);
                  setSelectedEvent(null);
                  setBetAmount('');
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button
                onClick={placeBet}
                disabled={
                  !betAmount || 
                  parseFloat(betAmount) <= 0 || 
                  placingBet ||
                  (walletBalance && parseFloat(betAmount) > walletBalance.balance)
                }
                className="place-bet-btn"
              >
                {placingBet ? '⏳ Placing...' : '🚀 Place Bet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SportsBetting;

