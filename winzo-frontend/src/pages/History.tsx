import React, { useState, useEffect } from 'react';
import BettingHistoryTable from '../components/history/BettingHistoryTable';
import AnalyticsDashboard from '../components/history/AnalyticsDashboard';
import AdvancedFilters from '../components/history/AdvancedFilters';
import ExportTools from '../components/history/ExportTools';
import Button from '../components/ui/Button/Button';
import Card from '../components/ui/Card/Card';
import { BetHistory, BettingAnalytics, FilterOptions, PaginationOptions } from '../types/betting';
import '../styles/history.css';

const History: React.FC = () => {
  const [viewMode, setViewMode] = useState<'history' | 'analytics'>('history');
  const [bets, setBets] = useState<BetHistory[]>([]);
  const [analytics, setAnalytics] = useState<BettingAnalytics | null>(null);
  const [filteredBets, setFilteredBets] = useState<BetHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    sports: [],
    betTypes: [],
    statuses: [],
    stakeRange: { min: 0, max: 1000 },
    search: ''
  });
  const [pagination, setPagination] = useState<PaginationOptions>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Simulate API call to fetch betting history
  useEffect(() => {
    const fetchBettingHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock data - replace with actual API call
        const mockBets: BetHistory[] = [
          {
            id: 'bet_001',
            date: '2024-01-15',
            sport: 'Basketball',
            event: 'Lakers vs Warriors',
            betType: 'Point Spread',
            stake: 50,
            odds: 1.91,
            payout: 95.50,
            status: 'won',
            teams: { home: 'Warriors', away: 'Lakers' },
            market: 'Point Spread',
            selection: 'Lakers +3.5',
            league: 'NBA',
            timestamp: '2024-01-15T20:30:00Z'
          },
          {
            id: 'bet_002',
            date: '2024-01-15',
            sport: 'Football',
            event: 'Chiefs vs Bills',
            betType: 'Moneyline',
            stake: 75,
            odds: 2.10,
            payout: 0,
            status: 'lost',
            teams: { home: 'Bills', away: 'Chiefs' },
            market: 'Moneyline',
            selection: 'Chiefs ML',
            league: 'NFL',
            timestamp: '2024-01-15T18:00:00Z'
          },
          {
            id: 'bet_003',
            date: '2024-01-14',
            sport: 'Basketball',
            event: 'Celtics vs Heat',
            betType: 'Total Points',
            stake: 25,
            odds: 1.95,
            payout: 48.75,
            status: 'won',
            teams: { home: 'Heat', away: 'Celtics' },
            market: 'Total Points',
            selection: 'Over 220.5',
            league: 'NBA',
            timestamp: '2024-01-14T19:30:00Z'
          },
          {
            id: 'bet_004',
            date: '2024-01-14',
            sport: 'Soccer',
            event: 'Manchester United vs Liverpool',
            betType: 'Moneyline',
            stake: 100,
            odds: 2.50,
            payout: 0,
            status: 'lost',
            teams: { home: 'Liverpool', away: 'Manchester United' },
            market: 'Match Result',
            selection: 'Manchester United Win',
            league: 'Premier League',
            timestamp: '2024-01-14T15:00:00Z'
          },
          {
            id: 'bet_005',
            date: '2024-01-13',
            sport: 'Basketball',
            event: 'Nets vs Knicks',
            betType: 'Point Spread',
            stake: 60,
            odds: 1.87,
            payout: 112.20,
            status: 'won',
            teams: { home: 'Knicks', away: 'Nets' },
            market: 'Point Spread',
            selection: 'Nets +5.5',
            league: 'NBA',
            timestamp: '2024-01-13T20:00:00Z'
          }
        ];

        const mockAnalytics: BettingAnalytics = {
          totalBets: 142,
          totalStake: 3250.00,
          totalPayout: 4097.25,
          netProfit: 847.25,
          winRate: 64.8,
          roi: 26.1,
          averageStake: 22.89,
          averageOdds: 1.94,
          longestWinStreak: 8,
          longestLoseStreak: 4,
          currentStreak: { type: 'win', count: 3 },
          profitByMonth: [
            { month: '2024-01', profit: 847.25, bets: 142 },
            { month: '2023-12', profit: 523.75, bets: 98 },
            { month: '2023-11', profit: -125.50, bets: 67 }
          ],
          sportBreakdown: [
            { sport: 'Basketball', bets: 58, profit: 425.75, winRate: 69.0 },
            { sport: 'Football', bets: 42, profit: 312.50, winRate: 61.9 },
            { sport: 'Soccer', bets: 28, profit: 89.00, winRate: 57.1 },
            { sport: 'Baseball', bets: 14, profit: 20.00, winRate: 64.3 }
          ],
          betTypeBreakdown: [
            { type: 'Point Spread', bets: 63, profit: 398.25, winRate: 66.7 },
            { type: 'Moneyline', bets: 45, profit: 234.50, winRate: 62.2 },
            { type: 'Total Points', bets: 34, profit: 214.50, winRate: 67.6 }
          ]
        };

        setBets(mockBets);
        setAnalytics(mockAnalytics);
        setFilteredBets(mockBets);
        setPagination(prev => ({
          ...prev,
          total: mockBets.length,
          totalPages: Math.ceil(mockBets.length / prev.limit)
        }));
      } catch (err) {
        setError('Failed to load betting history. Please try again.');
        console.error('History fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBettingHistory();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...bets];

    // Date range filter
    if (filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter(bet => 
        bet.date >= filters.dateRange.start && bet.date <= filters.dateRange.end
      );
    }

    // Sport filter
    if (filters.sports.length > 0) {
      filtered = filtered.filter(bet => filters.sports.includes(bet.sport));
    }

    // Bet type filter
    if (filters.betTypes.length > 0) {
      filtered = filtered.filter(bet => filters.betTypes.includes(bet.betType));
    }

    // Status filter
    if (filters.statuses.length > 0) {
      filtered = filtered.filter(bet => filters.statuses.includes(bet.status));
    }

    // Stake range filter
    filtered = filtered.filter(bet => 
      bet.stake >= filters.stakeRange.min && bet.stake <= filters.stakeRange.max
    );

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(bet =>
        bet.event.toLowerCase().includes(searchTerm) ||
        bet.sport.toLowerCase().includes(searchTerm) ||
        bet.betType.toLowerCase().includes(searchTerm) ||
        bet.selection?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredBets(filtered);
    setPagination(prev => ({
      ...prev,
      page: 1,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / prev.limit)
    }));
  }, [bets, filters]);

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="content">
          <div className="loading-container">
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
            <p className="loading-text">Loading your betting history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content">
        <div className="content">
          <Card className="error-card">
            <h2 className="text-2xl font-semibold text-primary mb-4">Unable to Load History</h2>
            <p className="text-secondary mb-6">{error}</p>
            <Button 
              variant="primary"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="content history-page">
        {/* Header */}
        <div className="history-header mb-6">
          <div className="header-content">
            <h1 className="text-4xl font-bold text-primary mb-2">
              Betting History
            </h1>
            <p className="text-lg text-secondary">
              Track your betting performance and analyze your patterns
            </p>
          </div>
          
          <div className="header-actions">
            <div className="view-toggle">
              <Button
                variant={viewMode === 'history' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('history')}
              >
                History
              </Button>
              <Button
                variant={viewMode === 'analytics' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('analytics')}
              >
                Analytics
              </Button>
            </div>
            
            <ExportTools 
              bets={filteredBets}
              analytics={analytics}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="history-filters mb-6">
          <AdvancedFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            availableSports={Array.from(new Set(bets.map(bet => bet.sport)))}
            availableBetTypes={Array.from(new Set(bets.map(bet => bet.betType)))}
          />
        </div>

        {/* Content */}
        <div className="history-content">
          {viewMode === 'history' ? (
            <BettingHistoryTable
              bets={filteredBets}
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          ) : (
            analytics && (
              <AnalyticsDashboard
                analytics={analytics}
                bets={filteredBets}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default History; 