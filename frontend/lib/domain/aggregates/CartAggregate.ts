/**
 * Cart Aggregate
 * Groups Cart entity with items and enforces business rules
 */

import { Cart, CartItem, CartItemType } from '../entities/Cart';
import { Price } from '../value-objects/Price';
import { Currency } from '../value-objects/Currency';

export interface CartSummary {
  totalItems: number;
  subtotal: Price;
  optionsTotal: Price;
  totalAmount: Price;
  currency: Currency;
}

export interface CartValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class CartAggregate {
  private constructor(
    private readonly cart: Cart
  ) {
    this.validate();
  }

  /**
   * Create a new CartAggregate instance
   */
  static create(
    id: string,
    userId: string | null = null,
    currency: Currency = Currency.getDefault()
  ): CartAggregate {
    const cart = Cart.create(id, userId, currency);
    return new CartAggregate(cart);
  }

  /**
   * Create a guest cart aggregate
   */
  static createGuest(): CartAggregate {
    const cart = Cart.createGuest();
    return new CartAggregate(cart);
  }

  /**
   * Validate aggregate constraints
   */
  private validate(): void {
    // Cart validation is handled by the Cart entity
    // Additional aggregate-level validations can be added here
  }

  /**
   * Get cart entity
   */
  getCart(): Cart {
    return this.cart;
  }

  /**
   * Get cart ID
   */
  getId(): string {
    return this.cart.getId();
  }

  /**
   * Get user ID
   */
  getUserId(): string | null {
    return this.cart.getUserId();
  }

  /**
   * Get cart items
   */
  getItems(): CartItem[] {
    return this.cart.getItems();
  }

  /**
   * Get cart currency
   */
  getCurrency(): Currency {
    return this.cart.getCurrency();
  }

  /**
   * Get cart summary
   */
  getSummary(): CartSummary {
    return {
      totalItems: this.cart.getTotalItems(),
      subtotal: this.cart.getSubtotal(),
      optionsTotal: this.cart.getOptionsTotal(),
      totalAmount: this.cart.getTotalPrice(),
      currency: this.cart.getCurrency()
    };
  }

  /**
   * Check if cart is empty
   */
  isEmpty(): boolean {
    return this.cart.isEmpty();
  }

  /**
   * Check if cart is expired
   */
  isExpired(): boolean {
    return this.cart.isExpired();
  }

  /**
   * Check if cart belongs to guest
   */
  isGuestCart(): boolean {
    return this.cart.isGuestCart();
  }

  /**
   * Get item by ID
   */
  getItemById(itemId: string): CartItem | null {
    return this.cart.getItemById(itemId);
  }

  /**
   * Get item by product ID
   */
  getItemByProductId(productId: string): CartItem | null {
    return this.cart.getItemByProductId(productId);
  }

  /**
   * Add item to cart
   */
  addItem(
    productId: string,
    productType: CartItemType,
    productTitle: string,
    productSlug: string,
    productImage: string | undefined,
    unitPrice: Price,
    quantity: number = 1,
    variantId?: string,
    variantName?: string,
    selectedOptions: any[] = []
  ): CartAggregate {
    const updatedCart = this.cart.addItem(
      productId,
      productType,
      productTitle,
      productSlug,
      productImage,
      unitPrice,
      quantity,
      variantId,
      variantName,
      selectedOptions
    );

    return new CartAggregate(updatedCart);
  }

  /**
   * Update item quantity
   */
  updateItemQuantity(itemId: string, quantity: number): CartAggregate {
    const updatedCart = this.cart.updateItemQuantity(itemId, quantity);
    return new CartAggregate(updatedCart);
  }

  /**
   * Remove item from cart
   */
  removeItem(itemId: string): CartAggregate {
    const updatedCart = this.cart.removeItem(itemId);
    return new CartAggregate(updatedCart);
  }

  /**
   * Clear cart
   */
  clear(): CartAggregate {
    const updatedCart = this.cart.clear();
    return new CartAggregate(updatedCart);
  }

  /**
   * Update cart currency
   */
  updateCurrency(currency: Currency): CartAggregate {
    const updatedCart = this.cart.updateCurrency(currency);
    return new CartAggregate(updatedCart);
  }

