/**
 * Order Entity
 * Represents an order in the system with domain logic and business rules
 */

import { Price } from '../value-objects/Price';
import { Currency } from '../value-objects/Currency';
import { ContactInfo } from '../value-objects/ContactInfo';
import { User } from './User';
import { Cart } from './Cart';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PAID = 'paid',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum PaymentStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
  DIGITAL_WALLET = 'digital_wallet'
}

export interface OrderItem {
  id: string;
  productId: string;
  productType: string;
  productTitle: string;
  productSlug: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: Price;
  totalPrice: Price;
  selectedOptions: OrderItemOption[];
  metadata: Record<string, any>;
}

export interface OrderItemOption {
  id: string;
  name: string;
  price: Price;
  quantity: number;
}

export interface OrderPayment {
  id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: Price;
  transactionId?: string;
  gatewayResponse?: Record<string, any>;
  processedAt?: Date;
  metadata: Record<string, any>;
}

export interface OrderParticipant {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  nationality?: string;
  passportNumber?: string;
  specialRequirements?: string;
}

export class Order {
  private constructor(
    private readonly id: string,
    private readonly orderNumber: string,
    private readonly userId: string,
    private readonly status: OrderStatus,
    private readonly items: OrderItem[],
    private readonly subtotal: Price,
    private readonly taxAmount: Price,
    private readonly discountAmount: Price,
    private readonly totalAmount: Price,
    private readonly currency: Currency,
    private readonly contactInfo: ContactInfo,
    private readonly participants: OrderParticipant[],
    private readonly payment: OrderPayment,
    private readonly notes?: string,
    private readonly metadata: Record<string, any>,
    private readonly createdAt: Date,
    private readonly updatedAt: Date,
    private readonly confirmedAt?: Date,
    private readonly completedAt?: Date,
    private readonly cancelledAt?: Date
  ) {
    this.validate();
  }

