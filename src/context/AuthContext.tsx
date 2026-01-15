import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { APIUser } from '../services/types';
import { apiService } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: APIUser | null;
  signIn: (userData: APIUser) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USER_STORAGE_KEY = 'tindler_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<APIUser | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = apiService.getToken();
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);

      if (token && storedUser) {
        try {
          // Verify token is still valid with timeout
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 5000)
          );
          const response = await Promise.race([
            apiService.getCurrentUser(),
            timeoutPromise
          ]) as any;

          if (response.success && response.user) {
            setUser(response.user);
            setIsAuthenticated(true);
          } else {
            // Token invalid, clear storage
            apiService.clearTokens();
            localStorage.removeItem(USER_STORAGE_KEY);
          }
        } catch (error) {
          // Token invalid, expired, or timeout
          console.log('Auth check failed, clearing tokens');
          apiService.clearTokens();
          localStorage.removeItem(USER_STORAGE_KEY);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const signIn = useCallback((userData: APIUser) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
  }, []);

  const signOut = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    apiService.clearTokens();
    localStorage.removeItem(USER_STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
