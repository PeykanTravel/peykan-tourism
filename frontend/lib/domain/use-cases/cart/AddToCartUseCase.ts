/**
 * Add to Cart Use Case
 * Handles cart operations and item management logic
 */

import { CartRepository, CartItemData } from '../../repositories/CartRepository';
import { ProductRepository } from '../../repositories/ProductRepository';
import { CartAggregate } from '../../aggregates/CartAggregate';
import { ProductAggregate } from '../../aggregates/ProductAggregate';
import { CartItemType } from '../../entities/Cart';
import { Price } from '../../value-objects/Price';
import { Currency } from '../../value-objects/Currency';

export interface AddToCartRequest {
  cartId: string;
  productId: string;
  quantity: number;
  variantId?: string;
  variantName?: string;
  selectedOptions?: Array<{
    optionId: string;
    value: string;
  }>;
}

export interface AddToCartResponse {
  success: boolean;
  cart?: CartAggregate;
  message?: string;
  errors?: string[];
}

export interface UpdateCartItemRequest {
  cartId: string;
  itemId: string;
  quantity: number;
}

export interface UpdateCartItemResponse {
  success: boolean;
  cart?: CartAggregate;
  message?: string;
  errors?: string[];
}

export interface RemoveFromCartRequest {
  cartId: string;
  itemId: string;
}

export interface RemoveFromCartResponse {
  success: boolean;
  cart?: CartAggregate;
  message?: string;
  errors?: string[];
}

export interface ClearCartRequest {
  cartId: string;
}

export interface ClearCartResponse {
  success: boolean;
  cart?: CartAggregate;
  message?: string;
  errors?: string[];
}

export interface GetCartRequest {
  cartId: string;
}

export interface GetCartResponse {
  success: boolean;
  cart?: CartAggregate;
  message?: string;
  errors?: string[];
}

export interface CreateCartRequest {
  userId?: string;
  currency?: string;
}

export interface CreateCartResponse {
  success: boolean;
  cart?: CartAggregate;
  message?: string;
  errors?: string[];
}

export interface UpdateCartCurrencyRequest {
  cartId: string;
  currency: string;
}

export interface UpdateCartCurrencyResponse {
  success: boolean;
  cart?: CartAggregate;
  message?: string;
  errors?: string[];
}

