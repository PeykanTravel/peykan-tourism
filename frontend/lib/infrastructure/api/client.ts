import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  PaginatedResponse, 
  ApiError, 
  HttpMethod, 
  RequestConfig, 
  ResponseConfig 
} from '../../domain/entities/Common';
import { SafeStorage } from '../../utils/storage';

// Extended Axios config with metadata
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  metadata?: {
    startTime: number;
  };
  _retry?: boolean;
}

// API Client Configuration
interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

// Request Interceptor Types
interface RequestInterceptor {
  onRequest?: (config: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>;
  onError?: (error: any) => any;
}

// Response Interceptor Types
interface ResponseInterceptor {
  onResponse?: (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>;
  onError?: (error: any) => any;
}

// Event Emitter for global state management
interface ApiEvents {
  'request:start': { url: string; method: string };
  'request:success': { url: string; method: string; duration: number };
  'request:error': { url: string; method: string; error: ApiError };
  'auth:expired': { message: string };
  'auth:refresh': { tokens: any };
}

class EventEmitter {
  private events: Map<string, Function[]> = new Map();

  on<K extends keyof ApiEvents>(event: K, handler: (data: ApiEvents[K]) => void) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(handler);
  }

  off<K extends keyof ApiEvents>(event: K, handler: (data: ApiEvents[K]) => void) {
    const handlers = this.events.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit<K extends keyof ApiEvents>(event: K, data: ApiEvents[K]) {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }
}

// Token Management
class TokenManager {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly TOKEN_EXPIRES_KEY = 'token_expires';

  getAccessToken(): string | null {
    return SafeStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return SafeStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    const expirationTime = Date.now() + (expiresIn * 1000);
    
    SafeStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    SafeStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    SafeStorage.setItem(this.TOKEN_EXPIRES_KEY, expirationTime.toString());
  }

  clearTokens(): void {
    SafeStorage.removeItem(this.ACCESS_TOKEN_KEY);
    SafeStorage.removeItem(this.REFRESH_TOKEN_KEY);
    SafeStorage.removeItem(this.TOKEN_EXPIRES_KEY);
  }

  isTokenExpired(): boolean {
    const expirationTime = SafeStorage.getItem(this.TOKEN_EXPIRES_KEY);
    if (!expirationTime) return true;
    
    return Date.now() > parseInt(expirationTime);
  }

  isTokenExpiringSoon(thresholdMinutes: number = 5): boolean {
    const expirationTime = SafeStorage.getItem(this.TOKEN_EXPIRES_KEY);
    if (!expirationTime) return true;
    
    const threshold = thresholdMinutes * 60 * 1000;
    return Date.now() > (parseInt(expirationTime) - threshold);
  }
}

// Main API Client Class
export class ApiClient {
  private axiosInstance: AxiosInstance;
  private tokenManager: TokenManager;
  private eventEmitter: EventEmitter;
  private config: ApiClientConfig;
  private refreshingPromise: Promise<void> | null = null;

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = {
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
      timeout: 10000,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    };

    this.tokenManager = new TokenManager();
    this.eventEmitter = new EventEmitter();
    
    this.axiosInstance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: true, // Enable cookies for CORS
    });

