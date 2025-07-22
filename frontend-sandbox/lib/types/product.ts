export type ProductType = 'tour' | 'event' | 'transfer';

export type FieldType = 
  | 'date' 
  | 'schedule' 
  | 'variant' 
  | 'participants' 
  | 'tickets' 
  | 'seats' 
  | 'pickup' 
  | 'dropoff' 
  | 'vehicle' 
  | 'location'
  | 'options' 
  | 'specialRequests'
  | 'textarea';

export interface ValidationSchema {
  required?: string;
  minLength?: string;
  maxLength?: string;
  minParticipants?: string;
  maxParticipants?: string;
  pattern?: string;
  custom?: (value: any) => string | null;
}

export interface FormField {
  name: string;
  type: FieldType;
  label: string;
  required: boolean;
  placeholder?: string;
  validation?: ValidationSchema;
  options?: Array<{
    id: string;
    name: string;
    price?: number;
    description?: string;
    capacity?: number;
  }>;
}

export interface PricingConfig {
  type: 'static' | 'dynamic' | 'ticket-based' | 'route-based';
  baseField?: string;
  ageGroups?: string[];
  calculatePrice?: (product: any, ...args: any[]) => number;
}

export interface BookingStep {
  id: string;
  title: string;
  description: string;
  fields: string[];
  isRequired: boolean;
  component?: string; // Optional custom component
  isCompleted?: boolean;
  isActive?: boolean;
}

export interface DisplayConfig {
  showVariantComparison?: boolean;
  showScheduleCalendar?: boolean;
  showCapacityIndicator?: boolean;
  showPricingBreakdown?: boolean;
  showOptionsGrid?: boolean;
  showTicketComparison?: boolean;
  showSeatMap?: boolean;
  showVehicleComparison?: boolean;
  showRouteMap?: boolean;
}

export interface ValidationConfig {
  checkAvailability?: boolean;
  validateCapacity?: boolean;
  validateCutoffTime?: boolean;
  validateSeats?: boolean;
  minParticipants?: number;
  maxParticipants?: number;
}

export interface ProductConfig {
  type: ProductType;
  steps: BookingStep[];
  pricing: {
    type: 'dynamic' | 'fixed' | 'tiered';
    calculatePrice: (...args: any[]) => number;
  };
}

export interface Product {
  id: string;
  type: 'tour' | 'event' | 'transfer';
  title: string;
  description: string;
  short_description: string;
  price: number;
  currency: string;
  images: string[];
  location: string;
  duration?: string;
  rating?: number;
  review_count?: number;
  is_featured?: boolean;
  is_popular?: boolean;
  
  // Tour specific
  variants?: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    features: string[];
    capacity: number;
    duration?: string;
    location?: string;
    pricing?: Array<{
      age_group: string;
      factor: number;
      is_free: boolean;
    }>;
  }>;
  
  schedules?: Array<{
    id: string;
    date: string;
    time: string;
    available_capacity: number;
    total_capacity?: number;
  }>;
  
  // Event specific
  performances?: Array<{
    id: string;
    date: string;
    time: string;
    venue: string;
    available_seats: number;
  }>;
  
  ticket_types?: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    benefits: string[];
  }>;
  
  sections?: Array<{
    id: string;
    name: string;
    description: string;
    price_multiplier: number;
    available_seats: number;
  }>;
  
  // Transfer specific
  routes?: Array<{
    id: string;
    origin: string;
    destination: string;
    distance: number;
    duration: string;
    base_price: number;
  }>;
  
  vehicle_types?: Array<{
    id: string;
    name: string;
    description: string;
    capacity: number;
    price_multiplier: number;
    features: string[];
  }>;
  
  // Common
  options?: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    type: 'addon' | 'service' | 'feature';
  }>;
}

export interface Booking {
  productId: string;
  productType: ProductType;
  variantId?: string;
  scheduleId?: string;
  date?: string;
  participants?: {
    adult: number;
    child: number;
    infant: number;
  };
  tickets?: Record<string, number>;
  seats?: string[];
  pickup?: string;
  dropoff?: string;
  vehicleId?: string;
  options?: Record<string, number>;
  specialRequests?: string;
  totalPrice: number;
  currency: string;
} 