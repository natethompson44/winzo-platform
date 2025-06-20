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
  PROFILE: '/api/auth/me'
};

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 10000,
  ALTERNATIVE_URLS
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

// Helper function to test API connectivity
export const testApiConnection = async (): Promise<string> => {
  for (const url of [API_BASE_URL, ...ALTERNATIVE_URLS]) {
    try {
      console.log(`🔗 Testing API connection to: ${url}/health`);
      const response = await fetch(`${url}/health`, {
        method: 'GET'
      });
      
      if (response.ok) {
        console.log(`✅ API connection successful to: ${url}`);
        return url;
      }
    } catch (error) {
      console.log(`❌ API connection failed for: ${url}`, error);
    }
  }
  
  console.log('❌ All API URLs failed');
  return API_BASE_URL; // Return default as fallback
};

console.log('\n🔗 API Base URL:', API_BASE_URL);
console.log('🌍 Environment:', process.env.NODE_ENV);
console.log('🔗 Login Endpoint:', `${API_BASE_URL}/api/auth/login`);
console.log('🔗 Health Endpoint:', `${API_BASE_URL}/health`);
console.log('🔗 Alternative URLs:', ALTERNATIVE_URLS);
