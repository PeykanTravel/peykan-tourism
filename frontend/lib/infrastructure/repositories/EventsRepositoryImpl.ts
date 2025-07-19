import { EventsRepository } from '../../domain/repositories/EventsRepository';
import { eventsApi } from '../api/events';
import { 
  Event, EventListResponse, EventDetailResponse, 
  EventSearchParams, EventBookingRequest, EventReview,
  EventCategory, Venue, Artist, EventPerformance,
  EventPricingRequest, EventPricingBreakdown,
  EventSeatMap, EventAvailabilityCalendar,
  EventSeatReservation
} from '../../types/api';
import { ApiResponse, PaginatedResponse } from '../../domain/entities/Common';

export class EventsRepositoryImpl implements EventsRepository {
  // Event Categories
  async getEventCategories(): Promise<ApiResponse<EventCategory[]>> {
    try {
      const data = await eventsApi.getEventCategories();
      return {
        success: true,
        data,
        message: 'Event categories retrieved successfully',
        status: 200
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to get event categories',
        errors: [error.message || 'Failed to get event categories'],
        status: error.status || 500
      };
    }
  }
  
  // Venues
  async getVenues(params?: {
    search?: string;
    city?: string;
    country?: string;
  }): Promise<ApiResponse<Venue[]>> {
    try {
      const data = await eventsApi.getVenues(params);
      return {
        success: true,
        data,
        message: 'Venues retrieved successfully',
        status: 200
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to get venues',
        errors: [error.message || 'Failed to get venues'],
        status: error.status || 500
      };
    }
  }
  
  // Artists
  async getArtists(params?: {
    search?: string;
  }): Promise<ApiResponse<Artist[]>> {
    try {
      const data = await eventsApi.getArtists(params);
      return {
        success: true,
        data,
        message: 'Artists retrieved successfully',
        status: 200
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to get artists',
        errors: [error.message || 'Failed to get artists'],
        status: error.status || 500
      };
    }
  }
  
