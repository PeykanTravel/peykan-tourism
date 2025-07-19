/**
 * Cart Entity
 * Represents a shopping cart in the system with domain logic and business rules
 */

import { Price } from '../value-objects/Price';
import { Currency } from '../value-objects/Currency';
import { User } from './User';

export enum CartItemType {
  TOUR = 'tour',
  EVENT = 'event',
  TRANSFER = 'transfer'
}

export interface CartItem {
  id: string;
  productId: string;
  productType: CartItemType;
  productTitle: string;
  productSlug: string;
  productImage?: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: Price;
  totalPrice: Price;
  selectedOptions: CartItemOption[];
  metadata: Record<string, any>;
  addedAt: Date;
}

export interface CartItemOption {
  id: string;
  name: string;
  price: Price;
  quantity: number;
}

export class Cart {
  private constructor(
    private readonly id: string,
    private readonly userId: string | null,
    private readonly items: CartItem[],
    private readonly currency: Currency,
    private readonly expiresAt: Date,
    private readonly createdAt: Date,
    private readonly updatedAt: Date
  ) {
    this.validate();
  }

  /**
   * Create a new Cart instance
   */
  static create(
    id: string,
    userId: string | null = null,
    currency: Currency = Currency.getDefault()
  ): Cart {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiration

    return new Cart(
      id,
      userId,
      [],
      currency,
      expiresAt,
      new Date(),
      new Date()
    );
  }