  /**
   * Extend expiration
   */
  extendExpiration(hours: number = 24): CartAggregate {
    const updatedCart = this.cart.extendExpiration(hours);
    return new CartAggregate(updatedCart);
  }

  /**
   * Assign to user
   */
  assignToUser(userId: string): CartAggregate {
    const updatedCart = this.cart.assignToUser(userId);
    return new CartAggregate(updatedCart);
  }

  /**
   * Validate cart for checkout
   */
  validateForCheckout(): CartValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if cart is empty
    if (this.isEmpty()) {
      errors.push('Cart is empty');
      return { isValid: false, errors, warnings };
    }

    // Check if cart is expired
    if (this.isExpired()) {
      errors.push('Cart has expired');
    }

    // Check if cart belongs to guest
    if (this.isGuestCart()) {
      warnings.push('Guest cart - user will need to register or login');
    }

    // Validate each item
    this.getItems().forEach(item => {
      if (item.quantity <= 0) {
        errors.push(`Item ${item.productTitle} has invalid quantity`);
      }

      if (item.quantity > 100) {
        warnings.push(`Item ${item.productTitle} has high quantity (${item.quantity})`);
      }

      if (item.unitPrice.isZero()) {
        errors.push(`Item ${item.productTitle} has zero price`);
      }
    });

    // Check currency consistency
    const hasDifferentCurrencies = this.getItems().some(item => 
      !item.unitPrice.getCurrency().equals(this.getCurrency())
    );

    if (hasDifferentCurrencies) {
      errors.push('All items must have the same currency');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get cart statistics
   */
  getStatistics(): {
    itemCount: number;
    uniqueProducts: number;
    totalValue: Price;
    averageItemPrice: Price;
    mostExpensiveItem: CartItem | null;
    leastExpensiveItem: CartItem | null;
  } {
    const items = this.getItems();
    const itemCount = this.cart.getTotalItems();
    const uniqueProducts = items.length;
    const totalValue = this.cart.getTotalPrice();

    if (items.length === 0) {
      return {
        itemCount: 0,
        uniqueProducts: 0,
        totalValue: Price.create(0, this.getCurrency()),
        averageItemPrice: Price.create(0, this.getCurrency()),
        mostExpensiveItem: null,
        leastExpensiveItem: null
      };
    }

    const totalPrice = items.reduce((sum, item) => sum + item.totalPrice.getAmount(), 0);
    const averageItemPrice = Price.create(totalPrice / uniqueProducts, this.getCurrency());

    const mostExpensiveItem = items.reduce((max, item) => 
      item.totalPrice.getAmount() > max.totalPrice.getAmount() ? item : max
    );

    const leastExpensiveItem = items.reduce((min, item) => 
      item.totalPrice.getAmount() < min.totalPrice.getAmount() ? item : min
    );

    return {
      itemCount,
      uniqueProducts,
      totalValue,
      averageItemPrice,
      mostExpensiveItem,
      leastExpensiveItem
    };
  }

  /**
   * Check if cart can be converted to order
   */
  canBeConvertedToOrder(): boolean {
    const validation = this.validateForCheckout();
    return validation.isValid && !this.isExpired();
  }

  /**
   * Get cart expiration time remaining (in hours)
   */
  getExpirationTimeRemaining(): number {
    const now = new Date();
    const expiresAt = this.cart.getExpiresAt();
    const timeRemaining = expiresAt.getTime() - now.getTime();
    return Math.max(0, timeRemaining / (1000 * 60 * 60)); // Convert to hours
  }

  /**
   * Check if cart needs refresh (expires soon)
   */
  needsRefresh(): boolean {
    const timeRemaining = this.getExpirationTimeRemaining();
    return timeRemaining < 1; // Less than 1 hour remaining
  }

  /**
   * Check if aggregate equals another
   */
  equals(other: CartAggregate): boolean {
    return this.cart.equals(other.cart);
  }

  /**
   * Convert to string
   */
  toString(): string {
    return `CartAggregate(${this.cart.toString()})`;
  }

  /**
   * Convert to JSON
   */
  toJSON(): any {
    return {
      cart: this.cart.toJSON(),
      summary: this.getSummary(),
      statistics: this.getStatistics(),
      validation: this.validateForCheckout()
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(json: any): CartAggregate {
    const cart = Cart.fromJSON(json.cart);
    return new CartAggregate(cart);
  }
} 