import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { BetHistory, PaginationOptions } from '../../types/betting';

interface BettingHistoryTableProps {
  bets: BetHistory[];
  pagination: PaginationOptions;
  onPageChange: (page: number) => void;
}

type SortField = 'date' | 'sport' | 'stake' | 'odds' | 'payout' | 'status';
type SortDirection = 'asc' | 'desc';

const BettingHistoryTable: React.FC<BettingHistoryTableProps> = ({
  bets,
  pagination,
  onPageChange
}) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const toggleRowExpansion = (betId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(betId)) {
      newExpanded.delete(betId);
    } else {
      newExpanded.add(betId);
    }
    setExpandedRows(newExpanded);
  };

  const sortedBets = [...bets].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortField) {
      case 'date':
        aValue = new Date(a.date);
        bValue = new Date(b.date);
        break;
      case 'sport':
        aValue = a.sport;
        bValue = b.sport;
        break;
      case 'stake':
        aValue = a.stake;
        bValue = b.stake;
        break;
      case 'odds':
        aValue = a.odds;
        bValue = b.odds;
        break;
      case 'payout':
        aValue = a.payout;
        bValue = b.payout;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedBets = sortedBets.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };



  const getStatusBadge = (status: string) => {
    const baseClasses = 'status-badge';
    switch (status) {
      case 'won': return `${baseClasses} status-won`;
      case 'lost': return `${baseClasses} status-lost`;
      case 'pending': return `${baseClasses} status-pending`;
      case 'cancelled': return `${baseClasses} status-cancelled`;
      case 'void': return `${baseClasses} status-void`;
      default: return baseClasses;
    }
  };

  const SortableHeader: React.FC<{ field: SortField; children: React.ReactNode }> = ({ field, children }) => (
    <th 
      className={`sortable-header ${sortField === field ? 'active' : ''}`}
      onClick={() => handleSort(field)}
    >
      <span className="header-content">
        {children}
        <span className="sort-icon">
          {sortField === field ? (
            sortDirection === 'asc' ? '↑' : '↓'
          ) : '↕'}
        </span>
      </span>
    </th>
  );

  if (bets.length === 0) {
    return (
      <Card className="empty-state">
        <div className="empty-content">
          <div className="empty-icon">📊</div>
          <h3 className="text-xl font-semibold text-primary mb-2">No Betting History</h3>
          <p className="text-secondary">
            You haven't placed any bets yet or no bets match your current filters.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="betting-history-table">
      <Card>
        <div className="table-container">
          <div className="table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th className="expand-column"></th>
                  <SortableHeader field="date">Date</SortableHeader>
                  <SortableHeader field="sport">Sport</SortableHeader>
                  <th>Event</th>
                  <th>Bet Type</th>
                  <SortableHeader field="stake">Stake</SortableHeader>
                  <SortableHeader field="odds">Odds</SortableHeader>
                  <SortableHeader field="payout">Payout</SortableHeader>
                  <SortableHeader field="status">Status</SortableHeader>
                </tr>
              </thead>
              <tbody>
                {paginatedBets.map((bet) => (
                  <React.Fragment key={bet.id}>
                    <tr className={`bet-row ${expandedRows.has(bet.id) ? 'expanded' : ''}`}>
                      <td className="expand-cell">
                        <button
                          className="expand-button"
                          onClick={() => toggleRowExpansion(bet.id)}
                          aria-label="Toggle details"
                        >
                          {expandedRows.has(bet.id) ? '−' : '+'}
                        </button>
                      </td>
                      <td className="date-cell">
                        {formatDate(bet.date)}
                      </td>
                      <td className="sport-cell">
                        <span className="sport-badge">{bet.sport}</span>
                      </td>
                      <td className="event-cell">
                        <div className="event-info">
                          <div className="event-name">{bet.event}</div>
                          {bet.league && (
                            <div className="league-name">{bet.league}</div>
                          )}
                        </div>
                      </td>
                      <td className="bet-type-cell">
                        {bet.betType}
                      </td>
                      <td className="stake-cell">
                        {formatCurrency(bet.stake)}
                      </td>
                      <td className="odds-cell">
                        {bet.odds.toFixed(2)}
                      </td>
                      <td className="payout-cell">
                        <span className={bet.payout > bet.stake ? 'profit' : bet.payout === 0 ? 'loss' : 'neutral'}>
                          {formatCurrency(bet.payout)}
                        </span>
                      </td>
                      <td className="status-cell">
                        <span className={getStatusBadge(bet.status)}>
                          {bet.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                    {expandedRows.has(bet.id) && (
                      <tr className="bet-details-row">
                        <td colSpan={9}>
                          <div className="bet-details">
                            <div className="details-grid">
                              <div className="detail-item">
                                <label>Selection:</label>
                                <span>{bet.selection}</span>
                              </div>
                              <div className="detail-item">
                                <label>Market:</label>
                                <span>{bet.market}</span>
                              </div>
                              <div className="detail-item">
                                <label>Time Placed:</label>
                                <span>{new Date(bet.timestamp).toLocaleString()}</span>
                              </div>
                              <div className="detail-item">
                                <label>Potential Return:</label>
                                <span>{formatCurrency(bet.stake * bet.odds)}</span>
                              </div>
                              {bet.teams && (
                                <>
                                  <div className="detail-item">
                                    <label>Home Team:</label>
                                    <span>{bet.teams.home}</span>
                                  </div>
                                  <div className="detail-item">
                                    <label>Away Team:</label>
                                    <span>{bet.teams.away}</span>
                                  </div>
                                </>
                              )}
                              <div className="detail-item">
                                <label>Net Result:</label>
                                <span className={bet.payout - bet.stake > 0 ? 'profit' : bet.payout - bet.stake < 0 ? 'loss' : 'neutral'}>
                                  {formatCurrency(bet.payout - bet.stake)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} bets
            </div>
            <div className="pagination-controls">
              <Button
                variant="ghost"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => onPageChange(pagination.page - 1)}
              >
                Previous
              </Button>
              
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = i + Math.max(1, pagination.page - 2);
                if (pageNum > pagination.totalPages) return null;
                
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === pagination.page ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button
                variant="ghost"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => onPageChange(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
      
      {/* Mobile Summary */}
      <div className="mobile-summary">
        <Card>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Total Shown:</span>
              <span className="stat-value">{paginatedBets.length} bets</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Staked:</span>
              <span className="stat-value">
                {formatCurrency(paginatedBets.reduce((sum, bet) => sum + bet.stake, 0))}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Payout:</span>
              <span className="stat-value">
                {formatCurrency(paginatedBets.reduce((sum, bet) => sum + bet.payout, 0))}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BettingHistoryTable; 