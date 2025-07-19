/**
 * Testing Configuration for Frontend Architecture
 * Supports unit tests, integration tests, and E2E tests
 */

import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { NextIntlClientProvider } from 'next-intl';

// Mock data for testing
export const MockData = {
  // User mock data
  mockUser: {
    id: '1',
    email: 'test@example.com',
    phone_number: '+1234567890',
    first_name: 'John',
    last_name: 'Doe',
    is_active: true,
    is_verified: true,
    is_phone_verified: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  
  // Auth tokens mock
  mockTokens: {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    token_type: 'Bearer',
    expires_in: 3600,
  },
  
  // Cart items mock
  mockCartItems: [
    {
      id: '1',
      product_id: 'tour-1',
      product_type: 'tour',
      title: 'Istanbul City Tour',
      quantity: 2,
      price: 150.00,
      currency: 'USD',
      booking_date: '2024-02-15',
      booking_time: '09:00',
      location: 'Istanbul, Turkey',
    },
    {
      id: '2',
      product_id: 'event-1',
      product_type: 'event',
      title: 'Turkish Music Concert',
      quantity: 1,
      price: 85.00,
      currency: 'USD',
      booking_date: '2024-02-20',
      booking_time: '20:00',
      location: 'Istanbul Opera House',
    },
  ],
  
  // Products mock
  mockProducts: {
    tours: [
      {
        id: '1',
        title: 'Istanbul City Tour',
        description: 'Explore the historic city of Istanbul',
        price: 150.00,
        currency: 'USD',
        image: '/images/istanbul-tour.jpg',
        duration: '8 hours',
        location: 'Istanbul, Turkey',
        rating: 4.8,
        reviewCount: 245,
        maxParticipants: 20,
        slug: 'istanbul-city-tour',
      },
    ],
    events: [
      {
        id: '1',
        title: 'Turkish Music Concert',
        description: 'Traditional Turkish music performance',
        price: 85.00,
        currency: 'USD',
        image: '/images/music-concert.jpg',
        date: '2024-02-20',
        time: '20:00',
        location: 'Istanbul Opera House',
        slug: 'turkish-music-concert',
      },
    ],
    transfers: [
      {
        id: '1',
        title: 'Airport Transfer',
        description: 'Comfortable airport transfer service',
        price: 45.00,
        currency: 'USD',
        origin: 'Istanbul Airport',
        destination: 'Sultanahmet',
        duration: '45 minutes',
        slug: 'airport-transfer',
      },
    ],
  },
};

// Test environment setup
export const TestEnvironment = {
  // API mocking
  mockApiEndpoints: {
    auth: {
      login: '/api/v1/auth/login/',
      register: '/api/v1/auth/register/',
      logout: '/api/v1/auth/logout/',
      refresh: '/api/v1/auth/token/refresh/',
    },
    cart: {
      getCart: '/api/v1/cart/',
      addToCart: '/api/v1/cart/items/',
      updateCart: '/api/v1/cart/items/:id/',
      removeFromCart: '/api/v1/cart/items/:id/',
    },
    products: {
      tours: '/api/v1/tours/tours/',
      events: '/api/v1/events/events/',
      transfers: '/api/v1/transfers/routes/',
    },
  },
  
  // Mock responses
  mockResponses: {
    success: {
      login: {
        success: true,
        user: MockData.mockUser,
        tokens: MockData.mockTokens,
      },
      cart: {
        success: true,
        items: MockData.mockCartItems,
        total: 385.00,
        currency: 'USD',
      },
      products: {
        success: true,
        results: MockData.mockProducts.tours,
        count: 1,
        next: null,
        previous: null,
      },
    },
    error: {
      login: {
        success: false,
        message: 'Invalid credentials',
        error: 'authentication_failed',
      },
      cart: {
        success: false,
        message: 'Cart not found',
        error: 'cart_not_found',
      },
    },
  },
  
  // Test configuration
  config: {
    timeout: 10000,
    retries: 3,
    baseURL: 'http://localhost:3000',
    apiURL: 'http://localhost:8000/api/v1',
  },
};

// Custom render function for testing components with providers
export const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const messages = {
      common: {
        loading: 'Loading...',
        error: 'An error occurred',
        success: 'Success',
        cancel: 'Cancel',
        save: 'Save',
        edit: 'Edit',
        delete: 'Delete',
        confirm: 'Confirm',
      },
      auth: {
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        email: 'Email',
        password: 'Password',
        loginButton: 'Login',
        registerButton: 'Register',
      },
      cart: {
        title: 'Shopping Cart',
        items: 'Items',
        total: 'Total',
        checkout: 'Checkout',
        removeItem: 'Remove Item',
        updateQuantity: 'Update Quantity',
      },
    };
    
    return (
      <NextIntlClientProvider locale="en" messages={messages}>
        {children}
      </NextIntlClientProvider>
    );
  };
  
  return render(ui, { wrapper: Wrapper, ...options });
};

// Store testing utilities
export const StoreTestUtils = {
  // Mock store initial state
  mockStoreInitialState: {
    auth: {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    },
    cart: {
      items: [],
      cart: null,
      summary: null,
      isLoading: false,
      error: null,
    },
    products: {
      tours: [],
      events: [],
      transfers: [],
      isLoading: false,
      error: null,
    },
  },
  
  // Create mock store
  createMockStore: (initialState: any) => ({
    getState: () => initialState,
    dispatch: jest.fn(),
    subscribe: jest.fn(),
    replaceReducer: jest.fn(),
  }),
  
  // Mock API calls
  mockApiCall: (mockResponse: any, delay: number = 100) => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockResponse), delay);
    });
  },
  
  // Mock error
  mockApiError: (error: any, delay: number = 100) => {
    return new Promise((_, reject) => {
      setTimeout(() => reject(error), delay);
    });
  },
};

