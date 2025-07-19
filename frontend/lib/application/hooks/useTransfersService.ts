import { useState, useCallback } from 'react';
import { TransferRoute, TransferBooking, TransferOption, TransferPricingRequest, TransferPricingResult } from '@/lib/types/api';
import { apiClient } from '@/lib/infrastructure/api/client';

interface TransferFilters {
  origin?: string;
  destination?: string;
  vehicle_type?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: string;
}

interface TransferBookingRequest {
  route_id: string;
  vehicle_type: string;
  trip_type: 'one_way' | 'round_trip';
  outbound_date: string;
  outbound_time: string;
  return_date?: string;
  return_time?: string;
  passenger_count: number;
  luggage_count: number;
  pickup_address: string;
  pickup_instructions?: string;
  dropoff_address: string;
  dropoff_instructions?: string;
  contact_name: string;
  contact_phone: string;
  selected_options?: Array<{
    option_id: string;
    quantity: number;
  }>;
  special_requirements?: string;
}

export function useTransfersService() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRoutes = useCallback(async (filters?: TransferFilters): Promise<TransferRoute[]> => {
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
      
      const response = await apiClient.get<TransferRoute[]>(`/transfers/routes/?${params.toString()}`);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transfer routes';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRouteBySlug = useCallback(async (slug: string): Promise<TransferRoute> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.get<TransferRoute>(`/transfers/routes/by-slug/${slug}/`);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transfer route';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRouteById = useCallback(async (id: string): Promise<TransferRoute> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.get<TransferRoute>(`/transfers/routes/${id}/`);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transfer route';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPopularRoutes = useCallback(async (): Promise<TransferRoute[]> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.get<TransferRoute[]>('/transfers/routes/popular/');
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch popular routes';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchRoutes = useCallback(async (query: string, filters?: TransferFilters): Promise<TransferRoute[]> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const searchData = {
        query,
        ...filters
      };
      
      const response = await apiClient.post<TransferRoute[]>('/transfers/routes/search/', searchData);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search transfer routes';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const calculatePricing = useCallback(async (request: TransferPricingRequest): Promise<TransferPricingResult> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.post<TransferPricingResult>('/transfers/calculate-price/', request);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate pricing';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const calculateRoutePricing = useCallback(async (routeId: string, request: TransferPricingRequest): Promise<TransferPricingResult> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.post<TransferPricingResult>(`/transfers/routes/${routeId}/calculate_price/`, request);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate route pricing';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getOptions = useCallback(async (filters?: { option_type?: string }): Promise<TransferOption[]> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters?.option_type) params.append('option_type', filters.option_type);
      
      const response = await apiClient.get<TransferOption[]>(`/transfers/options/?${params.toString()}`);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transfer options';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createBooking = useCallback(async (request: TransferBookingRequest): Promise<TransferBooking> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.post<TransferBooking>('/transfers/bookings/', request);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getBookings = useCallback(async (filters?: { status?: string; trip_type?: string }): Promise<TransferBooking[]> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.trip_type) params.append('trip_type', filters.trip_type);
      
      const response = await apiClient.get<TransferBooking[]>(`/transfers/bookings/?${params.toString()}`);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch bookings';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getBookingById = useCallback(async (id: string): Promise<TransferBooking> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.get<TransferBooking>(`/transfers/bookings/${id}/`);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch booking';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelBooking = useCallback(async (id: string): Promise<TransferBooking> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.post<TransferBooking>(`/transfers/bookings/${id}/cancel/`);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel booking';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUpcomingBookings = useCallback(async (): Promise<TransferBooking[]> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.get<TransferBooking[]>('/transfers/bookings/upcoming/');
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch upcoming bookings';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getBookingHistory = useCallback(async (): Promise<TransferBooking[]> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.get<TransferBooking[]>('/transfers/bookings/history/');
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch booking history';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToCart = useCallback(async (transferData: {
    route_id: string;
    vehicle_type: string;
    trip_type: 'one_way' | 'round_trip';
    outbound_date: string;
    outbound_time: string;
    return_date?: string;
    return_time?: string;
    passenger_count: number;
    luggage_count: number;
    pickup_address: string;
    dropoff_address: string;
    contact_name: string;
    contact_phone: string;
    selected_options?: Array<{
      option_id: string;
      quantity: number;
    }>;
    pickup_instructions?: string;
    dropoff_instructions?: string;
    special_requirements?: string;
  }): Promise<any> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.post<any>('/cart/add-transfer/', transferData);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add transfer to cart';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // State
    isLoading,
    error,
    
    // Route operations
    getRoutes,
    getRouteBySlug,
    getRouteById,
    getPopularRoutes,
    searchRoutes,
    
    // Pricing operations
    calculatePricing,
    calculateRoutePricing,
    
    // Options operations
    getOptions,
    
    // Booking operations
    createBooking,
    getBookings,
    getBookingById,
    cancelBooking,
    getUpcomingBookings,
    getBookingHistory,
    
    // Cart operations
    addToCart,
  };
} 