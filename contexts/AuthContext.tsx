import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '../types';
import { apiService } from '../services/apiService';
import toast from 'react-hot-toast';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  loginAsParent: (studentEmail: string, inviteCode: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'jee-genius-token';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));

  useEffect(() => {
    if (token) {
        apiService.setAuthToken(token);
    }

    const validateSession = async () => {
        if (token) {
            try {
                const sessionUser = await apiService.validateSession();
                setUser(sessionUser);
            } catch (error) {
                console.error("Session validation failed", error);
                setToken(null);
                localStorage.removeItem(TOKEN_KEY);
                apiService.setAuthToken(null);
            }
        }
        setLoading(false);
    };

    validateSession();
  }, [token]);

  const handleAuthSuccess = (newToken: string, newUser: User) => {
      localStorage.setItem(TOKEN_KEY, newToken);
      setToken(newToken);
      apiService.setAuthToken(newToken);
      setUser(newUser);
  };
  
  const login = useCallback(async (email: string, password?: string) => {
    // In a real app with registration, password would not be optional.
    // For this app, we'll simulate a "login or register" flow.
    const response = await apiService.login({ email, password: password || 'mockPassword' });
    handleAuthSuccess(response.token, response.user);
  }, []);
  
  const loginAsParent = useCallback(async (studentEmail: string, inviteCode: string) => {
    const response = await apiService.loginAsParent({ studentEmail, inviteCode });
    handleAuthSuccess(response.token, response.user);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    apiService.setAuthToken(null);
    // Optionally call a backend logout endpoint
    // apiService.logout();
  }, []);

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, loginAsParent, logout }}>
      {children}
    </AuthContext.Provider>
  );
};