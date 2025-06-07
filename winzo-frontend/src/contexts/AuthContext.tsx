import React, { createContext, useState, ReactNode, useEffect, useContext } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface User {
  username: string;
  balance: number;
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
  id: string;
}

interface AuthContextProps {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, inviteCode: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  token: null,
  login: async () => false,
  register: async () => false,
  logout: () => {},
});

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios
        .get(`${API_URL}/auth/me`)
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setToken(null);
        });
    }
  }, [token]);

  const login = async (username: string, password: string) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { username, password });
      const newToken = res.data.token;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      // Fetch the user data after login
      const meRes = await axios.get(`${API_URL}/auth/me`);
      setUser(meRes.data);

      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const register = async (username: string, password: string, inviteCode: string) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { username, password, inviteCode });
      const newToken = res.data.token;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      // Fetch the user data after registration
      const meRes = await axios.get(`${API_URL}/auth/me`);
      setUser(meRes.data);

      return true;
    } catch (err) {
      console.error('Registration error:', err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

