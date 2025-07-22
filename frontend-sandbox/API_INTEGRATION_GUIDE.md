# راهنمای یکپارچه‌سازی API - Peykan Tourism

## 🎯 **معرفی**

این راهنما نحوه استفاده از API‌های Peykan Tourism را توضیح می‌دهد. سیستم از Django REST Framework در backend و Axios در frontend استفاده می‌کند.

---

## 🏗️ **معماری API**

### **Base URL:**
```
Development: http://localhost:8000/api/v1/
Production: https://api.peykan-tourism.com/api/v1/
```

### **Authentication:**
- **JWT Token**: برای احراز هویت کاربران
- **Session**: برای مدیریت session
- **API Key**: برای سرویس‌های خارجی

---

## 📁 **ساختار API**

### **1. Tours API**
```
GET    /tours/                    # لیست تورها
GET    /tours/{id}/              # جزئیات تور
GET    /tours/{id}/schedules/    # برنامه‌های تور
GET    /tours/{id}/variants/     # انواع تور
POST   /tours/{id}/book/         # رزرو تور
```

### **2. Events API**
```
GET    /events/                  # لیست رویدادها
GET    /events/{id}/             # جزئیات رویداد
GET    /events/{id}/seats/       # صندلی‌های رویداد
POST   /events/{id}/book/        # رزرو رویداد
```

### **3. Transfers API**
```
GET    /transfers/               # لیست ترانسفرها
GET    /transfers/{id}/          # جزئیات ترانسفر
GET    /transfers/{id}/routes/   # مسیرهای ترانسفر
POST   /transfers/{id}/book/     # رزرو ترانسفر
```

### **4. Users API**
```
POST   /users/register/          # ثبت‌نام
POST   /users/login/             # ورود
GET    /users/profile/           # پروفایل کاربر
PUT    /users/profile/           # به‌روزرسانی پروفایل
```

### **5. Orders API**
```
GET    /orders/                  # لیست سفارشات
GET    /orders/{id}/             # جزئیات سفارش
POST   /orders/                  # ایجاد سفارش
PUT    /orders/{id}/cancel/      # لغو سفارش
```

### **6. Shared API**
```
GET    /shared/currency/         # نرخ ارزها
GET    /shared/language/         # زبان‌های پشتیبانی شده
GET    /shared/countries/        # کشورها
GET    /shared/cities/           # شهرها
```

---

## 🔧 **پیاده‌سازی در Frontend**

### **1. API Client Setup**

#### **`lib/api/client.ts`**
```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### **2. Enhanced API Client**

#### **`lib/api/enhancedApi.ts`**
```typescript
import { create } from 'zustand';

interface CacheStore {
  cache: Map<string, any>;
  setCache: (key: string, value: any, ttl?: number) => void;
  getCache: (key: string) => any;
  clearCache: () => void;
}

const useCacheStore = create<CacheStore>((set, get) => ({
  cache: new Map(),
  setCache: (key, value, ttl = 300000) => {
    const cache = get().cache;
    cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
    });
    set({ cache });
  },
  getCache: (key) => {
    const cache = get().cache;
    const item = cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      cache.delete(key);
      set({ cache });
      return null;
    }
    
    return item.value;
  },
  clearCache: () => set({ cache: new Map() }),
}));

class EnhancedApiClient {
  private cacheStore = useCacheStore;
  private retryCount = 3;
  private retryDelay = 1000;

