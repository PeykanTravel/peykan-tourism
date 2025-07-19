/**
 * Domain Entities Tests
 * Tests for all domain entities with their business logic and validation
 */

import { 
  User, 
  UserRole, 
  Product, 
  ProductType, 
  ProductStatus,
  Cart,
  CartItemType,
  Order,
  OrderStatus,
  PaymentMethod
} from '../index';
import { 
  Price, 
  Currency, 
  Location, 
  ContactInfo 
} from '../../value-objects';

describe('Domain Entities', () => {
  describe('User Entity', () => {
    let user: User;
    let contactInfo: ContactInfo;

    beforeEach(() => {
      contactInfo = ContactInfo.create({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890'
      });

      user = User.create(
        'user-1',
        'johndoe',
        'john@example.com',
        UserRole.CUSTOMER,
        {
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: new Date('1990-01-01'),
          nationality: 'US'
        }
      );
    });

    it('should create a valid user', () => {
      expect(user.getId()).toBe('user-1');
      expect(user.getUsername()).toBe('johndoe');
      expect(user.getEmail()).toBe('john@example.com');
      expect(user.getRole()).toBe(UserRole.CUSTOMER);
      expect(user.getFullName()).toBe('John Doe');
      expect(user.isUserActive()).toBe(true);
      expect(user.isEmailVerifiedUser()).toBe(false);
      expect(user.isPhoneVerifiedUser()).toBe(false);
    });

    it('should create a guest user', () => {
      const guest = User.createGuest();
      
      expect(guest.isGuest()).toBe(true);
      expect(guest.getFullName()).toBe('Guest User');
      expect(guest.getEmail()).toBe('');
    });

    it('should validate user constraints', () => {
      expect(() => {
        User.create('', 'username', 'email@test.com', UserRole.CUSTOMER, {
          firstName: 'John',
          lastName: 'Doe'
        });
      }).toThrow('User ID is required');

      expect(() => {
        User.create('id', '', 'email@test.com', UserRole.CUSTOMER, {
          firstName: 'John',
          lastName: 'Doe'
        });
      }).toThrow('Username is required');

      expect(() => {
        User.create('id', 'username', '', UserRole.CUSTOMER, {
          firstName: 'John',
          lastName: 'Doe'
        });
      }).toThrow('Email is required');

      expect(() => {
        User.create('id', 'username', 'email@test.com', UserRole.CUSTOMER, {
          firstName: '',
          lastName: 'Doe'
        });
      }).toThrow('First name is required');

      expect(() => {
        User.create('id', 'username', 'email@test.com', UserRole.CUSTOMER, {
          firstName: 'John',
          lastName: ''
        });
      }).toThrow('Last name is required');
    });

    it('should validate date of birth', () => {
      expect(() => {
        User.create('id', 'username', 'email@test.com', UserRole.CUSTOMER, {
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: new Date(Date.now() + 86400000) // Tomorrow
        });
      }).toThrow('Date of birth cannot be in the future');
    });

    it('should check user roles correctly', () => {
      expect(user.isCustomer()).toBe(true);
      expect(user.isGuest()).toBe(false);
      expect(user.isAgent()).toBe(false);
      expect(user.isAdmin()).toBe(false);
    });

    it('should check permissions correctly', () => {
      expect(user.canBookProducts()).toBe(true);
      expect(user.canAccessAdminPanel()).toBe(false);
      expect(user.canManageUsers()).toBe(false);
      expect(user.canManageProducts()).toBe(false);
    });

    it('should update profile', () => {
      const updatedUser = user.updateProfile({
        firstName: 'Jane',
        lastName: 'Smith'
      });

      expect(updatedUser.getFullName()).toBe('Jane Smith');
      expect(updatedUser.getFirstName()).toBe('Jane');
      expect(updatedUser.getLastName()).toBe('Smith');
    });

    it('should update preferences', () => {
      const newCurrency = Currency.create('EUR');
      const updatedUser = user.updatePreferences({
        currency: newCurrency
      });

      expect(updatedUser.getPreferences().currency.equals(newCurrency)).toBe(true);
    });

    it('should mark email as verified', () => {
      const verifiedUser = user.markEmailAsVerified();
      expect(verifiedUser.isEmailVerifiedUser()).toBe(true);
    });

    it('should mark phone as verified', () => {
      const verifiedUser = user.markPhoneAsVerified();
      expect(verifiedUser.isPhoneVerifiedUser()).toBe(true);
    });

    it('should calculate age correctly', () => {
      const age = user.getAge();
      expect(age).toBeGreaterThan(0);
    });

    it('should check verification status', () => {
      expect(user.isVerified()).toBe(false);
      
      const verifiedUser = user.markEmailAsVerified().markPhoneAsVerified();
      expect(verifiedUser.isVerified()).toBe(true);
    });

    it('should serialize and deserialize correctly', () => {
      const json = user.toJSON();
      const deserializedUser = User.fromJSON(json);
      
      expect(deserializedUser.equals(user)).toBe(true);
      expect(deserializedUser.getFullName()).toBe(user.getFullName());
    });
  });

  describe('Product Entity', () => {
    let product: Product;
    let price: Price;
    let location: Location;

    beforeEach(() => {
      price = Price.create(100, Currency.create('USD'));
      location = Location.create(
        'Test Location',
        '123 Test St',
        'Test City',
        'Test Country',
        40.7128,
        -74.0060
      );

      product = Product.create(
        'product-1',
        ProductType.TOUR,
        'test-tour',
        'Test Tour',
        'A wonderful test tour',
        'Amazing tour experience',
        price,
        location
      );
    });

    it('should create a valid product', () => {
      expect(product.getId()).toBe('product-1');
      expect(product.getType()).toBe(ProductType.TOUR);
      expect(product.getSlug()).toBe('test-tour');
      expect(product.getTitle()).toBe('Test Tour');
      expect(product.getDescription()).toBe('A wonderful test tour');
      expect(product.getShortDescription()).toBe('Amazing tour experience');
      expect(product.getPrice().equals(price)).toBe(true);
      expect(product.getLocation().getName()).toBe(location.getName());
      expect(product.getStatus()).toBe(ProductStatus.DRAFT);
      expect(product.isActive()).toBe(false);
      expect(product.isProductFeatured()).toBe(false);
      expect(product.isProductPopular()).toBe(false);
    });

    it('should validate product constraints', () => {
      expect(() => {
        Product.create('', ProductType.TOUR, 'slug', 'title', 'desc', 'short', price, location);
      }).toThrow('Product ID is required');

      expect(() => {
        Product.create('id', ProductType.TOUR, '', 'title', 'desc', 'short', price, location);
      }).toThrow('Product slug is required');

      expect(() => {
        Product.create('id', ProductType.TOUR, 'slug', '', 'desc', 'short', price, location);
      }).toThrow('Product title is required');

      expect(() => {
        Product.create('id', ProductType.TOUR, 'slug', 'title', '', 'short', price, location);
      }).toThrow('Product description is required');

      expect(() => {
        Product.create('id', ProductType.TOUR, 'slug', 'title', 'desc', '', price, location);
      }).toThrow('Product short description is required');

      const zeroPrice = Price.create(0, Currency.create('USD'));
      expect(() => {
        Product.create('id', ProductType.TOUR, 'slug', 'title', 'desc', 'short', zeroPrice, location);
      }).toThrow('Product price cannot be zero');
    });

    it('should validate short description length', () => {
      const longDescription = 'a'.repeat(501);
      expect(() => {
        Product.create('id', ProductType.TOUR, 'slug', 'title', 'desc', longDescription, price, location);
      }).toThrow('Short description cannot exceed 500 characters');
    });

    it('should handle images correctly', () => {
      const images = [
        { id: '1', url: 'image1.jpg', alt: 'Image 1', isPrimary: true, order: 1 },
        { id: '2', url: 'image2.jpg', alt: 'Image 2', isPrimary: false, order: 2 }
      ];

      const productWithImages = Product.create(
        'product-2',
        ProductType.TOUR,
        'test-tour-2',
        'Test Tour 2',
        'A wonderful test tour',
        'Amazing tour experience',
        price,
        location,
        images
      );

      expect(productWithImages.getImages()).toHaveLength(2);
      expect(productWithImages.getPrimaryImage()?.url).toBe('image1.jpg');
    });

    it('should validate primary image constraint', () => {
      const images = [
        { id: '1', url: 'image1.jpg', alt: 'Image 1', isPrimary: false, order: 1 },
        { id: '2', url: 'image2.jpg', alt: 'Image 2', isPrimary: false, order: 2 }
      ];

      expect(() => {
        Product.create('id', ProductType.TOUR, 'slug', 'title', 'desc', 'short', price, location, images);
      }).toThrow('Product must have exactly one primary image');
    });

    it('should handle variants correctly', () => {
      const variant = {
        id: 'variant-1',
        name: 'Standard',
        description: 'Standard variant',
        price: Price.create(120, Currency.create('USD')),
        isAvailable: true
      };

      const productWithVariant = product.addVariant(variant);
      
      expect(productWithVariant.hasVariants()).toBe(true);
      expect(productWithVariant.getVariants()).toHaveLength(1);
      expect(productWithVariant.getAvailableVariants()).toHaveLength(1);
      expect(productWithVariant.getVariantById('variant-1')).toEqual(variant);
    });

    it('should calculate price ranges correctly', () => {
      const variant1 = {
        id: 'variant-1',
        name: 'Standard',
        price: Price.create(100, Currency.create('USD')),
        isAvailable: true
      };

      const variant2 = {
        id: 'variant-2',
        name: 'Premium',
        price: Price.create(200, Currency.create('USD')),
        isAvailable: true
      };

      const productWithVariants = product
        .addVariant(variant1)
        .addVariant(variant2);

      expect(productWithVariants.getMinimumPrice().getAmount()).toBe(100);
      expect(productWithVariants.getMaximumPrice().getAmount()).toBe(200);
    });

    it('should update status correctly', () => {
      const activeProduct = product.updateStatus(ProductStatus.ACTIVE);
      expect(activeProduct.isActive()).toBe(true);
      expect(activeProduct.isAvailableForBooking()).toBe(true);
    });

    it('should mark as featured and popular', () => {
      const featuredProduct = product.markAsFeatured();
      expect(featuredProduct.isProductFeatured()).toBe(true);

      const popularProduct = product.markAsPopular();
      expect(popularProduct.isProductPopular()).toBe(true);
    });

    it('should serialize and deserialize correctly', () => {
      const json = product.toJSON();
      const deserializedProduct = Product.fromJSON(json);
      
      expect(deserializedProduct.equals(product)).toBe(true);
      expect(deserializedProduct.getTitle()).toBe(product.getTitle());
    });
  });

  describe('Cart Entity', () => {
    let cart: Cart;
    let price: Price;
    let currency: Currency;

    beforeEach(() => {
      currency = Currency.create('USD');
      price = Price.create(100, currency);
      cart = Cart.create('cart-1', 'user-1', currency);
    });

    it('should create a valid cart', () => {
      expect(cart.getId()).toBe('cart-1');
      expect(cart.getUserId()).toBe('user-1');
      expect(cart.getCurrency().equals(currency)).toBe(true);
      expect(cart.isEmpty()).toBe(true);
      expect(cart.getTotalItems()).toBe(0);
      expect(cart.getTotalPrice().getAmount()).toBe(0);
    });

    it('should create a guest cart', () => {
      const guestCart = Cart.createGuest();
      expect(guestCart.isGuestCart()).toBe(true);
      expect(guestCart.getUserId()).toBeNull();
    });

    it('should validate cart constraints', () => {
      expect(() => {
        Cart.create('', 'user-1', currency);
      }).toThrow('Cart ID is required');
    });

    it('should add items to cart', () => {
      const updatedCart = cart.addItem(
        'product-1',
        CartItemType.TOUR,
        'Test Tour',
        'test-tour',
        'image.jpg',
        price,
        2
      );

      expect(updatedCart.isEmpty()).toBe(false);
      expect(updatedCart.getTotalItems()).toBe(2);
      expect(updatedCart.getTotalPrice().getAmount()).toBe(200);
      expect(updatedCart.getItems()).toHaveLength(1);
    });

    it('should update item quantity', () => {
      let updatedCart = cart.addItem(
        'product-1',
        CartItemType.TOUR,
        'Test Tour',
        'test-tour',
        'image.jpg',
        price,
        1
      );

      updatedCart = updatedCart.updateItemQuantity(updatedCart.getItems()[0].id, 3);
      expect(updatedCart.getTotalItems()).toBe(3);
      expect(updatedCart.getTotalPrice().getAmount()).toBe(300);
    });

    it('should remove items from cart', () => {
      let updatedCart = cart.addItem(
        'product-1',
        CartItemType.TOUR,
        'Test Tour',
        'test-tour',
        'image.jpg',
        price,
        1
      );

      updatedCart = updatedCart.removeItem(updatedCart.getItems()[0].id);
      expect(updatedCart.isEmpty()).toBe(true);
      expect(updatedCart.getTotalItems()).toBe(0);
    });

    it('should clear cart', () => {
      let updatedCart = cart.addItem(
        'product-1',
        CartItemType.TOUR,
        'Test Tour',
        'test-tour',
        'image.jpg',
        price,
        1
      );

      updatedCart = updatedCart.clear();
      expect(updatedCart.isEmpty()).toBe(true);
    });

    it('should validate currency consistency', () => {
      const eurPrice = Price.create(100, Currency.create('EUR'));
      
      expect(() => {
        cart.addItem(
          'product-1',
          CartItemType.TOUR,
          'Test Tour',
          'test-tour',
          'image.jpg',
          eurPrice,
          1
        );
      }).toThrow('Item currency must match cart currency');
    });

    it('should calculate totals correctly', () => {
      const optionPrice = Price.create(20, currency);
      const selectedOptions = [
        { id: 'opt-1', name: 'Insurance', price: optionPrice, quantity: 1 }
      ];

      const updatedCart = cart.addItem(
        'product-1',
        CartItemType.TOUR,
        'Test Tour',
        'test-tour',
        'image.jpg',
        price,
        2,
        undefined,
        undefined,
        selectedOptions
      );

      expect(updatedCart.getSubtotal().getAmount()).toBe(200); // 100 * 2
      expect(updatedCart.getOptionsTotal().getAmount()).toBe(20); // 20 * 1
      expect(updatedCart.getTotalPrice().getAmount()).toBe(220); // 200 + 20
    });

    it('should update currency', () => {
      const updatedCart = cart.addItem(
        'product-1',
        CartItemType.TOUR,
        'Test Tour',
        'test-tour',
        'image.jpg',
        price,
        1
      );

      const eurCurrency = Currency.create('EUR');
      const cartWithEur = updatedCart.updateCurrency(eurCurrency);
      
      expect(cartWithEur.getCurrency().equals(eurCurrency)).toBe(true);
    });

    it('should extend expiration', () => {
      const originalExpiresAt = cart.getExpiresAt();
      const extendedCart = cart.extendExpiration(48);
      
      expect(extendedCart.getExpiresAt().getTime()).toBeGreaterThan(originalExpiresAt.getTime());
    });

    it('should assign to user', () => {
      const assignedCart = cart.assignToUser('new-user-1');
      expect(assignedCart.getUserId()).toBe('new-user-1');
    });

    it('should serialize and deserialize correctly', () => {
      const json = cart.toJSON();
      const deserializedCart = Cart.fromJSON(json);
      
      expect(deserializedCart.equals(cart)).toBe(true);
      expect(deserializedCart.getUserId()).toBe(cart.getUserId());
    });
  });

  describe('Order Entity', () => {
    let order: Order;
    let cart: Cart;
    let contactInfo: ContactInfo;
    let participants: any[];

    beforeEach(() => {
      const currency = Currency.create('USD');
      const price = Price.create(100, currency);
      
      cart = Cart.create('cart-1', 'user-1', currency);
      cart = cart.addItem(
        'product-1',
        CartItemType.TOUR,
        'Test Tour',
        'test-tour',
        'image.jpg',
        price,
        1
      );

      contactInfo = ContactInfo.create({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890'
      });

      participants = [
        {
          id: 'participant-1',
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: new Date('1990-01-01'),
          nationality: 'US'
        }
      ];

      order = Order.createFromCart(
        'order-1',
        'ORD-001',
        'user-1',
        cart,
        contactInfo,
        participants,
        PaymentMethod.CREDIT_CARD
      );
    });

    it('should create a valid order from cart', () => {
      expect(order.getId()).toBe('order-1');
      expect(order.getOrderNumber()).toBe('ORD-001');
      expect(order.getUserId()).toBe('user-1');
      expect(order.getStatus()).toBe(OrderStatus.PENDING);
      expect(order.getItems()).toHaveLength(1);
      expect(order.getParticipants()).toHaveLength(1);
      expect(order.getTotalAmount().getAmount()).toBe(100);
      expect(order.isPending()).toBe(true);
      expect(order.isPaymentPending()).toBe(true);
    });

    it('should validate order constraints', () => {
      expect(() => {
        Order.createFromCart(
          '',
          'ORD-001',
          'user-1',
          cart,
          contactInfo,
          participants,
          PaymentMethod.CREDIT_CARD
        );
      }).toThrow('Order ID is required');

      expect(() => {
        Order.createFromCart(
          'order-1',
          '',
          'user-1',
          cart,
          contactInfo,
          participants,
          PaymentMethod.CREDIT_CARD
        );
      }).toThrow('Order number is required');

      expect(() => {
        Order.createFromCart(
          'order-1',
          'ORD-001',
          '',
          cart,
          contactInfo,
          participants,
          PaymentMethod.CREDIT_CARD
        );
      }).toThrow('User ID is required');
    });

    it('should confirm order', () => {
      const confirmedOrder = order.confirm();
      expect(confirmedOrder.isConfirmed()).toBe(true);
      expect(confirmedOrder.getStatus()).toBe(OrderStatus.CONFIRMED);
    });

    it('should mark as paid', () => {
      const paidOrder = order.markAsPaid('txn-123', { gateway: 'stripe' });
      expect(paidOrder.isPaid()).toBe(true);
      expect(paidOrder.getStatus()).toBe(OrderStatus.PAID);
      expect(paidOrder.isPaymentPaid()).toBe(true);
      expect(paidOrder.getPayment().transactionId).toBe('txn-123');
    });

    it('should start processing', () => {
      const processingOrder = order
        .markAsPaid('txn-123')
        .startProcessing();
      
      expect(processingOrder.isProcessing()).toBe(true);
      expect(processingOrder.getStatus()).toBe(OrderStatus.PROCESSING);
    });

    it('should complete order', () => {
      const completedOrder = order
        .markAsPaid('txn-123')
        .startProcessing()
        .complete();
      
      expect(completedOrder.isCompleted()).toBe(true);
      expect(completedOrder.getStatus()).toBe(OrderStatus.COMPLETED);
    });

    it('should cancel order', () => {
      const cancelledOrder = order.cancel('Customer request');
      expect(cancelledOrder.isCancelled()).toBe(true);
      expect(cancelledOrder.getStatus()).toBe(OrderStatus.CANCELLED);
    });

    it('should refund order', () => {
      const paidOrder = order.markAsPaid('txn-123');
      const refundedOrder = paidOrder.refund(undefined, 'Customer request');
      
      expect(refundedOrder.isRefunded()).toBe(true);
      expect(refundedOrder.getStatus()).toBe(OrderStatus.REFUNDED);
    });

    it('should check permissions correctly', () => {
      expect(order.canBeCancelled()).toBe(true);
      expect(order.canBeRefunded()).toBe(false); // Not paid yet

      const paidOrder = order.markAsPaid('txn-123');
      expect(paidOrder.canBeRefunded()).toBe(true);
    });

    it('should get participant by ID', () => {
      const participant = order.getParticipantById('participant-1');
      expect(participant).toBeDefined();
      expect(participant?.firstName).toBe('John');
    });

    it('should get item by ID', () => {
      const item = order.getItemById(order.getItems()[0].id);
      expect(item).toBeDefined();
      expect(item?.productTitle).toBe('Test Tour');
    });

    it('should serialize and deserialize correctly', () => {
      const json = order.toJSON();
      const deserializedOrder = Order.fromJSON(json);
      
      expect(deserializedOrder.equals(order)).toBe(true);
      expect(deserializedOrder.getOrderNumber()).toBe(order.getOrderNumber());
    });
  });
}); 