    this.setupInterceptors();
  }

  // Setup Request and Response Interceptors
  private setupInterceptors(): void {
    // Request Interceptor
    this.axiosInstance.interceptors.request.use(
      async (config: any) => {
        const startTime = Date.now();
        
        // Add authorization header
        const token = this.tokenManager.getAccessToken();
        if (token && !this.tokenManager.isTokenExpired()) {
          config.headers!.Authorization = `Bearer ${token}`;
        }

        // Refresh token if expiring soon
        if (token && this.tokenManager.isTokenExpiringSoon()) {
          await this.refreshTokenIfNeeded();
        }

        // Emit request start event
        this.eventEmitter.emit('request:start', {
          url: config.url || '',
          method: config.method?.toUpperCase() || 'GET'
        });

        // Store start time for duration calculation
        config.metadata = { startTime };
        
        return config;
      },
      (error: any) => {
        this.eventEmitter.emit('request:error', {
          url: error.config?.url || '',
          method: error.config?.method?.toUpperCase() || 'GET',
          error: this.transformError(error)
        });
        return Promise.reject(error);
      }
    );

    // Response Interceptor
    this.axiosInstance.interceptors.response.use(
      (response: any) => {
        const duration = Date.now() - (response.config.metadata?.startTime || 0);
        
        this.eventEmitter.emit('request:success', {
          url: response.config.url || '',
          method: response.config.method?.toUpperCase() || 'GET',
          duration
        });
        
        return response;
      },
      async (error: any) => {
        const originalRequest = error.config;
        
        // Log error for debugging
        console.error('API Error:', {
          url: originalRequest?.url,
          method: originalRequest?.method,
          status: error.response?.status,
          message: error.response?.data?.message || error.message
        });

        // Handle 401 errors with token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshSuccess = await this.refreshTokens(this.tokenManager.getRefreshToken() || '');
            if (refreshSuccess) {
              // Retry original request with new token
              return this.axiosInstance(originalRequest);
            } else {
              // Clear auth and redirect to login
              this.tokenManager.clearTokens();
              this.eventEmitter.emit('auth:expired', { message: 'Session expired' });
              if (typeof window !== 'undefined') {
                window.location.href = '/login';
              }
              return Promise.reject(error);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            this.tokenManager.clearTokens();
            this.eventEmitter.emit('auth:expired', { message: 'Session expired' });
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(error);
          }
        }

        // Handle network errors
        if (!error.response) {
          console.error('Network error:', error.message);
          return Promise.reject({
            message: 'Network error. Please check your connection.',
            isNetworkError: true
          });
        }

        // Handle server errors
        if (error.response?.status >= 500) {
          console.error('Server error:', error.response.status);
          return Promise.reject({
            message: 'Server error. Please try again later.',
            isServerError: true
          });
        }

        // Handle validation errors
        if (error.response?.status === 400) {
          const validationErrors = error.response.data;
          console.error('Validation error:', validationErrors);
          return Promise.reject({
            message: 'Please check your input and try again.',
            validationErrors,
            isValidationError: true
          });
        }

        this.eventEmitter.emit('request:error', {
          url: error.config?.url || '',
          method: error.config?.method?.toUpperCase() || 'GET',
          error: this.transformError(error)
        });
        
        return Promise.reject(error);
      }
    );
  }

  private async refreshTokenIfNeeded(): Promise<void> {
    if (this.refreshingPromise) {
      return this.refreshingPromise;
    }

    const refreshToken = this.tokenManager.getRefreshToken();
    if (!refreshToken) {
      return;
    }

    this.refreshingPromise = this.refreshTokens(refreshToken).then(() => {});
    try {
      await this.refreshingPromise;
    } finally {
      this.refreshingPromise = null;
    }
  }

  private async refreshTokens(refreshToken: string): Promise<boolean> {
    try {
      const response = await axios.post(`${this.config.baseURL}/auth/refresh/`, {
        refresh: refreshToken
      });

      const { access, refresh } = response.data;
      this.tokenManager.setTokens(access, refresh, 3600); // 1 hour default
      
      this.eventEmitter.emit('auth:refresh', { tokens: { access, refresh } });
      return true; // Indicate success
    } catch (error) {
      this.tokenManager.clearTokens();
      return false; // Indicate failure
    }
  }

  private transformError(error: any): ApiError {
    if (error.response) {
      return {
        status: error.response.status,
        message: error.response.data?.message || error.response.statusText,
        errors: error.response.data?.errors || {},
        timestamp: new Date().toISOString()
      };
    }
    
    if (error.request) {
      return {
        status: 0,
        message: 'Network error - no response received',
        errors: {},
        timestamp: new Date().toISOString()
      };
    }
    
    return {
      status: 0,
      message: error.message || 'Unknown error',
      errors: {},
      timestamp: new Date().toISOString()
    };
  }

  private async request<T>(config: RequestConfig): Promise<ResponseConfig<T>> {
    const startTime = Date.now();
    
    try {
      const response = await this.axiosInstance(config);
      const duration = Date.now() - startTime;
      
      return {
        data: response.data,
        status: response.status,
        headers: response.headers as Record<string, string>,
        duration
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      throw this.transformError(error);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async get<T>(url: string, config?: Partial<RequestConfig>): Promise<T> {
    const response = await this.request<T>({ ...config, method: 'GET', url });
    return response.data;
  }

  async getWithResponse<T>(url: string, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    const response = await this.request<T>({ ...config, method: 'GET', url });
    return {
      success: true,
      data: response.data,
      message: 'Success',
      status: response.status
    };
  }

  async post<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<T> {
    const response = await this.request<T>({ ...config, method: 'POST', url, data });
    return response.data;
  }

  async postWithResponse<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    const response = await this.request<T>({ ...config, method: 'POST', url, data });
    return {
      success: true,
      data: response.data,
      message: 'Success',
      status: response.status
    };
  }

  async put<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<T> {
    const response = await this.request<T>({ ...config, method: 'PUT', url, data });
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<T> {
    const response = await this.request<T>({ ...config, method: 'PATCH', url, data });
    return response.data;
  }

  async patchWithResponse<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    const response = await this.request<T>({ ...config, method: 'PATCH', url, data });
    return {
      success: true,
      data: response.data,
      message: 'Success',
      status: response.status
    };
  }

  async delete<T>(url: string, config?: Partial<RequestConfig>): Promise<T> {
    const response = await this.request<T>({ ...config, method: 'DELETE', url });
    return response.data;
  }

  async deleteWithResponse<T>(url: string, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    const response = await this.request<T>({ ...config, method: 'DELETE', url });
    return {
      success: true,
      data: response.data,
      message: 'Success',
      status: response.status
    };
  }

  async getPaginated<T>(url: string, config?: Partial<RequestConfig>): Promise<PaginatedResponse<T>> {
    const response = await this.request<PaginatedResponse<T>>({ ...config, method: 'GET', url });
    return response.data;
  }

  // Event handling
  on<K extends keyof ApiEvents>(event: K, handler: (data: ApiEvents[K]) => void): void {
    this.eventEmitter.on(event, handler);
  }

  off<K extends keyof ApiEvents>(event: K, handler: (data: ApiEvents[K]) => void): void {
    this.eventEmitter.off(event, handler);
  }

  // Token management
  setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    this.tokenManager.setTokens(accessToken, refreshToken, expiresIn);
  }

  clearTokens(): void {
    this.tokenManager.clearTokens();
  }

  isAuthenticated(): boolean {
    return !this.tokenManager.isTokenExpired();
  }
}

// Export singleton instance
export const apiClient = new ApiClient(); 