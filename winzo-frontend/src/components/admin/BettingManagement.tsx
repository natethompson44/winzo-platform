import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../utils/axios';
import { handleApiError } from '../../config/api';
import toast from 'react-hot-toast';
import './BettingManagement.css';

interface Bet {
  id: number;
  user_id: number;
  username: string;
  selected_team: string;
  odds: number;
  stake: number;
  potential_payout: number;
  status: 'pending' | 'won' | 'lost' | 'cancelled';
  placed_at: string;
  settled_at?: string;
  sportsEvent: {
    id: string;
    home_team: string;
    away_team: string;
    sport_key: string;
    start_time: string;
    status: 'upcoming' | 'live' | 'finished';
  };
}

interface BetFilters {
  search: string;
  status: 'all' | 'pending' | 'won' | 'lost' | 'cancelled';
  sport: 'all' | string;
  dateRange: 'all' | 'today' | 'week' | 'month';
  sortBy: 'placed_at' | 'stake' | 'potential_payout' | 'odds';
  sortOrder: 'asc' | 'desc';
}

const BettingManagement: React.FC = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [filters, setFilters] = useState<BetFilters>({
    search: '',
    status: 'all',
    sport: 'all',
    dateRange: 'all',
    sortBy: 'placed_at',
    sortOrder: 'desc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(20);
  const [stats, setStats] = useState({
    totalBets: 0,
    totalStake: 0,
    totalPayout: 0,
    pendingBets: 0,
    winRate: 0
  });

  const fetchBets = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        search: filters.search,
        status: filters.status,
        sport: filters.sport,
        dateRange: filters.dateRange,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });

      const response = await apiClient.get(`/api/admin/bets?${params}`);
      
      if (response.data.success) {
        setBets(response.data.data);
        setTotalPages(Math.ceil(response.data.total / pageSize));
        setStats(response.data.stats);
      }
    } catch (error: any) {
      console.error('Error fetching bets:', error);
      toast.error(handleApiError(error));
      
      // Fallback data for development
      setBets([
        {
          id: 1,
          user_id: 1,
          username: 'john_doe',
          selected_team: 'Lakers',
          odds: 2.5,
          stake: 100,
          potential_payout: 250,
          status: 'pending',
          placed_at: '2024-01-20T14:30:00Z',
          sportsEvent: {
            id: '1',
            home_team: 'Lakers',
            away_team: 'Warriors',
            sport_key: 'basketball',
            start_time: '2024-01-21T20:00:00Z',
            status: 'upcoming'
          }
        },
        {
          id: 2,
          user_id: 2,
          username: 'jane_smith',
          selected_team: 'Chiefs',
          odds: 1.8,
          stake: 50,
          potential_payout: 90,
          status: 'won',
          placed_at: '2024-01-19T10:15:00Z',
          settled_at: '2024-01-20T16:45:00Z',
          sportsEvent: {
            id: '2',
            home_team: 'Chiefs',
            away_team: 'Bills',
            sport_key: 'football',
            start_time: '2024-01-20T15:00:00Z',
            status: 'finished'
          }
        },
        {
          id: 3,
          user_id: 3,
          username: 'big_better',
          selected_team: 'Manchester City',
          odds: 3.2,
          stake: 500,
          potential_payout: 1600,
          status: 'lost',
          placed_at: '2024-01-18T09:45:00Z',
          settled_at: '2024-01-19T18:30:00Z',
          sportsEvent: {
            id: '3',
            home_team: 'Manchester City',
            away_team: 'Arsenal',
            sport_key: 'soccer',
            start_time: '2024-01-19T14:00:00Z',
            status: 'finished'
          }
        }
      ]);
      setTotalPages(1);
      setStats({
        totalBets: 3,
        totalStake: 650,
        totalPayout: 90,
        pendingBets: 1,
        winRate: 33.3
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters]);

  useEffect(() => {
    fetchBets();
  }, [fetchBets]);

  const handleFilterChange = (key: keyof BetFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSettleBet = async (betId: number, result: 'won' | 'lost') => {
    try {
      const response = await apiClient.patch(`/api/admin/bets/${betId}/settle`, {
        result
      });
      
      if (response.data.success) {
        toast.success(`Bet settled as ${result}`);
        fetchBets();
        setShowSettlementModal(false);
      }
    } catch (error: any) {
      console.error('Error settling bet:', error);
      toast.error(handleApiError(error));
    }
  };

  const handleCancelBet = async (betId: number) => {
    try {
      const response = await apiClient.patch(`/api/admin/bets/${betId}/cancel`);
      
      if (response.data.success) {
        toast.success('Bet cancelled successfully');
        fetchBets();
      }
    } catch (error: any) {
      console.error('Error cancelling bet:', error);
      toast.error(handleApiError(error));
    }
  };

  const openSettlementModal = (bet: Bet) => {
    setSelectedBet(bet);
    setShowSettlementModal(true);
  };

  const closeSettlementModal = () => {
    setSelectedBet(null);
    setShowSettlementModal(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Pending', class: 'pending' },
      won: { label: 'Won', class: 'won' },
      lost: { label: 'Lost', class: 'lost' },
      cancelled: { label: 'Cancelled', class: 'cancelled' }
    };
    
    const { label, class: badgeClass } = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    
    return (
      <span className={`bet-status-badge ${badgeClass}`}>
        {label}
      </span>
    );
  };

  const getEventStatusBadge = (status: string) => {
    const statusMap = {
      upcoming: { label: 'Upcoming', class: 'upcoming' },
      live: { label: 'Live', class: 'live' },
      finished: { label: 'Finished', class: 'finished' }
    };
    
    const { label, class: badgeClass } = statusMap[status as keyof typeof statusMap] || statusMap.upcoming;
    
    return (
      <span className={`event-status-badge ${badgeClass}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="betting-management">
      {/* Header */}
      <div className="betting-management-header">
        <div className="betting-management-title">
          <h1>Betting Management</h1>
          <p>Monitor and manage all betting activity</p>
        </div>
        <div className="betting-management-actions">
          <button className="admin-btn primary" onClick={() => toast.success('Export bets to CSV')}>
            📊 Export
          </button>
          <button className="admin-btn secondary" onClick={() => toast.success('Bulk settlement menu')}>
            ⚙️ Bulk Actions
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="betting-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>Total Bets</h3>
            <div className="stat-value">{stats.totalBets}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Stake</h3>
            <div className="stat-value">{formatCurrency(stats.totalStake)}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <h3>Total Payout</h3>
            <div className="stat-value">{formatCurrency(stats.totalPayout)}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending Bets</h3>
            <div className="stat-value">{stats.pendingBets}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Win Rate</h3>
            <div className="stat-value">{stats.winRate.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bet-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search bets..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="filter-input"
          />
        </div>
        
        <div className="filter-group">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        <div className="filter-group">
          <select
            value={filters.sport}
            onChange={(e) => handleFilterChange('sport', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Sports</option>
            <option value="basketball">Basketball</option>
            <option value="football">Football</option>
            <option value="soccer">Soccer</option>
            <option value="baseball">Baseball</option>
          </select>
        </div>
        
        <div className="filter-group">
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
        
        <div className="filter-group">
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="filter-select"
          >
            <option value="placed_at">Date Placed</option>
            <option value="stake">Stake Amount</option>
            <option value="potential_payout">Potential Payout</option>
            <option value="odds">Odds</option>
          </select>
        </div>
        
        <div className="filter-group">
          <select
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            className="filter-select"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {/* Bets Table */}
      <div className="bets-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading bets...</p>
          </div>
        ) : (
          <table className="bets-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Event</th>
                <th>Selection</th>
                <th>Odds</th>
                <th>Stake</th>
                <th>Potential Payout</th>
                <th>Status</th>
                <th>Placed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bets.map((bet) => (
                <tr key={bet.id} className="bet-row">
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {bet.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-name">{bet.username}</div>
                    </div>
                  </td>
                  <td>
                    <div className="event-info">
                      <div className="event-teams">
                        {bet.sportsEvent.home_team} vs {bet.sportsEvent.away_team}
                      </div>
                      <div className="event-details">
                        <span className="sport-type">{bet.sportsEvent.sport_key}</span>
                        {getEventStatusBadge(bet.sportsEvent.status)}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="selection-info">
                      <span className="selected-team">{bet.selected_team}</span>
                    </div>
                  </td>
                  <td>
                    <div className="odds-info">
                      <span className="odds-value">{bet.odds.toFixed(2)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="stake-info">
                      <span className="stake-amount">{formatCurrency(bet.stake)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="payout-info">
                      <span className="payout-amount">{formatCurrency(bet.potential_payout)}</span>
                    </div>
                  </td>
                  <td>{getStatusBadge(bet.status)}</td>
                  <td>{formatDate(bet.placed_at)}</td>
                  <td>
                    <div className="bet-actions">
                      {bet.status === 'pending' && (
                        <>
                          <button
                            className="action-btn settle"
                            onClick={() => openSettlementModal(bet)}
                            title="Settle Bet"
                          >
                            ⚖️
                          </button>
                          <button
                            className="action-btn cancel"
                            onClick={() => handleCancelBet(bet.id)}
                            title="Cancel Bet"
                          >
                            ❌
                          </button>
                        </>
                      )}
                      <button
                        className="action-btn view"
                        onClick={() => toast.success(`View bet details for ${bet.id}`)}
                        title="View Details"
                      >
                        👁️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>
          
          <div className="pagination-info">
            Page {currentPage} of {totalPages}
          </div>
          
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}

      {/* Settlement Modal */}
      {showSettlementModal && selectedBet && (
        <BetSettlementModal
          bet={selectedBet}
          onClose={closeSettlementModal}
          onSettle={handleSettleBet}
        />
      )}
    </div>
  );
};

// Bet Settlement Modal Component
interface BetSettlementModalProps {
  bet: Bet;
  onClose: () => void;
  onSettle: (betId: number, result: 'won' | 'lost') => Promise<void>;
}

const BetSettlementModal: React.FC<BetSettlementModalProps> = ({ bet, onClose, onSettle }) => {
  const [loading, setLoading] = useState(false);

  const handleSettle = async (result: 'won' | 'lost') => {
    setLoading(true);
    await onSettle(bet.id, result);
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settle Bet - {bet.username}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="bet-details">
            <div className="detail-section">
              <h3>Bet Information</h3>
              <div className="detail-item">
                <label>User:</label>
                <span>{bet.username}</span>
              </div>
              <div className="detail-item">
                <label>Event:</label>
                <span>{bet.sportsEvent.home_team} vs {bet.sportsEvent.away_team}</span>
              </div>
              <div className="detail-item">
                <label>Selection:</label>
                <span>{bet.selected_team}</span>
              </div>
              <div className="detail-item">
                <label>Odds:</label>
                <span>{bet.odds.toFixed(2)}</span>
              </div>
              <div className="detail-item">
                <label>Stake:</label>
                <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(bet.stake)}</span>
              </div>
              <div className="detail-item">
                <label>Potential Payout:</label>
                <span className="payout-highlight">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(bet.potential_payout)}</span>
              </div>
            </div>
          </div>
          
          <div className="settlement-actions">
            <h3>Set Result</h3>
            <div className="settlement-buttons">
              <button
                className="settle-btn won"
                onClick={() => handleSettle('won')}
                disabled={loading}
              >
                ✅ Won - Pay ${bet.potential_payout.toFixed(2)}
              </button>
              <button
                className="settle-btn lost"
                onClick={() => handleSettle('lost')}
                disabled={loading}
              >
                ❌ Lost - No Payout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BettingManagement; 