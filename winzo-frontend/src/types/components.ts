// Component Library Type Definitions

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonVariant {
  variant: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';
}

export interface SizeVariant {
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export interface LayoutProps {
  hasSidebar?: boolean;
  sidebarCollapsed?: boolean;
  showMobileNav?: boolean;
}

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
  badge?: string | number;
}

export interface SportsData {
  id: string;
  name: string;
  category: string;
  status: 'live' | 'upcoming' | 'finished';
  startTime: string;
  homeTeam: string;
  awayTeam: string;
  odds: {
    home: number;
    away: number;
    draw?: number;
  };
}

export interface BetSlipItem {
  id: string;
  gameId: string;
  selection: string;
  odds: number;
  stake: number;
}

export interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
} 