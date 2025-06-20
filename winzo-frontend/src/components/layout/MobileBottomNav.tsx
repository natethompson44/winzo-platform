import React from 'react';

// SVG Icons
const SportIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LiveIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const SlipIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export interface MobileBottomNavProps {
  activeRoute?: string;
  onNavigate?: (route: string) => void;
  betSlipCount?: number;
  liveGamesCount?: number;
}

interface NavigationItem {
  id: string;
  name: string;
  href: string;
  icon: React.ComponentType;
  badge?: string | number;
  isActive?: boolean;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeRoute = '/sports',
  onNavigate,
  betSlipCount = 0,
  liveGamesCount = 12
}) => {
  const navigationItems: NavigationItem[] = [
    {
      id: 'sports',
      name: 'Sports',
      href: '/sports',
      icon: SportIcon,
      isActive: activeRoute === '/sports'
    },
    {
      id: 'live',
      name: 'Live',
      href: '/live',
      icon: LiveIcon,
      badge: liveGamesCount > 0 ? liveGamesCount : undefined,
      isActive: activeRoute === '/live'
    },
    {
      id: 'slip',
      name: 'Slip',
      href: '/slip',
      icon: SlipIcon,
      badge: betSlipCount > 0 ? betSlipCount : undefined,
      isActive: activeRoute === '/slip'
    },
    {
      id: 'account',
      name: 'Account',
      href: '/account',
      icon: UserIcon,
      isActive: activeRoute === '/account'
    }
  ];

  const handleNavClick = (item: NavigationItem) => {
    if (onNavigate) {
      onNavigate(item.href);
    }
  };

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-container">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`bottom-nav-item ${item.isActive ? 'active' : ''}`}
              aria-label={`Navigate to ${item.name}`}
            >
              <div className="nav-icon-container">
                <IconComponent />
                {item.badge && (
                  <span className="nav-badge">
                    {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="nav-label">{item.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav; 