import { Product, Price } from './Product';
import { User } from './User';

// Domain Entity - Cart
export interface Cart {
  id: string;
  user_id?: string; // Optional for guest carts
  session_id?: string; // For guest carts
  items: CartItem[];
  total_amount: Price;
  created_at: string;
  updated_at: string;
  expires_at?: string; // For guest carts
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  product_type: 'tour' | 'event' | 'transfer';
  product_title: string;
  product_image?: string;
  quantity: number;
  unit_price: Price;
  total_price: Price;
  options: CartItemOptions;
  created_at: string;
}

export interface CartItemOptions {
  variant_id?: string; // For tour variants
  pricing_option_id?: string; // For event pricing options
  schedule_id?: string; // For transfer schedules
  selected_date?: string;
  participants?: Participant[];
  special_requests?: string;
  addon_services?: AddonService[];
}

export interface Participant {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  email?: string;
  phone_number?: string;
  document_type?: 'passport' | 'id_card' | 'driver_license';
  document_number?: string;
  is_primary: boolean;
}

export interface AddonService {
  id: string;
  name: string;
  description?: string;
  price: Price;
  is_required: boolean;
  is_selected: boolean;
}

// Cart Summary
export interface CartSummary {
  subtotal: Price;
  tax: Price;
  discounts: CartDiscount[];
  total: Price;
  item_count: number;
  estimated_delivery?: string;
}

export interface CartDiscount {
  id: string;
  type: 'percentage' | 'fixed' | 'coupon';
  name: string;
  amount: Price;
  code?: string;
  is_applied: boolean;
}

// Order Entity
export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  items: OrderItem[];
  billing_address: Address;
  shipping_address?: Address;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal: Price;
  tax: Price;
  discounts: CartDiscount[];
  total: Price;
  notes?: string;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_type: 'tour' | 'event' | 'transfer';
  product_title: string;
  product_image?: string;
  quantity: number;
  unit_price: Price;
  total_price: Price;
  options: CartItemOptions;
  status: OrderItemStatus;
  delivery_date?: string;
  tracking_number?: string;
}

export interface Address {
  id: string;
  type: 'billing' | 'shipping';
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  phone_number?: string;
  is_default: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'cash';
  provider: string;
  display_name: string;
  last_four?: string;
  expiry_date?: string;
  is_default: boolean;
}

// Enums
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum OrderItemStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  READY = 'ready',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

// Cart Operations
export interface AddToCartRequest {
  product_id: string;
  product_type: 'tour' | 'event' | 'transfer';
  quantity: number;
  options: CartItemOptions;
}

export interface UpdateCartItemRequest {
  quantity?: number;
  options?: Partial<CartItemOptions>;
}

export interface CartValidationResult {
  is_valid: boolean;
  errors: CartValidationError[];
  warnings: CartValidationWarning[];
}

export interface CartValidationError {
  item_id: string;
  field: string;
  message: string;
  code: string;
}

export interface CartValidationWarning {
  item_id: string;
  message: string;
  code: string;
}

// Checkout
export interface CheckoutRequest {
  billing_address: Omit<Address, 'id'>;
  shipping_address?: Omit<Address, 'id'>;
  payment_method: string;
  notes?: string;
  terms_accepted: boolean;
}

export interface CheckoutResponse {
  order: Order;
  payment_url?: string;
  redirect_url?: string;
  requires_3d_secure?: boolean;
} 