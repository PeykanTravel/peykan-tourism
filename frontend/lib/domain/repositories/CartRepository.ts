/**
 * Cart Repository Interface
 * Defines the contract for cart data access operations
 */

import { CartAggregate } from '../aggregates/CartAggregate';
import { CartItem, CartItemType } from '../entities/Cart';
import { Price } from '../value-objects/Price';
import { Currency } from '../value-objects/Currency';

export interface CartSearchCriteria {
  userId?: string;
  isGuest?: boolean;
  isExpired?: boolean;
  minTotal?: Price;
  maxTotal?: Price;
  currency?: Currency;
  limit?: number;
  offset?: number;
}

export interface CartCreateData {
  userId?: string;
  currency?: Currency;
}

export interface CartUpdateData {
  userId?: string;
  currency?: Currency;
}

export interface CartItemData {
  productId: string;
  productType: CartItemType;
  productTitle: string;
  productSlug: string;
  productImage?: string;
  unitPrice: Price;
  quantity: number;
  variantId?: string;
  variantName?: string;
  selectedOptions?: any[];
}

export interface CartRepository {
  /**
   * Find cart by ID
   */
  findById(id: string): Promise<CartAggregate | null>;

  /**
   * Find cart by user ID
   */
  findByUserId(userId: string): Promise<CartAggregate | null>;

  /**
   * Find guest cart by session ID
   */
  findGuestCart(sessionId: string): Promise<CartAggregate | null>;

  /**
   * Find carts by search criteria
   */
  findByCriteria(criteria: CartSearchCriteria): Promise<CartAggregate[]>;

  /**
   * Find all carts
   */
  findAll(): Promise<CartAggregate[]>;

  /**
   * Find guest carts
   */
  findGuestCarts(): Promise<CartAggregate[]>;

  /**
   * Find expired carts
   */
  findExpiredCarts(): Promise<CartAggregate[]>;

  /**
   * Find carts by currency
   */
  findByCurrency(currency: Currency): Promise<CartAggregate[]>;

  /**
   * Find carts by total range
   */
  findByTotalRange(minTotal: Price, maxTotal: Price): Promise<CartAggregate[]>;

  /**
   * Create a new cart
   */
  create(data: CartCreateData): Promise<CartAggregate>;

  /**
   * Create a guest cart
   */
  createGuestCart(sessionId: string): Promise<CartAggregate>;

  /**
   * Update cart
   */
  update(id: string, data: CartUpdateData): Promise<CartAggregate>;

  /**
   * Delete cart
   */
  delete(id: string): Promise<boolean>;

  /**
   * Clear cart
   */
  clear(id: string): Promise<CartAggregate>;

  /**
   * Add item to cart
   */
  addItem(id: string, itemData: CartItemData): Promise<CartAggregate>;

  /**
   * Update item quantity
   */
  updateItemQuantity(id: string, itemId: string, quantity: number): Promise<CartAggregate>;

  /**
   * Remove item from cart
   */
  removeItem(id: string, itemId: string): Promise<CartAggregate>;

  /**
   * Update cart currency
   */
  updateCurrency(id: string, currency: Currency): Promise<CartAggregate>;

  /**
   * Assign cart to user
   */
  assignToUser(id: string, userId: string): Promise<CartAggregate>;

  /**
   * Extend cart expiration
   */
  extendExpiration(id: string, hours?: number): Promise<CartAggregate>;

  /**
   * Merge guest cart with user cart
   */
  mergeWithUserCart(guestCartId: string, userId: string): Promise<CartAggregate>;

  /**
   * Check if cart exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Check if user has cart
   */
  userHasCart(userId: string): Promise<boolean>;

  /**
   * Count total carts
   */
  count(): Promise<number>;

  /**
   * Count carts by user
   */
  countByUser(userId: string): Promise<number>;

  /**
   * Count guest carts
   */
  countGuestCarts(): Promise<number>;

  /**
   * Count expired carts
   */
  countExpiredCarts(): Promise<number>;

  /**
   * Count carts by currency
   */
  countByCurrency(currency: Currency): Promise<number>;

  /**
   * Get cart statistics
   */
  getStatistics(): Promise<{
    total: number;
    guest: number;
    expired: number;
    byCurrency: Record<string, number>;
    averageItems: number;
    averageTotal: Price;
    totalValue: Price;
  }>;

  /**
   * Clean up expired carts
   */
  cleanupExpiredCarts(): Promise<number>;

  /**
   * Get cart summary
   */
  getCartSummary(id: string): Promise<{
    itemCount: number;
    totalAmount: Price;
    currency: Currency;
    isExpired: boolean;
    expiresAt: Date;
  } | null>;

  /**
   * Validate cart for checkout
   */
  validateForCheckout(id: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }>;

  /**
   * Get cart items
   */
  getCartItems(id: string): Promise<CartItem[]>;

  /**
   * Get cart by item
   */
  findByItem(itemId: string): Promise<CartAggregate | null>;

  /**
   * Get carts with specific product
   */
  findByProduct(productId: string): Promise<CartAggregate[]>;

  /**
   * Get carts with specific product type
   */
  findByProductType(productType: CartItemType): Promise<CartAggregate[]>;
} 