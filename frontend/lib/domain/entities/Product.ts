/**
 * Product Entity
 * Simplified product model for the domain layer
 */

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  type: ProductType;
  status: ProductStatus;
  price: number;
  currency: string;
  images: string[];
  featured_image?: string;
  location?: {
    address: string;
    city: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  duration?: number; // in minutes
  max_capacity?: number;
  min_age?: number;
  max_age?: number;
  included_services?: string[];
  excluded_services?: string[];
  what_to_bring?: string[];
  cancellation_policy?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export type ProductType = 'tour' | 'event' | 'transfer';
export type ProductStatus = 'active' | 'inactive' | 'draft' | 'archived';

// Tour specific fields
export interface Tour extends Product {
  type: 'tour';
  category: string;
  variants?: TourVariant[];
  schedules?: TourSchedule[];
}

export interface TourVariant {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  max_capacity: number;
  available_capacity: number;
}

export interface TourSchedule {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  meeting_point: string;
  available_capacity: number;
  max_capacity: number;
}

// Event specific fields
export interface Event extends Product {
  type: 'event';
  venue: string;
  performances?: EventPerformance[];
  seat_map?: SeatMap;
}

export interface EventPerformance {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  available_seats: number;
  total_seats: number;
  price: number;
  currency: string;
}

export interface SeatMap {
  sections: SeatSection[];
}

export interface SeatSection {
  id: string;
  name: string;
  rows: SeatRow[];
}

export interface SeatRow {
  id: string;
  name: string;
  seats: Seat[];
}

export interface Seat {
  id: string;
  number: string;
  status: 'available' | 'reserved' | 'sold';
  price: number;
  currency: string;
}

// Transfer specific fields
export interface Transfer extends Product {
  type: 'transfer';
  from_location: string;
  to_location: string;
  distance?: number; // in km
  estimated_duration?: number; // in minutes
  vehicles?: TransferVehicle[];
}

export interface TransferVehicle {
  id: string;
  type: string;
  name: string;
  max_passengers: number;
  max_luggage: number;
  base_price: number;
  currency: string;
  description?: string;
}

// Search and filter interfaces
export interface ProductSearchCriteria {
  type?: ProductType;
  status?: ProductStatus;
  category?: string;
  location?: string;
  price_min?: number;
  price_max?: number;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export interface ProductListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: Product[];
} 