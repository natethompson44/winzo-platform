import React, { useState } from 'react';

// SVG Icons as React components for better performance
const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const SportIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LiveIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const HistoryIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CollapseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
  </svg>
);

export interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  activeRoute?: string;
  onNavigate?: (route: string) => void;
}

interface NavigationItem {
  id: string;
  name: string;
  href: string;
  icon: React.ComponentType;
  badge?: string;
  isActive?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  activeRoute = '/dashboard',
  onNavigate
}) => {
  const [userBalance] = useState(1250.75); // Mock user balance

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      name: 'Dashboard', 
      href: '/dashboard',
      icon: HomeIcon,
      isActive: activeRoute === '/dashboard'
    },
    {
      id: 'sports',
      name: 'Sports',
      href: '/sports',
      icon: SportIcon,
      isActive: activeRoute === '/sports'
    },
    {
      id: 'live',
      name: 'Live Sports',
      href: '/live',
      icon: LiveIcon,
      badge: '12',
      isActive: activeRoute === '/live'
    },
    {
      id: 'account',
      name: 'Account',
      href: '/account',
      icon: UserIcon,
      isActive: activeRoute === '/account'
    },
    {
      id: 'history',
      name: 'History',
      href: '/history',
      icon: HistoryIcon,
      isActive: activeRoute === '/history'
    },
    {
      id: 'settings',
      name: 'Settings',
      href: '/settings',
      icon: SettingsIcon,
      isActive: activeRoute === '/settings'
    }
  ];

  const handleNavClick = (item: NavigationItem) => {
    if (onNavigate) {
      onNavigate(item.href);
    }
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="logo">
          {!isCollapsed ? (
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <span className="text-white font-bold text-xl">WINZO</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-lg">W</span>
            </div>
          )}
        </div>
        
        {/* Collapse Toggle */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="collapse-toggle"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <CollapseIcon />
          </button>
        )}
      </div>

      {/* User Balance Section */}
      {!isCollapsed && (
        <div className="user-balance-section">
          <div className="balance-card">
            <div className="balance-label">Available Balance</div>
            <div className="balance-amount">${userBalance.toFixed(2)}</div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section">
          {!isCollapsed && (
            <div className="section-title">Navigation</div>
          )}
          
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`sidebar-item ${item.isActive ? 'active' : ''}`}
                title={isCollapsed ? item.name : undefined}
              >
                <span className="icon">
                  <IconComponent />
                </span>
                {!isCollapsed && (
                  <>
                    <span className="item-text">{item.name}</span>
                    {item.badge && (
                      <span className="badge">{item.badge}</span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* User Profile Section */}
      {!isCollapsed && (
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              <div className="avatar-placeholder">
                <UserIcon />
              </div>
            </div>
            <div className="user-info">
              <div className="user-name">John Doe</div>
              <div className="user-status">Premium Member</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar; 