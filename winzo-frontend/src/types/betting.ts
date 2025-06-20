export interface BetHistory {
  id: string;
  date: string;
  sport: string;
  event: string;
  betType: string;
  stake: number;
  odds: number;
  payout: number;
  status: 'won' | 'lost' | 'pending' | 'cancelled' | 'void';
  teams?: {
    home: string;
    away: string;
  };
  market?: string;
  selection?: string;
  league?: string;
  timestamp: string;
}

export interface BettingAnalytics {
  totalBets: number;
  totalStake: number;
  totalPayout: number;
  netProfit: number;
  winRate: number;
  roi: number;
  averageStake: number;
  averageOdds: number;
  longestWinStreak: number;
  longestLoseStreak: number;
  currentStreak: {
    type: 'win' | 'lose';
    count: number;
  };
  profitByMonth: Array<{
    month: string;
    profit: number;
    bets: number;
  }>;
  sportBreakdown: Array<{
    sport: string;
    bets: number;
    profit: number;
    winRate: number;
  }>;
  betTypeBreakdown: Array<{
    type: string;
    bets: number;
    profit: number;
    winRate: number;
  }>;
}

export interface FilterOptions {
  dateRange: {
    start: string;
    end: string;
  };
  sports: string[];
  betTypes: string[];
  statuses: string[];
  stakeRange: {
    min: number;
    max: number;
  };
  search: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ExportOptions {
  format: 'csv' | 'pdf';
  dateRange?: {
    start: string;
    end: string;
  };
  includeAnalytics?: boolean;
  emailTo?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
} 