/**
 * Order Entity
 * Simplified order model for the domain layer
 */

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  items: OrderItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  customer_info: CustomerInfo;
  billing_address?: Address;
  shipping_address?: Address;
  payment_method?: string;
  transaction_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_type: 'tour' | 'event' | 'transfer';
  product_title: string;
  product_slug: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  currency: string;
  
  // Product-specific data
  variant_id?: string;
  variant_name?: string;
  performance_id?: string;
  performance_date?: string;
  performance_time?: string;
  selected_seats?: Array<{
    id: string;
    seat_number: string;
    row_number: string;
    section: string;
  }>;
  participants?: Record<string, number>;
  route_id?: string;
  vehicle_type?: string;
  trip_type?: string;
  passenger_count?: number;
  luggage_count?: number;
  
  // Options
  selected_options?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  
  // Booking details
  booking_date?: string;
  booking_time?: string;
  special_requests?: string;
}

export interface CustomerInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  nationality?: string;
  passport_number?: string;
}

export interface Address {
  street: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';

export interface OrderCreateData {
  user_id: string;
  items: OrderItemCreateData[];
  customer_info: CustomerInfo;
  billing_address?: Address;
  shipping_address?: Address;
  payment_method?: string;
  notes?: string;
}

export interface OrderItemCreateData {
  product_id: string;
  product_type: 'tour' | 'event' | 'transfer';
  quantity: number;
  variant_id?: string;
  performance_id?: string;
  selected_seats?: Array<{
    id: string;
    seat_number: string;
    row_number: string;
    section: string;
  }>;
  participants?: Record<string, number>;
  route_id?: string;
  vehicle_type?: string;
  trip_type?: string;
  passenger_count?: number;
  luggage_count?: number;
  selected_options?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  booking_date?: string;
  booking_time?: string;
  special_requests?: string;
}

export interface OrderUpdateData {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  transaction_id?: string;
  notes?: string;
}

export interface OrderSearchCriteria {
  user_id?: string;
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export interface OrderListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: Order[];
}

export interface OrderResponse {
  order: Order;
  message?: string;
} 