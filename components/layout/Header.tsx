import React, { useState } from 'react';

// SVG Icons
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const NotificationIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 17h5l-5 5v-5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a3 3 0 11-6 0 3 3 0 016 0zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const WalletIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

export interface HeaderProps {
  onMobileMenuToggle?: () => void;
  isSidebarCollapsed?: boolean;
  onSearch?: (query: string) => void;
  userBalance?: number;
  userName?: string;
  notifications?: number;
}

const Header: React.FC<HeaderProps> = ({
  onMobileMenuToggle,
  isSidebarCollapsed = false,
  onSearch,
  userBalance = 1250.75,
  userName = 'John Doe',
  notifications = 3
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const userMenuItems = [
    { id: 'profile', label: 'My Profile', icon: UserIcon, href: '/profile' },
    { id: 'wallet', label: 'Wallet', icon: WalletIcon, href: '/wallet' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, href: '/settings' },
    { id: 'logout', label: 'Logout', icon: LogoutIcon, href: '/logout', isDestructive: true }
  ];

  const mockNotifications = [
    { id: 1, title: 'Bet Won!', message: 'Your Lakers bet won $25.50', time: '2 min ago', type: 'success' },
    { id: 2, title: 'New Promotion', message: '50% bonus on next deposit', time: '1 hour ago', type: 'info' },
    { id: 3, title: 'Game Starting', message: 'Lakers vs Warriors in 15 min', time: '2 hours ago', type: 'warning' }
  ];

  return (
    <header className="header">
      {/* Left Section */}
      <div className="header-left">
        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-toggle hidden-desktop"
          onClick={onMobileMenuToggle}
          aria-label="Open mobile menu"
        >
          <MenuIcon />
        </button>

        {/* Breadcrumb or Page Title */}
        <div className="page-title hidden-mobile">
          <h1 className="text-lg font-semibold text-primary">Dashboard</h1>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="header-center">
        <div className="header-search">
          <form onSubmit={handleSearchSubmit}>
            <div className="search-container">
              <SearchIcon />
              <input
                type="text"
                className="search-input"
                placeholder="Search games, teams, players..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </form>
        </div>
      </div>

      {/* Right Section */}
      <div className="header-right">
        {/* Balance Display */}
        <div className="balance-display hidden-mobile">
          <div className="balance-info">
            <span className="balance-label">Balance</span>
            <span className="balance-amount">${userBalance.toFixed(2)}</span>
          </div>
        </div>

        {/* Notifications */}
        <div className="notification-container">
          <button
            className="notification-trigger"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            aria-label={`Notifications ${notifications > 0 ? `(${notifications})` : ''}`}
          >
            <NotificationIcon />
            {notifications > 0 && (
              <span className="notification-badge">{notifications}</span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotificationOpen && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>Notifications</h3>
                <button className="mark-all-read">Mark all read</button>
              </div>
              <div className="notification-list">
                {mockNotifications.map((notification) => (
                  <div key={notification.id} className={`notification-item ${notification.type}`}>
                    <div className="notification-content">
                      <div className="notification-title">{notification.title}</div>
                      <div className="notification-message">{notification.message}</div>
                      <div className="notification-time">{notification.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="notification-footer">
                <button className="view-all-btn">View All Notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="user-menu">
          <button
            className="user-trigger"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            aria-label="User menu"
          >
            <div className="user-avatar">
              <div className="avatar-placeholder">
                <UserIcon />
              </div>
            </div>
            <div className="user-info hidden-mobile">
              <div className="user-name">{userName}</div>
              <div className="user-balance">${userBalance.toFixed(2)}</div>
            </div>
            <ChevronDownIcon />
          </button>

          {/* User Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                <div className="user-avatar-large">
                  <UserIcon />
                </div>
                <div className="user-details">
                  <div className="user-name">{userName}</div>
                  <div className="user-email">john.doe@example.com</div>
                </div>
              </div>
              
              <div className="user-dropdown-body">
                {userMenuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      className={`dropdown-item ${item.isDestructive ? 'destructive' : ''}`}
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        // Handle navigation
                      }}
                    >
                      <IconComponent />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(isUserMenuOpen || isNotificationOpen) && (
        <div
          className="overlay"
          onClick={() => {
            setIsUserMenuOpen(false);
            setIsNotificationOpen(false);
          }}
        />
      )}
    </header>
  );
};

export default Header; 