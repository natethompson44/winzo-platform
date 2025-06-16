import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../utils/axios';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';
import { User, ApiResponse, LoginFormData, ApiError } from '../types';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginFormData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const login = async (credentials: LoginFormData): Promise<void> => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await apiClient.post<ApiResponse<{ user: User; token: string }>>(
        API_ENDPOINTS.LOGIN,
        credentials
      );

      if (response.data?.success && response.data?.data) {
        const { user: userData, token } = response.data.data;
        localStorage.setItem('authToken', token);
        setUser(userData);
      } else {
        throw new Error(response.data?.message || 'Login failed');
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError.message || 'Login failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem('authToken');
    setUser(null);
    setError(null);
  };

  const checkAuthStatus = async (): Promise<void> => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.get<ApiResponse<User>>(API_ENDPOINTS.PROFILE);
      
      if (response.data?.success && response.data?.data) {
        setUser(response.data.data);
      } else {
        // Invalid token or user not found
        localStorage.removeItem('authToken');
      }
    } catch (error: unknown) {
      // Token might be expired or invalid
      localStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
