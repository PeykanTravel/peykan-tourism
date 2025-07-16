import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  PaginatedResponse, 
  ApiError, 
  HttpMethod, 
  RequestConfig, 
  ResponseConfig 
} from '../../domain/entities/Common';

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
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    const expirationTime = Date.now() + (expiresIn * 1000);
    
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.TOKEN_EXPIRES_KEY, expirationTime.toString());
  }

  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRES_KEY);
  }

  isTokenExpired(): boolean {
    const expirationTime = localStorage.getItem(this.TOKEN_EXPIRES_KEY);
    if (!expirationTime) return true;
    
    return Date.now() > parseInt(expirationTime);
  }

  isTokenExpiringSoon(thresholdMinutes: number = 5): boolean {
    const expirationTime = localStorage.getItem(this.TOKEN_EXPIRES_KEY);
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
        const duration = Date.now() - (error.config?.metadata?.startTime || 0);
        
        // Handle 401 Unauthorized - Try to refresh token
        if (error.response?.status === 401 && !error.config._retry) {
          error.config._retry = true;
          
          try {
            await this.refreshTokenIfNeeded();
            return this.axiosInstance(error.config);
          } catch (refreshError) {
            this.tokenManager.clearTokens();
            this.eventEmitter.emit('auth:expired', {
              message: 'Session expired. Please login again.'
            });
            return Promise.reject(refreshError);
          }
        }

        const apiError = this.transformError(error);
        
        this.eventEmitter.emit('request:error', {
          url: error.config?.url || '',
          method: error.config?.method?.toUpperCase() || 'GET',
          error: apiError
        });

        return Promise.reject(apiError);
      }
    );
  }

  // Refresh token if needed
  private async refreshTokenIfNeeded(): Promise<void> {
    if (this.refreshingPromise) {
      return this.refreshingPromise;
    }

    const refreshToken = this.tokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    this.refreshingPromise = this.refreshTokens(refreshToken)
      .finally(() => {
        this.refreshingPromise = null;
      });

    return this.refreshingPromise;
  }

  // Refresh tokens
  private async refreshTokens(refreshToken: string): Promise<void> {
    try {
      const response = await this.axiosInstance.post('/auth/refresh-token/', {
        refresh_token: refreshToken
      });

      const { access_token, refresh_token: newRefreshToken, expires_in } = response.data;
      
      this.tokenManager.setTokens(access_token, newRefreshToken, expires_in);
      
      this.eventEmitter.emit('auth:refresh', {
        tokens: response.data
      });
    } catch (error) {
      this.tokenManager.clearTokens();
      throw error;
    }
  }

  // Transform axios error to ApiError
  private transformError(error: any): ApiError {
    if (error.response) {
      return {
        message: error.response.data?.message || error.message || 'An error occurred',
        errors: error.response.data?.errors || {},
        status_code: error.response.status,
        error_code: error.response.data?.error_code,
        timestamp: new Date().toISOString()
      };
    }

    if (error.request) {
      return {
        message: 'Network error. Please check your connection.',
        status_code: 0,
        timestamp: new Date().toISOString()
      };
    }

    return {
      message: error.message || 'An unexpected error occurred',
      status_code: 500,
      timestamp: new Date().toISOString()
    };
  }

  // Generic request method with retry logic
  private async request<T>(config: RequestConfig): Promise<ResponseConfig<T>> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const axiosConfig: AxiosRequestConfig = {
          url: config.url,
          method: config.method,
          headers: config.headers,
          params: config.params,
          data: config.data,
          timeout: config.timeout || this.config.timeout,
        };

        const response = await this.axiosInstance(axiosConfig);
        
        return {
          data: response.data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers as Record<string, string>,
          config
        };
      } catch (error) {
        lastError = error;
        
        if (attempt < this.config.retryAttempts) {
          await this.delay(this.config.retryDelay * (attempt + 1));
        }
      }
    }

    throw lastError;
  }

  // Utility method for delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public API methods
  async get<T>(url: string, config?: Partial<RequestConfig>): Promise<T> {
    const response = await this.request<T>({
      url,
      method: 'GET',
      ...config
    });
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<T> {
    const response = await this.request<T>({
      url,
      method: 'POST',
      data,
      ...config
    });
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<T> {
    const response = await this.request<T>({
      url,
      method: 'PUT',
      data,
      ...config
    });
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<T> {
    const response = await this.request<T>({
      url,
      method: 'PATCH',
      data,
      ...config
    });
    return response.data;
  }

  async delete<T>(url: string, config?: Partial<RequestConfig>): Promise<T> {
    const response = await this.request<T>({
      url,
      method: 'DELETE',
      ...config
    });
    return response.data;
  }

  // Paginated requests
  async getPaginated<T>(url: string, config?: Partial<RequestConfig>): Promise<PaginatedResponse<T>> {
    return this.get<PaginatedResponse<T>>(url, config);
  }

  // Event system
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
    return !!this.tokenManager.getAccessToken() && !this.tokenManager.isTokenExpired();
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient; 