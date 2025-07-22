import { create } from 'zustand';

// ===== Types =====
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  enableCache: boolean;
  cacheTimeout: number;
}

export interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
}

// ===== Cache Store =====
interface CacheStore {
  cache: Map<string, CacheItem>;
  set: (key: string, data: any, ttl?: number) => void;
  get: (key: string) => any | null;
  delete: (key: string) => void;
  clear: () => void;
  isExpired: (key: string) => boolean;
}

export const useCacheStore = create<CacheStore>((set, get) => ({
  cache: new Map(),
  
  set: (key, data, ttl = 5 * 60 * 1000) => { // 5 minutes default
    const item: CacheItem = {
      data,
      timestamp: Date.now(),
      ttl
    };
    set((state) => ({
      cache: new Map(state.cache).set(key, item)
    }));
  },
  
  get: (key) => {
    const state = get();
    const item = state.cache.get(key);
    if (!item) return null;
    if (state.isExpired(key)) {
      state.delete(key);
      return null;
    }
    return item.data;
  },
  
  delete: (key) => {
    set((state) => {
      const newCache = new Map(state.cache);
      newCache.delete(key);
      return { cache: newCache };
    });
  },
  
  clear: () => {
    set({ cache: new Map() });
  },
  
  isExpired: (key) => {
    const state = get();
    const item = state.cache.get(key);
    if (!item) return true;
    return Date.now() - item.timestamp > item.ttl;
  }
}));

// ===== Enhanced API Client =====
class EnhancedApiClient {
  private config: ApiConfig;
  private cacheStore: ReturnType<typeof useCacheStore.getState>;
  
  constructor(config: Partial<ApiConfig> = {}) {
    this.config = {
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
      timeout: 10000,
      retries: 3,
      retryDelay: 1000,
      enableCache: true,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
      ...config
    };
    this.cacheStore = useCacheStore.getState();
  }
  
  // Generate cache key
  private generateCacheKey(endpoint: string, params?: any): string {
    const paramsString = params ? JSON.stringify(params) : '';
    return `${endpoint}:${paramsString}`;
  }
  
  // Retry mechanism
  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    retries: number = this.config.retries
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      if (retries > 0 && this.isRetryableError(error)) {
        await this.delay(this.config.retryDelay);
        return this.retryRequest(requestFn, retries - 1);
      }
      throw error;
    }
  }
  
  // Check if error is retryable
  private isRetryableError(error: any): boolean {
    if (!error.status) return false;
    return [408, 429, 500, 502, 503, 504].includes(error.status);
  }
  
  // Delay utility
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Enhanced fetch with timeout
  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout: number = this.config.timeout
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }
  
  // GET request with caching
  async get<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    options?: {
      useCache?: boolean;
      cacheTimeout?: number;
      timeout?: number;
    }
  ): Promise<ApiResponse<T>> {
    const url = new URL(`${this.config.baseURL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }
    
    const cacheKey = this.generateCacheKey(endpoint, params);
    const useCache = options?.useCache ?? this.config.enableCache;
    
    // Check cache first
    if (useCache) {
      const cachedData = this.cacheStore.get(cacheKey);
      if (cachedData) {
        return {
          data: cachedData,
          status: 200,
          message: 'Data from cache',
          success: true
        };
      }
    }
    
    // Make request with retry
    const response = await this.retryRequest(async () => {
      return this.fetchWithTimeout(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        }
      }, options?.timeout);
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Cache the response
    if (useCache) {
      this.cacheStore.set(cacheKey, data, options?.cacheTimeout ?? this.config.cacheTimeout);
    }
    
    return {
      data,
      status: response.status,
      message: 'Success',
      success: true
    };
  }
  
  // POST request
  async post<T = any>(
    endpoint: string,
    data?: any,
    options?: {
      timeout?: number;
      invalidateCache?: string[];
    }
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseURL}${endpoint}`;
    
    const response = await this.retryRequest(async () => {
      return this.fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: data ? JSON.stringify(data) : undefined
      }, options?.timeout);
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const responseData = await response.json();
    
    // Invalidate cache if specified
    if (options?.invalidateCache) {
      options.invalidateCache.forEach(cacheKey => {
        this.cacheStore.delete(cacheKey);
      });
    }
    
    return {
      data: responseData,
      status: response.status,
      message: 'Success',
      success: true
    };
  }
  
  // PUT request
  async put<T = any>(
    endpoint: string,
    data?: any,
    options?: {
      timeout?: number;
      invalidateCache?: string[];
    }
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseURL}${endpoint}`;
    
    const response = await this.retryRequest(async () => {
      return this.fetchWithTimeout(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: data ? JSON.stringify(data) : undefined
      }, options?.timeout);
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const responseData = await response.json();
    
    // Invalidate cache if specified
    if (options?.invalidateCache) {
      options.invalidateCache.forEach(cacheKey => {
        this.cacheStore.delete(cacheKey);
      });
    }
    
    return {
      data: responseData,
      status: response.status,
      message: 'Success',
      success: true
    };
  }
  
  // DELETE request
  async delete<T = any>(
    endpoint: string,
    options?: {
      timeout?: number;
      invalidateCache?: string[];
    }
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseURL}${endpoint}`;
    
    const response = await this.retryRequest(async () => {
      return this.fetchWithTimeout(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        }
      }, options?.timeout);
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const responseData = await response.json();
    
    // Invalidate cache if specified
    if (options?.invalidateCache) {
      options.invalidateCache.forEach(cacheKey => {
        this.cacheStore.delete(cacheKey);
      });
    }
    
    return {
      data: responseData,
      status: response.status,
      message: 'Success',
      success: true
    };
  }
  
  // Get authentication headers
  private getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  
  // Clear cache
  clearCache(): void {
    this.cacheStore.clear();
  }
  
  // Clear specific cache keys
  clearCacheKeys(keys: string[]): void {
    keys.forEach(key => this.cacheStore.delete(key));
  }
}

