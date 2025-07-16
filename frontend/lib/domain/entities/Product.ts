// Domain Entity - Product (Base)
export interface BaseProduct {
  id: string;
  title: string;
  description: string;
  short_description?: string;
  images: ProductImage[];
  price: Price;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  order: number;
}

export interface Price {
  amount: number;
  currency: 'USD' | 'EUR' | 'TRY';
  original_amount?: number; // For discounts
  discount_percentage?: number;
}

// Tour Entity
export interface Tour extends BaseProduct {
  type: 'tour';
  duration: number; // in days
  difficulty_level: 'easy' | 'medium' | 'hard';
  group_size: {
    min: number;
    max: number;
  };
  included_services: string[];
  excluded_services: string[];
  itinerary: TourItinerary[];
  location: Location;
  guide_language: ('en' | 'fa' | 'tr')[];
  cancellation_policy: CancellationPolicy;
  variants: TourVariant[];
}

export interface TourItinerary {
  day: number;
  title: string;
  description: string;
  activities: string[];
  meals: ('breakfast' | 'lunch' | 'dinner')[];
  accommodation?: string;
}

export interface TourVariant {
  id: string;
  name: string;
  price: Price;
  capacity: number;
  available_dates: string[];
  is_available: boolean;
}

// Event Entity
export interface Event extends BaseProduct {
  type: 'event';
  start_date: string;
  end_date: string;
  location: Location;
  category: EventCategory;
  organizer: string;
  capacity: number;
  available_spots: number;
  registration_deadline: string;
  age_restrictions?: {
    min_age?: number;
    max_age?: number;
  };
  requirements?: string[];
  pricing_options: EventPricingOption[];
}

export interface EventCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface EventPricingOption {
  id: string;
  name: string;
  description?: string;
  price: Price;
  capacity: number;
  available_spots: number;
  is_default: boolean;
}

// Transfer Entity
export interface Transfer extends BaseProduct {
  type: 'transfer';
  route: TransferRoute;
  vehicle_type: VehicleType;
  capacity: number;
  duration: number; // in minutes
  schedule: TransferSchedule[];
  booking_type: 'scheduled' | 'on_demand';
  amenities: string[];
  cancellation_policy: CancellationPolicy;
}

export interface TransferRoute {
  id: string;
  from: Location;
  to: Location;
  distance: number; // in kilometers
  stops?: Location[];
}

export interface VehicleType {
  id: string;
  name: string;
  capacity: number;
  features: string[];
  image?: string;
}

export interface TransferSchedule {
  id: string;
  departure_time: string;
  arrival_time: string;
  available_seats: number;
  price: Price;
  is_available: boolean;
}

// Common interfaces
export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  timezone: string;
}

export interface CancellationPolicy {
  id: string;
  name: string;
  description: string;
  rules: CancellationRule[];
}

export interface CancellationRule {
  days_before: number;
  refund_percentage: number;
  fee_percentage: number;
}

// Union type for all products
export type Product = Tour | Event | Transfer;

// Product filters
export interface ProductFilters {
  category?: string;
  price_min?: number;
  price_max?: number;
  location?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: 'price_asc' | 'price_desc' | 'date_asc' | 'date_desc' | 'popularity';
  page?: number;
  limit?: number;
}

// Product search
export interface ProductSearchQuery {
  query: string;
  filters: ProductFilters;
  suggestions?: string[];
} 