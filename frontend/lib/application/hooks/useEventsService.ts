import { useState, useCallback } from 'react';
import { Event, EventPerformance, EventPricingBreakdown } from '@/lib/types/api';
import { apiClient } from '@/lib/infrastructure/api/apiClient';

interface EventFilters {
  category?: string;
  venue?: string;
  style?: string;
  city?: string;
  date_from?: string;
  date_to?: string;
  price_min?: number;
  price_max?: number;
}

interface PricingRequest {
  event_id: string;
  performance_id: string;
  section_name: string;
  ticket_type_id: string;
  quantity: number;
  selected_options?: Array<{
    option_id: string;
    quantity: number;
  }>;
  discount_code?: string;
  user_currency?: string;
}

interface CartRequest {
  event_id: string;
  performance_id: string;
  section_name: string;
  ticket_type_id: string;
  quantity: number;
  selected_seats: string[];
  selected_options?: Array<{
    option_id: string;
    quantity: number;
  }>;
}

export function useEventsService() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getEvents = useCallback(async (filters?: EventFilters): Promise<Event[]> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }
      
      const response = await apiClient.get(`/events/?${params.toString()}`);
      return response.data.results || response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch events';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getEventBySlug = useCallback(async (slug: string): Promise<Event> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.get(`/events/${slug}/`);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch event';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchEvents = useCallback(async (query: string, filters?: EventFilters): Promise<Event[]> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('query', query);
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }
      
      const response = await apiClient.get(`/events/search/?${params.toString()}`);
      return response.data.results || response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search events';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getEventPerformances = useCallback(async (eventId: string): Promise<EventPerformance[]> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.get(`/events/${eventId}/performances/`);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch performances';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPerformanceSeats = useCallback(async (performanceId: string): Promise<any> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.get(`/events/performances/${performanceId}/seats/`);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch seats';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const calculateEventPricing = useCallback(async (request: PricingRequest): Promise<EventPricingBreakdown> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.post(`/events/${request.event_id}/calculate_pricing/`, request);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate pricing';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addEventToCart = useCallback(async (request: CartRequest): Promise<any> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.post('/cart/add_event/', request);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add event to cart';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getEventCategories = useCallback(async (): Promise<any[]> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.get('/events/categories/');
      return response.data.results || response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getEventVenues = useCallback(async (): Promise<any[]> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.get('/events/venues/');
      return response.data.results || response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch venues';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getEventArtists = useCallback(async (): Promise<any[]> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.get('/events/artists/');
      return response.data.results || response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch artists';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getEventReviews = useCallback(async (eventId: string): Promise<any[]> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.get(`/events/${eventId}/reviews/`);
      return response.data.results || response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch reviews';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addEventReview = useCallback(async (eventId: string, review: any): Promise<any> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.post(`/events/${eventId}/add_review/`, review);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add review';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getEventCapacity = useCallback(async (eventId: string): Promise<any> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.get(`/events/${eventId}/capacity_info/`);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch capacity info';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reserveSeats = useCallback(async (performanceId: string, request: any): Promise<any> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.post(`/events/capacity/${performanceId}/reserve_seats/`, request);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reserve seats';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAvailableSeats = useCallback(async (performanceId: string, filters?: any): Promise<any> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }
      
      const response = await apiClient.get(`/events/capacity/${performanceId}/available_seats/?${params.toString()}`);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch available seats';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const validateDiscountCode = useCallback(async (eventId: string, code: string): Promise<any> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.post(`/events/discounts/validate_code/`, {
        event_id: eventId,
        code: code
      });
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate discount code';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Data fetching
    getEvents,
    getEventBySlug,
    searchEvents,
    getEventPerformances,
    getPerformanceSeats,
    getEventCategories,
    getEventVenues,
    getEventArtists,
    getEventReviews,
    getEventCapacity,
    getAvailableSeats,
    
    // Actions
    calculateEventPricing,
    addEventToCart,
    addEventReview,
    reserveSeats,
    validateDiscountCode,
    
    // State
    isLoading,
    error,
    clearError
  };
} 