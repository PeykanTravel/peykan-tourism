import { useState, useEffect, useCallback } from 'react';
import { AuthService } from '../services/AuthService';
import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { UserRepositoryImpl } from '../../infrastructure/repositories/UserRepositoryImpl';
import { ApiClient } from '../../infrastructure/api/ApiClient';

export interface UseAuthReturn {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth service
  const apiClient = new ApiClient();
  const userRepository = new UserRepositoryImpl(apiClient);
  const authService = new AuthService(userRepository);

  // Load user from storage on mount
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to load user from storage:', error);
        // Clear invalid storage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    };

    loadUserFromStorage();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.login({ email, password });
      
      setUser(result.user);
      setToken(result.token);
      
      // Store in localStorage
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('auth_user', JSON.stringify(result.user));
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [authService]);

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.register(data);
      
      setUser(result.user);
      setToken(result.token);
      
      // Store in localStorage
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('auth_user', JSON.stringify(result.user));
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [authService]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (token) {
        await authService.logout(token);
      }
      
      setUser(null);
      setToken(null);
      
      // Clear localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      setError(errorMessage);
      // Still clear local state even if server logout fails
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    } finally {
      setIsLoading(false);
    }
  }, [authService, token]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    token,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError
  };
} 