export class AddToCartUseCase {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productRepository: ProductRepository
  ) {}

  /**
   * Add item to cart
   */
  async addToCart(request: AddToCartRequest): Promise<AddToCartResponse> {
    try {
      // Validate input
      const validation = this.validateAddToCartRequest(request);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      // Get cart
      const cart = await this.cartRepository.findById(request.cartId);
      if (!cart) {
        return {
          success: false,
          message: 'Cart not found',
          errors: ['Cart does not exist']
        };
      }

      // Check if cart is expired
      if (cart.isExpired()) {
        return {
          success: false,
          message: 'Cart has expired',
          errors: ['Cart has expired and cannot be modified']
        };
      }

      // Get product
      const product = await this.productRepository.findById(request.productId);
      if (!product) {
        return {
          success: false,
          message: 'Product not found',
          errors: ['Product does not exist']
        };
      }

      // Check if product is active
      if (!product.isActive()) {
        return {
          success: false,
          message: 'Product is not available',
          errors: ['Product is not active and cannot be added to cart']
        };
      }

      // Check if product is available for booking
      if (!product.isAvailableForBooking()) {
        return {
          success: false,
          message: 'Product is not available for booking',
          errors: ['Product is not available for booking at this time']
        };
      }

      // Check if item already exists in cart
      const existingItem = cart.getItemByProductId(request.productId);
      if (existingItem) {
        // Update quantity instead of adding new item
        const newQuantity = existingItem.quantity + request.quantity;
        const updatedCart = await this.cartRepository.updateItemQuantity(
          request.cartId,
          existingItem.id,
          newQuantity
        );

        return {
          success: true,
          cart: updatedCart,
          message: 'Item quantity updated in cart'
        };
      }

      // Prepare item data
      const itemData: CartItemData = {
        productId: request.productId,
        productType: this.mapProductTypeToCartItemType(product.getType()),
        productTitle: product.getTitle(),
        productSlug: product.getSlug(),
        productImage: product.getImages()[0]?.url,
        unitPrice: product.getPrice(),
        quantity: request.quantity,
        variantId: request.variantId,
        variantName: request.variantName,
        selectedOptions: request.selectedOptions || []
      };

      // Add item to cart
      const updatedCart = await this.cartRepository.addItem(request.cartId, itemData);

      return {
        success: true,
        cart: updatedCart,
        message: 'Item added to cart successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to add item to cart',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(request: UpdateCartItemRequest): Promise<UpdateCartItemResponse> {
    try {
      // Validate input
      const validation = this.validateUpdateCartItemRequest(request);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      // Get cart
      const cart = await this.cartRepository.findById(request.cartId);
      if (!cart) {
        return {
          success: false,
          message: 'Cart not found',
          errors: ['Cart does not exist']
        };
      }

      // Check if cart is expired
      if (cart.isExpired()) {
        return {
          success: false,
          message: 'Cart has expired',
          errors: ['Cart has expired and cannot be modified']
        };
      }

      // Check if item exists
      const item = cart.getItemById(request.itemId);
      if (!item) {
        return {
          success: false,
          message: 'Item not found in cart',
          errors: ['Item does not exist in cart']
        };
      }

      // Update item quantity
      const updatedCart = await this.cartRepository.updateItemQuantity(
        request.cartId,
        request.itemId,
        request.quantity
      );

      return {
        success: true,
        cart: updatedCart,
        message: 'Cart item updated successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to update cart item',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(request: RemoveFromCartRequest): Promise<RemoveFromCartResponse> {
    try {
      // Validate input
      if (!request.cartId || !request.itemId) {
        return {
          success: false,
          message: 'Cart ID and Item ID are required',
          errors: ['Cart ID and Item ID must be provided']
        };
      }

      // Get cart
      const cart = await this.cartRepository.findById(request.cartId);
      if (!cart) {
        return {
          success: false,
          message: 'Cart not found',
          errors: ['Cart does not exist']
        };
      }

      // Check if cart is expired
      if (cart.isExpired()) {
        return {
          success: false,
          message: 'Cart has expired',
          errors: ['Cart has expired and cannot be modified']
        };
      }

      // Remove item from cart
      const updatedCart = await this.cartRepository.removeItem(request.cartId, request.itemId);

      return {
        success: true,
        cart: updatedCart,
        message: 'Item removed from cart successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to remove item from cart',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Clear cart
   */
  async clearCart(request: ClearCartRequest): Promise<ClearCartResponse> {
    try {
      // Validate input
      if (!request.cartId) {
        return {
          success: false,
          message: 'Cart ID is required',
          errors: ['Cart ID must be provided']
        };
      }

      // Get cart
      const cart = await this.cartRepository.findById(request.cartId);
      if (!cart) {
        return {
          success: false,
          message: 'Cart not found',
          errors: ['Cart does not exist']
        };
      }

      // Clear cart
      const clearedCart = await this.cartRepository.clear(request.cartId);

      return {
        success: true,
        cart: clearedCart,
        message: 'Cart cleared successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to clear cart',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get cart
   */
  async getCart(request: GetCartRequest): Promise<GetCartResponse> {
    try {
      // Validate input
      if (!request.cartId) {
        return {
          success: false,
          message: 'Cart ID is required',
          errors: ['Cart ID must be provided']
        };
      }

      // Get cart
      const cart = await this.cartRepository.findById(request.cartId);
      if (!cart) {
        return {
          success: false,
          message: 'Cart not found',
          errors: ['Cart does not exist']
        };
      }

      return {
        success: true,
        cart,
        message: 'Cart retrieved successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to get cart',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Create new cart
   */
  async createCart(request: CreateCartRequest): Promise<CreateCartResponse> {
    try {
      // Validate input
      const validation = this.validateCreateCartRequest(request);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      // Create cart data
      const cartData = {
        userId: request.userId,
        currency: request.currency ? Currency.create(request.currency) : undefined
      };

      // Create cart
      const cart = await this.cartRepository.create(cartData);

      return {
        success: true,
        cart,
        message: 'Cart created successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to create cart',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Update cart currency
   */
  async updateCartCurrency(request: UpdateCartCurrencyRequest): Promise<UpdateCartCurrencyResponse> {
    try {
      // Validate input
      const validation = this.validateUpdateCartCurrencyRequest(request);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      // Get cart
      const cart = await this.cartRepository.findById(request.cartId);
      if (!cart) {
        return {
          success: false,
          message: 'Cart not found',
          errors: ['Cart does not exist']
        };
      }

      // Update currency
      const newCurrency = Currency.create(request.currency);
      const updatedCart = await this.cartRepository.updateCurrency(request.cartId, newCurrency);

      return {
        success: true,
        cart: updatedCart,
        message: 'Cart currency updated successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to update cart currency',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Map product type to cart item type
   */
  private mapProductTypeToCartItemType(productType: any): CartItemType {
    switch (productType) {
      case 'TOUR':
        return CartItemType.TOUR;
      case 'EVENT':
        return CartItemType.EVENT;
      case 'TRANSFER':
        return CartItemType.TRANSFER;
      default:
        return CartItemType.TOUR;
    }
  }

  /**
   * Validate add to cart request
   */
  private validateAddToCartRequest(request: AddToCartRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!request.cartId) {
      errors.push('Cart ID is required');
    }

    if (!request.productId) {
      errors.push('Product ID is required');
    }

    if (!request.quantity || request.quantity <= 0) {
      errors.push('Valid quantity is required');
    }

    if (request.quantity > 100) {
      errors.push('Quantity cannot exceed 100');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate update cart item request
   */
  private validateUpdateCartItemRequest(request: UpdateCartItemRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!request.cartId) {
      errors.push('Cart ID is required');
    }

    if (!request.itemId) {
      errors.push('Item ID is required');
    }

    if (!request.quantity || request.quantity <= 0) {
      errors.push('Valid quantity is required');
    }

    if (request.quantity > 100) {
      errors.push('Quantity cannot exceed 100');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate create cart request
   */
  private validateCreateCartRequest(request: CreateCartRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (request.currency) {
      try {
        Currency.create(request.currency);
      } catch {
        errors.push('Invalid currency code');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate update cart currency request
   */
  private validateUpdateCartCurrencyRequest(request: UpdateCartCurrencyRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!request.cartId) {
      errors.push('Cart ID is required');
    }

    if (!request.currency) {
      errors.push('Currency is required');
    } else {
      try {
        Currency.create(request.currency);
      } catch {
        errors.push('Valid currency code is required');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 