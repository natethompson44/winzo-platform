import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../config/api';
import { ApiResponse, ApiError } from '../types';

// Simple in-memory cache
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttlMinutes: number = 5): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

// Enhanced API Client
class EnhancedApiClient {
  private client: AxiosInstance;
  private cache = new ApiCache();
  private retryAttempts = new Map<string, number>();

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('authToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: unknown) => Promise.reject(this.formatError(error))
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: unknown) => {
        const originalRequest = (error as any).config;

        // Handle 401 errors
        if ((error as any).response?.status === 401 && !originalRequest._retry) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          return Promise.reject(this.formatError(error));
        }

        // Retry logic for network errors
        if (this.shouldRetry(error) && !originalRequest._retry) {
          const retryKey = `${originalRequest.method}:${originalRequest.url}`;
          const attempts = this.retryAttempts.get(retryKey) || 0;

          if (attempts < 3) {
            originalRequest._retry = true;
            this.retryAttempts.set(retryKey, attempts + 1);
            
            // Exponential backoff
            await this.delay(Math.pow(2, attempts) * 1000);
            
            return this.client(originalRequest);
          }
        }

        return Promise.reject(this.formatError(error));
      }
    );
  }

  private shouldRetry(error: unknown): boolean {
    const axiosError = error as any;
    return (
      !axiosError.response ||
      axiosError.response.status >= 500 ||
      axiosError.code === 'NETWORK_ERROR' ||
      axiosError.code === 'TIMEOUT'
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private formatError(error: unknown): ApiError {
    const axiosError = error as any;
    
    if (axiosError.response?.data?.message) {
      return {
        message: axiosError.response.data.message,
        code: axiosError.response.data.code,
        details: axiosError.response.data,
      };
    }
    
    if (axiosError.response?.data?.error) {
      return {
        message: axiosError.response.data.error,
        code: axiosError.response.status?.toString(),
        details: axiosError.response.data,
      };
    }
    
    if (axiosError.message) {
      return {
        message: axiosError.message,
        code: axiosError.code,
        details: axiosError,
      };
    }
    
    return {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      details: axiosError,
    };
  }

  // GET request with caching
  async get<T>(
    url: string, 
    config?: AxiosRequestConfig,
    cacheMinutes?: number
  ): Promise<ApiResponse<T>> {
    const cacheKey = `GET:${url}:${JSON.stringify(config?.params || {})}`;
    
    // Check cache first
    if (cacheMinutes && cacheMinutes > 0) {
      const cached = this.cache.get<ApiResponse<T>>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await this.client.get<ApiResponse<T>>(url, config);
      const result = response.data;
      
      // Cache successful responses
      if (cacheMinutes && cacheMinutes > 0 && result.success) {
        this.cache.set(cacheKey, result, cacheMinutes);
      }
      
      return result;
    } catch (error) {
      throw error; // Error is already formatted by interceptor
    }
  }

  // POST request
  async post<T>(
    url: string, 
    data?: unknown, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<ApiResponse<T>>(url, data, config);
      
      // Clear related cache entries on POST
      this.clearRelatedCache(url);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // PUT request
  async put<T>(
    url: string, 
    data?: unknown, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<ApiResponse<T>>(url, data, config);
      
      // Clear related cache entries on PUT
      this.clearRelatedCache(url);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // DELETE request
  async delete<T>(
    url: string, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<ApiResponse<T>>(url, config);
      
      // Clear related cache entries on DELETE
      this.clearRelatedCache(url);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Clear cache entries related to a URL
  private clearRelatedCache(url: string): void {
    const urlParts = url.split('/');
    const baseResource = urlParts[urlParts.length - 1];
    
    // Clear cache entries that might be affected
    for (const [key] of this.cache['cache']) {
      if (key.includes(baseResource)) {
        this.cache.delete(key);
      }
    }
  }

  // Batch requests
  async batch<T>(requests: Array<() => Promise<T>>): Promise<T[]> {
    try {
      return await Promise.all(requests.map(request => request()));
    } catch (error) {
      throw error;
    }
  }

  // Clear all cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache stats
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache['cache'].size,
      keys: Array.from(this.cache['cache'].keys()),
    };
  }
}

// Create singleton instance
export const apiClient = new EnhancedApiClient();

// Export the class for testing
export { EnhancedApiClient };

// Backward compatibility - export as default
export default apiClient;