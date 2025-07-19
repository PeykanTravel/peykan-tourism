// Base interface for all cart items
export interface BaseCartItem {
  id: string;
  type: 'tour' | 'event' | 'transfer';
  title: string;
  price: number;
  currency: string;
  image?: string;
  duration?: string;
  location?: string;
  date?: string;
  time?: string;
  variant_name?: string;
  quantity?: number;
}

// Tour-specific cart item
export interface TourCartItem extends BaseCartItem {
  type: 'tour';
  tour_id: string;
  schedule_id: string;
  variant_id: string;
  participants: {
    adult: number;
    child: number;
    infant: number;
  };
  selected_options: Array<{
    option_id: string;
    quantity: number;
  }>;
  special_requests?: string;
  total_participants: number;
  unit_price: number;
  options_total: number;
  subtotal: number;
}

// Event-specific cart item
export interface EventCartItem extends BaseCartItem {
  type: 'event';
  event_id: string;
  performance_id: string;
  ticket_type_id: string;
  seats: Array<{
    row: string;
    seat: string;
    price: number;
    section: string;
  }>;
  selected_options: Array<{
    option_id: string;
    quantity: number;
  }>;
  special_requests?: string;
  section: string;
  performance_date: string;
  performance_time: string;
  venue_name: string;
}

// Transfer-specific cart item
export interface TransferCartItem extends BaseCartItem {
  type: 'transfer';
  transfer_id: string;
  route_id: string;
  vehicle_type: string;
  trip_type: 'one-way' | 'round-trip';
  pickup_location: string;
  dropoff_location: string;
  pickup_date: string;
  pickup_time: string;
  passengers: number;
  selected_options: Array<{
    option_id: string;
    quantity: number;
  }>;
  special_requests?: string;
}

// Union type for all cart items
export type CartItem = TourCartItem | EventCartItem | TransferCartItem;

// Cart state interface
export interface CartState {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  total: number;
  currency: string;
  isLoading: boolean;
  error: string | null;
}

// Cart actions interface
export interface CartActions {
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  loadCart: () => Promise<void>;
  saveCart: () => Promise<void>;
}

// Cart context interface
export interface CartContextType extends CartState, CartActions {} 