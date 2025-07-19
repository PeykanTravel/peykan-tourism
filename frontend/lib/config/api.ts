export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const API_VERSION = 'v1';
export const API_TIMEOUT = 30000;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login/',
    LOGOUT: '/auth/logout/',
    REGISTER: '/auth/register/',
    REFRESH: '/auth/refresh/',
    VERIFY_EMAIL: '/auth/verify-email/',
    FORGOT_PASSWORD: '/auth/forgot-password/',
    RESET_PASSWORD: '/auth/reset-password/'
  },
  TOURS: {
    LIST: '/products/tours/',
    DETAIL: (slug: string) => `/products/tours/${slug}/`,
    CATEGORIES: '/products/tours/categories/'
  },
  EVENTS: {
    LIST: '/products/events/',
    DETAIL: (slug: string) => `/products/events/${slug}/`,
    CATEGORIES: '/products/events/categories/'
  },
  TRANSFERS: {
    LIST: '/products/transfers/',
    DETAIL: (slug: string) => `/products/transfers/${slug}/`,
    ROUTES: '/products/transfers/routes/'
  },
  CART: {
    BASE: '/cart/',
    ADD_ITEM: '/cart/add/',
    UPDATE_ITEM: '/cart/update/',
    REMOVE_ITEM: '/cart/remove/',
    CLEAR: '/cart/clear/'
  },
  ORDERS: {
    BASE: '/orders/',
    CREATE: '/orders/create/',
    CHECKOUT: '/orders/checkout/',
    PAYMENT: '/orders/payment/'
  }
};

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  VERSION: API_VERSION,
  TIMEOUT: API_TIMEOUT,
  FULL_BASE_URL: `${API_BASE_URL}/api/${API_VERSION}`,
  ENDPOINTS: API_ENDPOINTS
}; 