  async request<T>(config: any): Promise<T> {
    const cacheKey = `${config.method}_${config.url}_${JSON.stringify(config.params || {})}`;
    
    // Check cache for GET requests
    if (config.method === 'get') {
      const cached = this.cacheStore.getCache(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await apiClient.request(config);
      
      // Cache successful GET responses
      if (config.method === 'get') {
        this.cacheStore.setCache(cacheKey, response.data);
      }
      
      return response.data;
    } catch (error) {
      return this.handleError(error, config);
    }
  }

  private async handleError(error: any, config: any): Promise<any> {
    if (error.response?.status >= 500 && this.retryCount > 0) {
      this.retryCount--;
      await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      return this.request(config);
    }
    
    throw error;
  }
}

export const enhancedApi = new EnhancedApiClient();
```

### **3. Product-Specific API Functions**

#### **`lib/api/toursApi.ts`**
```typescript
import { enhancedApi } from './enhancedApi';

export interface Tour {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  images: string[];
  schedules: Schedule[];
  variants: Variant[];
}

export interface Schedule {
  id: string;
  date: string;
  available_seats: number;
  price: number;
}

export interface Variant {
  id: string;
  name: string;
  price_modifier: number;
  description: string;
}

export const toursApi = {
  // Get all tours
  getTours: (params?: any) => 
    enhancedApi.request<Tour[]>({
      method: 'get',
      url: '/tours/',
      params,
    }),

  // Get tour by ID
  getTour: (id: string) =>
    enhancedApi.request<Tour>({
      method: 'get',
      url: `/tours/${id}/`,
    }),

  // Get tour schedules
  getTourSchedules: (id: string) =>
    enhancedApi.request<Schedule[]>({
      method: 'get',
      url: `/tours/${id}/schedules/`,
    }),

  // Get tour variants
  getTourVariants: (id: string) =>
    enhancedApi.request<Variant[]>({
      method: 'get',
      url: `/tours/${id}/variants/`,
    }),

  // Book tour
  bookTour: (id: string, bookingData: any) =>
    enhancedApi.request<any>({
      method: 'post',
      url: `/tours/${id}/book/`,
      data: bookingData,
    }),
};
```

#### **`lib/api/eventsApi.ts`**
```typescript
import { enhancedApi } from './enhancedApi';

export interface Event {
  id: string;
  title: string;
  description: string;
  venue: string;
  date: string;
  price: number;
  total_seats: number;
  available_seats: number;
  seats: Seat[];
}

export interface Seat {
  id: string;
  row: string;
  number: string;
  price: number;
  status: 'available' | 'booked' | 'reserved';
}

export const eventsApi = {
  // Get all events
  getEvents: (params?: any) =>
    enhancedApi.request<Event[]>({
      method: 'get',
      url: '/events/',
      params,
    }),

  // Get event by ID
  getEvent: (id: string) =>
    enhancedApi.request<Event>({
      method: 'get',
      url: `/events/${id}/`,
    }),

  // Get event seats
  getEventSeats: (id: string) =>
    enhancedApi.request<Seat[]>({
      method: 'get',
      url: `/events/${id}/seats/`,
    }),

  // Book event
  bookEvent: (id: string, bookingData: any) =>
    enhancedApi.request<any>({
      method: 'post',
      url: `/events/${id}/book/`,
      data: bookingData,
    }),
};
```

#### **`lib/api/transfersApi.ts`**
```typescript
import { enhancedApi } from './enhancedApi';

export interface Transfer {
  id: string;
  title: string;
  description: string;
  from_location: string;
  to_location: string;
  vehicle_type: string;
  price: number;
  routes: Route[];
}

export interface Route {
  id: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  available_seats: number;
}

export const transfersApi = {
  // Get all transfers
  getTransfers: (params?: any) =>
    enhancedApi.request<Transfer[]>({
      method: 'get',
      url: '/transfers/',
      params,
    }),

  // Get transfer by ID
  getTransfer: (id: string) =>
    enhancedApi.request<Transfer>({
      method: 'get',
      url: `/transfers/${id}/`,
    }),

  // Get transfer routes
  getTransferRoutes: (id: string) =>
    enhancedApi.request<Route[]>({
      method: 'get',
      url: `/transfers/${id}/routes/`,
    }),

  // Book transfer
  bookTransfer: (id: string, bookingData: any) =>
    enhancedApi.request<any>({
      method: 'post',
      url: `/transfers/${id}/book/`,
      data: bookingData,
    }),
};
```

### **4. Authentication API**

#### **`lib/api/authApi.ts`**
```typescript
import { enhancedApi } from './enhancedApi';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  preferences: any;
}

export interface LoginResponse {
  user: User;
  token: string;
  refresh_token: string;
}

