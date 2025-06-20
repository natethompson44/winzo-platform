import React, { useState } from 'react';

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

interface UserTableProps {
  users: User[];
  onUserUpdate: (userId: number, updateData: Partial<User>) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onUserUpdate }) => {
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});

  const handleEditStart = (user: User) => {
    setEditingUser(user.id);
    setEditForm({
      wallet_balance: user.wallet_balance,
      is_active: user.is_active,
      role: user.role,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email
    });
  };

  const handleEditSave = (userId: number) => {
    onUserUpdate(userId, editForm);
    setEditingUser(null);
    setEditForm({});
  };

  const handleEditCancel = () => {
    setEditingUser(null);
    setEditForm({});
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatBalance = (balance: string) => {
    return `$${parseFloat(balance).toFixed(2)}`;
  };

  return (
    <div className="user-table-container">
      <table className="user-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Balance</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Last Login</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className={!user.is_active ? 'inactive-user' : ''}>
              <td>
                <div className="user-info">
                  <div className="user-avatar">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="user-name">
                      {user.first_name && user.last_name 
                        ? `${user.first_name} ${user.last_name}`
                        : user.username
                      }
                    </div>
                    <div className="user-username">@{user.username}</div>
                  </div>
                </div>
              </td>
              <td>
                {editingUser === user.id ? (
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="edit-input"
                  />
                ) : (
                  user.email
                )}
              </td>
              <td>
                {editingUser === user.id ? (
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.wallet_balance || ''}
                    onChange={(e) => setEditForm({ ...editForm, wallet_balance: e.target.value })}
                    className="edit-input"
                  />
                ) : (
                  <span className="balance-amount">
                    {formatBalance(user.wallet_balance)}
                  </span>
                )}
              </td>
              <td>
                {editingUser === user.id ? (
                  <select
                    value={editForm.role || 'user'}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="edit-select"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  <span className={`role-badge ${user.role}`}>
                    {user.role}
                  </span>
                )}
              </td>
              <td>
                {editingUser === user.id ? (
                  <select
                    value={editForm.is_active ? 'true' : 'false'}
                    onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === 'true' })}
                    className="edit-select"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                ) : (
                  <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                )}
              </td>
              <td>{formatDate(user.created_at)}</td>
              <td>
                {user.last_login_at ? formatDate(user.last_login_at) : 'Never'}
              </td>
              <td>
                <div className="action-buttons">
                  {editingUser === user.id ? (
                    <>
                      <button
                        onClick={() => handleEditSave(user.id)}
                        className="btn-save"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="btn-cancel"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEditStart(user)}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable; 