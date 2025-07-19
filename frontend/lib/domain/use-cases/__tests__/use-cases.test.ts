/**
 * Use Cases Tests
 * Tests for all domain use cases
 */

import { AuthenticateUserUseCase } from '../auth/AuthenticateUserUseCase';
import { CreateProductUseCase } from '../products/CreateProductUseCase';
import { AddToCartUseCase } from '../cart/AddToCartUseCase';
import { CreateOrderUseCase } from '../orders/CreateOrderUseCase';
import { OrderStatus, PaymentStatus } from '../../entities/Order';
import { ProductType } from '../../entities/Product';

// Mock repositories
const mockUserRepository = {
  findByUsername: jest.fn(),
  findByEmail: jest.fn(),
  existsByUsername: jest.fn(),
  existsByEmail: jest.fn(),
  create: jest.fn(),
  updateLastLogin: jest.fn(),
  findById: jest.fn()
};

const mockProductRepository = {
  findBySlug: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  activate: jest.fn(),
  deactivate: jest.fn(),
  findById: jest.fn()
};

const mockCartRepository = {
  findById: jest.fn(),
  create: jest.fn(),
  addItem: jest.fn(),
  updateItemQuantity: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  updateCurrency: jest.fn()
};

const mockOrderRepository = {
  create: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn()
};

describe('AuthenticateUserUseCase', () => {
  let useCase: AuthenticateUserUseCase;

  beforeEach(() => {
    useCase = new AuthenticateUserUseCase(mockUserRepository as any);
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should authenticate user with valid credentials', async () => {
      const mockUser = {
        getId: () => 'user-1',
        getUsername: () => 'testuser',
        getEmail: () => 'test@example.com',
        getRole: () => 'CUSTOMER',
        isActive: () => true,
        getPasswordHash: () => 'hashed_password'
      };

      mockUserRepository.findByUsername.mockResolvedValue(mockUser);
      mockUserRepository.updateLastLogin.mockResolvedValue(mockUser);

      const request = {
        username: 'testuser',
        password: 'password123'
      };

      const result = await useCase.authenticate(request);

      expect(result.success).toBe(true);
      expect(result.user).toBe(mockUser);
      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith('testuser');
    });

    it('should fail with invalid username', async () => {
      mockUserRepository.findByUsername.mockResolvedValue(null);

      const request = {
        username: 'nonexistent',
        password: 'password123'
      };

      const result = await useCase.authenticate(request);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid credentials');
      expect(result.errors).toContain('User not found');
    });

    it('should fail with missing credentials', async () => {
      const request = {};

      const result = await useCase.authenticate(request);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Username or email is required');
      expect(result.errors).toContain('Password is required');
    });
  });

  describe('register', () => {
    it('should register new user with valid data', async () => {
      const mockUser = {
        getId: () => 'user-1',
        getUsername: () => 'newuser',
        getEmail: () => 'new@example.com',
        getRole: () => 'CUSTOMER'
      };

      mockUserRepository.existsByUsername.mockResolvedValue(false);
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.create.mockResolvedValue(mockUser);

      const request = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        acceptTerms: true
      };

      const result = await useCase.register(request);

      expect(result.success).toBe(true);
      expect(result.user).toBe(mockUser);
      expect(mockUserRepository.create).toHaveBeenCalled();
    });

    it('should fail with existing username', async () => {
      mockUserRepository.existsByUsername.mockResolvedValue(true);

      const request = {
        username: 'existinguser',
        email: 'new@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        acceptTerms: true
      };

      const result = await useCase.register(request);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Username already exists');
      expect(result.errors).toContain('Username is already taken');
    });
  });
});

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;

  beforeEach(() => {
    useCase = new CreateProductUseCase(mockProductRepository as any);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create product with valid data', async () => {
      const mockProduct = {
        getId: () => 'product-1',
        getTitle: () => 'Test Tour',
        getSlug: () => 'test-tour'
      };

      mockProductRepository.findBySlug.mockResolvedValue(null);
      mockProductRepository.create.mockResolvedValue(mockProduct);

      const request = {
        type: ProductType.TOUR,
        slug: 'test-tour',
        title: 'Test Tour',
        description: 'A great test tour',
        shortDescription: 'Test tour',
        price: {
          amount: 100,
          currency: 'USD'
        },
        location: {
          name: 'Test Location',
          street: 'Test Street',
          city: 'Test City',
          country: 'Test Country'
        }
      };

      const result = await useCase.create(request);

      expect(result.success).toBe(true);
      expect(result.product).toBe(mockProduct);
      expect(mockProductRepository.create).toHaveBeenCalled();
    });

    it('should fail with existing slug', async () => {
      const mockProduct = {
        getId: () => 'product-1',
        getTitle: () => 'Existing Tour'
      };

      mockProductRepository.findBySlug.mockResolvedValue(mockProduct);

      const request = {
        type: ProductType.TOUR,
        slug: 'existing-tour',
        title: 'Test Tour',
        description: 'A great test tour',
        shortDescription: 'Test tour',
        price: {
          amount: 100,
          currency: 'USD'
        },
        location: {
          name: 'Test Location',
          street: 'Test Street',
          city: 'Test City',
          country: 'Test Country'
        }
      };

      const result = await useCase.create(request);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Product slug already exists');
      expect(result.errors).toContain('A product with this slug already exists');
    });

    it('should fail with invalid data', async () => {
      const request = {
        type: ProductType.TOUR,
        slug: '',
        title: '',
        description: '',
        shortDescription: '',
        price: {
          amount: 0,
          currency: ''
        },
        location: {
          name: '',
          street: '',
          city: '',
          country: ''
        }
      };

      const result = await useCase.create(request);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Product slug must be at least 3 characters long');
      expect(result.errors).toContain('Product title is required');
    });
  });
});

