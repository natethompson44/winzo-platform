// API Configuration for WINZO Frontend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Sports endpoints
  SPORTS: '/api/sports',
  SPORT_ODDS: (sport: string) => `/api/sports/${sport}/odds`,
  SPORT_SCORES: (sport: string) => `/api/sports/${sport}/scores`,
  SPORT_PARTICIPANTS: (sport: string) => `/api/sports/${sport}/participants`,
  SPORT_EVENT: (sport: string, eventId: string) => `/api/sports/${sport}/events/${eventId}`,
  // Betting endpoints
  PLACE_BET: '/api/bets/place',
  BET_HISTORY: '/api/bets/history',
  BET_DETAILS: (betId: string) => `/api/bets/${betId}`,
  CANCEL_BET: (betId: string) => `/api/bets/${betId}/cancel`,
  // Wallet endpoints
  WALLET_BALANCE: '/api/wallet/balance',
  WALLET_DEPOSIT: '/api/wallet/deposit',
  WALLET_WITHDRAW: '/api/wallet/withdraw',
  WALLET_TRANSACTIONS: '/api/wallet/transactions',
  // Auth endpoints
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  PROFILE: '/api/auth/profile'
};

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// Helper function for API error handling
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  } else if (error.response?.data?.error) {
    return error.response.data.error;
  } else if (error.message) {
    return error.message;
  } else {
    return 'An unexpected error occurred';
  }
};
