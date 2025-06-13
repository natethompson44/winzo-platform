import React from 'react';

interface IconProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral' | 'muted' | 'inverse';
  variant?: 'filled' | 'outlined' | 'duotone';
  className?: string;
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
export const FootballIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Football" className="icon-sport icon-football">
    <circle cx="12" cy="12" r="10" className="ball"/>
    <path d="M12 2a10 10 0 0 1 0 20 10 10 0 0 1 0-20z" fill="none"/>
    <path d="M12 2c2.5 0 4.5 1.5 5.5 3.5" fill="none"/>
    <path d="M12 22c-2.5 0-4.5-1.5-5.5-3.5" fill="none"/>
  </Icon>
);

export const BasketballIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Basketball" className="icon-sport icon-basketball">
    <circle cx="12" cy="12" r="10" className="ball"/>
    <path d="M12 2a10 10 0 0 1 0 20 10 10 0 0 1 0-20z" fill="none"/>
    <path d="M2 12h20" fill="none"/>
    <path d="M12 2a10 10 0 0 1 0 20 10 10 0 0 1 0-20z" fill="none"/>
  </Icon>
);

export const CricketIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Cricket" className="icon-sport icon-cricket">
    <path d="M12 2L8 8h8l-4-6z" className="bat"/>
    <circle cx="12" cy="16" r="4"/>
    <path d="M12 12v8" fill="none"/>
  </Icon>
);

export const TennisIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} aria-label="Tennis" className="icon-sport icon-tennis">
    <circle cx="12" cy="12" r="8" className="ball"/>
    <path d="M12 4v16" fill="none"/>
    <path d="M4 12h16" fill="none"/>
  </Icon>
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
  IconWrapper
};
export default IconLibrary; 