export const authApi = {
  // Register user
  register: (userData: any) =>
    enhancedApi.request<User>({
      method: 'post',
      url: '/users/register/',
      data: userData,
    }),

  // Login user
  login: (credentials: { email: string; password: string }) =>
    enhancedApi.request<LoginResponse>({
      method: 'post',
      url: '/users/login/',
      data: credentials,
    }),

  // Get user profile
  getProfile: () =>
    enhancedApi.request<User>({
      method: 'get',
      url: '/users/profile/',
    }),

  // Update user profile
  updateProfile: (profileData: any) =>
    enhancedApi.request<User>({
      method: 'put',
      url: '/users/profile/',
      data: profileData,
    }),

  // Refresh token
  refreshToken: (refreshToken: string) =>
    enhancedApi.request<{ token: string }>({
      method: 'post',
      url: '/users/refresh/',
      data: { refresh_token: refreshToken },
    }),
};
```

### **5. Orders API**

#### **`lib/api/ordersApi.ts`**
```typescript
import { enhancedApi } from './enhancedApi';

export interface Order {
  id: string;
  user: string;
  product_type: 'tour' | 'event' | 'transfer';
  product_id: string;
  quantity: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export const ordersApi = {
  // Get user orders
  getOrders: (params?: any) =>
    enhancedApi.request<Order[]>({
      method: 'get',
      url: '/orders/',
      params,
    }),

  // Get order by ID
  getOrder: (id: string) =>
    enhancedApi.request<Order>({
      method: 'get',
      url: `/orders/${id}/`,
    }),

  // Create order
  createOrder: (orderData: any) =>
    enhancedApi.request<Order>({
      method: 'post',
      url: '/orders/',
      data: orderData,
    }),

  // Cancel order
  cancelOrder: (id: string) =>
    enhancedApi.request<Order>({
      method: 'put',
      url: `/orders/${id}/cancel/`,
    }),
};
```

---

## 🎣 **Custom Hooks**

### **1. Data Fetching Hooks**

#### **`lib/hooks/useTours.ts`**
```typescript
import { useState, useEffect } from 'react';
import { toursApi, Tour } from '../api/toursApi';

export function useTours(params?: any) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);
        const data = await toursApi.getTours(params);
        setTours(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tours');
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, [params]);

  return { tours, loading, error, refetch: () => fetchTours() };
}
```

#### **`lib/hooks/useTour.ts`**
```typescript
import { useState, useEffect } from 'react';
import { toursApi, Tour } from '../api/toursApi';

export function useTour(id: string) {
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchTour = async () => {
      try {
        setLoading(true);
        const data = await toursApi.getTour(id);
        setTour(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tour');
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [id]);

  return { tour, loading, error, refetch: () => fetchTour() };
}
```

### **2. Authentication Hooks**

#### **`lib/hooks/useAuth.ts`**
```typescript
import { useState, useEffect } from 'react';
import { authApi, User } from '../api/authApi';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await authApi.getProfile();
        setUser(userData);
        setError(null);
      } catch (err) {
        localStorage.removeItem('auth_token');
        setError(err instanceof Error ? err.message : 'Authentication failed');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await authApi.login(credentials);
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('refresh_token', response.refresh_token);
      setUser(response.user);
      setError(null);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return { user, loading, error, login, logout };
}
```

---

## 🔄 **WebSocket Integration**

### **Real-time Updates**

#### **`lib/services/websocket.ts`**
```typescript
import { toast } from 'react-hot-toast';

export interface WebSocketMessage {
  type: 'booking_update' | 'price_change' | 'availability_update' | 'notification';
  data: any;
  timestamp: number;
}

class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('🔌 WebSocket connected');
        this.reconnectAttempts = 0;
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('❌ Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        this.scheduleReconnect(url);
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        reject(error);
      };
    });
  }

  private handleMessage(message: WebSocketMessage) {
    switch (message.type) {
      case 'booking_update':
        toast.success(`🔄 Booking updated: ${message.data.status}`);
        break;
      case 'price_change':
        toast.info(`💰 Price changed: ${message.data.product} - ${message.data.newPrice}`);
        break;
      case 'availability_update':
        toast.warning(`⚠️ Availability changed: ${message.data.product}`);
        break;
      case 'notification':
        toast(message.data.message);
        break;
    }
  }

  private scheduleReconnect(url: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect(url).catch(console.error);
      }, 3000);
    }
  }

  send(message: WebSocketMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  disconnect() {
    this.ws?.close();
  }
}

