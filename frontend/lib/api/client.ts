/**
 * API Client configuration for Peykan Tourism Platform.
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { tokenService } from '../services/tokenService';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://peykantravelistanbul.com/api/v1',
  timeout: 15000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for CORS
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from token service
    const authHeader = tokenService.getAuthHeader();
    
    if ('Authorization' in authHeader && config.headers) {
      config.headers.Authorization = authHeader.Authorization;
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    console.error('API Response error:', error);
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshSuccess = await tokenService.refreshToken();
      
      if (refreshSuccess) {
        // Retry the original request with new token
        const originalRequest = error.config;
        const authHeader = tokenService.getAuthHeader();
        
        if ('Authorization' in authHeader) {
          originalRequest.headers.Authorization = authHeader.Authorization;
        }
        
        return apiClient(originalRequest);
      } else {
        // Refresh failed, clear auth and redirect to login
        tokenService.clearTokens();
        
        // Redirect to login if in browser
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    
    // Handle network errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    }
    
    if (!error.response) {
      console.error('Network error - backend may be down');
    }
    
    return Promise.reject(error);
  }
);

export { apiClient }; 