// ===== API Instances =====
export const apiClient = new EnhancedApiClient();

// ===== Product-specific API functions =====

// Tours API
export const toursApi = {
  // Get all tours with caching
  getAll: async (params?: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) => {
    return apiClient.get('/tours/', params, {
      useCache: true,
      cacheTimeout: 10 * 60 * 1000 // 10 minutes
    });
  },
  
  // Get tour by ID with caching
  getById: async (id: string) => {
    return apiClient.get(`/tours/${id}/`, {}, {
      useCache: true,
      cacheTimeout: 30 * 60 * 1000 // 30 minutes
    });
  },
  
  // Get tour variants
  getVariants: async (tourId: string) => {
    return apiClient.get(`/tours/${tourId}/variants/`, {}, {
      useCache: true,
      cacheTimeout: 15 * 60 * 1000 // 15 minutes
    });
  },
  
  // Get tour schedules
  getSchedules: async (tourId: string, params?: {
    date?: string;
    variant?: string;
  }) => {
    return apiClient.get(`/tours/${tourId}/schedules/`, params, {
      useCache: true,
      cacheTimeout: 5 * 60 * 1000 // 5 minutes
    });
  },
  
  // Book tour
  book: async (tourId: string, bookingData: any) => {
    return apiClient.post(`/tours/${tourId}/book/`, bookingData, {
      invalidateCache: [`/tours/${tourId}/schedules/`]
    });
  },
  
  // Get tour reviews
  getReviews: async (tourId: string, params?: {
    page?: number;
    limit?: number;
    rating?: number;
  }) => {
    return apiClient.get(`/tours/${tourId}/reviews/`, params, {
      useCache: true,
      cacheTimeout: 10 * 60 * 1000 // 10 minutes
    });
  }
};

