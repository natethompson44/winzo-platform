import React from 'react';

interface Team {
  name: string;
  logo?: string;
  record?: string;
}

interface GameOdds {
  home: number;
  away: number;
  draw?: number;
  spread?: {
    home: number;
    away: number;
    line: number;
  };
  total?: {
    over: number;
    under: number;
    line: number;
  };
}

interface MobileGameCardProps {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  startTime: string;
  status: 'upcoming' | 'live' | 'finished';
  odds: GameOdds;
  isLive?: boolean;
  liveScore?: {
    home: number;
    away: number;
    period?: string;
    time?: string;
  };
  onOddsClick: (gameId: string, betType: string, odds: number, selection: string) => void;
  selectedBets?: string[];
}

const MobileGameCard: React.FC<MobileGameCardProps> = ({
  id,
  homeTeam,
  awayTeam,
  startTime,
  status,
  odds,
  isLive = false,
  liveScore,
  onOddsClick,
  selectedBets = []
}) => {
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (timeString: string) => {
    const date = new Date(timeString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleOddsClick = (betType: string, odds: number, selection: string) => {
    onOddsClick(id, betType, odds, selection);
  };

  const isSelected = (betKey: string) => {
    return selectedBets.includes(`${id}-${betKey}`);
  };

  return (
    <div className={`mobile-game-card ${status} ${isLive ? 'live' : ''}`}>
      {/* Header */}
      <div className="game-header">
        <div className="game-time">
          {status === 'live' ? (
            <div className="live-indicator">
              <span className="live-dot"></span>
              <span className="live-text">LIVE</span>
              {liveScore?.time && (
                <span className="live-time">{liveScore.time}</span>
              )}
            </div>
          ) : (
            <div className="scheduled-time">
              <span className="date">{formatDate(startTime)}</span>
              <span className="time">{formatTime(startTime)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Teams */}
      <div className="teams-section">
        <div className="team away-team">
          <div className="team-info">
            {awayTeam.logo && (
              <img src={awayTeam.logo} alt={awayTeam.name} className="team-logo" />
            )}
            <div className="team-details">
              <span className="team-name">{awayTeam.name}</span>
              {awayTeam.record && (
                <span className="team-record">{awayTeam.record}</span>
              )}
            </div>
          </div>
          {liveScore && (
            <div className="live-score away-score">{liveScore.away}</div>
          )}
        </div>

        <div className="vs-divider">
          <span className="vs-text">VS</span>
        </div>

        <div className="team home-team">
          <div className="team-info">
            {homeTeam.logo && (
              <img src={homeTeam.logo} alt={homeTeam.name} className="team-logo" />
            )}
            <div className="team-details">
              <span className="team-name">{homeTeam.name}</span>
              {homeTeam.record && (
                <span className="team-record">{homeTeam.record}</span>
              )}
            </div>
          </div>
          {liveScore && (
            <div className="live-score home-score">{liveScore.home}</div>
          )}
        </div>
      </div>

      {/* Betting Options */}
      <div className="betting-section">
        {/* Moneyline */}
        <div className="bet-type">
          <div className="bet-type-header">
            <span className="bet-type-name">Moneyline</span>
          </div>
          <div className="bet-options">
            <button
              className={`odds-button ${isSelected('ml-away') ? 'selected' : ''}`}
              onClick={() => handleOddsClick('moneyline', odds.away, awayTeam.name)}
            >
              <span className="team-short">{awayTeam.name}</span>
              <span className="odds-value">{odds.away > 0 ? '+' : ''}{odds.away}</span>
            </button>
            
                         {odds.draw && (
               <button
                 className={`odds-button ${isSelected('ml-draw') ? 'selected' : ''}`}
                 onClick={() => handleOddsClick('moneyline', odds.draw!, 'Draw')}
               >
                 <span className="team-short">Draw</span>
                 <span className="odds-value">{odds.draw > 0 ? '+' : ''}{odds.draw}</span>
               </button>
             )}
            
            <button
              className={`odds-button ${isSelected('ml-home') ? 'selected' : ''}`}
              onClick={() => handleOddsClick('moneyline', odds.home, homeTeam.name)}
            >
              <span className="team-short">{homeTeam.name}</span>
              <span className="odds-value">{odds.home > 0 ? '+' : ''}{odds.home}</span>
            </button>
          </div>
        </div>

        {/* Spread */}
        {odds.spread && (
          <div className="bet-type">
            <div className="bet-type-header">
              <span className="bet-type-name">Spread</span>
            </div>
            <div className="bet-options">
              <button
                className={`odds-button ${isSelected('spread-away') ? 'selected' : ''}`}
                onClick={() => handleOddsClick('spread', odds.spread!.away, `${awayTeam.name} ${odds.spread!.line > 0 ? '+' : ''}${odds.spread!.line}`)}
              >
                <span className="spread-line">{odds.spread.line > 0 ? '+' : ''}{odds.spread.line}</span>
                <span className="odds-value">{odds.spread.away > 0 ? '+' : ''}{odds.spread.away}</span>
              </button>
              
              <button
                className={`odds-button ${isSelected('spread-home') ? 'selected' : ''}`}
                onClick={() => handleOddsClick('spread', odds.spread!.home, `${homeTeam.name} ${odds.spread!.line < 0 ? '+' : ''}${-odds.spread!.line}`)}
              >
                <span className="spread-line">{odds.spread.line < 0 ? '+' : ''}{-odds.spread.line}</span>
                <span className="odds-value">{odds.spread.home > 0 ? '+' : ''}{odds.spread.home}</span>
              </button>
            </div>
          </div>
        )}

        {/* Total */}
        {odds.total && (
          <div className="bet-type">
            <div className="bet-type-header">
              <span className="bet-type-name">Total</span>
            </div>
            <div className="bet-options">
              <button
                className={`odds-button ${isSelected('total-over') ? 'selected' : ''}`}
                onClick={() => handleOddsClick('total', odds.total!.over, `Over ${odds.total!.line}`)}
              >
                <span className="total-line">O {odds.total.line}</span>
                <span className="odds-value">{odds.total.over > 0 ? '+' : ''}{odds.total.over}</span>
              </button>
              
              <button
                className={`odds-button ${isSelected('total-under') ? 'selected' : ''}`}
                onClick={() => handleOddsClick('total', odds.total!.under, `Under ${odds.total!.line}`)}
              >
                <span className="total-line">U {odds.total.line}</span>
                <span className="odds-value">{odds.total.under > 0 ? '+' : ''}{odds.total.under}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileGameCard; 