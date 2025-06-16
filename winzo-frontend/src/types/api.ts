// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// User Types
export interface User {
  id: number;
  username: string;
  email?: string;
  wallet_balance: number;
  walletBalance?: number; // Backend compatibility
  invite_code?: string;
  inviteCode?: string; // Backend compatibility
  created_at?: string;
  createdAt?: string; // Backend compatibility
  member_since?: string;
}

// Sports & Betting Types
export interface SportsEvent {
  id: string;
  home_team: string;
  away_team: string;
  homeTeam?: string; // Backend compatibility
  awayTeam?: string; // Backend compatibility
  sport_key: string;
  sport?: Sport;
  commence_time: string;
  odds?: EventOdds[];
}

export interface Sport {
  id: string;
  title: string;
  key: string;
  active: boolean;
  has_outrights: boolean;
}

export interface EventOdds {
  key: string;
  title: string;
  last_update: string;
  markets: OddsMarket[];
}

export interface OddsMarket {
  key: string;
  outcomes: OddsOutcome[];
}

export interface OddsOutcome {
  name: string;
  price: number;
  point?: number;
}

// Bet Types
export interface Bet {
  id: number;
  user_id: number;
  event_id?: string;
  selected_team: string;
  bet_type: 'moneyline' | 'spread' | 'total' | 'parlay';
  odds: number;
  stake: number;
  amount: number; // Backend compatibility
  potential_payout: number;
  actual_payout?: number;
  actualPayout?: number; // Backend compatibility
  status: 'pending' | 'won' | 'lost' | 'cancelled' | 'void';
  placed_at: string;
  placedAt?: string; // Backend compatibility
  settled_at?: string;
  sportsEvent?: SportsEvent;
  confidence?: number;
}

export interface BetSlipItem {
  id: string;
  eventId: string;
  homeTeam: string;
  awayTeam: string;
  selectedTeam: string;
  odds: number;
  stake: number;
  betType: string;
  sport: string;
  confidence?: number;
}

// Wallet Types
export interface WalletTransaction {
  id: number;
  user_id: number;
  type: 'deposit' | 'withdraw' | 'bet_placed' | 'bet_won' | 'bet_lost';
  amount: number;
  balance_after: number;
  description: string;
  created_at: string;
  status: 'pending' | 'completed' | 'failed';
  payment_method?: string;
  transaction_id?: string;
  paymentDetails?: Record<string, any>;
}

export interface WalletBalance {
  balance: number;
  pending_withdrawals: number;
  available_balance: number;
  currency: string;
}

// Dashboard Types
export interface DashboardStats {
  totalBets: number;
  totalStaked: number;
  totalWinnings: number;
  profit: number;
  winRate: number;
  betsPending: number;
  betsWon: number;
  betsLost: number;
  averageStake: number;
  bestSport: string;
  bestBettingTime: string;
  currentStreak: number;
  roi: number;
  monthlyTrend: number;
  weeklyPerformance: number;
}

export interface DashboardData {
  user: User;
  wallet: WalletBalance;
  betting: DashboardStats;
  recentActivity: Bet[];
  quickStats: {
    biggestWin: number;
    currentStreak: number;
    favoritesSport: string;
    nextMilestone: string;
  };
}

// Admin Types
export interface AdminUser extends User {
  role: 'admin' | 'user';
  status: 'active' | 'suspended' | 'banned';
  last_login?: string;
  total_bets?: number;
  total_wagered?: number;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalBets: number;
  totalRevenue: number;
  pendingWithdrawals: number;
}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

// Recommendation Types
export interface Recommendation {
  type: 'sport' | 'time' | 'stake' | 'strategy' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  action?: string;
  priority: 'high' | 'medium' | 'low';
  potentialValue?: number;
}

// Live Events Types
export interface LiveEvent {
  id: string;
  home_team: string;
  away_team: string;
  sport: string;
  current_score: string;
  time_remaining: string;
  odds_changes: number;
}

// Form Types
export interface LoginFormData {
  username: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  inviteCode?: string;
}

// Navigation Types
export interface NavigationUser {
  username: string;
  balance: number;
}

// Widget Types
export interface DashboardWidget {
  id: string;
  title: string;
  type: 'wallet' | 'stats' | 'recent-bets' | 'quick-actions' | 'recommendations' | 'live-events';
  size: 'small' | 'medium' | 'large';
  collapsible: boolean;
  collapsed: boolean;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}