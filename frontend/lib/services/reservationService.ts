/**
 * Reservation Service for Frontend
 * Handles all reservation-related API calls
 */

import { apiClient } from './apiClient';

// Types
export interface PricingRequest {
  product_type: 'event' | 'tour' | 'transfer';
  event_id?: string;
  performance_id?: string;
  selected_seats?: Array<{
    id: string;
    seat_number: string;
    row_number: string;
    section: string;
  }>;
  tour_id?: string;
  variant_id?: string;
  participants?: Record<string, number>;
  route_id?: string;
  vehicle_type?: string;
  trip_type?: string;
  passenger_count?: number;
  luggage_count?: number;
  selected_options: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  discount_code?: string;
}

export interface PricingResponse {
  base_price: number;
  variant_price: number;
  options_total: number;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  discount_amount: number;
  discount_code: string;
  breakdown: Record<string, any>;
}

export interface AvailabilityRequest {
  product_type: 'event' | 'tour' | 'transfer';
  event_id?: string;
  performance_id?: string;
  seat_ids?: string[];
  booking_date: string;
  booking_time: string;
  tour_id?: string;
  variant_id?: string;
  participants?: Record<string, number>;
  route_id?: string;
  vehicle_type?: string;
  trip_type?: string;
  passenger_count?: number;
  luggage_count?: number;
}

export interface AvailabilityResponse {
  available: boolean;
  message: string;
  details?: Record<string, any>;
}

export interface ReservationItem {
  product_type: 'event' | 'tour' | 'transfer';
  product_id: string;
  product_title: string;
  product_slug: string;
  booking_date: string;
  booking_time: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  currency: string;
  variant_id?: string;
  variant_name?: string;
  selected_options: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  options_total: number;
  booking_data: Record<string, any>;
}

export interface ReservationRequest {
  items: ReservationItem[];
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  special_requirements?: string;
}

export interface Reservation {
  id: string;
  reservation_number: string;
  status: 'draft' | 'confirmed' | 'cancelled' | 'completed' | 'expired';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  discount_amount: number;
  discount_code: string;
  special_requirements: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  items: ReservationItem[];
  history: Array<{
    from_status: string;
    to_status: string;
    changed_by_name: string;
    reason: string;
    created_at: string;
  }>;
}

export interface ReservationListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Reservation[];
}

class ReservationService {
  private baseUrl = '/api/v1/reservations';

  /**
   * Calculate pricing for a reservation
   */
  async calculatePricing(data: PricingRequest): Promise<PricingResponse> {
    const response = await apiClient.post(`${this.baseUrl}/calculate-pricing/`, data);
    return response.data;
  }

  /**
   * Check availability for a product
   */
  async checkAvailability(data: AvailabilityRequest): Promise<AvailabilityResponse> {
    const response = await apiClient.post(`${this.baseUrl}/check-availability/`, data);
    return response.data;
  }

  /**
   * Reserve capacity temporarily
   */
  async reserveCapacity(data: AvailabilityRequest): Promise<{ success: boolean; message: string; expires_at?: string }> {
    const response = await apiClient.post(`${this.baseUrl}/reserve-capacity/`, data);
    return response.data;
  }

  /**
   * Create a new reservation
   */
  async createReservation(data: ReservationRequest): Promise<Reservation> {
    const response = await apiClient.post(`${this.baseUrl}/create-reservation/`, data);
    return response.data;
  }

  /**
   * Get list of reservations
   */
  async getReservations(params?: {
    status?: string;
    product_type?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
  }): Promise<ReservationListResponse> {
    const response = await apiClient.get(`${this.baseUrl}/reservations/`, { params });
    return response.data;
  }

  /**
   * Get a specific reservation
   */
  async getReservation(id: string): Promise<Reservation> {
    const response = await apiClient.get(`${this.baseUrl}/reservations/${id}/`);
    return response.data;
  }

  /**
   * Confirm a reservation
   */
  async confirmReservation(id: string): Promise<{ message: string; status: string }> {
    const response = await apiClient.post(`${this.baseUrl}/reservations/${id}/confirm/`);
    return response.data;
  }

