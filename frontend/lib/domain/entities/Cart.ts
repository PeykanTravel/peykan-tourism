/**
 * Cart Entity
 * Simplified cart model for the domain layer
 */

export interface Cart {
  id: string;
  user_id?: string;
  items: CartItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  product_type: 'tour' | 'event' | 'transfer';
  product_title: string;
  product_slug: string;
  product_image?: string;
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
  participants?: Record<string, number>; // For tours: { 'adult': 2, 'child': 1 }
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
  
  created_at: string;
  updated_at: string;
}

export interface CartCreateData {
  user_id?: string;
  items: CartItemCreateData[];
}

export interface CartItemCreateData {
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

export interface CartUpdateData {
  items?: CartItemUpdateData[];
  discount_code?: string;
}

export interface CartItemUpdateData {
  id: string;
  quantity?: number;
  selected_options?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  special_requests?: string;
}

export interface CartResponse {
  cart: Cart;
  message?: string;
}

export interface CartItemResponse {
  item: CartItem;
  message?: string;
} 