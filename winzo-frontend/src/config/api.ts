// API Configuration for WINZO Frontend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://winzo-platform-production.up.railway.app';

export const API_ENDPOINTS = {
  // Sports endpoints
  SPORTS: '/api/sports',
  SPORT_ODDS: (sport: string) => `/api/sports/${sport}/odds`,
  SPORT_SCORES: (sport: string) => `/api/sports/${sport}/scores`,
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
  PROFILE: '/api/auth/me'
};

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 10000
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

console.log('\n🔗 API Base URL:', API_BASE_URL);
console.log('🌍 Environment:', process.env.NODE_ENV);
console.log('🔗 Login Endpoint:', `${API_BASE_URL}/api/auth/login`);