// Test scenarios
export const TestScenarios = {
  // Authentication scenarios
  auth: {
    successfulLogin: {
      description: 'User successfully logs in',
      input: {
        username: 'test@example.com',
        password: 'password123',
      },
      expected: {
        user: MockData.mockUser,
        tokens: MockData.mockTokens,
        isAuthenticated: true,
      },
    },
    failedLogin: {
      description: 'Login fails with invalid credentials',
      input: {
        username: 'test@example.com',
        password: 'wrongpassword',
      },
      expected: {
        error: 'Invalid credentials',
        isAuthenticated: false,
      },
    },
    logout: {
      description: 'User successfully logs out',
      expected: {
        user: null,
        isAuthenticated: false,
      },
    },
  },
  
  // Cart scenarios
  cart: {
    addToCart: {
      description: 'Successfully add item to cart',
      input: {
        product_id: 'tour-1',
        product_type: 'tour',
        quantity: 2,
      },
      expected: {
        items: MockData.mockCartItems,
        total: 385.00,
      },
    },
    updateCartItem: {
      description: 'Successfully update cart item quantity',
      input: {
        itemId: '1',
        quantity: 3,
      },
      expected: {
        items: MockData.mockCartItems,
        total: 535.00,
      },
    },
    removeFromCart: {
      description: 'Successfully remove item from cart',
      input: {
        itemId: '1',
      },
      expected: {
        items: [],
        total: 0,
      },
    },
  },
  
  // Product scenarios
  products: {
    loadTours: {
      description: 'Successfully load tours',
      expected: {
        tours: MockData.mockProducts.tours,
        isLoading: false,
      },
    },
    loadEvents: {
      description: 'Successfully load events',
      expected: {
        events: MockData.mockProducts.events,
        isLoading: false,
      },
    },
    searchProducts: {
      description: 'Successfully search products',
      input: {
        query: 'Istanbul',
        filters: {
          category: 'tours',
          price_range: [0, 200],
        },
      },
      expected: {
        results: MockData.mockProducts.tours,
        count: 1,
      },
    },
  },
};

// Performance testing utilities
export const PerformanceTestUtils = {
  // Measure component render time
  measureRenderTime: (component: ReactElement) => {
    const start = performance.now();
    customRender(component);
    const end = performance.now();
    return end - start;
  },
  
  // Measure API call time
  measureApiTime: async (apiCall: () => Promise<any>) => {
    const start = performance.now();
    await apiCall();
    const end = performance.now();
    return end - start;
  },
  
  // Memory usage tracking
  trackMemoryUsage: () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory?.usedJSHeapSize || 0,
        totalJSHeapSize: memory?.totalJSHeapSize || 0,
        jsHeapSizeLimit: memory?.jsHeapSizeLimit || 0,
      };
    }
    return null;
  },
  
  // Bundle size analysis
  analyzeBundleSize: () => {
    // This would be implemented with webpack-bundle-analyzer
    return {
      totalSize: 0,
      chunks: [],
      assets: [],
    };
  },
};

// E2E testing configuration
export const E2ETestConfig = {
  // Selectors for E2E tests
  selectors: {
    auth: {
      loginForm: '[data-testid="login-form"]',
      emailInput: '[data-testid="email-input"]',
      passwordInput: '[data-testid="password-input"]',
      loginButton: '[data-testid="login-button"]',
      logoutButton: '[data-testid="logout-button"]',
    },
    cart: {
      cartIcon: '[data-testid="cart-icon"]',
      cartItems: '[data-testid="cart-items"]',
      addToCartButton: '[data-testid="add-to-cart-button"]',
      removeFromCartButton: '[data-testid="remove-from-cart-button"]',
      checkoutButton: '[data-testid="checkout-button"]',
    },
    products: {
      productCard: '[data-testid="product-card"]',
      productTitle: '[data-testid="product-title"]',
      productPrice: '[data-testid="product-price"]',
      searchInput: '[data-testid="search-input"]',
      searchButton: '[data-testid="search-button"]',
    },
  },
  
  // Test workflows
  workflows: {
    userRegistration: [
      'navigate to register page',
      'fill registration form',
      'submit form',
      'verify email',
      'confirm registration',
    ],
    userLogin: [
      'navigate to login page',
      'fill login form',
      'submit form',
      'verify dashboard',
    ],
    addToCart: [
      'navigate to products page',
      'select product',
      'add to cart',
      'verify cart update',
    ],
    checkout: [
      'navigate to cart',
      'proceed to checkout',
      'fill billing information',
      'complete payment',
      'verify order confirmation',
    ],
  },
  
  // Performance benchmarks
  benchmarks: {
    pageLoad: {
      homepage: 2000, // 2 seconds
      products: 3000, // 3 seconds
      cart: 1000, // 1 second
      checkout: 2000, // 2 seconds
    },
    apiResponse: {
      auth: 1000, // 1 second
      cart: 500, // 500ms
      products: 1000, // 1 second
    },
    bundleSize: {
      main: 250000, // 250KB
      vendor: 500000, // 500KB
      chunks: 100000, // 100KB per chunk
    },
  },
};

export default {
  MockData,
  TestEnvironment,
  customRender,
  StoreTestUtils,
  TestScenarios,
  PerformanceTestUtils,
  E2ETestConfig,
}; 