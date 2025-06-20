// Application Constants
export const APP_CONFIG = {
  NAME: 'WINZO Platform',
  VERSION: '1.0.0',
  DESCRIPTION: 'Professional Sports Betting Platform',
};

export const BETTING_LIMITS = {
  MIN_STAKE: 1,
  MAX_STAKE: 1000,
  MIN_DEPOSIT: 10,
  MAX_DEPOSIT: 10000,
  MIN_WITHDRAWAL: 10,
  MAX_WITHDRAWAL: 5000,
};

export const ODDS_FORMATS = {
  AMERICAN: 'american',
  DECIMAL: 'decimal',
  FRACTIONAL: 'fractional',
};

export const BET_TYPES = {
  SINGLE: 'single',
  PARLAY: 'parlay',
};

export const BET_STATUSES = {
  PENDING: 'pending',
  WON: 'won',
  LOST: 'lost',
  CANCELLED: 'cancelled',
};

export const SPORTS_CATEGORIES = {
  AMERICAN: 'American Sports',
  INTERNATIONAL: 'International Sports',
  COMBAT: 'Combat Sports',
  RACING: 'Racing',
  ESPORTS: 'Esports',
};

export const QUICK_STAKE_AMOUNTS = [5, 10, 25, 50, 100];

export const REFRESH_INTERVALS = {
  ODDS: 30000, // 30 seconds
  BALANCE: 60000, // 1 minute
  HISTORY: 300000, // 5 minutes
};

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  BET_SLIP: 'winzo_betslip',
  USER_PREFERENCES: 'winzo_preferences',
};

export const API_TIMEOUTS = {
  DEFAULT: 10000,
  UPLOAD: 30000,
  DOWNLOAD: 60000,
};
