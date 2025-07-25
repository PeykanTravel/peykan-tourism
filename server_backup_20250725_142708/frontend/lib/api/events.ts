/**
 * Event API utilities for Peykan Tourism Platform.
 */

import { apiClient } from './client';
import { 
  Event, EventListResponse, EventDetailResponse, 
  EventSearchParams, EventBookingRequest, EventReview,
  EventCategory, Venue, Artist, EventPerformance,
  EventPricingRequest, EventPricingBreakdown,
  EventSeatMap, EventAvailabilityCalendar,
  EventSeatReservation
} from '../types/api';

// Event Categories
export const getEventCategories = async (): Promise<EventCategory[]> => {
  const response = await apiClient.get('/events/categories/');
  return response.data;
};

// Venues
export const getVenues = async (params?: {
  search?: string;
  city?: string;
  country?: string;
}): Promise<Venue[]> => {
  const response = await apiClient.get('/events/venues/', { params });
  return response.data;
};

// Artists
export const getArtists = async (params?: {
  search?: string;
}): Promise<Artist[]> => {
  const response = await apiClient.get('/events/artists/', { params });
  return response.data;
};

// Enhanced Events API
export const getEvents = async (params?: {
  search?: string;
  category?: string;
  venue?: string;
  style?: string;
  min_price?: number;
  max_price?: number;
  date_from?: string;
  date_to?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}): Promise<EventListResponse> => {
  const response = await apiClient.get('/events/events/', { params });
  return response.data;
};

export const searchEvents = async (searchParams: EventSearchParams): Promise<EventListResponse> => {
  const response = await apiClient.get('/events/events/search/', { 
    params: searchParams 
  });
  return response.data;
};

export const getEventBySlug = async (slug: string): Promise<EventDetailResponse> => {
  try {
    const response = await apiClient.get(`/events/events/${slug}/`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching event by slug:', error);
    
    // Handle specific error types
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw new Error('Request timeout: The server is taking too long to respond. Please try again.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Event not found');
    }
    
    if (error.response?.status >= 500) {
      throw new Error('Server error: Please try again later');
    }
    
    // Re-throw the original error if it's not handled
    throw error;
  }
};

export const getEventById = async (id: string): Promise<EventDetailResponse> => {
  try {
    const response = await apiClient.get(`/events/events/${id}/`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching event by ID:', error);
    
    // Handle specific error types
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw new Error('Request timeout: The server is taking too long to respond. Please try again.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Event not found');
    }
    
    if (error.response?.status >= 500) {
      throw new Error('Server error: Please try again later');
    }
    
    // Re-throw the original error if it's not handled
    throw error;
  }
};

// Enhanced Performance APIs
export const getEventPerformancesDetailed = async (eventId: string): Promise<{
  event_id: string;
  performances: Array<{
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    is_available: boolean;
    capacity_summary: any;
    available_sections: any[];
    booking_cutoff: string;
  }>;
}> => {
  const response = await apiClient.get(`/events/events/${eventId}/performances-detailed/`);
  return response.data;
};

export const getEventAvailabilityCalendar = async (eventId: string): Promise<EventAvailabilityCalendar> => {
  const response = await apiClient.get(`/events/events/${eventId}/availability-calendar/`);
  return response.data;
};

// Enhanced Pricing APIs
export const calculateEventPricing = async (
  eventId: string,
  pricingRequest: EventPricingRequest
): Promise<{
  event_id: string;
  performance_id: string;
  pricing_breakdown: EventPricingBreakdown;
  calculation_timestamp: string;
}> => {
  const response = await apiClient.post(`/events/events/${eventId}/calculate-pricing/`, pricingRequest);
  return response.data;
};

export const getEventOptions = async (eventId: string): Promise<{
  event_id: string;
  options: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    option_type: string;
    max_quantity: number;
    is_available: boolean;
  }>;
}> => {
  const response = await apiClient.get(`/events/events/${eventId}/available-options/`);
  return response.data;
};