export const wsClient = new WebSocketClient();
```

---

## 🧪 **Testing API Integration**

### **1. Unit Tests**

#### **`__tests__/api/toursApi.test.ts`**
```typescript
import { toursApi } from '../../lib/api/toursApi';
import { enhancedApi } from '../../lib/api/enhancedApi';

jest.mock('../../lib/api/enhancedApi');

describe('toursApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch tours successfully', async () => {
    const mockTours = [
      { id: '1', title: 'Tour 1', price: 100 },
      { id: '2', title: 'Tour 2', price: 200 },
    ];

    (enhancedApi.request as jest.Mock).mockResolvedValue(mockTours);

    const result = await toursApi.getTours();

    expect(enhancedApi.request).toHaveBeenCalledWith({
      method: 'get',
      url: '/tours/',
      params: undefined,
    });
    expect(result).toEqual(mockTours);
  });

  it('should handle API errors', async () => {
    const error = new Error('API Error');
    (enhancedApi.request as jest.Mock).mockRejectedValue(error);

    await expect(toursApi.getTours()).rejects.toThrow('API Error');
  });
});
```

### **2. Integration Tests**

#### **`__tests__/integration/booking.test.ts`**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UnifiedBookingForm } from '../../components/booking/UnifiedBookingForm';
import { toursApi } from '../../lib/api/toursApi';

jest.mock('../../lib/api/toursApi');

describe('Booking Integration', () => {
  it('should book tour successfully', async () => {
    const mockBookingResponse = { id: 'booking-1', status: 'confirmed' };
    (toursApi.bookTour as jest.Mock).mockResolvedValue(mockBookingResponse);

    render(<UnifiedBookingForm productType="tour" productId="tour-1" />);

    // Fill form
    fireEvent.change(screen.getByLabelText('Date'), {
      target: { value: '2024-01-15' },
    });
    fireEvent.change(screen.getByLabelText('Participants'), {
      target: { value: '2' },
    });

    // Submit form
    fireEvent.click(screen.getByText('Book Now'));

    await waitFor(() => {
      expect(toursApi.bookTour).toHaveBeenCalledWith('tour-1', {
        date: '2024-01-15',
        participants: 2,
      });
    });
  });
});
```

---

## 📊 **Error Handling**

### **1. Global Error Handler**

#### **`lib/utils/errorHandler.ts`**
```typescript
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: any): ApiError {
  if (error.response) {
    const { status, data } = error.response;
    return new ApiError(
      data.message || 'An error occurred',
      status,
      data.code
    );
  }

  if (error.request) {
    return new ApiError('Network error', 0);
  }

  return new ApiError(error.message || 'Unknown error', 0);
}
```

### **2. Error Boundaries**

#### **`components/ErrorBoundary.tsx`**
```typescript
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 🔒 **Security**

### **1. Token Management**

```typescript
// lib/utils/tokenManager.ts
export class TokenManager {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  static isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}
```

### **2. CSRF Protection**

```typescript
// lib/api/client.ts
apiClient.interceptors.request.use((config) => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});
```

---

## 📈 **Performance Optimization**

### **1. Request Caching**

```typescript
// lib/api/cache.ts
export class RequestCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }
}
```

### **2. Request Debouncing**

```typescript
// lib/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

---

## 📚 **Best Practices**

### **1. API Response Types**

```typescript
// lib/types/api.ts
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}
```

### **2. Loading States**

```typescript
// lib/hooks/useLoading.ts
import { useState, useCallback } from 'react';

export function useLoading(initialState = false) {
  const [loading, setLoading] = useState(initialState);

  const withLoading = useCallback(async (fn: () => Promise<any>) => {
    setLoading(true);
    try {
      const result = await fn();
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, setLoading, withLoading };
}
```

### **3. Retry Logic**

```typescript
// lib/utils/retry.ts
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }

      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
}
```

---

**این راهنما به‌روزرسانی می‌شود. برای سوالات بیشتر با تیم توسعه تماس بگیرید!** 📞 