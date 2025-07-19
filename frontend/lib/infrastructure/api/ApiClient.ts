/**
 * Unified API Client
 * Handles all HTTP communication with the backend API
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  pagination?: {
    current: number;
    total: number;
    count: number;
    next: string | null;
    previous: string | null;
  };
  // Add pagination fields that repositories expect
  results?: T[];
  count?: number;
  page?: number;
  limit?: number;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: string[];
  code?: string;
}

export interface RequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
  retryCount?: number;
  timeout?: number;
}

// Extend the internal config type as well
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    skipAuth?: boolean;
  }
}

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  enableLogging?: boolean;
}

export class ApiClient {
  private axiosInstance: AxiosInstance;
  private config: ApiClientConfig;
  private authToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(config: ApiClientConfig) {
    this.config = {
      timeout: 10000,
      retryAttempts: 3,
      retryDelay: 1000,
      enableLogging: false,
      ...config
    };

    this.axiosInstance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add auth token if available
        if (this.authToken && !config.skipAuth) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId();

        if (this.config.enableLogging) {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            data: config.data,
            params: config.params
          });
        }

        return config;
      },
      (error) => {
        if (this.config.enableLogging) {
          console.error('❌ API Request Error:', error);
        }
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        if (this.config.enableLogging) {
          console.log(`✅ API Response: ${response.status} ${response.config.url}`, {
            data: response.data
          });
        }

        // Transform response to standard format
        return this.transformResponse(response);
      },
      async (error: AxiosError) => {
        if (this.config.enableLogging) {
          console.error('❌ API Response Error:', {
            status: error.response?.status,
            url: error.config?.url,
            message: error.message,
            data: error.response?.data
          });
        }

        // Handle token refresh
        if (error.response?.status === 401 && this.refreshToken) {
          try {
            await this.refreshAuthToken();
            // Retry original request
            const originalRequest = error.config;
            if (originalRequest) {
              return this.axiosInstance.request(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens
            this.clearAuthTokens();
            throw this.transformError(error);
          }
        }

        throw this.transformError(error);
      }
    );
  }

  /**
   * Transform axios response to standard format
   */
  private transformResponse(response: AxiosResponse): any {
    const { data, status } = response;

    // Handle different response formats
    if (data && typeof data === 'object') {
      return {
        success: status >= 200 && status < 300,
        data: data.data || data,
        message: data.message,
        errors: data.errors,
        pagination: data.pagination,
        // Add pagination fields that repositories expect
        results: data.results || data.data,
        count: data.count,
        page: data.page,
        limit: data.limit
      };
    }

    return {
      success: status >= 200 && status < 300,
      data: data
    };
  }

  /**
   * Transform axios error to standard format
   */
  private transformError(error: AxiosError): ApiError {
    const status = error.response?.status || 0;
    const data = error.response?.data as any;

    return {
      message: data?.message || error.message || 'Network error',
      status,
      errors: data?.errors || [error.message],
      code: data?.code || error.code
    };
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set authentication tokens
   */
  setAuthTokens(authToken: string, refreshToken?: string): void {
    this.authToken = authToken;
    if (refreshToken) {
      this.refreshToken = refreshToken;
    }
  }

  /**
   * Clear authentication tokens
   */
  clearAuthTokens(): void {
    this.authToken = null;
    this.refreshToken = null;
  }

  /**
   * Refresh authentication token
   */
  private async refreshAuthToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await this.axiosInstance.post('/auth/refresh/', {
        refresh_token: this.refreshToken
      });

      const { data } = response;
      if (data.access_token) {
        this.authToken = data.access_token;
        if (data.refresh_token) {
          this.refreshToken = data.refresh_token;
        }
      }
    } catch (error) {
      throw new Error('Token refresh failed');
    }
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, config?: RequestConfig): Promise<any> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response;
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<any> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response;
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<any> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response;
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<any> {
    const response = await this.axiosInstance.patch<T>(url, data, config);
    return response;
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: RequestConfig): Promise<any> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response;
  }

  /**
   * Upload file
   */
  async uploadFile<T = any>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const uploadConfig: RequestConfig = {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      }
    };

    return this.post<T>(url, formData, uploadConfig);
  }

  /**
   * Download file
   */
  async downloadFile(url: string, filename?: string, config?: RequestConfig): Promise<void> {
    try {
      const response = await this.axiosInstance.get(url, {
        ...config,
        responseType: 'blob'
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      throw this.transformError(error as AxiosError);
    }
  }

  /**
   * Retry request with exponential backoff
   */
  private async retryRequest<T>(
    requestFn: () => Promise<ApiResponse<T>>,
    retryCount: number = 0
  ): Promise<ApiResponse<T>> {
    try {
      return await requestFn();
    } catch (error) {
      const apiError = error as ApiError;
      
      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (apiError.status >= 400 && apiError.status < 500 && apiError.status !== 429) {
        throw error;
      }

      if (retryCount < this.config.retryAttempts!) {
        const delay = this.config.retryDelay! * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryRequest(requestFn, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): ApiClientConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ApiClientConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Update axios instance if baseURL or timeout changed
    if (newConfig.baseURL) {
      this.axiosInstance.defaults.baseURL = newConfig.baseURL;
    }
    if (newConfig.timeout) {
      this.axiosInstance.defaults.timeout = newConfig.timeout;
    }
  }
}

// Create default API client instance
export const apiClient = new ApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  enableLogging: process.env.NODE_ENV === 'development'
}); 