// Enhanced Seat Management APIs
export const getEventSeatMap = async (
  eventId: string,
  performanceId: string
): Promise<EventSeatMap> => {
  const response = await apiClient.get(`/events/events/${eventId}/seat-map/`, {
    params: { performance_id: performanceId }
  });
  return response.data;
};

export const reserveEventSeats = async (
  eventId: string,
  reservation: EventSeatReservation
): Promise<{
  message: string;
  reservation_id: string;
  expires_at: string;
}> => {
  const response = await apiClient.post(`/events/events/${eventId}/reserve-seats/`, reservation);
  return response.data;
};

// Legacy seat API for backward compatibility
export const getPerformanceSeats = async (
  performanceId: string,
  params?: {
    section?: string;
    ticket_type_id?: string;
  }
): Promise<{
  performance_id: string;
  section?: string;
  ticket_type_id?: string;
  seats: Array<{
    id: string;
    seat_number: string;
    row_number: string;
    section: string;
    price: number;
    currency: string;
    is_wheelchair_accessible: boolean;
    is_premium: boolean;
  }>;
  total_count: number;
}> => {
  const response = await apiClient.get(`/events/events/performances/${performanceId}/seats/`, { params });
  return response.data;
};

// Enhanced Capacity APIs
export const getPerformanceCapacitySummary = async (performanceId: string): Promise<{
  performance: {
    max_capacity: number;
    current_capacity: number;
    available_capacity: number;
    occupancy_rate: number;
  };
  sections: Array<{
    name: string;
    total_capacity: number;
    available_capacity: number;
    reserved_capacity: number;
    sold_capacity: number;
    occupancy_rate: number;
    ticket_types: Array<{
      name: string;
      allocated_capacity: number;
      available_capacity: number;
      reserved_capacity: number;
      sold_capacity: number;
      final_price: number;
    }>;
  }>;
}> => {
  const response = await apiClient.get(`/events/performances/${performanceId}/capacity-summary/`);
  return response.data;
};

export const getPerformanceAvailableSeats = async (performanceId: string): Promise<{
  performance_id: string;
  available_seats: Array<{
    id: string;
    section: {
      id: string;
      name: string;
    };
    ticket_type: {
      id: string;
      name: string;
      description: string;
      ticket_type: string;
      benefits: string[];
    };
    allocated_capacity: number;
    available_capacity: number;
    reserved_capacity: number;
    sold_capacity: number;
    price_modifier: number;
    final_price: number;
  }>;
}> => {
  const response = await apiClient.get(`/events/performances/${performanceId}/available-seats/`);
  return response.data;
};

// Enhanced Event Reviews
export const getEventReviews = async (
  eventId: string, 
  params?: {
    page?: number;
    page_size?: number;
    ordering?: string;
  }
): Promise<{
  count: number;
  next: string | null;
  previous: string | null;
  results: EventReview[];
}> => {
  const response = await apiClient.get(`/events/events/${eventId}/reviews/`, { params });
  return response.data;
};

export const addEventReview = async (
  eventId: string, 
  reviewData: {
    rating: number;
    title: string;
    comment: string;
  }
): Promise<EventReview> => {
  const response = await apiClient.post(`/events/events/${eventId}/add_review/`, reviewData);
  return response.data;
};

// Enhanced Event Booking
export const bookEvent = async (
  eventId: string, 
  bookingData: EventBookingRequest
): Promise<{
  message: string;
  event_id: string;
  booking_data: EventBookingRequest;
}> => {
  const response = await apiClient.post(`/events/events/${eventId}/book/`, bookingData);
  return response.data;
};

// Event Sections
export const getEventSections = async (performanceId: string): Promise<{
  sections: Array<{
    id: string;
    name: string;
    description: string;
    total_capacity: number;
    available_capacity: number;
    reserved_capacity: number;
    sold_capacity: number;
    base_price: number;
    currency: string;
    is_wheelchair_accessible: boolean;
    is_premium: boolean;
  }>;
}> => {
  const response = await apiClient.get(`/events/performances/${performanceId}/sections/`);
  return response.data;
};

