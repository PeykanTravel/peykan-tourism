/**
 * Transfer API utilities for Peykan Tourism Platform.
 * Updated to match backend implementation.
 */

import { apiClient } from './client';

// Backend-aligned interfaces
export interface TransferRoutePricing {
  id: string;
  vehicle_type: string;
  vehicle_type_display: string;
  vehicle_name: string;
  vehicle_description: string;
  base_price: string;
  max_passengers: number;
  max_luggage: number;
  features: string[];
  amenities: string[];
  is_active: boolean;
}

export interface TransferRoute {
  id: string;
  name: string;
  description: string;
  origin: string;
  destination: string;
  slug: string;
  round_trip_discount_enabled: boolean;
  round_trip_discount_percentage: string;
  peak_hour_surcharge: string;
  midnight_surcharge: string;
  is_admin_selected: boolean;
  is_popular: boolean;
  popularity_score: number;
  booking_count: number;
  is_active: boolean;
  pricing: TransferRoutePricing[];
  created_at: string;
  origin_coordinates: Record<string, any>;
  destination_coordinates: Record<string, any>;
}

export interface TransferOption {
  id: string;
  name: string;
  description: string;
  option_type: string;
  option_type_display: string;
  price_type: string;
  price_type_display: string;
  price: string;
  price_percentage: string;
  max_quantity: number | null;
  is_active: boolean;
  created_at: string;
}

export interface PricingCalculationRequest {
  vehicle_type: string;
  trip_type: 'one_way' | 'round_trip';
  booking_time: string;
  return_time?: string;
  selected_options: Array<{
    option_id: string;
    quantity: number;
  }>;
}

export interface PricingCalculationResponse {
  price_breakdown: {
    base_price: number;
    outbound_price: number;
    outbound_surcharge: number;
    return_price: number;
    return_surcharge: number;
    options_total: number;
    round_trip_discount: number;
    final_price: number;
  };
  options_breakdown: Array<{
    option_id: string;
    name: string;
    price: number;
    quantity: number;
    total: number;
  }>;
  trip_info: {
    vehicle_type: string;
    is_round_trip: boolean;
    booking_time: string;
    return_time: string | null;
  };
  route_info: {
    origin: string;
    destination: string;
    name: string;
  };
  time_info: {
    booking_hour: number;
    time_category: string;
    surcharge_percentage: number;
  };
}

export interface TransferBookingRequest {
  route_id: string;
  vehicle_type: string;
  trip_type: 'one_way' | 'round_trip';
  outbound_datetime: string;
  return_datetime?: string;
  passenger_count: number;
  luggage_count: number;
  pickup_address: string;
  dropoff_address: string;
  contact_name: string;
  contact_phone: string;
  selected_options: Array<{
    option_id: string;
    quantity: number;
  }>;
  special_requirements?: string;
}

// API Functions

// Get all transfer routes
export const getTransferRoutes = async (params?: {
  search?: string;
  origin?: string;
  destination?: string;
}): Promise<{ count: number; next: string | null; previous: string | null; results: TransferRoute[] }> => {
  const response = await apiClient.get('/transfers/routes/', { params });
  return response.data;
};

// Get transfer route by ID
export const getTransferRoute = async (routeId: string): Promise<{ data: TransferRoute }> => {
  const response = await apiClient.get(`/transfers/routes/${routeId}/`);
  return response.data;
};

// Get popular routes
export const getPopularRoutes = async (): Promise<{ data: TransferRoute[] }> => {
  const response = await apiClient.get('/transfers/routes/popular/');
  return response.data;
};

// Calculate price for a route
export const calculateTransferPrice = async (
  routeId: string,
  request: PricingCalculationRequest
): Promise<PricingCalculationResponse> => {
  const response = await apiClient.post(`/transfers/routes/${routeId}/calculate_price/`, request);
  return response.data;
};

// Add transfer to cart
export const addTransferToCart = async (bookingData: TransferBookingRequest): Promise<{
  success: boolean;
  message: string;
  cart_item_id?: string;
}> => {
  try {
    const response = await apiClient.post('/cart/add/', {
      product_type: 'transfer',
      product_id: bookingData.route_id,
      quantity: 1,
      booking_data: bookingData
    });
    
    // Backend returns { message: "...", cart_item: {...} } format
    // Transform to expected { success: true, message: "...", cart_item_id: "..." } format
    return {
      success: true,
      message: response.data.message,
      cart_item_id: response.data.cart_item?.id
    };
  } catch (error: any) {
    // Handle API errors
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to add transfer to cart'
    };
  }
};

// Get transfer options
export const getTransferOptions = async (): Promise<{ count: number; next: string | null; previous: string | null; results: TransferOption[] }> => {
  const response = await apiClient.get('/transfers/options/');
  return response.data;
};

// Legacy functions for backward compatibility (to be removed)
export const getTransferLocations = async (params?: {
  search?: string;
  city?: string;
  country?: string;
}): Promise<any[]> => {
  console.warn('getTransferLocations is deprecated. Use getTransferRoutes instead.');
  return [];
};

export const getTransfers = async (params?: any): Promise<any> => {
  console.warn('getTransfers is deprecated. Use getTransferRoutes instead.');
  return { data: [], count: 0, next: null, previous: null };
};

export const searchTransfers = async (searchParams: any): Promise<any> => {
  console.warn('searchTransfers is deprecated. Use getTransferRoutes instead.');
  return { data: [], count: 0, next: null, previous: null };
};

export const getTransferBySlug = async (slug: string): Promise<any> => {
  console.warn('getTransferBySlug is deprecated. Use getTransferRoute instead.');
  throw new Error('Method deprecated');
};

export const getTransferById = async (id: string): Promise<any> => {
  console.warn('getTransferById is deprecated. Use getTransferRoute instead.');
  return getTransferRoute(id);
};

export const getTransferSchedules = async (transferId: string): Promise<any[]> => {
  console.warn('getTransferSchedules is deprecated. Schedules are not used in transfer routes.');
  return [];
};

export const bookTransfer = async (transferId: string, bookingData: any): Promise<any> => {
  console.warn('bookTransfer is deprecated. Use addTransferToCart instead.');
  return addTransferToCart(bookingData);
};

export const getTransferPricing = async (transferId: string): Promise<any> => {
  console.warn('getTransferPricing is deprecated. Use calculateTransferPrice instead.');
  const route = await getTransferRoute(transferId);
  return { pricing: route.data.pricing };
};

export const getTransferAvailability = async (transferId: string): Promise<any> => {
  console.warn('getTransferAvailability is deprecated. Transfers are always available.');
  return { available_schedules: [] };
};

export const getTransferFilters = async (): Promise<any> => {
  console.warn('getTransferFilters is deprecated.');
  return { locations: [], transfer_types: [], vehicle_types: [] };
};

export const getTransferStats = async (transferId: string): Promise<any> => {
  console.warn('getTransferStats is deprecated.');
  return { total_schedules: 0, upcoming_schedules: 0, available_capacity: 0 };
};

export const getRouteByLocations = async (
  pickupLocationId: string, 
  dropoffLocationId: string
): Promise<any[]> => {
  console.warn('getRouteByLocations is deprecated. Use getTransferRoutes with origin/destination params.');
  return [];
}; 