import { apiClient } from './client';
import type { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  User 
} from '../types/api';

// Authentication API endpoints
export const login = (data: LoginRequest) => 
  apiClient.post<AuthResponse>('/auth/login/', data);

export const register = (data: RegisterRequest) => 
  apiClient.post<AuthResponse>('/auth/register/', data);

export const logout = () => {
  const refreshToken = typeof window !== 'undefined' 
    ? localStorage.getItem('refresh_token') 
    : null;
    
  return apiClient.post<{ message: string }>('/auth/logout/', {
    refresh_token: refreshToken
  });
};

export const refreshToken = (refreshToken: string) => 
  apiClient.post<{ access: string; refresh: string }>('/auth/token/refresh/', {
    refresh: refreshToken
  });

export const getProfile = () => 
  apiClient.get<User>('/auth/profile/');

export const updateProfile = (data: Partial<User>) => 
  apiClient.patch<User>('/auth/profile/', data);

export const changePassword = (data: {
  current_password: string;
  new_password: string;
  new_password_confirm: string;
}) => 
  apiClient.post<{ message: string }>('/auth/change-password/', data);

export const requestPasswordReset = (email: string) => 
  apiClient.post<{ message: string; email: string }>('/auth/forgot-password/', { email });

export const resetPassword = (data: {
  email: string;
  new_password: string;
  new_password_confirm: string;
  otp_code: string;
}) => 
  apiClient.post<{ message: string }>('/auth/reset-password/confirm/', data);

export const requestOTP = (data: {
  phone?: string;
  email?: string;
  otp_type: 'phone' | 'email' | 'password_reset' | 'login';
}) => 
  apiClient.post<{ message: string; otp_type: string; target: string }>('/auth/otp/request/', data);

export const verifyOTP = (data: {
  email?: string;
  phone?: string;
  code: string;
  otp_type: 'email' | 'phone' | 'password_reset' | 'login';
}) => 
  apiClient.post<{ 
    message: string; 
    tokens?: { 
      access: string; 
      refresh: string; 
    };
    user?: User;
  }>('/auth/otp/verify/', data);

export const verifyEmail = (data: {
  email: string;
  code: string;
}) => 
  apiClient.post<{
    message: string;
    tokens?: {
      access: string;
      refresh: string;
    };
    user?: User;
  }>('/auth/verify-email/', {
    email: data.email,
    otp_code: data.code
  }); 