// Section Ticket Types
export const getSectionTicketTypes = async (sectionId: string): Promise<{
  ticket_types: Array<{
    id: string;
    section: {
      id: string;
      name: string;
    };
    ticket_type: {
      id: string;
      name: string;
      description: string;
      ticket_type: string;
      benefits: string[];
      age_min?: number;
      age_max?: number;
    };
    allocated_capacity: number;
    available_capacity: number;
    reserved_capacity: number;
    sold_capacity: number;
    price_modifier: number;
    final_price: number;
  }>;
}> => {
  const response = await apiClient.get(`/events/sections/${sectionId}/ticket-types/`);
  return response.data;
};

// Event Pricing with new system
export const getEventPricing = async (eventId: string): Promise<{
  pricing_summary: Record<string, {
    ticket_type_name: string;
    ticket_type_code: string;
    base_price: number;
    modified_price: number;
    price_modifier: number;
    capacity: number;
    benefits: string[];
    age_min?: number;
    age_max?: number;
  }>;
  pricing_breakdown: {
    base_price: number;
    options_total: number;
    discounts_total: number;
    fees_total: number;
    taxes_total: number;
    grand_total: number;
    currency: string;
    breakdown: {
      options: Array<{
        name: string;
        price: number;
        quantity: number;
        total: number;
      }>;
      discounts: Array<{
        name: string;
        type: string;
        value: number;
        amount: number;
      }>;
      fees: Array<{
        name: string;
        type: string;
        value: number;
        amount: number;
      }>;
    };
  };
}> => {
  const event = await getEventById(eventId);
  
  // Get base price from pricing summary
  const pricingSummaryValues = Object.values(event.pricing_summary || {});
  const basePrice = pricingSummaryValues.length > 0 ? pricingSummaryValues[0].base_price : 0;
  
  // Mock pricing breakdown (will be replaced with actual API call)
  const pricing_breakdown = {
    base_price: basePrice,
    options_total: 0,
    discounts_total: 0,
    fees_total: 0,
    taxes_total: 0,
    grand_total: basePrice,
    currency: 'USD',
    breakdown: {
      options: [],
      discounts: [],
      fees: [],
    },
  };
  
  return {
    pricing_summary: event.pricing_summary,
    pricing_breakdown
  };
};

export const getEventAvailability = async (eventId: string): Promise<{
  available_performances: EventPerformance[];
  is_available_today: boolean;
}> => {
  const event = await getEventById(eventId);
  return {
    available_performances: event.available_performances || [],
    is_available_today: event.is_available_today || false
  };
};

// Event filters and search utilities
export const getEventFilters = async (): Promise<{
  categories: EventCategory[];
  venues: Venue[];
  styles: Array<{ value: string; label: string }>;
}> => {
  const response = await apiClient.get('/events/filters/');
  const data = response.data || {};
  return {
    categories: Array.isArray(data.categories) ? data.categories : [],
    venues: Array.isArray(data.venues) ? data.venues : [],
    styles: Array.isArray(data.styles) ? data.styles : [],
  };
};

// Event statistics
export const getEventStats = async (eventId: string): Promise<{
  average_rating: number;
  review_count: number;
  total_performances: number;
  upcoming_performances: number;
}> => {
  const response = await apiClient.get(`/events/events/${eventId}/stats/`);
  return response.data;
}; 

// Cart integration for events
export const addEventToCart = async (eventCartData: {
  event_id: string;
  performance_id: string;
  section_name: string;
  ticket_type_id: string;
  quantity: number;
  selected_seats?: string[];
  selected_options?: Array<{
    option_id: string;
    quantity: number;
  }>;
  special_requirements?: string;
}): Promise<{
  message: string;
  cart_item_id: string;
  expires_at: string;
}> => {
  const response = await apiClient.post('/cart/add-event/', eventCartData);
  return response.data;
}; 