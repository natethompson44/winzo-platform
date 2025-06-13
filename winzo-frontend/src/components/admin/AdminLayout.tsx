import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AdminLayout.css';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navigationItems = [
    {
      path: '/admin/dashboard',
      label: 'Dashboard',
      icon: '📊',
      description: 'Overview & Analytics'
    },
    {
      path: '/admin/users',
      label: 'User Management',
      icon: '👥',
      description: 'Manage Users & Accounts'
    },
    {
      path: '/admin/betting',
      label: 'Betting Management',
      icon: '🎯',
      description: 'Bets, Odds & Settlements'
    },
    {
      path: '/admin/financial',
      label: 'Financial',
      icon: '💰',
      description: 'Transactions & Revenue'
    },
    {
      path: '/admin/content',
      label: 'Content',
      icon: '📝',
      description: 'Sports & Promotions'
    },
    {
      path: '/admin/system',
      label: 'System',
      icon: '⚙️',
      description: 'Settings & Maintenance'
    }
  ];

  const getCurrentPageTitle = () => {
    const currentItem = navigationItems.find(item => 
      location.pathname.startsWith(item.path)
    );
    return currentItem?.label || 'Admin Portal';
  };

  const getCurrentPageDescription = () => {
    const currentItem = navigationItems.find(item => 
      location.pathname.startsWith(item.path)
    );
    return currentItem?.description || 'Platform Administration';
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <span className="admin-logo-icon">🏆</span>
            <div className="admin-logo-text">
              <h2>WINZO</h2>
              <span>Admin</span>
            </div>
          </div>
          <button
            className="admin-sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="admin-navigation">
          <ul className="admin-nav-list">
            {navigationItems.map((item) => (
              <li key={item.path} className="admin-nav-item">
                <button
                  className={`admin-nav-link ${
                    location.pathname.startsWith(item.path) ? 'active' : ''
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  <span className="admin-nav-icon">{item.icon}</span>
                  {sidebarOpen && (
                    <div className="admin-nav-content">
                      <span className="admin-nav-label">{item.label}</span>
                      <span className="admin-nav-description">{item.description}</span>
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-user-avatar">
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            {sidebarOpen && (
              <div className="admin-user-details">
                <span className="admin-user-name">{user?.username || 'Admin'}</span>
                <span className="admin-user-role">Administrator</span>
              </div>
            )}
          </div>
          <button
            className="admin-logout-btn"
            onClick={handleLogout}
            title="Logout"
          >
            <span className="admin-logout-icon">🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Top Header */}
        <header className="admin-header">
          <div className="admin-header-left">
            <button
              className="admin-mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              ☰
            </button>
            <div className="admin-page-info">
              <h1 className="admin-page-title">{getCurrentPageTitle()}</h1>
              <p className="admin-page-description">{getCurrentPageDescription()}</p>
            </div>
          </div>
          
          <div className="admin-header-right">
            <div className="admin-header-actions">
              <button className="admin-action-btn" title="Notifications">
                🔔
              </button>
              <button className="admin-action-btn" title="Settings">
                ⚙️
              </button>
              <div className="admin-user-menu">
                <span className="admin-user-menu-name">{user?.username}</span>
                <button className="admin-user-menu-btn" onClick={handleLogout}>
                  🚪
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="admin-content">
          {children || <Outlet />}
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="admin-mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout; 