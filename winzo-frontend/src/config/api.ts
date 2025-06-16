// API Configuration for WINZO Frontend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://winzo-platform-production.up.railway.app';

// Alternative Railway URLs to try if the main one fails
const ALTERNATIVE_URLS = [
  'https://winzo-platform-production.up.railway.app',
  'https://winzo-platform.up.railway.app',
  'https://winzo-backend-production.up.railway.app',
  'https://winzo-backend.up.railway.app'
];

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
  PROFILE: '/api/auth/me',
  // Dashboard endpoints
  DASHBOARD: '/api/dashboard',
  DASHBOARD_STATS: '/api/dashboard/quick-stats'
} as const;

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 10000,
  ALTERNATIVE_URLS,
  RETRY_ATTEMPTS: 3,
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
} as const;

// Helper function for API error handling with proper typing
export const handleApiError = (error: unknown): string => {
  if (typeof error === 'object' && error !== null) {
    const axiosError = error as any;
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    } else if (axiosError.response?.data?.error) {
      return axiosError.response.data.error;
    } else if (axiosError.message) {
      return axiosError.message;
    }
  }
  return 'An unexpected error occurred';
};

// Helper function to test API connectivity
export const testApiConnection = async (): Promise<string> => {
  for (const url of [API_BASE_URL, ...ALTERNATIVE_URLS]) {
    try {
      const response = await fetch(`${url}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (response.ok) {
        return url;
      }
    } catch (error) {
      // Silent fail for individual URL tests
      continue;
    }
  }
  
  // Return default as fallback
  return API_BASE_URL;
};
