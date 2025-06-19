import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './WinzoLayout.css';

interface WinzoLayoutProps {
  children: React.ReactNode;
}

const WinzoLayout: React.FC<WinzoLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const isMobileDevice = window.innerWidth <= 768;
      if (isMobileDevice) {
        setSidebarOpen(false);
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, [setSidebarOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigationItems = [
    {
      path: '/dashboard',
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
    const breadcrumbs = [{ name: 'Home', path: '/dashboard' }];
    
    paths.forEach((path, index) => {
      const fullPath = '/' + paths.slice(0, index + 1).join('/');
      let name = path.charAt(0).toUpperCase() + path.slice(1);
      
      switch (path) {
        case 'dashboard': name = 'Dashboard'; break;
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
    <div className="winzo-layout">
      {/* Header */}
      <header id="header" className="header fixed-top d-flex align-items-center">
        <div className="d-flex align-items-center justify-content-between">
          <Link to="/dashboard" className="logo d-flex align-items-center">
            <img src="/assets/img/winzo-logo.png" alt="WINZO" />
            <span className="d-none d-lg-block">WINZO</span>
            <span className="d-none d-lg-block tagline">Sports</span>
          </Link>
          <i 
            className="bi bi-list toggle-sidebar-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          ></i>
        </div>

        <div className="search-bar">
          <form className="search-form d-flex align-items-center">
            <input type="text" placeholder="Search teams, leagues, events..." />
            <button type="submit"><i className="bi bi-search"></i></button>
          </form>
        </div>

        <nav className="header-nav ms-auto">
          <ul className="d-flex align-items-center">
            <li className="nav-item d-block d-lg-none">
              <button className="nav-link nav-icon search-bar-toggle btn btn-link">
                <i className="bi bi-search"></i>
              </button>
            </li>

            {/* Notifications */}
            <li className="nav-item dropdown">
              <button 
                className="nav-link nav-icon btn btn-link" 
                onClick={() => setShowNotifications(!showNotifications)}
                type="button"
              >
                <i className="bi bi-bell"></i>
                <span className="badge bg-primary badge-number">3</span>
              </button>
              {showNotifications && (
                <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow notifications show">
                  <li className="dropdown-header">
                    You have 3 new notifications
                    <button className="btn btn-link p-0"><span className="badge rounded-pill bg-primary p-2 ms-2">View all</span></button>
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
                  <li><hr className="dropdown-divider" /></li>
                  <li className="notification-item">
                    <i className="bi bi-info-circle text-primary"></i>
                    <div>
                      <h4>Odds Update</h4>
                      <p>Favorable odds available for NBA games</p>
                      <p>1 hr. ago</p>
                    </div>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li className="dropdown-footer">
                    <button className="btn btn-link">Show all notifications</button>
                  </li>
                </ul>
              )}
            </li>

            {/* User Profile */}
            <li className="nav-item dropdown pe-3">
              <button 
                className="nav-link nav-profile d-flex align-items-center pe-0 btn btn-link" 
                onClick={() => setShowProfile(!showProfile)}
                type="button"
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
                    <Link className="dropdown-item d-flex align-items-center" to="/account">
                      <i className="bi bi-gear"></i>
                      <span>Account Settings</span>
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item d-flex align-items-center" onClick={handleLogout} type="button">
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
          
          <li className="nav-heading">Quick Actions</li>
          
          <li className="nav-item">
            <button className="nav-link collapsed btn btn-link" onClick={() => navigate('/account?tab=deposit')} type="button">
              <i className="bi bi-plus-circle"></i>
              <span>Deposit Funds</span>
            </button>
          </li>
          
          <li className="nav-item">  
            <button className="nav-link collapsed btn btn-link" onClick={() => navigate('/account?tab=withdraw')} type="button">
              <i className="bi bi-dash-circle"></i>
              <span>Withdraw</span>
            </button>
          </li>
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

export default WinzoLayout; 