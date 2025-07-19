/**
 * Order Repository Interface
 * Simplified interface for order data access operations
 */

import { Order, OrderStatus, PaymentStatus } from '../entities/Order';

export interface OrderSearchCriteria {
  user_id?: string;
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  start_date?: Date;
  end_date?: Date;
  order_number?: string;
  page?: number;
  limit?: number;
}

export interface OrderCreateData {
  user_id: string;
  items: Array<{
    product_id: string;
    product_type: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  customer_info: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    city: string;
    country: string;
  };
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  payment_method?: string;
  notes?: string;
}

export interface OrderUpdateData {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  transaction_id?: string;
  notes?: string;
}

export interface OrderRepository {
  /**
   * Find order by ID
   */
  findById(id: string): Promise<Order | null>;

  /**
   * Find order by order number
   */
  findByOrderNumber(orderNumber: string): Promise<Order | null>;

  /**
   * Find orders by search criteria
   */
  findByCriteria(criteria: OrderSearchCriteria): Promise<{
    orders: Order[];
    total: number;
    page: number;
    limit: number;
  }>;

  /**
   * Find orders by user ID
   */
  findByUserId(userId: string, pagination?: { page: number; limit: number }): Promise<{
    orders: Order[];
    total: number;
    page: number;
    limit: number;
  }>;

  /**
   * Find orders by status
   */
  findByStatus(status: OrderStatus): Promise<Order[]>;

  /**
   * Find orders by payment status
   */
  findByPaymentStatus(paymentStatus: PaymentStatus): Promise<Order[]>;

  /**
   * Create a new order
   */
  create(data: OrderCreateData): Promise<Order>;

  /**
   * Update order
   */
  update(id: string, data: OrderUpdateData): Promise<Order>;

  /**
   * Delete order
   */
  delete(id: string): Promise<boolean>;

  /**
   * Check if order exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Check if order number exists
   */
  existsByOrderNumber(orderNumber: string): Promise<boolean>;

  /**
   * Get order statistics
   */
  getStatistics(): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    totalRevenue: number;
    averageOrderValue: number;
    byStatus: Record<string, number>;
    byPaymentStatus: Record<string, number>;
  }>;
} 