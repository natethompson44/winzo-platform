import React, { useState, useMemo } from 'react';
import { GameCard, Game } from '../components/sports/GameCard';
import { BetSlip, BetSlipItem } from '../components/sports/BetSlip';

// Mock data for demonstration
const mockGames: Game[] = [
  {
    id: 'game-1',
    homeTeam: {
      id: 'lakers',
      name: 'Los Angeles Lakers',
      shortName: 'LAL',
      record: '25-20',
      score: 98
    },
    awayTeam: {
      id: 'warriors',
      name: 'Golden State Warriors',
      shortName: 'GSW',
      record: '28-17',
      score: 102
    },
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    status: 'live',
    league: 'NBA',
    sport: 'basketball',
    isLive: true,
    markets: [
      {
        id: 'moneyline',
        name: 'Moneyline',
        options: [
          { id: 'ml-gsw', selection: 'Golden State Warriors', odds: -150, movement: 'down' },
          { id: 'ml-lal', selection: 'Los Angeles Lakers', odds: 130, movement: 'up' }
        ]
      },
      {
        id: 'spread',
        name: 'Point Spread',
        options: [
          { id: 'spr-gsw', selection: 'Golden State Warriors -3.5', odds: -110 },
          { id: 'spr-lal', selection: 'Los Angeles Lakers +3.5', odds: -110 }
        ]
      },
      {
        id: 'total',
        name: 'Total Points',
        options: [
          { id: 'tot-o', selection: 'Over 218.5', odds: -105 },
          { id: 'tot-u', selection: 'Under 218.5', odds: -115 }
        ]
      }
    ]
  },
  {
    id: 'game-2',
    homeTeam: {
      id: 'chiefs',
      name: 'Kansas City Chiefs',
      shortName: 'KC',
      record: '14-3'
    },
    awayTeam: {
      id: 'bills',
      name: 'Buffalo Bills',
      shortName: 'BUF',
      record: '13-4'
    },
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: 'upcoming',
    league: 'NFL',
    sport: 'football',
    markets: [
      {
        id: 'moneyline',
        name: 'Moneyline',
        options: [
          { id: 'ml-buf', selection: 'Buffalo Bills', odds: 175 },
          { id: 'ml-kc', selection: 'Kansas City Chiefs', odds: -205 }
        ]
      },
      {
        id: 'spread',
        name: 'Point Spread',
        options: [
          { id: 'spr-buf', selection: 'Buffalo Bills +4.5', odds: -110 },
          { id: 'spr-kc', selection: 'Kansas City Chiefs -4.5', odds: -110 }
        ]
      },
      {
        id: 'total',
        name: 'Total Points',
        options: [
          { id: 'tot-o', selection: 'Over 47.5', odds: -110 },
          { id: 'tot-u', selection: 'Under 47.5', odds: -110 }
        ]
      }
    ]
  },
  {
    id: 'game-3',
    homeTeam: {
      id: 'celtics',
      name: 'Boston Celtics',
      shortName: 'BOS',
      record: '35-10'
    },
    awayTeam: {
      id: 'heat',
      name: 'Miami Heat',
      shortName: 'MIA',
      record: '22-23'
    },
    startTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    status: 'upcoming',
    league: 'NBA',
    sport: 'basketball',
    markets: [
      {
        id: 'moneyline',
        name: 'Moneyline',
        options: [
          { id: 'ml-mia', selection: 'Miami Heat', odds: 280 },
          { id: 'ml-bos', selection: 'Boston Celtics', odds: -340 }
        ]
      },
      {
        id: 'spread',
        name: 'Point Spread',
        options: [
          { id: 'spr-mia', selection: 'Miami Heat +8.5', odds: -110 },
          { id: 'spr-bos', selection: 'Boston Celtics -8.5', odds: -110 }
        ]
      },
      {
        id: 'total',
        name: 'Total Points',
        options: [
          { id: 'tot-o', selection: 'Over 215.5', odds: -110 },
          { id: 'tot-u', selection: 'Under 215.5', odds: -110 }
        ]
      }
    ]
  }
];

