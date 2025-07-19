/**
 * Order Aggregate
 * Groups Order entity with items, participants, and enforces business rules
 */

import { Order, OrderStatus, PaymentStatus, PaymentMethod, OrderItem, OrderParticipant } from '../entities/Order';
import { Cart } from '../entities/Cart';
import { ContactInfo } from '../value-objects/ContactInfo';
import { Price } from '../value-objects/Price';

export interface OrderSummary {
  totalItems: number;
  subtotal: Price;
  taxAmount: Price;
  discountAmount: Price;
  totalAmount: Price;
  participantCount: number;
}

export interface OrderValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface OrderWorkflowStep {
  step: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export class OrderAggregate {
  private constructor(
    private readonly order: Order,
    private readonly workflowSteps: OrderWorkflowStep[] = []
  ) {
    this.validate();
  }

  /**
   * Create a new OrderAggregate from cart
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
  ): OrderAggregate {
    const order = Order.createFromCart(
      id,
      orderNumber,
      userId,
      cart,
      contactInfo,
      participants,
      paymentMethod,
      taxAmount,
      discountAmount,
      notes
    );

    const workflowSteps: OrderWorkflowStep[] = [
      {
        step: 'order_created',
        status: 'completed',
        timestamp: new Date(),
        metadata: { orderNumber, userId }
      }
    ];

    return new OrderAggregate(order, workflowSteps);
  }

  /**
   * Validate aggregate constraints
   */
  private validate(): void {
    // Order validation is handled by the Order entity
    // Additional aggregate-level validations can be added here
  }

  /**
   * Get order entity
   */
  getOrder(): Order {
    return this.order;
  }

  /**
   * Get order ID
   */
  getId(): string {
    return this.order.getId();
  }

  /**
   * Get order number
   */
  getOrderNumber(): string {
    return this.order.getOrderNumber();
  }

  /**
   * Get user ID
   */
  getUserId(): string {
    return this.order.getUserId();
  }

  /**
   * Get order status
   */
  getStatus(): OrderStatus {
    return this.order.getStatus();
  }

  /**
   * Get order items
   */
  getItems(): OrderItem[] {
    return this.order.getItems();
  }

  /**
   * Get participants
   */
  getParticipants(): OrderParticipant[] {
    return this.order.getParticipants();
  }

  /**
   * Get contact info
   */
  getContactInfo(): ContactInfo {
    return this.order.getContactInfo();
  }

  /**
   * Get payment
   */
  getPayment(): any {
    return this.order.getPayment();
  }

  /**
   * Get order summary
   */
  getSummary(): OrderSummary {
    return {
      totalItems: this.order.getItems().reduce((total, item) => total + item.quantity, 0),
      subtotal: this.order.getSubtotal(),
      taxAmount: this.order.getTaxAmount(),
      discountAmount: this.order.getDiscountAmount(),
      totalAmount: this.order.getTotalAmount(),
      participantCount: this.order.getParticipants().length
    };
  }

  /**
   * Get workflow steps
   */
  getWorkflowSteps(): OrderWorkflowStep[] {
    return [...this.workflowSteps];
  }

  /**
   * Check if order is pending
   */
  isPending(): boolean {
    return this.order.isPending();
  }

  /**
   * Check if order is confirmed
   */
  isConfirmed(): boolean {
    return this.order.isConfirmed();
  }

  /**
   * Check if order is paid
   */
  isPaid(): boolean {
    return this.order.isPaid();
  }

  /**
   * Check if order is processing
   */
  isProcessing(): boolean {
    return this.order.isProcessing();
  }

  /**
   * Check if order is completed
   */
  isCompleted(): boolean {
    return this.order.isCompleted();
  }

  /**
   * Check if order is cancelled
   */
  isCancelled(): boolean {
    return this.order.isCancelled();
  }

  /**
   * Check if order is refunded
   */
  isRefunded(): boolean {
    return this.order.isRefunded();
  }

  /**
   * Check if payment is pending
   */
  isPaymentPending(): boolean {
    return this.order.isPaymentPending();
  }

  /**
   * Check if payment is paid
   */
  isPaymentPaid(): boolean {
    return this.order.isPaymentPaid();
  }

  /**
   * Check if payment is failed
   */
  isPaymentFailed(): boolean {
    return this.order.isPaymentFailed();
  }

  /**
   * Get participant by ID
   */
  getParticipantById(participantId: string): OrderParticipant | null {
    return this.order.getParticipantById(participantId);
  }

  /**
   * Get item by ID
   */
  getItemById(itemId: string): OrderItem | null {
    return this.order.getItemById(itemId);
  }

  /**
   * Confirm order
   */
  confirm(): OrderAggregate {
    const updatedOrder = this.order.confirm();
    const workflowSteps = [
      ...this.workflowSteps,
      {
        step: 'order_confirmed',
        status: 'completed',
        timestamp: new Date(),
        metadata: { confirmedBy: 'system' }
      }
    ];

    return new OrderAggregate(updatedOrder, workflowSteps);
  }

  /**
   * Mark as paid
   */
  markAsPaid(transactionId?: string, gatewayResponse?: Record<string, any>): OrderAggregate {
    const updatedOrder = this.order.markAsPaid(transactionId, gatewayResponse);
    const workflowSteps = [
      ...this.workflowSteps,
      {
        step: 'payment_processed',
        status: 'completed',
        timestamp: new Date(),
        metadata: { transactionId, gateway: gatewayResponse?.gateway }
      }
    ];

    return new OrderAggregate(updatedOrder, workflowSteps);
  }

  /**
   * Start processing
   */
  startProcessing(): OrderAggregate {
    const updatedOrder = this.order.startProcessing();
    const workflowSteps = [
      ...this.workflowSteps,
      {
        step: 'processing_started',
        status: 'completed',
        timestamp: new Date(),
        metadata: { startedBy: 'system' }
      }
    ];

    return new OrderAggregate(updatedOrder, workflowSteps);
  }

  /**
   * Complete order
   */
  complete(): OrderAggregate {
    const updatedOrder = this.order.complete();
    const workflowSteps = [
      ...this.workflowSteps,
      {
        step: 'order_completed',
        status: 'completed',
        timestamp: new Date(),
        metadata: { completedBy: 'system' }
      }
    ];

    return new OrderAggregate(updatedOrder, workflowSteps);
  }

  /**
   * Cancel order
   */
  cancel(reason?: string): OrderAggregate {
    const updatedOrder = this.order.cancel(reason);
    const workflowSteps = [
      ...this.workflowSteps,
      {
        step: 'order_cancelled',
        status: 'completed',
        timestamp: new Date(),
        metadata: { reason, cancelledBy: 'system' }
      }
    ];

    return new OrderAggregate(updatedOrder, workflowSteps);
  }

  /**
   * Refund order
   */
  refund(amount?: Price, reason?: string): OrderAggregate {
    const updatedOrder = this.order.refund(amount, reason);
    const workflowSteps = [
      ...this.workflowSteps,
      {
        step: 'order_refunded',
        status: 'completed',
        timestamp: new Date(),
        metadata: { 
          refundAmount: amount?.toJSON(),
          reason,
          refundedBy: 'system'
        }
      }
    ];

    return new OrderAggregate(updatedOrder, workflowSteps);
  }

  /**
   * Add workflow step
   */
  addWorkflowStep(step: string, status: 'pending' | 'completed' | 'failed', metadata?: Record<string, any>): OrderAggregate {
    const workflowSteps = [
      ...this.workflowSteps,
      {
        step,
        status,
        timestamp: new Date(),
        metadata
      }
    ];

    return new OrderAggregate(this.order, workflowSteps);
  }

  /**
   * Validate order for processing
   */
  validateForProcessing(): OrderValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if order is in valid state for processing
    if (!this.isPaid()) {
      errors.push('Order must be paid before processing');
    }

    if (this.isCancelled()) {
      errors.push('Cancelled orders cannot be processed');
    }

    if (this.isRefunded()) {
      errors.push('Refunded orders cannot be processed');
    }

    // Validate participants
    if (this.getParticipants().length === 0) {
      errors.push('Order must have at least one participant');
    }

    // Validate items
    if (this.getItems().length === 0) {
      errors.push('Order must have at least one item');
    }

    // Check participant count matches item quantities
    const totalQuantity = this.getItems().reduce((total, item) => total + item.quantity, 0);
    if (this.getParticipants().length !== totalQuantity) {
      errors.push('Number of participants must match total item quantity');
    }

    // Check if order is expired (older than 30 days)
    const orderAge = Date.now() - this.order.toJSON().createdAt;
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    if (orderAge > thirtyDays) {
      warnings.push('Order is older than 30 days');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get order statistics
   */
  getStatistics(): {
    itemCount: number;
    uniqueProducts: number;
    participantCount: number;
    totalValue: Price;
    averageItemPrice: Price;
    workflowStepCount: number;
    processingTime?: number; // in hours
  } {
    const items = this.getItems();
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const uniqueProducts = items.length;
    const participantCount = this.getParticipants().length;
    const totalValue = this.order.getTotalAmount();
    const workflowStepCount = this.workflowSteps.length;

    if (items.length === 0) {
      return {
        itemCount: 0,
        uniqueProducts: 0,
        participantCount,
        totalValue: Price.create(0, this.order.getCurrency()),
        averageItemPrice: Price.create(0, this.order.getCurrency()),
        workflowStepCount
      };
    }

    const totalPrice = items.reduce((sum, item) => sum + item.totalPrice.getAmount(), 0);
    const averageItemPrice = Price.create(totalPrice / uniqueProducts, this.order.getCurrency());

    // Calculate processing time if order is completed
    let processingTime: number | undefined;
    if (this.isCompleted()) {
      const createdStep = this.workflowSteps.find(step => step.step === 'order_created');
      const completedStep = this.workflowSteps.find(step => step.step === 'order_completed');
      
      if (createdStep && completedStep) {
        const processingTimeMs = completedStep.timestamp.getTime() - createdStep.timestamp.getTime();
        processingTime = processingTimeMs / (1000 * 60 * 60); // Convert to hours
      }
    }

    return {
      itemCount,
      uniqueProducts,
      participantCount,
      totalValue,
      averageItemPrice,
      workflowStepCount,
      processingTime
    };
  }

  /**
   * Check if order can be processed
   */
  canBeProcessed(): boolean {
    const validation = this.validateForProcessing();
    return validation.isValid;
  }

  /**
   * Check if order can be cancelled
   */
  canBeCancelled(): boolean {
    return this.order.canBeCancelled();
  }

  /**
   * Check if order can be refunded
   */
  canBeRefunded(): boolean {
    return this.order.canBeRefunded();
  }

  /**
   * Get order age in days
   */
  getAgeInDays(): number {
    const createdAt = new Date(this.order.toJSON().createdAt);
    const now = new Date();
    const ageInMs = now.getTime() - createdAt.getTime();
    return Math.floor(ageInMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if aggregate equals another
   */
  equals(other: OrderAggregate): boolean {
    return this.order.equals(other.order);
  }

  /**
   * Convert to string
   */
  toString(): string {
    return `OrderAggregate(${this.order.toString()})`;
  }

  /**
   * Convert to JSON
   */
  toJSON(): any {
    return {
      order: this.order.toJSON(),
      summary: this.getSummary(),
      statistics: this.getStatistics(),
      workflowSteps: this.workflowSteps,
      validation: this.validateForProcessing()
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(json: any): OrderAggregate {
    const order = Order.fromJSON(json.order);
    const workflowSteps = json.workflowSteps || [];
    return new OrderAggregate(order, workflowSteps);
  }
} 