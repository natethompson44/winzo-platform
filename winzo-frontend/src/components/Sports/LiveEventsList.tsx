import React, { useState, useEffect } from 'react';
import { useBetSlip } from '../../contexts/BetSlipContext';
import './LiveEventsList.css';

interface LiveGameEvent {
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
}

interface LiveEventsListProps {
  events: LiveGameEvent[];
  highlightedEventId?: string | null;
  selectedBetType: 'straight' | 'parlay' | 'teaser' | 'if-bet';
}

const LiveEventsList: React.FC<LiveEventsListProps> = ({ 
  events, 
  highlightedEventId, 
  selectedBetType 
}) => {
  const { addToBetSlip } = useBetSlip();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second for live countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatOdds = (odds: number): string => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  const formatLiveTime = (timeRemaining: string, gameStatus: string): string => {
    return `${gameStatus} • ${timeRemaining}`;
  };

  const handleBetClick = (
    event: LiveGameEvent,
    betType: 'spread' | 'total' | 'moneyline',
    selection: string,
    odds: number
  ) => {
    addToBetSlip({
      eventId: event.id,
      sport: event.sport,
      homeTeam: event.homeTeam,
      awayTeam: event.awayTeam,
      selectedTeam: selection,
      odds: odds,
      bookmaker: 'WINZO',
      marketType: betType,
      commenceTime: event.gameTime.toISOString()
    });
  };

  if (events.length === 0) {
    return (
      <div className="live-events-list__empty">
        <div className="empty-state">
          <span className="empty-state__icon">📺</span>
          <h3>No live events</h3>
          <p>Check back later for live games</p>
        </div>
      </div>
    );
  }

  return (
    <div className="live-events-list">
      <div className="live-events-list__header">
        <div className="header-content">
          <div className="header-left">
            <h3>
              <span className="live-indicator">
                <span className="live-dot"></span>
                LIVE
              </span>
              Events
            </h3>
            <span className="events-count">{events.length} games</span>
          </div>
          <div className="header-right">
            <span className="last-update">Updates live</span>
          </div>
        </div>
      </div>

      <div className="live-events-list__content">
        {events.map((event) => (
          <div
            key={event.id}
            className={`live-event-card ${
              highlightedEventId === event.id ? 'live-event-card--highlighted' : ''
            }`}
          >
            {/* Live Event Header */}
            <div className="live-event-card__header">
              <div className="live-event-card__teams">
                <div className="team-info">
                  <span className="rotation-number">{event.rotationNumbers.away}</span>
                  <span className="team-name">{event.awayTeam}</span>
                  <span className="team-score">{event.currentScore.away}</span>
                </div>
                <div className="vs-separator">
                  <span className="live-badge">LIVE</span>
                </div>
                <div className="team-info">
                  <span className="rotation-number">{event.rotationNumbers.home}</span>
                  <span className="team-name">{event.homeTeam}</span>
                  <span className="team-score">{event.currentScore.home}</span>
                </div>
              </div>
              
              <div className="live-event-card__meta">
                <span className="league-badge">{event.league}</span>
                <span className="game-status">
                  {formatLiveTime(event.timeRemaining, event.gameStatus)}
                </span>
              </div>
            </div>

            {/* Live Betting Markets */}
            <div className="live-event-card__markets">
              {/* Spread */}
              <div className="betting-market">
                <div className="market-header">
                  <span className="market-title">Spread</span>
                  <span className="live-indicator-small">LIVE</span>
                </div>
                <div className="market-options">
                  <button
                    className="bet-button live-bet-button"
                    onClick={() => handleBetClick(
                      event, 
                      'spread', 
                      `${event.awayTeam} ${formatOdds(event.odds.spread.away)}`,
                      event.odds.spread.odds
                    )}
                  >
                    <span className="bet-selection">{event.awayTeam}</span>
                    <span className="bet-spread">{formatOdds(event.odds.spread.away)}</span>
                    <span className="bet-odds">{formatOdds(event.odds.spread.odds)}</span>
                  </button>
                  <button
                    className="bet-button live-bet-button"
                    onClick={() => handleBetClick(
                      event, 
                      'spread', 
                      `${event.homeTeam} ${formatOdds(event.odds.spread.home)}`,
                      event.odds.spread.odds
                    )}
                  >
                    <span className="bet-selection">{event.homeTeam}</span>
                    <span className="bet-spread">{formatOdds(event.odds.spread.home)}</span>
                    <span className="bet-odds">{formatOdds(event.odds.spread.odds)}</span>
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className="betting-market">
                <div className="market-header">
                  <span className="market-title">Total</span>
                  <span className="live-indicator-small">LIVE</span>
                </div>
                <div className="market-options">
                  <button
                    className="bet-button live-bet-button"
                    onClick={() => handleBetClick(
                      event, 
                      'total', 
                      `Over ${event.odds.total.over}`,
                      event.odds.total.odds
                    )}
                  >
                    <span className="bet-selection">Over</span>
                    <span className="bet-total">{event.odds.total.over}</span>
                    <span className="bet-odds">{formatOdds(event.odds.total.odds)}</span>
                  </button>
                  <button
                    className="bet-button live-bet-button"
                    onClick={() => handleBetClick(
                      event, 
                      'total', 
                      `Under ${event.odds.total.under}`,
                      event.odds.total.odds
                    )}
                  >
                    <span className="bet-selection">Under</span>
                    <span className="bet-total">{event.odds.total.under}</span>
                    <span className="bet-odds">{formatOdds(event.odds.total.odds)}</span>
                  </button>
                </div>
              </div>

              {/* Moneyline */}
              <div className="betting-market">
                <div className="market-header">
                  <span className="market-title">Moneyline</span>
                  <span className="live-indicator-small">LIVE</span>
                </div>
                <div className="market-options">
                  <button
                    className="bet-button live-bet-button"
                    onClick={() => handleBetClick(
                      event, 
                      'moneyline', 
                      event.awayTeam,
                      event.odds.moneyline.away
                    )}
                  >
                    <span className="bet-selection">{event.awayTeam}</span>
                    <span className="bet-odds">{formatOdds(event.odds.moneyline.away)}</span>
                  </button>
                  <button
                    className="bet-button live-bet-button"
                    onClick={() => handleBetClick(
                      event, 
                      'moneyline', 
                      event.homeTeam,
                      event.odds.moneyline.home
                    )}
                  >
                    <span className="bet-selection">{event.homeTeam}</span>
                    <span className="bet-odds">{formatOdds(event.odds.moneyline.home)}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Live Game Progress Bar */}
            <div className="live-progress">
              <div className="progress-info">
                <span className="current-score">
                  {event.awayTeam} {event.currentScore.away} - {event.currentScore.home} {event.homeTeam}
                </span>
                <span className="game-clock">{event.timeRemaining}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveEventsList;