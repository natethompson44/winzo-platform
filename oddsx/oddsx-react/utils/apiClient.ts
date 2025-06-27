import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

interface RetryConfig {
  retries: number;
  delay: number;
  retryCondition?: (error: any) => boolean;
}

class ApiClient {
  private instance: AxiosInstance;
  private defaultRetryConfig: RetryConfig = {
    retries: 3,
    delay: 1000,
    retryCondition: (error) => {
      // Retry on network errors, 5xx errors, and specific 503 errors
      return !error.response || 
             error.code === 'NETWORK_ERROR' ||
             (error.response?.status >= 500 && error.response?.status < 600) ||
             error.response?.status === 503;
    }
  };

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'https://winzo-platform-production.up.railway.app/api') {
    this.instance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for adding auth tokens
    this.instance.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('authToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for handling common errors
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - just clear token, let components handle the error
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
          }
          // Don't auto-redirect - let components handle gracefully
          console.warn('Authentication required for this request');
        }
        return Promise.reject(error);
      }
    );
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async retryRequest<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    config: RetryConfig = this.defaultRetryConfig
  ): Promise<AxiosResponse<T>> {
    let lastError: any;

    for (let attempt = 0; attempt <= config.retries; attempt++) {
      try {
        return await requestFn();
      } catch (error: any) {
        lastError = error;
        
        if (attempt === config.retries || !config.retryCondition?.(error)) {
          throw error;
        }

        console.warn(`API request failed (attempt ${attempt + 1}/${config.retries + 1}):`, error.message);
        await this.delay(config.delay * Math.pow(2, attempt)); // Exponential backoff
      }
    }

    throw lastError;
  }

  async get<T = any>(
    url: string, 
    config?: AxiosRequestConfig,
    retryConfig?: Partial<RetryConfig>
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.retryRequest(
        () => this.instance.get<T>(url, config),
        { ...this.defaultRetryConfig, ...retryConfig }
      );
      
      return {
        data: response.data,
        success: true,
        message: 'Success'
      };
    } catch (error: any) {
      console.error('API GET Error:', error);
      return {
        data: null as T,
        success: false,
        error: error.response?.data?.message || error.message || 'Request failed',
        message: this.getErrorMessage(error)
      };
    }
  }

  async post<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig,
    retryConfig?: Partial<RetryConfig>
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.retryRequest(
        () => this.instance.post<T>(url, data, config),
        { ...this.defaultRetryConfig, ...retryConfig }
      );
      
      return {
        data: response.data,
        success: true,
        message: 'Success'
      };
    } catch (error: any) {
      console.error('API POST Error:', error);
      return {
        data: null as T,
        success: false,
        error: error.response?.data?.message || error.message || 'Request failed',
        message: this.getErrorMessage(error)
      };
    }
  }

  async put<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig,
    retryConfig?: Partial<RetryConfig>
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.retryRequest(
        () => this.instance.put<T>(url, data, config),
        { ...this.defaultRetryConfig, ...retryConfig }
      );
      
      return {
        data: response.data,
        success: true,
        message: 'Success'
      };
    } catch (error: any) {
      console.error('API PUT Error:', error);
      return {
        data: null as T,
        success: false,
        error: error.response?.data?.message || error.message || 'Request failed',
        message: this.getErrorMessage(error)
      };
    }
  }

  async delete<T = any>(
    url: string, 
    config?: AxiosRequestConfig,
    retryConfig?: Partial<RetryConfig>
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.retryRequest(
        () => this.instance.delete<T>(url, config),
        { ...this.defaultRetryConfig, ...retryConfig }
      );
      
      return {
        data: response.data,
        success: true,
        message: 'Success'
      };
    } catch (error: any) {
      console.error('API DELETE Error:', error);
      return {
        data: null as T,
        success: false,
        error: error.response?.data?.message || error.message || 'Request failed',
        message: this.getErrorMessage(error)
      };
    }
  }

  private getErrorMessage(error: any): string {
    if (error.code === 'NETWORK_ERROR') {
      return 'Network connection failed. Please check your internet connection.';
    }
    
    if (error.response?.status === 503) {
      return 'Service temporarily unavailable. Please try again in a moment.';
    }
    
    if (error.response?.status >= 500) {
      return 'Server error occurred. Please try again later.';
    }
    
    if (error.response?.status === 404) {
      return 'The requested resource was not found.';
    }
    
    if (error.response?.status === 403) {
      return 'You do not have permission to access this resource.';
    }
    
    if (error.response?.status === 400) {
      return error.response?.data?.message || 'Invalid request. Please check your input.';
    }
    
    return error.message || 'An unexpected error occurred.';
  }

  // Helper method to check if the API is healthy
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/health', {}, { retries: 1, delay: 500 });
      return response.success;
    } catch {
      return false;
    }
  }

  // ===== USER MANAGEMENT METHODS =====

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<ApiResponse<any>> {
    return this.get('/auth/me');
  }

  /**
   * Update user profile
   */
  async updateUserProfile(profileData: any): Promise<ApiResponse<any>> {
    return this.put('/user/profile', profileData);
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(): Promise<ApiResponse<any>> {
    return this.get('/user/preferences');
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(preferences: any): Promise<ApiResponse<any>> {
    return this.put('/user/preferences', preferences);
  }

  /**
   * Change user password
   */
  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<ApiResponse<any>> {
    return this.put('/user/password', passwordData);
  }

  /**
   * Get security settings
   */
  async getSecuritySettings(): Promise<ApiResponse<any>> {
    return this.get('/user/security');
  }

  // ===== SPORTS AND BETTING METHODS =====

  /**
   * Get sports games
   */
  async getSportsGames(params?: {
    sport?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<any>> {
    return this.get('/sports/games', { params });
  }

  /**
   * Get odds for games
   */
  async getOdds(gameId?: string): Promise<ApiResponse<any>> {
    const url = gameId ? `/sports/odds/${gameId}` : '/sports/odds';
    return this.get(url);
  }

  /**
   * Place a bet
   */
  async placeBet(betData: {
    game_id: string;
    bet_type: string;
    selection: string;
    odds: number;
    stake: number;
  }): Promise<ApiResponse<any>> {
    return this.post('/bets/place', betData);
  }

  /**
   * Get betting history
   */
  async getBettingHistory(params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<any>> {
    return this.get('/bets/history', { params });
  }

  /**
   * Get active bets
   */
  async getActiveBets(): Promise<ApiResponse<any>> {
    return this.get('/bets/active');
  }

  // ===== WALLET METHODS =====

  /**
   * Get wallet balance
   */
  async getWalletBalance(): Promise<ApiResponse<any>> {
    return this.get('/user/balance');
  }

  /**
   * Deposit funds
   */
  async depositFunds(depositData: {
    amount: number;
    method: string;
  }): Promise<ApiResponse<any>> {
    return this.post('/wallet/deposit', depositData);
  }

  /**
   * Withdraw funds
   */
  async withdrawFunds(withdrawData: {
    amount: number;
    method: string;
  }): Promise<ApiResponse<any>> {
    return this.post('/wallet/withdraw', withdrawData);
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(params?: {
    type?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<any>> {
    return this.get('/wallet/transactions', { params });
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();

export default apiClient;
export type { ApiResponse, RetryConfig };