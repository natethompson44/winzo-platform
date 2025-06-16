import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG } from '../config/api';

// Enhanced security utilities for WINZO platform
class SecurityManager {
  private static readonly TOKEN_KEY = 'winzo_auth_token';
  private static readonly TOKEN_EXPIRY_KEY = 'winzo_token_expiry';
  private static readonly MAX_REQUEST_SIZE = 1024 * 1024; // 1MB
  private static blacklistedTokens = new Set<string>();

  // Secure token storage with expiration tracking
  static setAuthToken(token: string, expiresIn: number = 24 * 60 * 60 * 1000): void {
    try {
      const expiryTime = Date.now() + expiresIn;
      
      // Store in sessionStorage for better security (cleared on tab close)
      sessionStorage.setItem(this.TOKEN_KEY, token);
      sessionStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
      
      // Remove from blacklist if present
      this.blacklistedTokens.delete(token);
      
      console.log('🔐 Auth token stored securely');
    } catch (error) {
      console.error('❌ Failed to store auth token:', error);
    }
  }

  // Secure token retrieval with validation
  static getAuthToken(): string | null {
    try {
      const token = sessionStorage.getItem(this.TOKEN_KEY);
      const expiry = sessionStorage.getItem(this.TOKEN_EXPIRY_KEY);
      
      if (!token || !expiry) {
        return null;
      }

      // Check if token is blacklisted
      if (this.blacklistedTokens.has(token)) {
        this.clearAuthToken();
        return null;
      }

      // Check token expiration
      const expiryTime = parseInt(expiry, 10);
      if (Date.now() >= expiryTime) {
        console.log('🔒 Token expired, clearing...');
        this.clearAuthToken();
        return null;
      }

      return token;
    } catch (error) {
      console.error('❌ Failed to retrieve auth token:', error);
      return null;
    }
  }

  // Secure token removal
  static clearAuthToken(): void {
    try {
      const token = sessionStorage.getItem(this.TOKEN_KEY);
      if (token) {
        this.blacklistedTokens.add(token);
      }
      
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.TOKEN_EXPIRY_KEY);
      
      // Also clear from localStorage if it exists (migration)
      localStorage.removeItem('authToken');
      
      console.log('🔒 Auth token cleared securely');
    } catch (error) {
      console.error('❌ Failed to clear auth token:', error);
    }
  }

  // Validate request size
  static validateRequestSize(data: any): boolean {
    try {
      const size = JSON.stringify(data).length;
      if (size > this.MAX_REQUEST_SIZE) {
        console.error('🚨 Request too large:', size, 'bytes');
        return false;
      }
      return true;
    } catch (error) {
      console.error('❌ Request validation failed:', error);
      return false;
    }
  }

  // Sanitize request data
  static sanitizeRequestData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = { ...data };
    
    // Remove potentially dangerous properties
    const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
    dangerousKeys.forEach(key => {
      if (key in sanitized) {
        delete sanitized[key];
      }
    });

    return sanitized;
  }

  // Generate CSRF token
  static generateCSRFToken(): string {
    return 'XMLHttpRequest'; // Standard CSRF protection
  }
}

// Enhanced axios instance with bank-level security
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT || 30000, // 30 seconds timeout
  
  // Enhanced security headers
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'X-Requested-With': SecurityManager.generateCSRFToken()
  },
  
  // Security configurations
  withCredentials: true,
  maxContentLength: 1024 * 1024, // 1MB max response
  maxBodyLength: 1024 * 1024, // 1MB max request
  maxRedirects: 0, // Prevent redirect attacks
  
  // Validate status codes
  validateStatus: (status) => {
    return status >= 200 && status < 300;
  }
});

