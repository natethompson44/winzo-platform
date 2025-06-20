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

  constructor(baseURL: string = process.env.REACT_APP_API_URL || 'http://localhost:3001/api') {
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
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
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
          // Handle unauthorized - redirect to login
          localStorage.removeItem('authToken');
          window.location.href = '/login';
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
    return this.get('/user/profile');
  }

  /**
   * Update user profile
   */
  async updateUserProfile(profileData: any): Promise<ApiResponse<any>> {
    return this.put('/user/profile', profileData);
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return this.post('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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

  /**
   * Get active sessions
   */
  async getActiveSessions(): Promise<ApiResponse<any>> {
    return this.get('/user/sessions');
  }

  // ===== ANALYTICS METHODS =====

  /**
   * Get chart data
   */
  async getChartData(params?: {
    timeRange?: string;
    chartType?: string;
  }): Promise<ApiResponse<any>> {
    return this.get('/analytics/charts', { params });
  }

  /**
   * Get analytics summary
   */
  async getAnalyticsSummary(params?: {
    period?: string;
  }): Promise<ApiResponse<any>> {
    return this.get('/analytics/summary', { params });
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(params?: {
    format?: string;
    includeCharts?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.get('/analytics/export', { params });
  }

  // ===== ENHANCED BETTING HISTORY =====

  /**
   * Get enhanced betting history with filtering
   */
  async getBettingHistory(params?: {
    status?: string;
    betType?: string;
    sport?: string;
    minStake?: number;
    maxStake?: number;
    minOdds?: number;
    maxOdds?: number;
    search?: string;
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: string;
    includeAnalytics?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.get('/bets/history', { params });
  }

  // ===== INTEGRATION TEST METHODS =====

  /**
   * Test backend connectivity
   */
  async testConnectivity(): Promise<ApiResponse<any>> {
    return this.get('/integration-test/ping');
  }

  /**
   * Test authentication
   */
  async testAuthentication(): Promise<ApiResponse<any>> {
    return this.get('/integration-test/auth-test');
  }

  /**
   * Test CORS configuration
   */
  async testCORS(): Promise<ApiResponse<any>> {
    return this.get('/integration-test/cors-test');
  }

  /**
   * Test data handling
   */
  async testDataHandling(testData: any): Promise<ApiResponse<any>> {
    return this.post('/integration-test/data-test', testData);
  }

  /**
   * Get endpoints status
   */
  async getEndpointsStatus(): Promise<ApiResponse<any>> {
    return this.get('/integration-test/endpoints-status');
  }

  /**
   * Get sample data for testing
   */
  async getSampleData(): Promise<ApiResponse<any>> {
    return this.get('/integration-test/sample-data');
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();

export default apiClient;
export type { ApiResponse, RetryConfig }; 