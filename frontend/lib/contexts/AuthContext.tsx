'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types/api';
import { tokenService } from '../services/tokenService';
import { useToast } from './ToastContext';
import { errorHandler } from '../utils/errorHandler';
import { useTranslations } from 'next-intl';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, tokens: { access: string; refresh: string }) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { showError, showSuccess } = useToast();
  const t = useTranslations();

  // Initialize error handler
  useEffect(() => {
    errorHandler.initialize(showError, showSuccess, t);
  }, [showError, showSuccess, t]);

  useEffect(() => {
    // Check authentication status on mount
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Use token service to check authentication
      const isAuth = tokenService.isAuthenticated();
      const userData = tokenService.getUser();
      
      if (isAuth && userData) {
        // Verify token with backend
        const isValid = await tokenService.validateToken();
        
        if (isValid) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // Token is invalid, try to refresh
          const refreshSuccess = await tokenService.refreshToken();
          if (refreshSuccess) {
            const refreshedUser = tokenService.getUser();
            setUser(refreshedUser);
            setIsAuthenticated(true);
          } else {
            // Refresh failed, clear everything
            tokenService.clearTokens();
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      errorHandler.handle(error, 'AUTH_CHECK');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData: User, tokens: { access: string; refresh: string }) => {
    // Use token service to store tokens
    tokenService.storeTokens({
      access: tokens.access,
      refresh: tokens.refresh,
      user: userData
    });
    
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    // Use token service to clear tokens
    tokenService.clearTokens();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      // Update user in token service
      const currentTokens = {
        access: tokenService.getAccessToken() || '',
        refresh: tokenService.getRefreshToken() || '',
        user: updatedUser
      };
      tokenService.storeTokens(currentTokens);
      setUser(updatedUser);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 