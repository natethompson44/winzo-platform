import React from 'react';

export type IconSize = 'sm' | 'md' | 'lg';
export type IconColor = 'success' | 'primary' | 'secondary' | 'warning' | 'danger' | 'neutral' | 'muted' | 'inverse';
export type IconVariant = 'filled' | 'outlined' | 'duotone';

export interface IconProps {
  className?: string;
  size?: IconSize;
  color?: IconColor;
  variant?: IconVariant;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
  role?: string;
}

// Base Icon Component
const Icon: React.FC<IconProps & { children: React.ReactNode }> = ({
  size = 'md',
  color = 'neutral',
  variant = 'outlined',
  className = '',
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden = true,
  role = 'img',
  children,
  ...props
}) => {
  const iconClasses = [
    'icon',
    `icon-${size}`,
    `icon-${color}`,
    `icon-${variant}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <svg
      className={iconClasses}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
      role={role}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {children}
    </svg>
  );
};

// Navigation Icons
export const HomeIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Home">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="9,22 9,12 15,12 15,22" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const DashboardIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Dashboard">
    <rect x="3" y="3" width="7" height="7" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="14" y="3" width="7" height="7" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="14" y="14" width="7" height="7" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="3" y="14" width="7" height="7" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const WalletIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Wallet">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 7v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="16" cy="12" r="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const HistoryIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="History">
    <path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const SportsIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Sports">
    <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 14s1.5 2 4 2 4-2 4-2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="9" y1="9" x2="9.01" y2="9" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="15" y1="9" x2="15.01" y2="9" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// Action Icons
export const QuickBetIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Quick Bet" color="success">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const DepositIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Deposit" color="primary">
    <path d="M12 5v14" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const WithdrawIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Withdraw" color="warning">
    <path d="M12 19V5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const SettingsIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Settings">
    <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const SupportIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Support">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="10" r="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 13v-3" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const LogoutIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Logout">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="16,17 21,12 16,7" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const UserIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="User">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const PaletteIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Design System">
    <circle cx="13.5" cy="6.5" r="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="17.5" cy="10.5" r="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="8.5" cy="7.5" r="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="6.5" cy="12.5" r="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const NetworkIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Network">
    <path d="M12 2L2 7l10 5 10-5-10-5z" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 17l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const ServerIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Server">
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="6" y1="6" x2="6.01" y2="6" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="6" y1="18" x2="6.01" y2="18" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const LockIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Lock">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="16" r="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const ClockIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Clock">
    <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="12,6 12,12 16,14" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const CalendarIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Calendar">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const CalendarDaysIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Calendar Days">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 14h.01" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 14h.01" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 14h.01" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 18h.01" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 18h.01" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 18h.01" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const FireIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Fire">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4 4 4 1.5 0 3-1 3-3 0 1.5-1 3-3 3-1 0-1.5-.5-1.5-1" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const BetSlipIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Bet Slip">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="14,2 14,8 20,8" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="16" y1="13" x2="8" y2="13" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="16" y1="17" x2="8" y2="17" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="10,9 9,9 8,9" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const LightningIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Lightning">
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const TrendingUpIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Trending Up">
    <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="16,7 22,7 22,13" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const TrendingDownIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Trending Down">
    <polyline points="22,17 13.5,8.5 8.5,13.5 2,7" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="16,17 22,17 22,11" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const DollarIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Dollar">
    <line x1="12" y1="1" x2="12" y2="23" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const RefreshIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Refresh">
    <polyline points="1,4 1,10 7,10" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="23,20 23,14 17,14" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// Status Icons
export const SuccessIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Success" color="success">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="22,4 12,14.01 9,11.01" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const WarningIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Warning" color="warning">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const ErrorIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Error" color="danger">
    <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="15" y1="9" x2="9" y2="15" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="9" y1="9" x2="15" y2="15" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const InfoIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Information" color="secondary">
    <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="16" x2="12" y2="12" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="8" x2="12.01" y2="8" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const LoadingIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Loading" className="icon-loading">
    <path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// Payment Icons
export const CardIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Credit Card">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="1" y1="10" x2="23" y2="10" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const BankIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Bank">
    <path d="M3 21h18" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 10h18" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 6l7-3 7 3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 10v11" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 10v11" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 10v11" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 10v11" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const CryptoIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Cryptocurrency">
    <path d="M12 2L2 7l10 5 10-5-10-5z" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 17l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// Utility Icons
export const SearchIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Search">
    <circle cx="11" cy="11" r="8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const FilterIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Filter">
    <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const SortIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Sort">
    <path d="M3 6h18" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 12h12" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 18h6" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const CloseIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Close">
    <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const ChevronDownIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Expand">
    <polyline points="6,9 12,15 18,9" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const ChevronUpIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Collapse">
    <polyline points="18,15 12,9 6,15" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const ChevronLeftIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Previous">
    <polyline points="15,18 9,12 15,6" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

export const ChevronRightIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Next">
    <polyline points="9,18 15,12 9,6" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// Sports Icons
export const FootballIcon: React.FC<IconProps> = ({ className, size = 'md', color = 'primary' }) => (
  <svg className={className} width={size === 'sm' ? 16 : size === 'md' ? 24 : 32} height={size === 'sm' ? 16 : size === 'md' ? 24 : 32} viewBox="0 0 24 24" fill="none" stroke={`var(--color-${color})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    <path d="M2 12h20" />
  </svg>
);

export const BasketballIcon: React.FC<IconProps> = ({ className, size = 'md', color = 'primary' }) => (
  <svg className={className} width={size === 'sm' ? 16 : size === 'md' ? 24 : 32} height={size === 'sm' ? 16 : size === 'md' ? 24 : 32} viewBox="0 0 24 24" fill="none" stroke={`var(--color-${color})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    <path d="M2 12h20" />
    <path d="M12 2v20" />
  </svg>
);

export const BaseballIcon: React.FC<IconProps> = ({ className, size = 'md', color = 'primary' }) => (
  <svg className={className} width={size === 'sm' ? 16 : size === 'md' ? 24 : 32} height={size === 'sm' ? 16 : size === 'md' ? 24 : 32} viewBox="0 0 24 24" fill="none" stroke={`var(--color-${color})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    <path d="M2 12h20" />
    <path d="M12 2v20" />
    <path d="M8 8l8 8" />
    <path d="M8 16l8-8" />
  </svg>
);

export const HockeyIcon: React.FC<IconProps> = ({ className, size = 'md', color = 'primary' }) => (
  <svg className={className} width={size === 'sm' ? 16 : size === 'md' ? 24 : 32} height={size === 'sm' ? 16 : size === 'md' ? 24 : 32} viewBox="0 0 24 24" fill="none" stroke={`var(--color-${color})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12h16" />
    <path d="M4 12a8 8 0 0 1 8-8h0a8 8 0 0 1 8 8" />
    <path d="M4 12a8 8 0 0 0 8 8h0a8 8 0 0 0 8-8" />
    <path d="M12 4v16" />
  </svg>
);

export const TennisIcon: React.FC<IconProps> = ({ className, size = 'md', color = 'primary' }) => (
  <svg className={className} width={size === 'sm' ? 16 : size === 'md' ? 24 : 32} height={size === 'sm' ? 16 : size === 'md' ? 24 : 32} viewBox="0 0 24 24" fill="none" stroke={`var(--color-${color})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    <path d="M2 12h20" />
    <path d="M12 2v20" />
    <path d="M8 8l8 8" />
    <path d="M8 16l8-8" />
  </svg>
);

export const CricketIcon: React.FC<IconProps> = ({ className, size = 'md', color = 'primary' }) => (
  <svg className={className} width={size === 'sm' ? 16 : size === 'md' ? 24 : 32} height={size === 'sm' ? 16 : size === 'md' ? 24 : 32} viewBox="0 0 24 24" fill="none" stroke={`var(--color-${color})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
    <path d="M12 6v12" />
    <path d="M6 12h12" />
    <path d="M8 8l8 8" />
    <path d="M8 16l8-8" />
  </svg>
);

export const LiveIcon: React.FC<IconProps> = ({ className, size = 'sm', color = 'danger' }) => (
  <svg className={className} width={size === 'sm' ? 16 : size === 'md' ? 24 : 32} height={size === 'sm' ? 16 : size === 'md' ? 24 : 32} viewBox="0 0 24 24" fill="none" stroke={`var(--color-${color})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" fill={`var(--color-${color})`} />
  </svg>
);

// Icon Wrapper Component
interface IconWrapperProps extends IconProps {
  label?: string;
  badge?: string | number;
  children: React.ReactNode;
}

export const IconWrapper: React.FC<IconWrapperProps> = ({
  label,
  badge,
  children,
  ...props
}) => {
  return (
    <div className="icon-wrapper">
      {children}
      {label && <span className="icon-label">{label}</span>}
      {badge && <span className="icon-badge">{badge}</span>}
    </div>
  );
};

// Export all icons
const IconLibrary = {
  HomeIcon,
  DashboardIcon,
  WalletIcon,
  HistoryIcon,
  SportsIcon,
  QuickBetIcon,
  DepositIcon,
  WithdrawIcon,
  SettingsIcon,
  SupportIcon,
  LogoutIcon,
  SuccessIcon,
  WarningIcon,
  ErrorIcon,
  InfoIcon,
  LoadingIcon,
  CardIcon,
  BankIcon,
  CryptoIcon,
  SearchIcon,
  FilterIcon,
  SortIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FootballIcon,
  BasketballIcon,
  CricketIcon,
  TennisIcon,
  IconWrapper,
  UserIcon,
  PaletteIcon,
  NetworkIcon,
  ServerIcon,
  LockIcon,
  ClockIcon,
  CalendarIcon,
  CalendarDaysIcon,
  FireIcon,
  BetSlipIcon,
  LightningIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  DollarIcon,
  RefreshIcon,
  LiveIcon
};

export const EyeIcon: React.FC<IconProps> = ({ size = 'md', color = 'neutral', className = '' }) => (
  <svg
    className={`icon icon-${size} icon-${color} ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
      fill="currentColor"
    />
  </svg>
);

export const EyeOffIcon: React.FC<IconProps> = ({ size = 'md', color = 'neutral', className = '' }) => (
  <svg
    className={`icon icon-${size} icon-${color} ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
      fill="currentColor"
    />
  </svg>
);

export const MailIcon: React.FC<IconProps> = ({ size = 'md', color = 'neutral', className = '' }) => (
  <svg
    className={`icon icon-${size} icon-${color} ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
      fill="currentColor"
    />
  </svg>
);

export default IconLibrary; 