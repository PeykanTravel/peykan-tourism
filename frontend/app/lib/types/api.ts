// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'guest' | 'customer' | 'agent' | 'admin';
  is_active: boolean;
  is_phone_verified: boolean;
  is_email_verified: boolean;
  date_joined: string;
  last_login: string | null;
  profile: UserProfile;
}

export interface UserProfile {
  id: string;
  avatar?: string | null;
  bio?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  newsletter_subscription: boolean;
  marketing_emails: boolean;
}

// Auth Types
export interface AuthResponse {
  message: string;
  user: User;
  tokens?: {
    refresh: string;
    access: string;
  };
  email_verification_required?: boolean;
  email?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  role?: string;
}

export interface OTPPayload {
  phone?: string;
  email?: string;
  otp_type: 'phone' | 'email' | 'password_reset' | 'login';
}

export interface OTPVerifyPayload extends OTPPayload {
  code: string;
}

export interface PasswordResetPayload {
  email: string;
  code: string;
  new_password: string;
  new_password_confirm: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  new_password_confirm: string;
}

// Tour Types
export interface Tour {
  id: string;
  slug: string;
  title: string;
  description: string;
  short_description: string;
  highlights: string;
  itinerary: string;
  included_services: string;
  excluded_services: string;
  important_notes: string;
  image: string;
  gallery: string[];
  base_price: number;
  currency: string;
  duration_hours: number;
  max_participants: number;
  booking_cutoff_hours: number;
  cancellation_hours: number;
  refund_percentage: number;
  includes_transfer: boolean;
  includes_guide: boolean;
  includes_meal: boolean;
  includes_photographer: boolean;
  category: TourCategory;
  variants: TourVariant[];
  options: TourOption[];
  schedules: TourSchedule[];
  reviews: TourReview[];
  average_rating: number;
  review_count: number;
  is_available_today: boolean;
  is_active: boolean;
  created_at: string;
}

export interface TourCategory {
  id: string;
  name: string;
  description: string;
  image: string;
  is_active: boolean;
}

export interface TourVariant {
  id: string;
  name: string;
  description: string;
  price_modifier: number;
  capacity: number;
  is_active: boolean;
}

export interface TourOption {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  option_type: string;
  is_available: boolean;
  max_quantity?: number;
}

export interface TourSchedule {
  id: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  max_capacity: number;
  current_capacity: number;
  available_capacity: number;
  is_full: boolean;
  day_of_week: number;
  variant_capacities: Record<string, number>;
}

export interface TourReview {
  id: string;
  rating: number;
  title: string;
  comment: string;
  is_verified: boolean;
  is_helpful: number;
  created_at: string;
  user_name: string;
}

export interface TourSearchParams {
  query?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  min_duration?: number;
  max_duration?: number;
  date_from?: string;
  date_to?: string;
  includes_transfer?: boolean;
  includes_guide?: boolean;
  includes_meal?: boolean;
  sort_by?: string;
}

export interface TourBookingPayload {
  tour_id: string;
  schedule_id: string;
  variant_id?: string;
  quantity: number;
  booking_date: string;
  selected_options?: Array<{
    option_id: string;
    quantity: number;
    price: number;
  }>;
  special_requests?: string;
}

// Cart Types
export interface CartItem {
  id: string;
  product_type: 'tour' | 'event' | 'transfer';
  product_id: string;
  product_title: string;
  product_slug: string;
  variant_id?: string;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  currency: string;
  selected_options: Array<{
    option_id: string;
    quantity: number;
    price: number;
  }>;
  special_requests?: string;
  created_at: string;
}

export interface Cart {
  id: string;
  user?: string;
  session_key?: string;
  items: CartItem[];
  total_items: number;
  subtotal: number;
  total_price: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface AddToCartPayload {
  product_type: 'tour' | 'event' | 'transfer';
  product_id: string;
  variant_id?: string;
  quantity: number;
  selected_options?: Array<{
    option_id: string;
    quantity: number;
  }>;
  special_requests?: string;
}

export interface UpdateCartItemPayload {
  quantity: number;
  selected_options?: Array<{
    option_id: string;
    quantity: number;
  }>;
  special_requests?: string;
}

// Order Types
export interface OrderItem {
  id: string;
  product_type: 'tour' | 'event' | 'transfer';
  product_id: string;
  product_title: string;
  product_slug: string;
  variant_id?: string;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  currency: string;
  selected_options: Array<{
    option_id: string;
    quantity: number;
    price: number;
  }>;
  booking_date?: string;
  booking_time?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user: string;
  agent?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  total_amount: number;
  currency: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  special_requests?: string;
  notes?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateOrderPayload {
  cart_id: string;
  special_requests?: string;
  agent_id?: string;
}

// Payment Types
export interface PaymentTransaction {
  id: string;
  payment: string;
  transaction_type: 'authorization' | 'capture' | 'refund' | 'void' | 'chargeback';
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed';
  gateway_response: any;
  error_code?: string;
  error_message?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  payment_id: string;
  order: string;
  user: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string;
  transactions: PaymentTransaction[];
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentPayload {
  order_id: string;
  payment_method: string;
}

// Agent Types
export interface AgentCommission {
  id: string;
  order: string;
  commission_amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  created_at: string;
}

export interface Agent {
  id: string;
  user: string;
  agency_name: string;
  agency_code: string;
  status: 'active' | 'inactive' | 'suspended';
  commissions: AgentCommission[];
  created_at: string;
  updated_at: string;
}

export interface AgentSummary {
  total_orders: number;
  total_commissions: number;
  recent_orders: Array<{
    order_number: string;
    customer_name: string;
    total_amount: number;
    status: string;
    created_at: string;
  }>;
  recent_commissions: Array<{
    id: string;
    order_number: string;
    commission_amount: number;
    status: string;
    created_at: string;
  }>;
}

// Pagination Types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Error Types
export interface ApiError {
  error: string;
  detail?: string;
  code?: string;
} 