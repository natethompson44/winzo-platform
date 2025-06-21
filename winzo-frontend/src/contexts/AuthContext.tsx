import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../utils/apiClient';

interface User {
  id: number;
  username: string;
  email?: string;
  wallet_balance: number;
  created_at: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, inviteCode: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateBalance: (newBalance: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const response = await apiClient.getUserProfile();
      if (response.success && response.data && response.data.success && response.data.data) {
        setUser(response.data.data);
      } else {
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('🔗 Making login request...');
      
      const response = await apiClient.post('/auth/login', {
        username,
        password
      });
      
      console.log('✅ Login response:', response);
      
      if (response.success && response.data && response.data.success && response.data.data) {
        const { token, user: userData } = response.data.data;
        localStorage.setItem('authToken', token);
        setUser(userData);
        return true;
      }
      console.log('❌ Login failed - invalid response structure:', response);
      return false;
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      return false;
    }
  };

  const register = async (username: string, password: string, inviteCode: string): Promise<boolean> => {
    try {
      const response = await apiClient.post('/auth/register', {
        username,
        password,
        invite_code: inviteCode
      });
      
      if (response.success && response.data && response.data.success && response.data.data) {
        const { token, user: userData } = response.data.data;
        localStorage.setItem('authToken', token);
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await apiClient.getUserProfile();
      if (response.success && response.data && response.data.success && response.data.data) {
        setUser(response.data.data);
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const updateBalance = (newBalance: number) => {
    if (user) {
      setUser({ ...user, wallet_balance: newBalance });
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    updateBalance
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
export default AuthProvider; 