describe('AddToCartUseCase', () => {
  let useCase: AddToCartUseCase;

  beforeEach(() => {
    useCase = new AddToCartUseCase(mockCartRepository as any, mockProductRepository as any);
    jest.clearAllMocks();
  });

  describe('addToCart', () => {
    it('should add item to cart successfully', async () => {
      const mockCart = {
        getId: () => 'cart-1',
        isExpired: () => false,
        getItemByProductId: () => null,
        getItems: () => []
      };

      const mockProduct = {
        getId: () => 'product-1',
        getType: () => 'TOUR',
        getTitle: () => 'Test Tour',
        getSlug: () => 'test-tour',
        getImages: () => [{ url: 'image.jpg' }],
        getPrice: () => ({ amount: 100, currency: 'USD' }),
        isActive: () => true,
        isAvailableForBooking: () => true
      };

      const updatedCart = {
        getId: () => 'cart-1',
        getItems: () => [{ id: 'item-1', productId: 'product-1', quantity: 1 }]
      };

      mockCartRepository.findById.mockResolvedValue(mockCart);
      mockProductRepository.findById.mockResolvedValue(mockProduct);
      mockCartRepository.addItem.mockResolvedValue(updatedCart);

      const request = {
        cartId: 'cart-1',
        productId: 'product-1',
        quantity: 1
      };

      const result = await useCase.addToCart(request);

      expect(result.success).toBe(true);
      expect(result.cart).toBe(updatedCart);
      expect(mockCartRepository.addItem).toHaveBeenCalled();
    });

    it('should fail with expired cart', async () => {
      const mockCart = {
        getId: () => 'cart-1',
        isExpired: () => true
      };

      mockCartRepository.findById.mockResolvedValue(mockCart);

      const request = {
        cartId: 'cart-1',
        productId: 'product-1',
        quantity: 1
      };

      const result = await useCase.addToCart(request);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Cart has expired');
      expect(result.errors).toContain('Cart has expired and cannot be modified');
    });

    it('should fail with invalid quantity', async () => {
      const request = {
        cartId: 'cart-1',
        productId: 'product-1',
        quantity: 0
      };

      const result = await useCase.addToCart(request);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Valid quantity is required');
    });
  });

  describe('createCart', () => {
    it('should create cart successfully', async () => {
      const mockCart = {
        getId: () => 'cart-1',
        getItems: () => []
      };

      mockCartRepository.create.mockResolvedValue(mockCart);

      const request = {
        userId: 'user-1',
        currency: 'USD'
      };

      const result = await useCase.createCart(request);

      expect(result.success).toBe(true);
      expect(result.cart).toBe(mockCart);
      expect(mockCartRepository.create).toHaveBeenCalled();
    });

    it('should fail with invalid currency', async () => {
      const request = {
        userId: 'user-1',
        currency: 'INVALID'
      };

      const result = await useCase.createCart(request);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Invalid currency code');
    });
  });
});

describe('CreateOrderUseCase', () => {
  let useCase: CreateOrderUseCase;

  beforeEach(() => {
    useCase = new CreateOrderUseCase(mockOrderRepository as any, mockCartRepository as any, mockUserRepository as any);
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should fail with empty cart', async () => {
      const mockCart = {
        getId: () => 'cart-1',
        isEmpty: () => true
      };

      mockCartRepository.findById.mockResolvedValue(mockCart);

      const request = {
        cartId: 'cart-1',
        contactInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+1234567890'
        },
        paymentMethod: 'credit_card' as const
      };

      const result = await useCase.createOrder(request);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Cart is empty');
      expect(result.errors).toContain('Cannot create order from empty cart');
    });

    it('should fail with invalid contact info', async () => {
      const request = {
        cartId: 'cart-1',
        contactInfo: {
          firstName: '',
          lastName: '',
          email: 'invalid-email',
          phone: ''
        },
        paymentMethod: 'credit_card' as const
      };

      const result = await useCase.createOrder(request);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('First name is required');
      expect(result.errors).toContain('Last name is required');
      expect(result.errors).toContain('Valid email address is required');
      expect(result.errors).toContain('Phone number is required');
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order successfully', async () => {
      const mockOrder = {
        getId: () => 'order-1',
        getStatus: () => OrderStatus.PENDING
      };

      const cancelledOrder = {
        getId: () => 'order-1',
        getStatus: () => OrderStatus.CANCELLED
      };

      mockOrderRepository.findById.mockResolvedValue(mockOrder);
      mockOrderRepository.update.mockResolvedValue(cancelledOrder);

      const request = {
        orderId: 'order-1',
        reason: 'Customer request'
      };

      const result = await useCase.cancelOrder(request);

      expect(result.success).toBe(true);
      expect(result.order).toBe(cancelledOrder);
      expect(mockOrderRepository.update).toHaveBeenCalledWith('order-1', {
        status: OrderStatus.CANCELLED,
        notes: 'Customer request'
      });
    });

    it('should fail to cancel completed order', async () => {
      const mockOrder = {
        getId: () => 'order-1',
        getStatus: () => OrderStatus.COMPLETED
      };

      mockOrderRepository.findById.mockResolvedValue(mockOrder);

      const request = {
        orderId: 'order-1'
      };

      const result = await useCase.cancelOrder(request);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Order cannot be cancelled');
      expect(result.errors).toContain('Order with status completed cannot be cancelled');
    });
  });
}); 