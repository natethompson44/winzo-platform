import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import UserTable from '../../components/admin/UserTable';
import apiClient from '../../utils/apiClient';

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  wallet_balance: string;
  is_active: boolean;
  role: string;
  created_at: string;
  last_login_at?: string;
}

interface UserFilters {
  search: string;
  role: string;
  status: string;
  sortBy: string;
  sortOrder: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: '',
    status: '',
    sortBy: 'created_at',
    sortOrder: 'DESC'
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      
      const response = await apiClient.get('/admin/users', { params });
      
      if (response.success) {
        setUsers(response.data.data.users);
        setPagination(prev => ({
          ...prev,
          total: response.data.data.pagination.total,
          totalPages: response.data.data.pagination.totalPages
        }));
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      console.error('Users fetch error:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<UserFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleUserUpdate = async (userId: number, updateData: Partial<User>) => {
    try {
      const response = await apiClient.put(`/admin/users/${userId}`, updateData);
      
      if (response.success) {
        // Update user in local state
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, ...response.data.data } : user
        ));
      } else {
        alert('Failed to update user');
      }
    } catch (err) {
      console.error('User update error:', err);
      alert('Failed to update user');
    }
  };

  return (
    <AdminLayout>
      <div className="user-management">
        <div className="admin-header">
          <h1>User Management</h1>
          <p>Manage user accounts and permissions</p>
        </div>

        {/* Filters */}
        <div className="user-filters">
          <div className="filter-row">
            <input
              type="text"
              placeholder="Search users..."
              value={filters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              className="search-input"
            />
            
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange({ role: e.target.value })}
              className="filter-select"
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange({ status: e.target.value })}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                handleFilterChange({ sortBy, sortOrder });
              }}
              className="filter-select"
            >
              <option value="created_at-DESC">Newest First</option>
              <option value="created_at-ASC">Oldest First</option>
              <option value="username-ASC">Username A-Z</option>
              <option value="username-DESC">Username Z-A</option>
              <option value="wallet_balance-DESC">Balance High-Low</option>
              <option value="wallet_balance-ASC">Balance Low-High</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="admin-loading">
            <div className="loading-spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : error ? (
          <div className="admin-error">
            <h3>Error Loading Users</h3>
            <p>{error}</p>
            <button className="btn-primary" onClick={fetchUsers}>
              Retry
            </button>
          </div>
        ) : (
          <>
            <UserTable
              users={users}
              onUserUpdate={handleUserUpdate}
            />
            
            {/* Pagination */}
            <div className="pagination">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="pagination-btn"
              >
                Previous
              </button>
              
              <span className="pagination-info">
                Page {pagination.page} of {pagination.totalPages} 
                ({pagination.total} total users)
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default UserManagement; 