  // Events
  async getEvents(params?: {
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
  }): Promise<PaginatedResponse<Event>> {
    try {
      const response = await eventsApi.getEvents(params);
      return {
        count: response.count,
        next: response.next,
        previous: response.previous,
        results: response.results
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get events');
    }
  }
  
  async searchEvents(searchParams: EventSearchParams): Promise<PaginatedResponse<Event>> {
    try {
      const response = await eventsApi.searchEvents(searchParams);
      return {
        count: response.count,
        next: response.next,
        previous: response.previous,
        results: response.results
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to search events');
    }
  }
  
  async getEventBySlug(slug: string): Promise<ApiResponse<Event>> {
    try {
      const response = await eventsApi.getEventBySlug(slug);
      return {
        success: true,
        data: response,
        message: 'Event retrieved successfully',
        status: 200
      };
    } catch (error: any) {
      return {
        success: false,
        data: null as any,
        message: error.message || 'Failed to get event',
        errors: [error.message || 'Failed to get event'],
        status: error.status || 500
      };
    }
  }
  
  async getEventById(id: string): Promise<ApiResponse<Event>> {
    try {
      const response = await eventsApi.getEventById(id);
      return {
        success: true,
        data: response,
        message: 'Event retrieved successfully',
        status: 200
      };
    } catch (error: any) {
      return {
        success: false,
        data: null as any,
        message: error.message || 'Failed to get event',
        errors: [error.message || 'Failed to get event'],
        status: error.status || 500
      };
    }
  }
  
  // Event Performances
  async getEventPerformancesDetailed(eventId: string): Promise<ApiResponse<{
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
  }>> {
    try {
      const data = await eventsApi.getEventPerformancesDetailed(eventId);
      return {
        success: true,
        data,
        message: 'Event performances retrieved successfully',
        status: 200
      };
    } catch (error: any) {
      return {
        success: false,
        data: null as any,
        message: error.message || 'Failed to get event performances',
        errors: [error.message || 'Failed to get event performances'],
        status: error.status || 500
      };
    }
  }
  
  async getEventAvailabilityCalendar(eventId: string): Promise<ApiResponse<EventAvailabilityCalendar>> {
    try {
      const data = await eventsApi.getEventAvailabilityCalendar(eventId);
      return {
        success: true,
        data,
        message: 'Event availability calendar retrieved successfully',
        status: 200
      };
    } catch (error: any) {
      return {
        success: false,
        data: null as any,
        message: error.message || 'Failed to get event availability calendar',
        errors: [error.message || 'Failed to get event availability calendar'],
        status: error.status || 500
      };
    }
  }
  
  // Event Pricing
  async calculateEventPricing(
    eventId: string,
    pricingRequest: EventPricingRequest
  ): Promise<ApiResponse<{
    event_id: string;
    performance_id: string;
    pricing_breakdown: EventPricingBreakdown;
    calculation_timestamp: string;
  }>> {
    try {
      const data = await eventsApi.calculateEventPricing(eventId, pricingRequest);
      return {
        success: true,
        data,
        message: 'Event pricing calculated successfully',
        status: 200
      };
    } catch (error: any) {
      return {
        success: false,
        data: null as any,
        message: error.message || 'Failed to calculate event pricing',
        errors: [error.message || 'Failed to calculate event pricing'],
        status: error.status || 500
      };
    }
  }
  
  async getEventOptions(eventId: string): Promise<ApiResponse<{
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
  }>> {
    try {
      const data = await eventsApi.getEventOptions(eventId);
      return {
        success: true,
        data,
        message: 'Event options retrieved successfully',
        status: 200
      };
    } catch (error: any) {
      return {
        success: false,
        data: null as any,
        message: error.message || 'Failed to get event options',
        errors: [error.message || 'Failed to get event options'],
        status: error.status || 500
      };
    }
  }
  
  // Seat Management
  async getEventSeatMap(
    eventId: string,
    performanceId: string
  ): Promise<ApiResponse<EventSeatMap>> {
    try {
      const data = await eventsApi.getEventSeatMap(eventId, performanceId);
      return {
        success: true,
        data,
        message: 'Event seat map retrieved successfully',
        status: 200
      };
    } catch (error: any) {
      return {
        success: false,
        data: null as any,
        message: error.message || 'Failed to get event seat map',
        errors: [error.message || 'Failed to get event seat map'],
        status: error.status || 500
      };
    }
  }
  
  async reserveEventSeats(
    eventId: string,
    reservation: EventSeatReservation
  ): Promise<ApiResponse<{
    message: string;
    reservation_id: string;
    expires_at: string;
  }>> {
    try {
      const data = await eventsApi.reserveEventSeats(eventId, reservation);
      return {
        success: true,
        data,
        message: 'Event seats reserved successfully',
        status: 200
      };
    } catch (error: any) {
      return {
        success: false,
        data: null as any,
        message: error.message || 'Failed to reserve event seats',
        errors: [error.message || 'Failed to reserve event seats'],
        status: error.status || 500
      };
    }
  }
  
  // Event Reviews
  async getEventReviews(
    eventId: string, 
    params?: {
      page?: number;
      page_size?: number;
      ordering?: string;
    }
  ): Promise<PaginatedResponse<EventReview>> {
    try {
      return await eventsApi.getEventReviews(eventId, params);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get event reviews');
    }
  }
  
  async addEventReview(
    eventId: string, 
    reviewData: {
      rating: number;
      title: string;
      comment: string;
    }
  ): Promise<ApiResponse<EventReview>> {
    try {
      const data = await eventsApi.addEventReview(eventId, reviewData);
      return {
        success: true,
        data,
        message: 'Event review added successfully',
        status: 200
      };
    } catch (error: any) {
      return {
        success: false,
        data: null as any,
        message: error.message || 'Failed to add event review',
        errors: [error.message || 'Failed to add event review'],
        status: error.status || 500
      };
    }
  }
  
  // Event Booking
  async bookEvent(
    eventId: string, 
    bookingData: EventBookingRequest
  ): Promise<ApiResponse<{
    message: string;
    event_id: string;
    booking_data: EventBookingRequest;
  }>> {
    try {
      const data = await eventsApi.bookEvent(eventId, bookingData);
      return {
        success: true,
        data,
        message: 'Event booked successfully',
        status: 200
      };
    } catch (error: any) {
      return {
        success: false,
        data: null as any,
        message: error.message || 'Failed to book event',
        errors: [error.message || 'Failed to book event'],
        status: error.status || 500
      };
    }
  }
  
  // Event Filters
  async getEventFilters(): Promise<ApiResponse<{
    categories: EventCategory[];
    venues: Venue[];
    styles: Array<{ value: string; label: string }>;
  }>> {
    try {
      const data = await eventsApi.getEventFilters();
      return {
        success: true,
        data,
        message: 'Event filters retrieved successfully',
        status: 200
      };
    } catch (error: any) {
      return {
        success: false,
        data: { categories: [], venues: [], styles: [] },
        message: error.message || 'Failed to get event filters',
        errors: [error.message || 'Failed to get event filters'],
        status: error.status || 500
      };
    }
  }
  
  // Event Stats
  async getEventStats(eventId: string): Promise<ApiResponse<{
    average_rating: number;
    review_count: number;
    total_performances: number;
    upcoming_performances: number;
  }>> {
    try {
      const data = await eventsApi.getEventStats(eventId);
      return {
        success: true,
        data,
        message: 'Event stats retrieved successfully',
        status: 200
      };
    } catch (error: any) {
      return {
        success: false,
        data: null as any,
        message: error.message || 'Failed to get event stats',
        errors: [error.message || 'Failed to get event stats'],
        status: error.status || 500
      };
    }
  }
  
  // Cart Integration
  async addEventToCart(eventCartData: {
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
  }): Promise<ApiResponse<{
    message: string;
    cart_item_id: string;
    expires_at: string;
  }>> {
    try {
      const data = await eventsApi.addEventToCart(eventCartData);
      return {
        success: true,
        data,
        message: 'Event added to cart successfully',
        status: 200
      };
    } catch (error: any) {
      return {
        success: false,
        data: null as any,
        message: error.message || 'Failed to add event to cart',
        errors: [error.message || 'Failed to add event to cart'],
        status: error.status || 500
      };
    }
  }
} 