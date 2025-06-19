import React from 'react';
import { useBetSlip } from '../../contexts/BetSlipContext';
import './EventsList.css';

interface GameEvent {
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
}

interface EventsListProps {
  events: GameEvent[];
  highlightedEventId?: string | null;
  selectedBetType?: 'straight' | 'parlay' | 'teaser' | 'if-bet';
  isLiveMode: boolean;
}

const EventsList: React.FC<EventsListProps> = ({ 
  events, 
  highlightedEventId, 
  selectedBetType,
  isLiveMode 
}) => {
  const { addToBetSlip } = useBetSlip();

  const formatOdds = (odds: number): string => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  const formatGameTime = (date: Date): string => {
    if (isLiveMode) {
      return 'LIVE NOW';
    }
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const handleBetClick = (
    event: GameEvent,
    betType: 'spread' | 'total' | 'moneyline',
    selection: string,
    odds: number
  ) => {
    // Map old market types to new standardized ones
    const marketTypeMap: Record<string, 'h2h' | 'spreads' | 'totals' | 'player_props' | 'team_props'> = {
      'moneyline': 'h2h',
      'spread': 'spreads', 
      'total': 'totals'
    };

    addToBetSlip({
      eventId: event.id,
      sport: event.sport,
      homeTeam: event.homeTeam,
      awayTeam: event.awayTeam,
      selectedTeam: selection,
      odds: odds,
      bookmaker: 'WINZO',
      marketType: marketTypeMap[betType],
      commenceTime: event.gameTime.toISOString()
    });
  };

  if (events.length === 0) {
    return (
      <div className="events-list__empty">
        <div className="empty-state">
          <span className="empty-state__icon">🏆</span>
          <h3>No events available</h3>
          <p>Check back later for upcoming games</p>
        </div>
      </div>
    );
  }

  return (
    <div className="events-list">
      <div className="events-list__header">
        <h3>{isLiveMode ? 'Live Events' : 'Upcoming Events'}</h3>
        <span className="events-count">{events.length} games</span>
      </div>

      <div className="events-list__content">
        {events.map((event) => (
          <div
            key={event.id}
            className={`event-card ${
              highlightedEventId === event.id ? 'event-card--highlighted' : ''
            }`}
          >
            {/* Event Header */}
            <div className="event-card__header">
              <div className="event-card__teams">
                <div className="team-info">
                  <span className="rotation-number">{event.rotationNumbers.away}</span>
                  <span className="team-name">{event.awayTeam}</span>
                </div>
                <span className="vs-separator">@</span>
                <div className="team-info">
                  <span className="rotation-number">{event.rotationNumbers.home}</span>
                  <span className="team-name">{event.homeTeam}</span>
                </div>
              </div>
              
              <div className="event-card__meta">
                <span className="league-badge">{event.league}</span>
                <span className="game-time">{formatGameTime(event.gameTime)}</span>
              </div>
            </div>

            {/* Betting Markets */}
            <div className="event-card__markets">
              {/* Spread */}
              <div className="betting-market">
                <div className="market-header">
                  <span className="market-title">Spread</span>
                </div>
                <div className="market-options">
                  <button
                    className="bet-button"
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
                    className="bet-button"
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
                </div>
                <div className="market-options">
                  <button
                    className="bet-button"
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
                    className="bet-button"
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
                </div>
                <div className="market-options">
                  <button
                    className="bet-button"
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
                    className="bet-button"
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsList;