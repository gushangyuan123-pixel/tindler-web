import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { APIUser } from '../services/types';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: APIUser | null;
  signIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Auto-authenticated
  const [isLoading] = useState(false);
  const [user, setUser] = useState<APIUser | null>({
    id: 'demo-user',
    email: 'demo@tindler.app',
    name: 'Demo User',
  });

  const signIn = useCallback(() => {
    setUser({
      id: 'demo-user',
      email: 'demo@tindler.app',
      name: 'Demo User',
    });
    setIsAuthenticated(true);
  }, []);

  const signOut = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
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