const Sports: React.FC = () => {
  // State management
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bets, setBets] = useState<BetSlipItem[]>([]);
  const [isBetSlipOpen, setIsBetSlipOpen] = useState(false);

  // Sports categories
  const sportsCategories = [
    { id: 'all', name: 'All Sports', count: mockGames.length },
    { id: 'basketball', name: 'Basketball', count: mockGames.filter(g => g.sport === 'basketball').length },
    { id: 'football', name: 'Football', count: mockGames.filter(g => g.sport === 'football').length },
    { id: 'baseball', name: 'Baseball', count: 0 },
    { id: 'hockey', name: 'Hockey', count: 0 },
    { id: 'soccer', name: 'Soccer', count: 0 }
  ];

  // Filter options
  const filterOptions = [
    { id: 'all', name: 'All Games' },
    { id: 'live', name: 'Live' },
    { id: 'today', name: 'Today' },
    { id: 'tomorrow', name: 'Tomorrow' }
  ];

  // Filtered games
  const filteredGames = useMemo(() => {
    let filtered = mockGames;

    // Filter by sport
    if (selectedSport !== 'all') {
      filtered = filtered.filter(game => game.sport === selectedSport);
    }

    // Filter by status/time
    if (selectedFilter === 'live') {
      filtered = filtered.filter(game => game.status === 'live');
    } else if (selectedFilter === 'today') {
      const today = new Date().toDateString();
      filtered = filtered.filter(game => 
        new Date(game.startTime).toDateString() === today
      );
    } else if (selectedFilter === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      filtered = filtered.filter(game => 
        new Date(game.startTime).toDateString() === tomorrow.toDateString()
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(game =>
        game.homeTeam.name.toLowerCase().includes(query) ||
        game.awayTeam.name.toLowerCase().includes(query) ||
        game.league.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [selectedSport, selectedFilter, searchQuery]);

  // Bet management
  const handleBetSelect = (betData: {
    gameId: string;
    market: string;
    selection: string;
    odds: number;
    teamId?: string;
  }) => {
    const betId = `${betData.gameId}-${betData.market}-${betData.selection}`;
    
    // Check if bet already exists
    const existingBetIndex = bets.findIndex(bet => bet.id === betId);
    
    if (existingBetIndex >= 0) {
      // Remove existing bet
      setBets(prev => prev.filter(bet => bet.id !== betId));
    } else {
      // Add new bet
      const game = mockGames.find(g => g.id === betData.gameId);
      const newBet: BetSlipItem = {
        id: betId,
        ...betData,
        stake: 0,
        gameInfo: game ? {
          homeTeam: game.homeTeam.name,
          awayTeam: game.awayTeam.name,
          startTime: game.startTime,
          league: game.league
        } : undefined
      };
      
      setBets(prev => [...prev, newBet]);
      
      // Auto-open bet slip on mobile
      if (window.innerWidth < 768) {
        setIsBetSlipOpen(true);
      }
    }
  };

  const handleRemoveBet = (betId: string) => {
    setBets(prev => prev.filter(bet => bet.id !== betId));
  };

  const handleUpdateStake = (betId: string, stake: number) => {
    setBets(prev => prev.map(bet => 
      bet.id === betId ? { ...bet, stake } : bet
    ));
  };

  const handlePlaceBets = async (betsToPlace: BetSlipItem[]) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Clear bets after successful placement
    setBets([]);
    setIsBetSlipOpen(false);
    
    // Show success message (in a real app, use a toast/notification system)
    alert(`Successfully placed ${betsToPlace.length} bet(s)!`);
  };

  const handleClearAllBets = () => {
    setBets([]);
  };

  // Get selected bets for game cards
  const selectedBets = bets.map(bet => ({
    gameId: bet.gameId,
    market: bet.market,
    selection: bet.selection,
    odds: bet.odds,
    teamId: bet.teamId
  }));

  return (
    <div className="sports-page">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Sports Betting</h1>
        <div className="header-meta">
          <span className="games-count">{filteredGames.length} games available</span>
          {bets.length > 0 && (
            <button
              className="btn btn-accent btn-sm mobile-bet-slip-trigger hidden-desktop"
              onClick={() => setIsBetSlipOpen(true)}
            >
              Bet Slip ({bets.length})
            </button>
          )}
        </div>
      </div>

      {/* Sports Categories */}
      <div className="sports-categories">
        <div className="category-tabs">
          {sportsCategories.map(category => (
            <button
              key={category.id}
              className={`category-tab ${selectedSport === category.id ? 'active' : ''}`}
              onClick={() => setSelectedSport(category.id)}
            >
              <span className="tab-name">{category.name}</span>
              <span className="tab-count">{category.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="filters-group">
          {filterOptions.map(filter => (
            <button
              key={filter.id}
              className={`filter-btn ${selectedFilter === filter.id ? 'active' : ''}`}
              onClick={() => setSelectedFilter(filter.id)}
            >
              {filter.name}
            </button>
          ))}
        </div>
        
        <div className="search-container">
          <input
            type="text"
            className="search-input form-input"
            placeholder="Search teams, leagues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="search-icon">🔍</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="sports-content">
        {/* Games Grid */}
        <div className="games-section">
          {filteredGames.length === 0 ? (
            <div className="no-games">
              <div className="no-games-icon">🏟️</div>
              <h3>No games found</h3>
              <p>Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className="games-grid">
              {filteredGames.map(game => (
                <GameCard
                  key={game.id}
                  game={game}
                  selectedBets={selectedBets}
                  onBetSelect={handleBetSelect}
                />
              ))}
            </div>
          )}
        </div>

        {/* Desktop Bet Slip */}
        <div className="bet-slip-section hidden-mobile">
          <BetSlip
            bets={bets}
            onRemoveBet={handleRemoveBet}
            onUpdateStake={handleUpdateStake}
            onPlaceBets={handlePlaceBets}
            onClearAll={handleClearAllBets}
          />
        </div>
      </div>

      {/* Mobile Bet Slip Modal */}
      {isBetSlipOpen && (
        <div className="mobile-bet-slip-overlay hidden-desktop">
          <div className="mobile-bet-slip-modal">
            <BetSlip
              bets={bets}
              isOpen={isBetSlipOpen}
              onRemoveBet={handleRemoveBet}
              onUpdateStake={handleUpdateStake}
              onPlaceBets={handlePlaceBets}
              onClearAll={handleClearAllBets}
              onToggle={() => setIsBetSlipOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Sports; 