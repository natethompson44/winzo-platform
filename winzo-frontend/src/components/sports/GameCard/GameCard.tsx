import React from 'react';
import { OddsButton } from '../OddsButton';
import { LiveIndicator } from '../LiveIndicator';

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo?: string;
  record?: string;
  score?: number;
}

export interface BettingMarket {
  id: string;
  name: string;
  options: Array<{
    id: string;
    selection: string;
    odds: number;
    movement?: 'up' | 'down' | null;
  }>;
}

export interface Game {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  startTime: string;
  status: 'upcoming' | 'live' | 'final';
  league: string;
  sport: string;
  markets: BettingMarket[];
  isLive?: boolean;
}

export interface GameCardProps {
  game: Game;
  selectedBets: Array<{
    gameId: string;
    market: string;
    selection: string;
    odds: number;
    teamId?: string;
  }>;
  onBetSelect: (bet: {
    gameId: string;
    market: string;
    selection: string;
    odds: number;
    teamId?: string;
  }) => void;
  className?: string;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  selectedBets,
  onBetSelect,
  className = ''
}) => {
  const formatGameTime = (timeString: string): string => {
    const date = new Date(timeString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusDisplay = (status: string): string => {
    switch (status) {
      case 'live':
        return 'LIVE';
      case 'final':
        return 'FINAL';
      case 'upcoming':
        return 'UPCOMING';
      default:
        return status.toUpperCase();
    }
  };

  const isBetSelected = (gameId: string, market: string, selection: string): boolean => {
    return selectedBets.some(bet => 
      bet.gameId === gameId && 
      bet.market === market && 
      bet.selection === selection
    );
  };

  const TeamLogo: React.FC<{ team: Team; isAway?: boolean }> = ({ team, isAway = false }) => (
    <div className={`team ${isAway ? 'away' : 'home'}`}>
      <div className="team-logo">
        {team.logo ? (
          <img src={team.logo} alt={`${team.name} logo`} />
        ) : (
          <div className="team-logo-placeholder">
            {team.shortName.substring(0, 3).toUpperCase()}
          </div>
        )}
      </div>
      <div className="team-info">
        <div className="team-name">{team.name}</div>
        {team.record && (
          <div className="team-record">{team.record}</div>
        )}
        {game.status === 'live' && typeof team.score === 'number' && (
          <div className="team-score">{team.score}</div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`game-card hover-lift ${className}`.trim()}>
      {/* Game Header */}
      <div className="game-header">
        <div className="game-meta">
          <span className="game-time">{formatGameTime(game.startTime)}</span>
          <span className="game-league">{game.league}</span>
        </div>
        <div className="game-status-container">
          {game.isLive && <LiveIndicator isLive={true} />}
          <span className={`game-status ${game.status}`}>
            {getStatusDisplay(game.status)}
          </span>
        </div>
      </div>

      {/* Teams */}
      <div className="game-teams">
        <TeamLogo team={game.awayTeam} isAway={true} />
        <div className="vs">VS</div>
        <TeamLogo team={game.homeTeam} />
      </div>

      {/* Betting Markets */}
      <div className="game-markets">
        {game.markets.slice(0, 3).map((market) => (
          <div key={market.id} className="market">
            <div className="market-label">{market.name}</div>
            <div className="market-options">
              {market.options.map((option) => (
                <OddsButton
                  key={option.id}
                  odds={option.odds}
                  selection={option.selection}
                  market={market.name}
                  gameId={game.id}
                  teamId={option.selection === game.homeTeam.name ? game.homeTeam.id : 
                          option.selection === game.awayTeam.name ? game.awayTeam.id : undefined}
                  isSelected={isBetSelected(game.id, market.name, option.selection)}
                  isDisabled={game.status === 'final'}
                  movement={option.movement}
                  onClick={onBetSelect}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Additional Markets Indicator */}
      {game.markets.length > 3 && (
        <div className="more-markets">
          <button className="btn btn-ghost btn-sm">
            +{game.markets.length - 3} more markets
          </button>
        </div>
      )}
    </div>
  );
};

export default GameCard; 