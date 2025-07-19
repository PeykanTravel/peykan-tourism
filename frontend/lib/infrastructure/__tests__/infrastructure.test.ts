/**
 * Infrastructure Tests
 * Tests for all infrastructure layer components
 */

import { ApiClient } from '../api/ApiClient';
import { UserRepositoryImpl } from '../repositories/UserRepositoryImpl';
import { ProductRepositoryImpl } from '../repositories/ProductRepositoryImpl';
import { CartRepositoryImpl } from '../repositories/CartRepositoryImpl';
import { OrderRepositoryImpl } from '../repositories/OrderRepositoryImpl';
import { LocalStorage } from '../storage/LocalStorage';
import { SessionStorage } from '../storage/SessionStorage';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    },
    defaults: {
      baseURL: '',
      timeout: 10000
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn()
  }))
}));

describe('Infrastructure Layer', () => {
  describe('ApiClient', () => {
    let apiClient: ApiClient;

    beforeEach(() => {
      apiClient = new ApiClient({
        baseURL: 'http://localhost:8000/api',
        enableLogging: false
      });
    });

    it('should create with default configuration', () => {
      expect(apiClient).toBeInstanceOf(ApiClient);
      expect(apiClient.getConfig().baseURL).toBe('http://localhost:8000/api');
      expect(apiClient.getConfig().timeout).toBe(10000);
      expect(apiClient.getConfig().retryAttempts).toBe(3);
    });

    it('should update configuration', () => {
      apiClient.updateConfig({ timeout: 5000 });
      expect(apiClient.getConfig().timeout).toBe(5000);
    });

    it('should handle authentication methods', () => {
      expect(() => apiClient.setAuthTokens('token123', 'refresh123')).not.toThrow();
      expect(() => apiClient.clearAuthTokens()).not.toThrow();
    });
  });

  describe('UserRepositoryImpl', () => {
    let userRepository: UserRepositoryImpl;

    beforeEach(() => {
      userRepository = new UserRepositoryImpl();
    });

    it('should be instance of UserRepositoryImpl', () => {
      expect(userRepository).toBeInstanceOf(UserRepositoryImpl);
    });

    it('should have required methods', () => {
      expect(typeof userRepository.findById).toBe('function');
      expect(typeof userRepository.findByUsername).toBe('function');
      expect(typeof userRepository.findByEmail).toBe('function');
      expect(typeof userRepository.create).toBe('function');
      expect(typeof userRepository.update).toBe('function');
      expect(typeof userRepository.delete).toBe('function');
    });
  });

  describe('ProductRepositoryImpl', () => {
    let productRepository: ProductRepositoryImpl;

    beforeEach(() => {
      productRepository = new ProductRepositoryImpl();
    });

    it('should be instance of ProductRepositoryImpl', () => {
      expect(productRepository).toBeInstanceOf(ProductRepositoryImpl);
    });

    it('should have required methods', () => {
      expect(typeof productRepository.findById).toBe('function');
      expect(typeof productRepository.findBySlug).toBe('function');
      expect(typeof productRepository.find).toBe('function');
      expect(typeof productRepository.create).toBe('function');
      expect(typeof productRepository.update).toBe('function');
      expect(typeof productRepository.delete).toBe('function');
    });
  });

  describe('CartRepositoryImpl', () => {
    let cartRepository: CartRepositoryImpl;

    beforeEach(() => {
      cartRepository = new CartRepositoryImpl();
    });

    it('should be instance of CartRepositoryImpl', () => {
      expect(cartRepository).toBeInstanceOf(CartRepositoryImpl);
    });

    it('should have required methods', () => {
      expect(typeof cartRepository.findById).toBe('function');
      expect(typeof cartRepository.findByUserId).toBe('function');
      expect(typeof cartRepository.create).toBe('function');
      expect(typeof cartRepository.addItem).toBe('function');
      expect(typeof cartRepository.removeItem).toBe('function');
      expect(typeof cartRepository.clear).toBe('function');
    });
  });

  describe('OrderRepositoryImpl', () => {
    let orderRepository: OrderRepositoryImpl;

    beforeEach(() => {
      orderRepository = new OrderRepositoryImpl();
    });

    it('should be instance of OrderRepositoryImpl', () => {
      expect(orderRepository).toBeInstanceOf(OrderRepositoryImpl);
    });

    it('should have required methods', () => {
      expect(typeof orderRepository.findById).toBe('function');
      expect(typeof orderRepository.findByOrderNumber).toBe('function');
      expect(typeof orderRepository.find).toBe('function');
      expect(typeof orderRepository.create).toBe('function');
      expect(typeof orderRepository.update).toBe('function');
      expect(typeof orderRepository.delete).toBe('function');
    });
  });

  describe('LocalStorage', () => {
    let localStorage: LocalStorage;

    beforeEach(() => {
      localStorage = new LocalStorage({ prefix: 'test_' });
    });

    it('should be instance of LocalStorage', () => {
      expect(localStorage).toBeInstanceOf(LocalStorage);
    });

    it('should have required methods', () => {
      expect(typeof localStorage.set).toBe('function');
      expect(typeof localStorage.get).toBe('function');
      expect(typeof localStorage.remove).toBe('function');
      expect(typeof localStorage.has).toBe('function');
      expect(typeof localStorage.clear).toBe('function');
      expect(typeof localStorage.keys).toBe('function');
    });

    it('should handle basic operations without errors', () => {
      expect(() => localStorage.set('test_key', 'test_value')).not.toThrow();
      expect(() => localStorage.get('test_key')).not.toThrow();
      expect(() => localStorage.remove('test_key')).not.toThrow();
      expect(() => localStorage.has('test_key')).not.toThrow();
    });
  });

  describe('SessionStorage', () => {
    let sessionStorage: SessionStorage;

    beforeEach(() => {
      sessionStorage = new SessionStorage({ prefix: 'test_session_' });
    });

    it('should be instance of SessionStorage', () => {
      expect(sessionStorage).toBeInstanceOf(SessionStorage);
    });

    it('should have required methods', () => {
      expect(typeof sessionStorage.set).toBe('function');
      expect(typeof sessionStorage.get).toBe('function');
      expect(typeof sessionStorage.remove).toBe('function');
      expect(typeof sessionStorage.has).toBe('function');
      expect(typeof sessionStorage.clear).toBe('function');
      expect(typeof sessionStorage.keys).toBe('function');
    });

    it('should handle basic operations without errors', () => {
      expect(() => sessionStorage.set('test_key', 'test_value')).not.toThrow();
      expect(() => sessionStorage.get('test_key')).not.toThrow();
      expect(() => sessionStorage.remove('test_key')).not.toThrow();
      expect(() => sessionStorage.has('test_key')).not.toThrow();
    });
  });

  describe('Repository Integration', () => {
    it('should have consistent interface across repositories', () => {
      const userRepo = new UserRepositoryImpl();
      const productRepo = new ProductRepositoryImpl();
      const cartRepo = new CartRepositoryImpl();
      const orderRepo = new OrderRepositoryImpl();

      // All repositories should have basic CRUD methods
      expect(typeof userRepo.findById).toBe('function');
      expect(typeof productRepo.findById).toBe('function');
      expect(typeof cartRepo.findById).toBe('function');
      expect(typeof orderRepo.findById).toBe('function');

      expect(typeof userRepo.create).toBe('function');
      expect(typeof productRepo.create).toBe('function');
      expect(typeof cartRepo.create).toBe('function');
      expect(typeof orderRepo.create).toBe('function');

      expect(typeof userRepo.update).toBe('function');
      expect(typeof productRepo.update).toBe('function');
      expect(typeof orderRepo.update).toBe('function');

      expect(typeof userRepo.delete).toBe('function');
      expect(typeof productRepo.delete).toBe('function');
      expect(typeof cartRepo.delete).toBe('function');
      expect(typeof orderRepo.delete).toBe('function');
    });
  });

  describe('Storage Integration', () => {
    it('should have consistent interface across storage implementations', () => {
      const localStorage = new LocalStorage();
      const sessionStorage = new SessionStorage();

      // Both storage implementations should have the same basic methods
      expect(typeof localStorage.set).toBe('function');
      expect(typeof sessionStorage.set).toBe('function');

      expect(typeof localStorage.get).toBe('function');
      expect(typeof sessionStorage.get).toBe('function');

      expect(typeof localStorage.remove).toBe('function');
      expect(typeof sessionStorage.remove).toBe('function');

      expect(typeof localStorage.has).toBe('function');
      expect(typeof sessionStorage.has).toBe('function');

      expect(typeof localStorage.clear).toBe('function');
      expect(typeof sessionStorage.clear).toBe('function');

      expect(typeof localStorage.keys).toBe('function');
      expect(typeof sessionStorage.keys).toBe('function');
    });
  });
}); 