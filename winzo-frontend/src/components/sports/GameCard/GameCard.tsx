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
    <div className={`team flex items-center ${isAway ? 'justify-end' : 'justify-start'}`}>
      <div className="team-logo w-8 h-8 mr-3 flex items-center justify-center">
        {team.logo ? (
          <img src={team.logo} alt={`${team.name} logo`} className="w-full h-full object-contain" />
        ) : (
          <div className="team-logo-placeholder w-full h-full bg-secondary rounded-full flex items-center justify-center text-xs font-semibold text-tertiary">
            {team.shortName.substring(0, 3).toUpperCase()}
          </div>
        )}
      </div>
      <div className="team-info flex-1">
        <div className="team-name text-sm font-medium text-primary">{team.name}</div>
        {team.record && (
          <div className="team-record text-xs text-tertiary">{team.record}</div>
        )}
        {game.status === 'live' && typeof team.score === 'number' && (
          <div className="team-score text-lg font-bold text-primary">{team.score}</div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`card game-card hover-lift ${className}`.trim()}>
      {/* Game Header */}
      <div className="card-header flex justify-between items-center">
        <div className="game-meta flex items-center gap-4">
          <span className="game-time text-sm text-secondary">{formatGameTime(game.startTime)}</span>
          <span className="game-league text-sm text-tertiary">{game.league}</span>
        </div>
        <div className="game-status-container flex items-center gap-2">
          {game.isLive && <LiveIndicator isLive={true} />}
          <span className={`game-status text-xs font-semibold px-2 py-1 rounded ${
            game.status === 'live' ? 'bg-success text-neutral-0' : 
            game.status === 'final' ? 'bg-secondary text-tertiary' : 
            'bg-info text-neutral-0'
          }`}>
            {getStatusDisplay(game.status)}
          </span>
        </div>
      </div>

      {/* Teams */}
      <div className="card-body">
        <div className="game-teams mb-6">
          <TeamLogo team={game.awayTeam} isAway={true} />
          <div className="vs text-center py-2">
            <span className="text-sm font-semibold text-tertiary">VS</span>
          </div>
          <TeamLogo team={game.homeTeam} />
        </div>

        {/* Betting Markets */}
        <div className="game-markets">
          {game.markets.slice(0, 3).map((market) => (
            <div key={market.id} className="market mb-4">
              <div className="market-label text-sm font-medium text-secondary mb-2">{market.name}</div>
              <div className="market-options grid grid-cols-3 gap-2">
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
                    size="sm"
                    onClick={onBetSelect}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Markets Indicator */}
        {game.markets.length > 3 && (
          <div className="more-markets text-center mt-4">
            <button className="btn btn-ghost btn-sm">
              +{game.markets.length - 3} more markets
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCard; 