// Events API
export const eventsApi = {
  // Get all events with caching
  getAll: async (params?: {
    search?: string;
    venue?: string;
    date?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) => {
    return apiClient.get('/events/', params, {
      useCache: true,
      cacheTimeout: 10 * 60 * 1000 // 10 minutes
    });
  },
  
  // Get event by ID with caching
  getById: async (id: string) => {
    return apiClient.get(`/events/${id}/`, {}, {
      useCache: true,
      cacheTimeout: 30 * 60 * 1000 // 30 minutes
    });
  },
  
  // Get event ticket types
  getTicketTypes: async (eventId: string) => {
    return apiClient.get(`/events/${eventId}/ticket-types/`, {}, {
      useCache: true,
      cacheTimeout: 15 * 60 * 1000 // 15 minutes
    });
  },
  
  // Get event seats
  getSeats: async (eventId: string, params?: {
    ticketType?: string;
    date?: string;
  }) => {
    return apiClient.get(`/events/${eventId}/seats/`, params, {
      useCache: true,
      cacheTimeout: 2 * 60 * 1000 // 2 minutes (seats change frequently)
    });
  },
  
  // Book event
  book: async (eventId: string, bookingData: any) => {
    return apiClient.post(`/events/${eventId}/book/`, bookingData, {
      invalidateCache: [`/events/${eventId}/seats/`]
    });
  },
  
  // Get event reviews
  getReviews: async (eventId: string, params?: {
    page?: number;
    limit?: number;
    rating?: number;
  }) => {
    return apiClient.get(`/events/${eventId}/reviews/`, params, {
      useCache: true,
      cacheTimeout: 10 * 60 * 1000 // 10 minutes
    });
  }
};

// Transfers API
export const transfersApi = {
  // Get all transfers with caching
  getAll: async (params?: {
    search?: string;
    origin?: string;
    destination?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) => {
    return apiClient.get('/transfers/', params, {
      useCache: true,
      cacheTimeout: 10 * 60 * 1000 // 10 minutes
    });
  },
  
  // Get transfer by ID with caching
  getById: async (id: string) => {
    return apiClient.get(`/transfers/${id}/`, {}, {
      useCache: true,
      cacheTimeout: 30 * 60 * 1000 // 30 minutes
    });
  },
  
  // Get transfer routes
  getRoutes: async (params?: {
    origin?: string;
    destination?: string;
  }) => {
    return apiClient.get('/transfers/routes/', params, {
      useCache: true,
      cacheTimeout: 15 * 60 * 1000 // 15 minutes
    });
  },
  
  // Get transfer vehicle types
  getVehicleTypes: async (transferId: string) => {
    return apiClient.get(`/transfers/${transferId}/vehicle-types/`, {}, {
      useCache: true,
      cacheTimeout: 15 * 60 * 1000 // 15 minutes
    });
  },
  
  // Book transfer
  book: async (transferId: string, bookingData: any) => {
    return apiClient.post(`/transfers/${transferId}/book/`, bookingData);
  },
  
  // Get transfer reviews
  getReviews: async (transferId: string, params?: {
    page?: number;
    limit?: number;
    rating?: number;
  }) => {
    return apiClient.get(`/transfers/${transferId}/reviews/`, params, {
      useCache: true,
      cacheTimeout: 10 * 60 * 1000 // 10 minutes
    });
  }
};

// Cart API
export const cartApi = {
  // Get cart
  get: async () => {
    return apiClient.get('/cart/', {}, {
      useCache: false // Cart should not be cached
    });
  },
  
  // Add item to cart
  addItem: async (itemData: any) => {
    return apiClient.post('/cart/add/', itemData, {
      invalidateCache: ['/cart/']
    });
  },
  
  // Update cart item
  updateItem: async (itemId: string, itemData: any) => {
    return apiClient.put(`/cart/items/${itemId}/`, itemData, {
      invalidateCache: ['/cart/']
    });
  },
  
  // Remove item from cart
  removeItem: async (itemId: string) => {
    return apiClient.delete(`/cart/items/${itemId}/`, {
      invalidateCache: ['/cart/']
    });
  },
  
  // Clear cart
  clear: async () => {
    return apiClient.delete('/cart/clear/', {
      invalidateCache: ['/cart/']
    });
  }
};

// Orders API
export const ordersApi = {
  // Get user orders
  getAll: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    return apiClient.get('/orders/', params, {
      useCache: true,
      cacheTimeout: 5 * 60 * 1000 // 5 minutes
    });
  },
  
  // Get order by ID
  getById: async (orderId: string) => {
    return apiClient.get(`/orders/${orderId}/`, {}, {
      useCache: true,
      cacheTimeout: 10 * 60 * 1000 // 10 minutes
    });
  },
  
  // Create order
  create: async (orderData: any) => {
    return apiClient.post('/orders/', orderData, {
      invalidateCache: ['/orders/', '/cart/']
    });
  },
  
  // Cancel order
  cancel: async (orderId: string) => {
    return apiClient.post(`/orders/${orderId}/cancel/`, {}, {
      invalidateCache: ['/orders/']
    });
  }
};

// User API
export const userApi = {
  // Get user profile
  getProfile: async () => {
    return apiClient.get('/user/profile/', {}, {
      useCache: true,
      cacheTimeout: 15 * 60 * 1000 // 15 minutes
    });
  },
  
  // Update user profile
  updateProfile: async (profileData: any) => {
    return apiClient.put('/user/profile/', profileData, {
      invalidateCache: ['/user/profile/']
    });
  },
  
  // Get user preferences
  getPreferences: async () => {
    return apiClient.get('/user/preferences/', {}, {
      useCache: true,
      cacheTimeout: 30 * 60 * 1000 // 30 minutes
    });
  },
  
  // Update user preferences
  updatePreferences: async (preferencesData: any) => {
    return apiClient.put('/user/preferences/', preferencesData, {
      invalidateCache: ['/user/preferences/']
    });
  }
};

// ===== Error Handling Utilities =====
export class ApiError extends Error {
  public status: number;
  public code?: string;
  public details?: any;
  
  constructor(message: string, status: number, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Error handler
export const handleApiError = (error: any): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }
  
  if (error.message === 'Request timeout') {
    return new ApiError('درخواست با مشکل مواجه شد. لطفاً دوباره تلاش کنید.', 408);
  }
  
  if (error.message.includes('HTTP')) {
    const status = parseInt(error.message.split(' ')[1]);
    return new ApiError('خطا در ارتباط با سرور', status);
  }
  
  return new ApiError('خطای غیرمنتظره رخ داد', 500);
};

// ===== Rate Limiting =====
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;
  
  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }
  
  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }
  
  getRemainingRequests(key: string): number {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

export const rateLimiter = new RateLimiter();

// ===== WebSocket Support =====
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Function[]> = new Map();
  
  constructor(private url: string) {}
  
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };
        
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.emit(data.type, data.payload);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };
        
        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.attemptReconnect();
        };
        
        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }
  
  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }
  
  send(type: string, payload: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }
  
  on(type: string, callback: Function): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(callback);
  }
  
  off(type: string, callback: Function): void {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }
  
  private emit(type: string, payload: any): void {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.forEach(callback => callback(payload));
    }
  }
  
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// ===== Real-time Updates =====
export const realtimeApi = {
  // WebSocket instance for real-time updates
  ws: null as WebSocketClient | null,
  
  // Initialize WebSocket connection
  init: (token?: string) => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/';
    const url = token ? `${wsUrl}?token=${token}` : wsUrl;
    
    realtimeApi.ws = new WebSocketClient(url);
    return realtimeApi.ws.connect();
  },
  
  // Subscribe to real-time updates
  subscribe: (channel: string, callback: Function) => {
    if (realtimeApi.ws) {
      realtimeApi.ws.on(channel, callback);
    }
  },
  
  // Unsubscribe from real-time updates
  unsubscribe: (channel: string, callback: Function) => {
    if (realtimeApi.ws) {
      realtimeApi.ws.off(channel, callback);
    }
  },
  
  // Send real-time message
  send: (channel: string, payload: any) => {
    if (realtimeApi.ws) {
      realtimeApi.ws.send(channel, payload);
    }
  },
  
  // Disconnect WebSocket
  disconnect: () => {
    if (realtimeApi.ws) {
      realtimeApi.ws.disconnect();
      realtimeApi.ws = null;
    }
  }
}; 