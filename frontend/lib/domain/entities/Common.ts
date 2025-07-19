// Common Types and API Response Interfaces

// API Response Structure (matching Django DRF)
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: string[];
  status: number;
  status_code?: number; // For backward compatibility
}

// Paginated Response (matching Django DRF PageNumberPagination)
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Error Response
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
  status_code?: number; // For backward compatibility
  error_code?: string;
  timestamp: string;
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  lastUpdated?: string;
}

// Generic CRUD Operations
export interface CrudState<T> extends LoadingState {
  items: T[];
  currentItem: T | null;
  totalCount: number;
  hasMore: boolean;
}

// Search and Filter
export interface SearchState<T> extends LoadingState {
  query: string;
  results: T[];
  suggestions: string[];
  filters: Record<string, any>;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// Notification
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: NotificationAction[];
  created_at: string;
  is_read: boolean;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

// Form State
export interface FormState<T> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Modal State
export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  closable?: boolean;
  onClose?: () => void;
}

// Theme
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  breakpoints: {
    mobile: string;
    tablet: string;
    desktop: string;
    wide: string;
  };
}

// Application Configuration
export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
  };
  features: {
    auth: boolean;
    cart: boolean;
    notifications: boolean;
    analytics: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'system';
    language: 'en' | 'fa' | 'tr';
    currency: 'USD' | 'EUR' | 'TRY';
    pagination: {
      defaultLimit: number;
      maxLimit: number;
    };
  };
}

// Validation
export interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Storage
export interface StorageItem<T> {
  key: string;
  value: T;
  expires?: Date;
  encrypted?: boolean;
}

// Cache
export interface CacheItem<T> {
  key: string;
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface CacheConfig {
  defaultTTL: number; // Time to live in milliseconds
  maxSize: number; // Maximum cache size
  strategy: 'LRU' | 'LFU' | 'FIFO';
}

// Event System
export interface AppEvent<T = any> {
  type: string;
  payload: T;
  timestamp: number;
  source: string;
}

export interface EventHandler<T = any> {
  (event: AppEvent<T>): void;
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type NonNullable<T> = T extends null | undefined ? never : T;

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Request Configuration
export interface RequestConfig {
  url: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTTL?: number;
}

// Response Configuration
export interface ResponseConfig<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
  duration: number;
}

// Environment
export interface Environment {
  NODE_ENV: 'development' | 'production' | 'test';
  API_URL: string;
  WS_URL?: string;
  CDN_URL?: string;
  SENTRY_DSN?: string;
  GOOGLE_ANALYTICS_ID?: string;
}

// Audit Trail
export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id: string;
  changes: Record<string, any>;
  ip_address: string;
  user_agent: string;
  timestamp: string;
}

// File Upload
export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

// Internationalization
export interface I18nResource {
  [key: string]: string | I18nResource;
}

export interface I18nConfig {
  defaultLanguage: string;
  supportedLanguages: string[];
  resources: Record<string, I18nResource>;
  fallbackLanguage: string;
} 