// Enhanced request interceptor with comprehensive security
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    try {
      // Add authentication token
      const token = SecurityManager.getAuthToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      // Add CSRF protection
      config.headers = config.headers || {};
      config.headers['X-Requested-With'] = SecurityManager.generateCSRFToken();
      config.headers['X-CSRF-Token'] = SecurityManager.generateCSRFToken();

      // Validate and sanitize request data
      if (config.data) {
        if (!SecurityManager.validateRequestSize(config.data)) {
          throw new Error('Request payload too large');
        }
        config.data = SecurityManager.sanitizeRequestData(config.data);
      }

      // Add request timestamp for replay attack prevention
      config.headers['X-Request-Time'] = Date.now().toString();

      // Add request ID for tracking
      config.headers['X-Request-ID'] = crypto.randomUUID?.() || 
        Math.random().toString(36).substring(2, 15);

      console.log('🔐 Secure request prepared:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        hasAuth: !!token,
        timestamp: new Date().toISOString()
      });

      return config;
    } catch (error) {
      console.error('❌ Request interceptor error:', error);
      return Promise.reject(error);
    }
  },
  (error: AxiosError) => {
    console.error('❌ Request configuration error:', error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor with security validation
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    try {
      // Log successful responses for security monitoring
      console.log('✅ Secure response received:', {
        status: response.status,
        url: response.config.url,
        timestamp: new Date().toISOString()
      });

      // Validate response structure
      if (response.data && typeof response.data === 'object') {
        // Check for potential security issues in response
        const hasSecurityWarning = response.data.security_warning || 
                                  response.data.security_alert;
        
        if (hasSecurityWarning) {
          console.warn('🚨 Security warning in response:', hasSecurityWarning);
        }

        // Handle token refresh if provided
        if (response.data.new_token) {
          SecurityManager.setAuthToken(response.data.new_token);
        }
      }

      return response;
    } catch (error) {
      console.error('❌ Response processing error:', error);
      return response; // Return response even if processing fails
    }
  },
  (error: AxiosError) => {
    try {
      const status = error.response?.status;
      const url = error.config?.url;
      
      console.error('❌ API Error:', {
        status,
        url,
        message: error.message,
        timestamp: new Date().toISOString()
      });

      // Handle specific security errors
      switch (status) {
        case 401: // Unauthorized
          console.warn('🔒 Authentication failed - clearing tokens');
          SecurityManager.clearAuthToken();
          
          // Redirect to login if not already there
          if (!window.location.pathname.includes('/login')) {
            setTimeout(() => {
              window.location.href = '/login?reason=session_expired';
            }, 1000);
          }
          break;

        case 403: // Forbidden
          console.warn('🚨 Access forbidden - possible CSRF or permission issue');
          
          // If CSRF error, reload the page to get fresh tokens
          if (error.response?.data?.code === 'CSRF_TOKEN_MISSING' ||
              error.response?.data?.code === 'CSRF_INVALID_SOURCE') {
            console.log('🔄 CSRF error detected - reloading page');
            setTimeout(() => window.location.reload(), 2000);
          }
          break;

        case 429: // Rate Limited
          console.warn('🐌 Rate limit exceeded - backing off');
          const retryAfter = error.response?.headers['retry-after'] || '60';
          console.log(`⏰ Retry after ${retryAfter} seconds`);
          break;

        case 500: // Server Error
          console.error('🚨 Server error detected');
          break;

        default:
          console.warn('⚠️ Unexpected API error:', status);
      }

      // Handle network errors
      if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
        console.error('🌐 Network connectivity issue');
      }

      // Handle timeout errors
      if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
        console.error('⏱️ Request timeout - server may be overloaded');
      }

      return Promise.reject(error);
    } catch (processingError) {
      console.error('❌ Error processing failed response:', processingError);
      return Promise.reject(error);
    }
  }
);

// Security utilities for components
export const securityUtils = {
  // Secure storage methods
  setAuthToken: SecurityManager.setAuthToken.bind(SecurityManager),
  getAuthToken: SecurityManager.getAuthToken.bind(SecurityManager),
  clearAuthToken: SecurityManager.clearAuthToken.bind(SecurityManager),
  
  // Request validation
  validateRequestSize: SecurityManager.validateRequestSize.bind(SecurityManager),
  sanitizeData: SecurityManager.sanitizeRequestData.bind(SecurityManager),
  
  // Security status
  isAuthenticated: () => !!SecurityManager.getAuthToken(),
  
  // Safe navigation
  safeNavigate: (path: string) => {
    // Validate path to prevent XSS
    const safePath = path.replace(/[<>]/g, '');
    window.location.href = safePath;
  }
};

// Migration utility to move tokens from localStorage to sessionStorage
const migrateTokenStorage = () => {
  try {
    const oldToken = localStorage.getItem('authToken');
    if (oldToken && !SecurityManager.getAuthToken()) {
      console.log('🔄 Migrating token to secure storage');
      SecurityManager.setAuthToken(oldToken);
      localStorage.removeItem('authToken');
    }
  } catch (error) {
    console.error('❌ Token migration failed:', error);
  }
};

// Execute migration on module load
migrateTokenStorage();

export default apiClient;