  /**
   * Create a guest cart
   */
  static createGuest(): Cart {
    const guestId = `guest_cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return Cart.create(guestId);
  }

  /**
   * Validate cart constraints
   */
  private validate(): void {
    if (!this.id || this.id.trim().length === 0) {
      throw new Error('Cart ID is required');
    }

    if (this.items.length > 50) {
      throw new Error('Cart cannot contain more than 50 items');
    }

    // Validate that all items have the same currency
    const hasDifferentCurrencies = this.items.some(item => 
      !item.unitPrice.getCurrency().equals(this.currency)
    );

    if (hasDifferentCurrencies) {
      throw new Error('All cart items must have the same currency');
    }

    // Validate item quantities
    this.items.forEach(item => {
      if (item.quantity <= 0) {
        throw new Error(`Item ${item.id} quantity must be greater than 0`);
      }

      if (item.quantity > 100) {
        throw new Error(`Item ${item.id} quantity cannot exceed 100`);
      }
    });
  }

  /**
   * Get cart ID
   */
  getId(): string {
    return this.id;
  }

  /**
   * Get user ID
   */
  getUserId(): string | null {
    return this.userId;
  }

  /**
   * Get cart items
   */
  getItems(): CartItem[] {
    return [...this.items];
  }

  /**
   * Get cart currency
   */
  getCurrency(): Currency {
    return this.currency;
  }

  /**
   * Get expiration date
   */
  getExpiresAt(): Date {
    return this.expiresAt;
  }

  /**
   * Check if cart is empty
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Get total number of items
   */
  getTotalItems(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Get total price
   */
  getTotalPrice(): Price {
    if (this.isEmpty()) {
      return Price.create(0, this.currency);
    }

    const totalAmount = this.items.reduce((total, item) => {
      return total + item.totalPrice.getAmount();
    }, 0);

    return Price.create(totalAmount, this.currency);
  }

  /**
   * Get subtotal (without options)
   */
  getSubtotal(): Price {
    if (this.isEmpty()) {
      return Price.create(0, this.currency);
    }

    const subtotalAmount = this.items.reduce((total, item) => {
      const itemSubtotal = item.unitPrice.getAmount() * item.quantity;
      return total + itemSubtotal;
    }, 0);

    return Price.create(subtotalAmount, this.currency);
  }

  /**
   * Get options total
   */
  getOptionsTotal(): Price {
    if (this.isEmpty()) {
      return Price.create(0, this.currency);
    }

    const optionsAmount = this.items.reduce((total, item) => {
      const itemOptionsTotal = item.selectedOptions.reduce((optTotal, option) => {
        return optTotal + (option.price.getAmount() * option.quantity);
      }, 0);
      return total + itemOptionsTotal;
    }, 0);

    return Price.create(optionsAmount, this.currency);
  }

  /**
   * Check if cart is expired
   */
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  /**
   * Check if cart belongs to guest
   */
  isGuestCart(): boolean {
    return this.userId === null;
  }

  /**
   * Get item by ID
   */
  getItemById(itemId: string): CartItem | null {
    return this.items.find(item => item.id === itemId) || null;
  }

  /**
   * Get item by product ID
   */
  getItemByProductId(productId: string): CartItem | null {
    return this.items.find(item => item.productId === productId) || null;
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
    selectedOptions: CartItemOption[] = []
  ): Cart {
    // Validate currency
    if (!unitPrice.getCurrency().equals(this.currency)) {
      throw new Error('Item currency must match cart currency');
    }

    // Check if item already exists
    const existingItem = this.getItemByProductId(productId);
    if (existingItem) {
      return this.updateItemQuantity(existingItem.id, existingItem.quantity + quantity);
    }

    const itemId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate total price
    const itemSubtotal = unitPrice.getAmount() * quantity;
    const optionsTotal = selectedOptions.reduce((total, option) => {
      return total + (option.price.getAmount() * option.quantity);
    }, 0);
    const totalAmount = itemSubtotal + optionsTotal;

    const newItem: CartItem = {
      id: itemId,
      productId,
      productType,
      productTitle,
      productSlug,
      productImage,
      variantId,
      variantName,
      quantity,
      unitPrice,
      totalPrice: Price.create(totalAmount, this.currency),
      selectedOptions,
      metadata: {},
      addedAt: new Date()
    };

    const updatedItems = [...this.items, newItem];

    return new Cart(
      this.id,
      this.userId,
      updatedItems,
      this.currency,
      this.expiresAt,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Update item quantity
   */
  updateItemQuantity(itemId: string, quantity: number): Cart {
    if (quantity <= 0) {
      return this.removeItem(itemId);
    }

    if (quantity > 100) {
      throw new Error('Item quantity cannot exceed 100');
    }

    const updatedItems = this.items.map(item => {
      if (item.id === itemId) {
        const itemSubtotal = item.unitPrice.getAmount() * quantity;
        const optionsTotal = item.selectedOptions.reduce((total, option) => {
          return total + (option.price.getAmount() * option.quantity);
        }, 0);
        const totalAmount = itemSubtotal + optionsTotal;

        return {
          ...item,
          quantity,
          totalPrice: Price.create(totalAmount, this.currency)
        };
      }
      return item;
    });

    return new Cart(
      this.id,
      this.userId,
      updatedItems,
      this.currency,
      this.expiresAt,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Remove item from cart
   */
  removeItem(itemId: string): Cart {
    const updatedItems = this.items.filter(item => item.id !== itemId);

    return new Cart(
      this.id,
      this.userId,
      updatedItems,
      this.currency,
      this.expiresAt,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Clear cart
   */
  clear(): Cart {
    return new Cart(
      this.id,
      this.userId,
      [],
      this.currency,
      this.expiresAt,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Update cart currency
   */
  updateCurrency(currency: Currency): Cart {
    // Convert all prices to new currency
    const updatedItems = this.items.map(item => {
      const convertedUnitPrice = item.unitPrice.convertTo(currency);
      const convertedTotalPrice = item.totalPrice.convertTo(currency);
      const convertedOptions = item.selectedOptions.map(option => ({
        ...option,
        price: option.price.convertTo(currency)
      }));

      return {
        ...item,
        unitPrice: convertedUnitPrice,
        totalPrice: convertedTotalPrice,
        selectedOptions: convertedOptions
      };
    });

    return new Cart(
      this.id,
      this.userId,
      updatedItems,
      currency,
      this.expiresAt,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Extend expiration
   */
  extendExpiration(hours: number = 24): Cart {
    const newExpiresAt = new Date();
    newExpiresAt.setHours(newExpiresAt.getHours() + hours);

    return new Cart(
      this.id,
      this.userId,
      this.items,
      this.currency,
      newExpiresAt,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Assign to user
   */
  assignToUser(userId: string): Cart {
    return new Cart(
      this.id,
      userId,
      this.items,
      this.currency,
      this.expiresAt,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Check if cart equals another
   */
  equals(other: Cart): boolean {
    return this.id === other.id;
  }

  /**
   * Convert to string
   */
  toString(): string {
    return `Cart(${this.id}, ${this.getTotalItems()} items, ${this.getTotalPrice().toString()})`;
  }

  /**
   * Convert to JSON
   */
  toJSON(): any {
    return {
      id: this.id,
      userId: this.userId,
      items: this.items,
      currency: this.currency.toJSON(),
      expiresAt: this.expiresAt.toISOString(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(json: any): Cart {
    return new Cart(
      json.id,
      json.userId,
      json.items,
      Currency.fromJSON(json.currency),
      new Date(json.expiresAt),
      new Date(json.createdAt),
      new Date(json.updatedAt)
    );
  }
} 