  /**
   * Create a new Order instance from cart
   */
  static createFromCart(
    id: string,
    orderNumber: string,
    userId: string,
    cart: Cart,
    contactInfo: ContactInfo,
    participants: OrderParticipant[],
    paymentMethod: PaymentMethod,
    taxAmount: Price = Price.create(0, cart.getCurrency()),
    discountAmount: Price = Price.create(0, cart.getCurrency()),
    notes?: string
  ): Order {
    const items: OrderItem[] = cart.getItems().map(cartItem => ({
      id: `order_item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId: cartItem.productId,
      productType: cartItem.productType,
      productTitle: cartItem.productTitle,
      productSlug: cartItem.productSlug,
      variantId: cartItem.variantId,
      variantName: cartItem.variantName,
      quantity: cartItem.quantity,
      unitPrice: cartItem.unitPrice,
      totalPrice: cartItem.totalPrice,
      selectedOptions: cartItem.selectedOptions,
      metadata: cartItem.metadata
    }));

    const subtotal = cart.getSubtotal();
    const totalAmount = Price.create(
      subtotal.getAmount() + taxAmount.getAmount() - discountAmount.getAmount(),
      cart.getCurrency()
    );

    const payment: OrderPayment = {
      id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      method: paymentMethod,
      status: PaymentStatus.PENDING,
      amount: totalAmount,
      metadata: {}
    };

    return new Order(
      id,
      orderNumber,
      userId,
      OrderStatus.PENDING,
      items,
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      cart.getCurrency(),
      contactInfo,
      participants,
      payment,
      notes,
      {},
      new Date(),
      new Date()
    );
  }

  /**
   * Validate order constraints
   */
  private validate(): void {
    if (!this.id || this.id.trim().length === 0) {
      throw new Error('Order ID is required');
    }

    if (!this.orderNumber || this.orderNumber.trim().length === 0) {
      throw new Error('Order number is required');
    }

    if (!this.userId || this.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    if (this.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    if (this.totalAmount.getAmount() < 0) {
      throw new Error('Order total amount cannot be negative');
    }

    if (this.participants.length === 0) {
      throw new Error('Order must have at least one participant');
    }

    // Validate that all items have the same currency
    const hasDifferentCurrencies = this.items.some(item => 
      !item.unitPrice.getCurrency().equals(this.currency)
    );

    if (hasDifferentCurrencies) {
      throw new Error('All order items must have the same currency');
    }

    // Validate participant count matches total quantity
    const totalQuantity = this.items.reduce((total, item) => total + item.quantity, 0);
    if (this.participants.length !== totalQuantity) {
      throw new Error('Number of participants must match total item quantity');
    }
  }

  /**
   * Get order ID
   */
  getId(): string {
    return this.id;
  }

  /**
   * Get order number
   */
  getOrderNumber(): string {
    return this.orderNumber;
  }

  /**
   * Get user ID
   */
  getUserId(): string {
    return this.userId;
  }

  /**
   * Get order status
   */
  getStatus(): OrderStatus {
    return this.status;
  }

  /**
   * Get order items
   */
  getItems(): OrderItem[] {
    return [...this.items];
  }

  /**
   * Get subtotal
   */
  getSubtotal(): Price {
    return this.subtotal;
  }

  /**
   * Get tax amount
   */
  getTaxAmount(): Price {
    return this.taxAmount;
  }

  /**
   * Get discount amount
   */
  getDiscountAmount(): Price {
    return this.discountAmount;
  }

  /**
   * Get total amount
   */
  getTotalAmount(): Price {
    return this.totalAmount;
  }

  /**
   * Get currency
   */
  getCurrency(): Currency {
    return this.currency;
  }

  /**
   * Get contact info
   */
  getContactInfo(): ContactInfo {
    return this.contactInfo;
  }

  /**
   * Get participants
   */
  getParticipants(): OrderParticipant[] {
    return [...this.participants];
  }

  /**
   * Get payment
   */
  getPayment(): OrderPayment {
    return { ...this.payment };
  }

  /**
   * Get notes
   */
  getNotes(): string | undefined {
    return this.notes;
  }

  /**
   * Check if order is pending
   */
  isPending(): boolean {
    return this.status === OrderStatus.PENDING;
  }

  /**
   * Check if order is confirmed
   */
  isConfirmed(): boolean {
    return this.status === OrderStatus.CONFIRMED;
  }

  /**
   * Check if order is paid
   */
  isPaid(): boolean {
    return this.status === OrderStatus.PAID;
  }

  /**
   * Check if order is processing
   */
  isProcessing(): boolean {
    return this.status === OrderStatus.PROCESSING;
  }

  /**
   * Check if order is completed
   */
  isCompleted(): boolean {
    return this.status === OrderStatus.COMPLETED;
  }

  /**
   * Check if order is cancelled
   */
  isCancelled(): boolean {
    return this.status === OrderStatus.CANCELLED;
  }

  /**
   * Check if order is refunded
   */
  isRefunded(): boolean {
    return this.status === OrderStatus.REFUNDED;
  }

  /**
   * Check if payment is pending
   */
  isPaymentPending(): boolean {
    return this.payment.status === PaymentStatus.PENDING;
  }

  /**
   * Check if payment is paid
   */
  isPaymentPaid(): boolean {
    return this.payment.status === PaymentStatus.PAID;
  }

  /**
   * Check if payment is failed
   */
  isPaymentFailed(): boolean {
    return this.payment.status === PaymentStatus.FAILED;
  }

  /**
   * Check if order can be cancelled
   */
  canBeCancelled(): boolean {
    return this.status === OrderStatus.PENDING || 
           this.status === OrderStatus.CONFIRMED ||
           this.status === OrderStatus.PAID;
  }

  /**
   * Check if order can be refunded
   */
  canBeRefunded(): boolean {
    return this.status === OrderStatus.PAID || 
           this.status === OrderStatus.PROCESSING ||
           this.status === OrderStatus.COMPLETED;
  }

  /**
   * Confirm order
   */
  confirm(): Order {
    if (!this.isPending()) {
      throw new Error('Only pending orders can be confirmed');
    }

    return new Order(
      this.id,
      this.orderNumber,
      this.userId,
      OrderStatus.CONFIRMED,
      this.items,
      this.subtotal,
      this.taxAmount,
      this.discountAmount,
      this.totalAmount,
      this.currency,
      this.contactInfo,
      this.participants,
      this.payment,
      this.notes,
      this.metadata,
      this.createdAt,
      new Date(),
      new Date(),
      this.completedAt,
      this.cancelledAt
    );
  }

  /**
   * Mark as paid
   */
  markAsPaid(transactionId?: string, gatewayResponse?: Record<string, any>): Order {
    const updatedPayment: OrderPayment = {
      ...this.payment,
      status: PaymentStatus.PAID,
      transactionId,
      gatewayResponse,
      processedAt: new Date()
    };

    return new Order(
      this.id,
      this.orderNumber,
      this.userId,
      OrderStatus.PAID,
      this.items,
      this.subtotal,
      this.taxAmount,
      this.discountAmount,
      this.totalAmount,
      this.currency,
      this.contactInfo,
      this.participants,
      updatedPayment,
      this.notes,
      this.metadata,
      this.createdAt,
      new Date(),
      this.confirmedAt,
      this.completedAt,
      this.cancelledAt
    );
  }

  /**
   * Start processing
   */
  startProcessing(): Order {
    if (!this.isPaid()) {
      throw new Error('Only paid orders can start processing');
    }

    return new Order(
      this.id,
      this.orderNumber,
      this.userId,
      OrderStatus.PROCESSING,
      this.items,
      this.subtotal,
      this.taxAmount,
      this.discountAmount,
      this.totalAmount,
      this.currency,
      this.contactInfo,
      this.participants,
      this.payment,
      this.notes,
      this.metadata,
      this.createdAt,
      new Date(),
      this.confirmedAt,
      this.completedAt,
      this.cancelledAt
    );
  }

  /**
   * Complete order
   */
  complete(): Order {
    if (!this.isProcessing()) {
      throw new Error('Only processing orders can be completed');
    }

    return new Order(
      this.id,
      this.orderNumber,
      this.userId,
      OrderStatus.COMPLETED,
      this.items,
      this.subtotal,
      this.taxAmount,
      this.discountAmount,
      this.totalAmount,
      this.currency,
      this.contactInfo,
      this.participants,
      this.payment,
      this.notes,
      this.metadata,
      this.createdAt,
      new Date(),
      this.confirmedAt,
      new Date(),
      this.cancelledAt
    );
  }

  /**
   * Cancel order
   */
  cancel(reason?: string): Order {
    if (!this.canBeCancelled()) {
      throw new Error('Order cannot be cancelled in current status');
    }

    const updatedMetadata = {
      ...this.metadata,
      cancellationReason: reason,
      cancelledBy: 'system'
    };

    return new Order(
      this.id,
      this.orderNumber,
      this.userId,
      OrderStatus.CANCELLED,
      this.items,
      this.subtotal,
      this.taxAmount,
      this.discountAmount,
      this.totalAmount,
      this.currency,
      this.contactInfo,
      this.participants,
      this.payment,
      this.notes,
      updatedMetadata,
      this.createdAt,
      new Date(),
      this.confirmedAt,
      this.completedAt,
      new Date()
    );
  }

  /**
   * Refund order
   */
  refund(amount?: Price, reason?: string): Order {
    if (!this.canBeRefunded()) {
      throw new Error('Order cannot be refunded in current status');
    }

    const refundAmount = amount || this.totalAmount;
    const updatedPayment: OrderPayment = {
      ...this.payment,
      status: refundAmount.equals(this.totalAmount) ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED,
      metadata: {
        ...this.payment.metadata,
        refundAmount: refundAmount.toJSON(),
        refundReason: reason
      }
    };

    const updatedMetadata = {
      ...this.metadata,
      refundAmount: refundAmount.toJSON(),
      refundReason: reason
    };

    return new Order(
      this.id,
      this.orderNumber,
      this.userId,
      OrderStatus.REFUNDED,
      this.items,
      this.subtotal,
      this.taxAmount,
      this.discountAmount,
      this.totalAmount,
      this.currency,
      this.contactInfo,
      this.participants,
      updatedPayment,
      this.notes,
      updatedMetadata,
      this.createdAt,
      new Date(),
      this.confirmedAt,
      this.completedAt,
      this.cancelledAt
    );
  }

  /**
   * Get participant by ID
   */
  getParticipantById(participantId: string): OrderParticipant | null {
    return this.participants.find(p => p.id === participantId) || null;
  }

  /**
   * Get item by ID
   */
  getItemById(itemId: string): OrderItem | null {
    return this.items.find(item => item.id === itemId) || null;
  }

  /**
   * Check if order equals another
   */
  equals(other: Order): boolean {
    return this.id === other.id;
  }

  /**
   * Convert to string
   */
  toString(): string {
    return `Order(${this.orderNumber}, ${this.status}, ${this.totalAmount.toString()})`;
  }

  /**
   * Convert to JSON
   */
  toJSON(): any {
    return {
      id: this.id,
      orderNumber: this.orderNumber,
      userId: this.userId,
      status: this.status,
      items: this.items,
      subtotal: this.subtotal.toJSON(),
      taxAmount: this.taxAmount.toJSON(),
      discountAmount: this.discountAmount.toJSON(),
      totalAmount: this.totalAmount.toJSON(),
      currency: this.currency.toJSON(),
      contactInfo: this.contactInfo.toJSON(),
      participants: this.participants,
      payment: this.payment,
      notes: this.notes,
      metadata: this.metadata,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      confirmedAt: this.confirmedAt?.toISOString(),
      completedAt: this.completedAt?.toISOString(),
      cancelledAt: this.cancelledAt?.toISOString()
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(json: any): Order {
    return new Order(
      json.id,
      json.orderNumber,
      json.userId,
      json.status,
      json.items,
      Price.fromJSON(json.subtotal),
      Price.fromJSON(json.taxAmount),
      Price.fromJSON(json.discountAmount),
      Price.fromJSON(json.totalAmount),
      Currency.fromJSON(json.currency),
      ContactInfo.fromJSON(json.contactInfo),
      json.participants,
      json.payment,
      json.notes,
      json.metadata,
      new Date(json.createdAt),
      new Date(json.updatedAt),
      json.confirmedAt ? new Date(json.confirmedAt) : undefined,
      json.completedAt ? new Date(json.completedAt) : undefined,
      json.cancelledAt ? new Date(json.cancelledAt) : undefined
    );
  }
} 