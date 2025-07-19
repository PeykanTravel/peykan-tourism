import { useState, useCallback } from 'react';
import { AuthService } from '../services/AuthService';
import { ApiClient } from '../../infrastructure/api/client';
import { LoginCredentials, RegisterData, UpdateProfileData, ChangePasswordData } from '../../domain/repositories/UserRepository';
import { User } from '../../domain/entities/User';
import { ApiResponse } from '../../domain/entities/Common';

// Create singleton instances
const apiClient = new ApiClient();
const authService = new AuthService(apiClient);

export const useAuthService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = useCallback(async <T>(
    request: () => Promise<ApiResponse<T>>
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await request();
      
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Request failed');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<{ user: User; tokens: any } | null> => {
    return handleRequest(() => authService.login(credentials));
  }, [handleRequest]);

  const register = useCallback(async (data: RegisterData): Promise<{ user: User; tokens: any } | null> => {
    return handleRequest(() => authService.register(data));
  }, [handleRequest]);

  const logout = useCallback(async (): Promise<void> => {
    await handleRequest(() => authService.logout());
  }, [handleRequest]);

  const refreshToken = useCallback(async (): Promise<{ tokens: any } | null> => {
    return handleRequest(() => authService.refreshToken());
  }, [handleRequest]);

  const getProfile = useCallback(async (): Promise<User | null> => {
    return handleRequest(() => authService.getProfile());
  }, [handleRequest]);

  const updateProfile = useCallback(async (data: UpdateProfileData): Promise<User | null> => {
    return handleRequest(() => authService.updateProfile(data));
  }, [handleRequest]);

  const changePassword = useCallback(async (data: ChangePasswordData): Promise<void> => {
    await handleRequest(() => authService.changePassword(data));
  }, [handleRequest]);

  const verifyEmail = useCallback(async (code: string): Promise<void> => {
    await handleRequest(() => authService.verifyEmail(code));
  }, [handleRequest]);

  const verifyPhoneNumber = useCallback(async (code: string): Promise<void> => {
    await handleRequest(() => authService.verifyPhoneNumber(code));
  }, [handleRequest]);

  const resendVerificationCode = useCallback(async (type: 'email' | 'phone'): Promise<void> => {
    await handleRequest(() => authService.resendVerificationCode(type));
  }, [handleRequest]);

  const forgotPassword = useCallback(async (email: string): Promise<void> => {
    await handleRequest(() => authService.forgotPassword(email));
  }, [handleRequest]);

  const resetPassword = useCallback(async (token: string, password: string): Promise<void> => {
    await handleRequest(() => authService.resetPassword(token, password));
  }, [handleRequest]);

  return {
    // State
    isLoading,
    error,
    
    // Methods
    login,
    register,
    logout,
    refreshToken,
    getProfile,
    updateProfile,
    changePassword,
    verifyEmail,
    verifyPhoneNumber,
    resendVerificationCode,
    forgotPassword,
    resetPassword,
    
    // Utilities
    clearError: () => setError(null),
  };
}; 