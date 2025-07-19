import { describe, it, expect, vi, beforeEach } from '@jest/globals';
import { LoginUseCase } from '../use-cases/auth/LoginUseCase';
import { AuthService } from '../services/AuthService';
import { ProductService } from '../services/ProductService';
import { CartService } from '../services/CartService';
import { OrderService } from '../services/OrderService';

// Mock repositories
const mockUserRepository = {
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  findById: vi.fn(),
  findByEmail: vi.fn()
};

const mockProductRepository = {
  findAll: vi.fn(),
  findById: vi.fn()
};

const mockCartRepository = {
  save: vi.fn(),
  findById: vi.fn(),
  findByUserId: vi.fn(),
  clear: vi.fn()
};

const mockOrderRepository = {
  save: vi.fn(),
  findById: vi.fn(),
  findByUserId: vi.fn()
};

describe('Application Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Services', () => {
    describe('AuthService', () => {
      it('should be instantiated correctly', () => {
        const authService = new AuthService(mockUserRepository);
        expect(authService).toBeInstanceOf(AuthService);
      });

      it('should handle login request', async () => {
        mockUserRepository.login.mockResolvedValue({
          success: true,
          user: { id: '1', email: 'test@example.com' },
          token: 'mock-token',
          refreshToken: 'mock-refresh-token'
        });

        const authService = new AuthService(mockUserRepository);
        
        await expect(authService.login({
          email: 'test@example.com',
          password: 'password123'
        })).resolves.toBeDefined();
      });
    });

    describe('ProductService', () => {
      it('should be instantiated correctly', () => {
        const productService = new ProductService(mockProductRepository);
        expect(productService).toBeInstanceOf(ProductService);
      });

      it('should handle product retrieval', async () => {
        mockProductRepository.findAll.mockResolvedValue({
          success: true,
          products: [],
          total: 0
        });

        const productService = new ProductService(mockProductRepository);
        
        await expect(productService.getProducts({
          page: 1,
          limit: 10
        })).resolves.toBeDefined();
      });
    });

    describe('CartService', () => {
      it('should be instantiated correctly', () => {
        const cartService = new CartService(mockCartRepository, mockProductRepository);
        expect(cartService).toBeInstanceOf(CartService);
      });
    });

    describe('OrderService', () => {
      it('should be instantiated correctly', () => {
        const orderService = new OrderService(mockOrderRepository, mockCartRepository, mockUserRepository);
        expect(orderService).toBeInstanceOf(OrderService);
      });
    });
  });

  describe('Use Cases', () => {
    describe('LoginUseCase', () => {
      it('should be instantiated correctly', () => {
        const loginUseCase = new LoginUseCase(mockUserRepository);
        expect(loginUseCase).toBeInstanceOf(LoginUseCase);
      });

      it('should handle login execution', async () => {
        mockUserRepository.login.mockResolvedValue({
          success: true,
          user: { id: '1', email: 'test@example.com' },
          token: 'mock-token',
          refreshToken: 'mock-refresh-token'
        });

        const loginUseCase = new LoginUseCase(mockUserRepository);
        
        await expect(loginUseCase.execute({
          email: 'test@example.com',
          password: 'password123'
        })).resolves.toBeDefined();
      });
    });
  });
}); 