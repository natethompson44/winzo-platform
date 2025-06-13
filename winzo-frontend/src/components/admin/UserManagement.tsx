import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../utils/axios';
import { API_ENDPOINTS } from '../../config/api';
import toast from 'react-hot-toast';
import './UserManagement.css';

interface User {
  id: number;
  username: string;
  email?: string;
  wallet_balance: number;
  is_active: boolean;
  created_at: string;
  last_login?: string;
  total_bets: number;
  total_winnings: number;
  verification_status: 'pending' | 'verified' | 'rejected';
}

interface UserFilters {
  search: string;
  status: 'all' | 'active' | 'inactive';
  verification: 'all' | 'pending' | 'verified' | 'rejected';
  sortBy: 'username' | 'created_at' | 'wallet_balance' | 'total_bets';
  sortOrder: 'asc' | 'desc';
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    status: 'all',
    verification: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(20);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        search: filters.search,
        status: filters.status,
        verification: filters.verification,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });

      const response = await apiClient.get(`/api/admin/users?${params}`);
      
      if (response.data.success) {
        setUsers(response.data.data);
        setTotalPages(Math.ceil(response.data.total / pageSize));
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error(error.message || 'Failed to fetch users');
      
      // Fallback data for development
      setUsers([
        {
          id: 1,
          username: 'john_doe',
          email: 'john@example.com',
          wallet_balance: 1250.50,
          is_active: true,
          created_at: '2024-01-15T10:30:00Z',
          last_login: '2024-01-20T14:22:00Z',
          total_bets: 45,
          total_winnings: 3200.00,
          verification_status: 'verified'
        },
        {
          id: 2,
          username: 'jane_smith',
          email: 'jane@example.com',
          wallet_balance: 750.25,
          is_active: true,
          created_at: '2024-01-16T09:15:00Z',
          last_login: '2024-01-20T16:45:00Z',
          total_bets: 23,
          total_winnings: 1800.00,
          verification_status: 'pending'
        },
        {
          id: 3,
          username: 'big_better',
          email: 'big@example.com',
          wallet_balance: 5000.00,
          is_active: false,
          created_at: '2024-01-10T11:20:00Z',
          last_login: '2024-01-19T20:30:00Z',
          total_bets: 156,
          total_winnings: 12500.00,
          verification_status: 'verified'
        }
      ]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFilterChange = (key: keyof UserFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleUserAction = async (userId: number, action: 'suspend' | 'activate' | 'verify' | 'reject') => {
    try {
      const response = await apiClient.patch(`/api/admin/users/${userId}/${action}`);
      
      if (response.data.success) {
        toast.success(`User ${action}ed successfully`);
        fetchUsers();
      }
    } catch (error: any) {
      console.error(`Error ${action}ing user:`, error);
      toast.error(error.message || `Failed to ${action} user`);
    }
  };

  const adjustBalance = async (userId: number, adjustment: number) => {
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.WALLET_DEPOSIT}`, {
        user_id: userId,
        amount: adjustment
      });
      
      if (response.data.success) {
        toast.success(`Balance adjusted by $${adjustment}`);
        fetchUsers(); // Refresh the list
      }
    } catch (error: any) {
      console.error('Error adjusting balance:', error);
      toast.error(error.message || 'Failed to adjust balance');
    }
  };

  const openUserModal = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setSelectedUser(null);
    setShowUserModal(false);
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

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const getVerificationBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Pending', class: 'pending' },
      verified: { label: 'Verified', class: 'verified' },
      rejected: { label: 'Rejected', class: 'rejected' }
    };
    
    const { label, class: badgeClass } = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    
    return (
      <span className={`verification-badge ${badgeClass}`}>
        {label}
      </span>
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(filters.search.toLowerCase()) ||
                         (user.email && user.email.toLowerCase().includes(filters.search.toLowerCase()));
    const matchesStatus = filters.status === 'all' || 
                         (filters.status === 'active' && user.is_active) ||
                         (filters.status === 'inactive' && !user.is_active);
    const matchesVerification = filters.verification === 'all' || user.verification_status === filters.verification;
    
    return matchesSearch && matchesStatus && matchesVerification;
  });

  return (
    <div className="user-management">
      {/* Header */}
      <div className="user-management-header">
        <div className="user-management-title">
          <h1>User Management</h1>
          <p>Manage user accounts, balances, and verification status</p>
        </div>
        <div className="user-management-actions">
          <button className="admin-btn primary" onClick={() => toast.success('Export users to CSV')}>
            📊 Export
          </button>
          <button className="admin-btn secondary" onClick={() => toast.success('Bulk actions menu')}>
            ⚙️ Bulk Actions
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="user-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search users..."
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        
        <div className="filter-group">
          <select
            value={filters.verification}
            onChange={(e) => handleFilterChange('verification', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Verification</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        
        <div className="filter-group">
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="filter-select"
          >
            <option value="created_at">Created Date</option>
            <option value="username">Username</option>
            <option value="wallet_balance">Balance</option>
            <option value="total_bets">Total Bets</option>
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

      {/* Users Table */}
      <div className="users-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Verification</th>
                <th>Bets</th>
                <th>Winnings</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="user-row">
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-details">
                        <div className="user-name">{user.username}</div>
                        <div className="user-email">{user.email || 'No email'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="balance-info">
                      <div className="balance-amount">{formatCurrency(user.wallet_balance)}</div>
                    </div>
                  </td>
                  <td>{getStatusBadge(user.is_active)}</td>
                  <td>{getVerificationBadge(user.verification_status)}</td>
                  <td>{user.total_bets}</td>
                  <td>{formatCurrency(user.total_winnings)}</td>
                  <td>{formatDate(user.created_at)}</td>
                  <td>
                    <div className="user-actions">
                      <button
                        className="action-btn view"
                        onClick={() => openUserModal(user)}
                        title="View Details"
                      >
                        👁️
                      </button>
                      {user.is_active ? (
                        <button
                          className="action-btn suspend"
                          onClick={() => handleUserAction(user.id, 'suspend')}
                          title="Suspend User"
                        >
                          ⏸️
                        </button>
                      ) : (
                        <button
                          className="action-btn activate"
                          onClick={() => handleUserAction(user.id, 'activate')}
                          title="Activate User"
                        >
                          ▶️
                        </button>
                      )}
                      {user.verification_status === 'pending' && (
                        <>
                          <button
                            className="action-btn verify"
                            onClick={() => handleUserAction(user.id, 'verify')}
                            title="Verify User"
                          >
                            ✅
                          </button>
                          <button
                            className="action-btn reject"
                            onClick={() => handleUserAction(user.id, 'reject')}
                            title="Reject User"
                          >
                            ❌
                          </button>
                        </>
                      )}
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

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={closeUserModal}
          onBalanceAdjustment={adjustBalance}
        />
      )}
    </div>
  );
};

// User Detail Modal Component
interface UserDetailModalProps {
  user: User;
  onClose: () => void;
  onBalanceAdjustment: (userId: number, adjustment: number) => Promise<void>;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose, onBalanceAdjustment }) => {
  const [adjustment, setAdjustment] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const adjustmentValue = parseFloat(adjustment);
    if (isNaN(adjustmentValue) || adjustmentValue === 0) {
      toast.error('Please enter a valid adjustment amount');
      return;
    }
    
    if (!reason.trim()) {
      toast.error('Please provide a reason for the adjustment');
      return;
    }

    setLoading(true);
    await onBalanceAdjustment(user.id, adjustmentValue);
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>User Details - {user.username}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="user-detail-grid">
            <div className="detail-section">
              <h3>Account Information</h3>
              <div className="detail-item">
                <label>Username:</label>
                <span>{user.username}</span>
              </div>
              <div className="detail-item">
                <label>Email:</label>
                <span>{user.email || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <label>Created:</label>
                <span>{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
              <div className="detail-item">
                <label>Last Login:</label>
                <span>{user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</span>
              </div>
            </div>
            
            <div className="detail-section">
              <h3>Financial Information</h3>
              <div className="detail-item">
                <label>Current Balance:</label>
                <span className="balance-highlight">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(user.wallet_balance)}</span>
              </div>
              <div className="detail-item">
                <label>Total Bets:</label>
                <span>{user.total_bets}</span>
              </div>
              <div className="detail-item">
                <label>Total Winnings:</label>
                <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(user.total_winnings)}</span>
              </div>
            </div>
          </div>
          
          <div className="balance-adjustment-section">
            <h3>Balance Adjustment</h3>
            <form onSubmit={handleSubmit} className="adjustment-form">
              <div className="form-group">
                <label htmlFor="adjustment">Adjustment Amount ($)</label>
                <input
                  type="number"
                  id="adjustment"
                  value={adjustment}
                  onChange={(e) => setAdjustment(e.target.value)}
                  placeholder="Enter amount (positive or negative)"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="reason">Reason</label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide reason for adjustment"
                  rows={3}
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={onClose} className="admin-btn secondary">
                  Cancel
                </button>
                <button type="submit" className="admin-btn primary" disabled={loading}>
                  {loading ? 'Processing...' : 'Apply Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement; 