  /**
   * Cancel a reservation
   */
  async cancelReservation(id: string, reason?: string): Promise<{ message: string; status: string }> {
    const response = await apiClient.post(`${this.baseUrl}/reservations/${id}/cancel/`, { reason });
    return response.data;
  }

  /**
   * Update reservation status
   */
  async updateReservationStatus(
    id: string,
    status: string,
    reason?: string
  ): Promise<{ message: string; status: string }> {
    const response = await apiClient.post(`${this.baseUrl}/reservations/${id}/update_status/`, {
      status,
      reason,
    });
    return response.data;
  }

  /**
   * Get available seats for an event
   */
  async getAvailableSeats(eventId: string, performanceId: string): Promise<Array<{
    id: string;
    seat_number: string;
    row_number: string;
    section: string;
    price: number;
    status: string;
  }>> {
    const response = await apiClient.get(`/api/v1/events/${eventId}/performances/${performanceId}/seats/`);
    return response.data;
  }

  /**
   * Get available schedules for a tour
   */
  async getAvailableSchedules(
    tourId: string,
    variantId: string,
    startDate: string,
    endDate: string
  ): Promise<Array<{
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    available_capacity: number;
    max_capacity: number;
    meeting_point: string;
    start_location: string;
    price_per_person: number;
  }>> {
    const response = await apiClient.get(`/api/v1/tours/${tourId}/variants/${variantId}/schedules/`, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  }

  /**
   * Get available routes for transfers
   */
  async getAvailableRoutes(fromLocation: string, toLocation: string): Promise<Array<{
    id: string;
    from_location: string;
    to_location: string;
    distance: number;
    estimated_duration: number;
    base_price: number;
    is_popular: boolean;
  }>> {
    const response = await apiClient.get('/api/v1/transfers/routes/', {
      params: { from_location: fromLocation, to_location: toLocation },
    });
    return response.data;
  }

  /**
   * Get available vehicles for a route
   */
  async getAvailableVehicles(routeId: string, tripType: string): Promise<Array<{
    type: string;
    name: string;
    max_passengers: number;
    max_luggage: number;
    base_price: number;
    passenger_surcharge: number;
    luggage_surcharge: number;
    included_passengers: number;
    included_luggage: number;
    description: string;
  }>> {
    const response = await apiClient.get(`/api/v1/transfers/routes/${routeId}/vehicles/`, {
      params: { trip_type: tripType },
    });
    return response.data;
  }

  /**
   * Validate discount code
   */
  async validateDiscountCode(code: string, productType: string, productId: string): Promise<{
    valid: boolean;
    discount_amount: number;
    discount_type: string;
    message: string;
  }> {
    const response = await apiClient.post('/api/v1/discounts/validate/', {
      code,
      product_type: productType,
      product_id: productId,
    });
    return response.data;
  }

  /**
   * Get reservation statistics
   */
  async getReservationStats(): Promise<{
    total_reservations: number;
    confirmed_reservations: number;
    pending_reservations: number;
    cancelled_reservations: number;
    total_revenue: number;
  }> {
    const response = await apiClient.get(`${this.baseUrl}/reservations/stats/`);
    return response.data;
  }

  /**
   * Export reservations to CSV
   */
  async exportReservations(params?: {
    status?: string;
    date_from?: string;
    date_to?: string;
    product_type?: string;
  }): Promise<Blob> {
    const response = await apiClient.get(`${this.baseUrl}/reservations/export/`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Send reservation reminder
   */
  async sendReminder(reservationId: string): Promise<{ message: string }> {
    const response = await apiClient.post(`${this.baseUrl}/reservations/${reservationId}/send-reminder/`);
    return response.data;
  }

  /**
   * Get reservation timeline
   */
  async getReservationTimeline(reservationId: string): Promise<Array<{
    action: string;
    timestamp: string;
    user: string;
    details: string;
  }>> {
    const response = await apiClient.get(`${this.baseUrl}/reservations/${reservationId}/timeline/`);
    return response.data;
  }
}

// Export singleton instance
export const reservationService = new ReservationService(); 