import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './AdminLayout.css';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
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
    navigate('/login');
  };

  const navigationItems = [
    {
      path: '/sports',
      label: 'Dashboard',
      icon: 'bi-grid',
      description: 'Main Dashboard & Overview'
    },
    {
      path: '/sports',
      label: 'Sports Betting',
      icon: 'bi-trophy',
      description: 'Place Bets & View Odds'
    },
    {
      path: '/live-sports',
      label: 'Live Sports',
      icon: 'bi-broadcast',
      description: 'Live Events & Real-time Betting'
    },
    {
      path: '/account',
      label: 'Account',
      icon: 'bi-person',
      description: 'Profile & Settings'
    },
    {
      path: '/history',
      label: 'Betting History',
      icon: 'bi-clock-history',
      description: 'View Past Bets & Analytics'
    }
  ];

  const getCurrentPageTitle = () => {
    const currentItem = navigationItems.find(item => 
      location.pathname.startsWith(item.path)
    );
    return currentItem?.label || 'WINZO Sports';
  };

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Home', path: '/sports' }];
    
    paths.forEach((path, index) => {
      const fullPath = '/' + paths.slice(0, index + 1).join('/');
      let name = path.charAt(0).toUpperCase() + path.slice(1);
      
      switch (path) {
        case 'sports': name = 'Sports Betting'; break;
        case 'live-sports': name = 'Live Sports'; break;
        case 'account': name = 'Account'; break;
        case 'history': name = 'Betting History'; break;
      }
      
      breadcrumbs.push({ name, path: fullPath });
    });
    
    return breadcrumbs;
  };

  return (
    <div className="winzo-admin-layout">
      {/* Header */}
      <header id="header" className="header fixed-top d-flex align-items-center">
        <div className="d-flex align-items-center justify-content-between">
          <Link to="/sports" className="logo d-flex align-items-center">
            <span className="d-none d-lg-block">WINZO</span>
            <span className="d-none d-lg-block tagline">Sports Betting</span>
          </Link>
          <i 
            className="bi bi-list toggle-sidebar-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          ></i>
        </div>

        <div className="search-bar">
          <form className="search-form d-flex align-items-center">
            <input type="text" placeholder="Search teams, leagues..." />
            <button type="submit"><i className="bi bi-search"></i></button>
          </form>
        </div>

        <nav className="header-nav ms-auto">
          <ul className="d-flex align-items-center">
            <li className="nav-item d-block d-lg-none">
              <button className="nav-link nav-icon search-bar-toggle" type="button">
                <i className="bi bi-search"></i>
              </button>
            </li>

            {/* Notifications */}
            <li className="nav-item dropdown">
              <button 
                className="nav-link nav-icon" 
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <i className="bi bi-bell"></i>
                <span className="badge bg-primary badge-number">3</span>
              </button>
              {showNotifications && (
                <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow notifications show">
                  <li className="dropdown-header">
                    You have 3 new notifications
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li className="notification-item">
                    <i className="bi bi-check-circle text-success"></i>
                    <div>
                      <h4>Bet Won!</h4>
                      <p>Your Lakers bet has won - $47.50 credited</p>
                      <p>5 min. ago</p>
                    </div>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li className="notification-item">
                    <i className="bi bi-exclamation-triangle text-warning"></i>
                    <div>
                      <h4>Live Game Alert</h4>
                      <p>Chiefs vs Bills entering 4th quarter</p>
                      <p>15 min. ago</p>
                    </div>
                  </li>
                </ul>
              )}
            </li>

            {/* User Profile */}
            <li className="nav-item dropdown pe-3">
              <button 
                className="nav-link nav-profile d-flex align-items-center pe-0" 
                type="button"
                onClick={() => setShowProfile(!showProfile)}
              >
                <img src="/assets/img/default-avatar.png" alt="Profile" className="rounded-circle" />
                <span className="d-none d-md-block dropdown-toggle ps-2">{user?.username}</span>
              </button>
              {showProfile && (
                <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile show">
                  <li className="dropdown-header">
                    <h6>{user?.username}</h6>
                    <span>Balance: ${user?.wallet_balance?.toFixed(2) || '0.00'}</span>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link className="dropdown-item d-flex align-items-center" to="/account">
                      <i className="bi bi-person"></i>
                      <span>My Profile</span>
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item d-flex align-items-center" type="button" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right"></i>
                      <span>Sign Out</span>
                    </button>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </nav>
      </header>

      {/* Sidebar */}
      <aside id="sidebar" className={`sidebar ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
        <ul className="sidebar-nav">
          {navigationItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === item.path ? '' : 'collapsed'}`}
                to={item.path}
              >
                <i className={`bi ${item.icon}`}></i>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <main id="main" className="main">
        <div className="pagetitle">
          <h1>{getCurrentPageTitle()}</h1>
          <nav>
            <ol className="breadcrumb">
              {getBreadcrumbs().map((crumb, index) => (
                <li key={index} className={`breadcrumb-item ${index === getBreadcrumbs().length - 1 ? 'active' : ''}`}>
                  {index === getBreadcrumbs().length - 1 ? (
                    crumb.name
                  ) : (
                    <Link to={crumb.path}>{crumb.name}</Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <section className="section dashboard">
          {children}
        </section>
      </main>
    </div>
  );
};

export default AdminLayout; 