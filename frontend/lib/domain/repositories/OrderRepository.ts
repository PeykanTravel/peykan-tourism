/**
 * Order Repository Interface
 * Defines the contract for order data access operations
 */

import { OrderAggregate } from '../aggregates/OrderAggregate';
import { Order, OrderStatus, PaymentStatus, PaymentMethod } from '../entities/Order';
import { Price } from '../value-objects/Price';
import { ContactInfo } from '../value-objects/ContactInfo';

export interface OrderSearchCriteria {
  userId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  minAmount?: Price;
  maxAmount?: Price;
  startDate?: Date;
  endDate?: Date;
  orderNumber?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'totalAmount' | 'orderNumber';
  sortOrder?: 'asc' | 'desc';
}

export interface OrderCreateData {
  userId: string;
  cartId: string;
  contactInfo: ContactInfo;
  participants: any[];
  paymentMethod: PaymentMethod;
  taxAmount?: Price;
  discountAmount?: Price;
  notes?: string;
}

export interface OrderUpdateData {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  contactInfo?: ContactInfo;
  participants?: any[];
  notes?: string;
}

export interface OrderWorkflowData {
  step: string;
  status: 'pending' | 'completed' | 'failed';
  metadata?: Record<string, any>;
}

export interface OrderRepository {
  /**
   * Find order by ID
   */
  findById(id: string): Promise<OrderAggregate | null>;

  /**
   * Find order by order number
   */
  findByOrderNumber(orderNumber: string): Promise<OrderAggregate | null>;

  /**
   * Find orders by search criteria
   */
  findByCriteria(criteria: OrderSearchCriteria): Promise<OrderAggregate[]>;

  /**
   * Find all orders
   */
  findAll(): Promise<OrderAggregate[]>;

  /**
   * Find orders by user ID
   */
  findByUserId(userId: string): Promise<OrderAggregate[]>;

  /**
   * Find orders by status
   */
  findByStatus(status: OrderStatus): Promise<OrderAggregate[]>;

  /**
   * Find orders by payment status
   */
  findByPaymentStatus(paymentStatus: PaymentStatus): Promise<OrderAggregate[]>;

  /**
   * Find pending orders
   */
  findPendingOrders(): Promise<OrderAggregate[]>;

  /**
   * Find paid orders
   */
  findPaidOrders(): Promise<OrderAggregate[]>;

  /**
   * Find processing orders
   */
  findProcessingOrders(): Promise<OrderAggregate[]>;

  /**
   * Find completed orders
   */
  findCompletedOrders(): Promise<OrderAggregate[]>;

  /**
   * Find cancelled orders
   */
  findCancelledOrders(): Promise<OrderAggregate[]>;

  /**
   * Find orders by date range
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<OrderAggregate[]>;

  /**
   * Find orders by amount range
   */
  findByAmountRange(minAmount: Price, maxAmount: Price): Promise<OrderAggregate[]>;

  /**
   * Find orders by payment method
   */
  findByPaymentMethod(paymentMethod: PaymentMethod): Promise<OrderAggregate[]>;

  /**
   * Search orders by term
   */
  search(searchTerm: string): Promise<OrderAggregate[]>;

  /**
   * Create a new order
   */
  create(data: OrderCreateData): Promise<OrderAggregate>;

  /**
   * Update order
   */
  update(id: string, data: OrderUpdateData): Promise<OrderAggregate>;

  /**
   * Delete order
   */
  delete(id: string): Promise<boolean>;

  /**
   * Confirm order
   */
  confirm(id: string): Promise<OrderAggregate>;

  /**
   * Mark order as paid
   */
  markAsPaid(id: string, transactionId?: string, gatewayResponse?: Record<string, any>): Promise<OrderAggregate>;

  /**
   * Start processing order
   */
  startProcessing(id: string): Promise<OrderAggregate>;

  /**
   * Complete order
   */
  complete(id: string): Promise<OrderAggregate>;

  /**
   * Cancel order
   */
  cancel(id: string, reason?: string): Promise<OrderAggregate>;

  /**
   * Refund order
   */
  refund(id: string, amount?: Price, reason?: string): Promise<OrderAggregate>;

  /**
   * Add workflow step
   */
  addWorkflowStep(id: string, workflowData: OrderWorkflowData): Promise<OrderAggregate>;

  /**
   * Get order workflow steps
   */
  getWorkflowSteps(id: string): Promise<OrderWorkflowData[]>;

  /**
   * Check if order exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Check if order number exists
   */
  existsByOrderNumber(orderNumber: string): Promise<boolean>;

  /**
   * Count total orders
   */
  count(): Promise<number>;

  /**
   * Count orders by user
   */
  countByUser(userId: string): Promise<number>;

  /**
   * Count orders by status
   */
  countByStatus(status: OrderStatus): Promise<number>;

  /**
   * Count orders by payment status
   */
  countByPaymentStatus(paymentStatus: PaymentStatus): Promise<number>;

  /**
   * Count pending orders
   */
  countPendingOrders(): Promise<number>;

  /**
   * Count paid orders
   */
  countPaidOrders(): Promise<number>;

  /**
   * Count completed orders
   */
  countCompletedOrders(): Promise<number>;

  /**
   * Count orders by date range
   */
  countByDateRange(startDate: Date, endDate: Date): Promise<number>;

  /**
   * Get order statistics
   */
  getStatistics(): Promise<{
    total: number;
    pending: number;
    paid: number;
    processing: number;
    completed: number;
    cancelled: number;
    refunded: number;
    byStatus: Record<OrderStatus, number>;
    byPaymentStatus: Record<PaymentStatus, number>;
    byPaymentMethod: Record<PaymentMethod, number>;
    totalRevenue: Price;
    averageOrderValue: Price;
    revenueByPeriod: Record<string, Price>;
  }>;

  /**
   * Get revenue statistics
   */
  getRevenueStatistics(startDate: Date, endDate: Date): Promise<{
    totalRevenue: Price;
    orderCount: number;
    averageOrderValue: Price;
    revenueByDay: Record<string, Price>;
    revenueByMonth: Record<string, Price>;
    topProducts: Array<{ productId: string; revenue: Price; quantity: number }>;
  }>;

  /**
   * Get order summary
   */
  getOrderSummary(id: string): Promise<{
    orderNumber: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    totalAmount: Price;
    itemCount: number;
    participantCount: number;
    createdAt: Date;
    updatedAt: Date;
  } | null>;

  /**
   * Validate order for processing
   */
  validateForProcessing(id: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }>;

  /**
   * Get order items
   */
  getOrderItems(id: string): Promise<any[]>;

  /**
   * Get order participants
   */
  getOrderParticipants(id: string): Promise<any[]>;

  /**
   * Get orders by product
   */
  findByProduct(productId: string): Promise<OrderAggregate[]>;

  /**
   * Get orders by participant
   */
  findByParticipant(participantId: string): Promise<OrderAggregate[]>;

  /**
   * Generate order number
   */
  generateOrderNumber(): Promise<string>;

  /**
   * Get recent orders
   */
  getRecentOrders(limit?: number): Promise<OrderAggregate[]>;

  /**
   * Get user order history
   */
  getUserOrderHistory(userId: string, limit?: number): Promise<OrderAggregate[]>;
} 