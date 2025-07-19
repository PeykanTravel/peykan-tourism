import { apiClient } from '@/lib/infrastructure/api/client';
import { TransferRoute, TransferBooking, TransferOption, TransferPricingRequest, TransferPricingResult, TransferBookingRequest } from '@/lib/types/api';

export class TransfersService {
  // Routes
  static async getRoutes(filters?: {
    origin?: string;
    destination?: string;
    is_popular?: boolean;
  }): Promise<TransferRoute[]> {
    const params = new URLSearchParams();
    if (filters?.origin) params.append('origin', filters.origin);
    if (filters?.destination) params.append('destination', filters.destination);
    if (filters?.is_popular) params.append('is_popular', 'true');

    const response = await apiClient.get<TransferRoute[]>(`/transfers/routes/?${params.toString()}`);
    return response;
  }

  static async getRouteBySlug(slug: string): Promise<TransferRoute> {
    const response = await apiClient.get<TransferRoute>(`/transfers/routes/by-slug/${slug}/`);
    return response;
  }

  static async getRouteById(id: string): Promise<TransferRoute> {
    const response = await apiClient.get<TransferRoute>(`/transfers/routes/${id}/`);
    return response;
  }

  static async getPopularRoutes(): Promise<TransferRoute[]> {
    const response = await apiClient.get<TransferRoute[]>('/transfers/routes/popular/');
    return response;
  }

  static async searchRoutes(query: string, filters?: {
    origin?: string;
    destination?: string;
    vehicle_type?: string;
    min_price?: number;
    max_price?: number;
    sort_by?: string;
  }): Promise<TransferRoute[]> {
    const searchData = {
      query,
      ...filters
    };
    const response = await apiClient.post<TransferRoute[]>('/transfers/routes/search/', searchData);
    return response;
  }

  // Pricing
  static async calculatePricing(request: TransferPricingRequest): Promise<TransferPricingResult> {
    const response = await apiClient.post<TransferPricingResult>('/transfers/calculate-price/', request);
    return response;
  }

  static async calculateRoutePricing(routeId: string, request: TransferPricingRequest): Promise<TransferPricingResult> {
    const response = await apiClient.post<TransferPricingResult>(`/transfers/routes/${routeId}/calculate_price/`, request);
    return response;
  }

  // Options
  static async getOptions(filters?: {
    option_type?: string;
  }): Promise<TransferOption[]> {
    const params = new URLSearchParams();
    if (filters?.option_type) params.append('option_type', filters.option_type);

    const response = await apiClient.get<TransferOption[]>(`/transfers/options/?${params.toString()}`);
    return response;
  }

  // Bookings
  static async createBooking(request: TransferBookingRequest): Promise<TransferBooking> {
    const response = await apiClient.post<TransferBooking>('/transfers/bookings/', request);
    return response;
  }

  static async getBookings(filters?: {
    status?: string;
    trip_type?: string;
  }): Promise<TransferBooking[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.trip_type) params.append('trip_type', filters.trip_type);

    const response = await apiClient.get<TransferBooking[]>(`/transfers/bookings/?${params.toString()}`);
    return response;
  }

  static async getBookingById(id: string): Promise<TransferBooking> {
    const response = await apiClient.get<TransferBooking>(`/transfers/bookings/${id}/`);
    return response;
  }

  static async cancelBooking(id: string): Promise<TransferBooking> {
    const response = await apiClient.post<TransferBooking>(`/transfers/bookings/${id}/cancel/`);
    return response;
  }

  static async getUpcomingBookings(): Promise<TransferBooking[]> {
    const response = await apiClient.get<TransferBooking[]>('/transfers/bookings/upcoming/');
    return response;
  }

  static async getBookingHistory(): Promise<TransferBooking[]> {
    const response = await apiClient.get<TransferBooking[]>('/transfers/bookings/history/');
    return response;
  }

  // Add to cart
  static async addToCart(transferData: {
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
  }): Promise<any> {
    const response = await apiClient.post<any>('/cart/add-transfer/', transferData);
    return response;
  }
} 