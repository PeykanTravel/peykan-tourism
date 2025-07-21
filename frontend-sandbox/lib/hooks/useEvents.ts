/**
 * SWR hooks for Event data management.
 */

import { useCustomHook, useDataHookWithParams } from './hookFactory';
import { 
  Event, EventListResponse, EventDetailResponse, 
  EventSearchParams, EventBookingRequest, EventReview,
  EventCategory, Venue, Artist, EventPerformance
} from '../types/api';
import * as eventsApi from '../api/events';

// Event Categories
export const useEventCategories = () => {
  return useCustomHook<EventCategory[]>(
    'event-categories',
    () => eventsApi.getEventCategories()
  );
};

// Venues
export const useVenues = (
  params?: {
    search?: string;
    city?: string;
    country?: string;
  }
) => {
  const key = params ? ['venues', params] : 'venues';
  
  return useCustomHook<Venue[]>(
    key,
    () => eventsApi.getVenues(params)
  );
};

// Artists
export const useArtists = (
  params?: {
    search?: string;
  }
) => {
  const key = params ? ['artists', params] : 'artists';
  
  return useCustomHook<Artist[]>(
    key,
    () => eventsApi.getArtists(params)
  );
};

// Events List
export const useEvents = (
  params?: {
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
  }
) => {
  const key = params ? ['events', params] : 'events';
  
  return useCustomHook<EventListResponse>(
    key,
    () => eventsApi.getEvents(params)
  );
};

// Event Search
export const useEventSearch = (
  searchParams: EventSearchParams
) => {
  const key = ['event-search', searchParams];
  
  return useCustomHook<EventListResponse>(
    key,
    () => eventsApi.searchEvents(searchParams)
  );
};

// Event Detail by Slug
export const useEventBySlug = (
  slug: string
) => {
  return useCustomHook<EventDetailResponse>(
    slug ? ['event', slug] : null,
    () => eventsApi.getEventBySlug(slug)
  );
};

// Event Detail by ID
export const useEventById = (
  id: string
) => {
  return useCustomHook<EventDetailResponse>(
    id ? ['event', id] : null,
    () => eventsApi.getEventById(id)
  );
};

// Event Performances
export const useEventPerformances = (
  eventId: string
) => {
  return useCustomHook<{
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
  }>(
    eventId ? ['event-performances', eventId] : null,
    () => eventsApi.getEventPerformancesDetailed(eventId)
  );
};

// Event Reviews
export const useEventReviews = (
  eventId: string,
  params?: {
    page?: number;
    page_size?: number;
    ordering?: string;
  }
) => {
  const key = eventId ? ['event-reviews', eventId, params] : null;
  
  return useCustomHook<{
    count: number;
    next: string | null;
    previous: string | null;
    results: EventReview[];
  }>(
    key,
    () => eventsApi.getEventReviews(eventId, params)
  );
};

// Event Pricing
export const useEventPricing = (
  eventId: string
) => {
  return useCustomHook<{
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
  }>(
    eventId ? ['event-pricing', eventId] : null,
    () => eventsApi.getEventPricing(eventId)
  );
};

// Event Availability
export const useEventAvailability = (
  eventId: string
) => {
  return useCustomHook<{
    available_performances: EventPerformance[];
    is_available_today: boolean;
  }>(
    eventId ? ['event-availability', eventId] : null,
    () => eventsApi.getEventAvailability(eventId)
  );
};

// Event Filters
export const useEventFilters = () => {
  return useCustomHook<{
    categories: EventCategory[];
    venues: Venue[];
    styles: Array<{ value: string; label: string }>;
  }>(
    'event-filters',
    () => eventsApi.getEventFilters()
  );
};

// Event Stats
export const useEventStats = (
  eventId: string
) => {
  return useCustomHook<{
    average_rating: number;
    review_count: number;
    total_performances: number;
    upcoming_performances: number;
  }>(
    eventId ? ['event-stats', eventId] : null,
    () => eventsApi.getEventStats(eventId)
  );
};

// Event Mutations
export const useEventMutations = () => {
  const addReview = async (
    eventId: string,
    reviewData: {
      rating: number;
      title: string;
      comment: string;
    }
  ) => {
    try {
      const response = await eventsApi.addEventReview(eventId, reviewData);
      return { success: true, review: response };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to add review' 
      };
    }
  };

  const bookEvent = async (
    eventId: string,
    bookingData: EventBookingRequest
  ) => {
    try {
      const response = await eventsApi.bookEvent(eventId, bookingData);
      return { success: true, booking: response };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to book event' 
      };
    }
  };

  return {
    addReview,
    bookEvent,
  };
};

// Event Booking Hook
export const useEventBooking = (eventId: string) => {
  const { addReview, bookEvent } = useEventMutations();
  
  return {
    addReview: (reviewData: { rating: number; title: string; comment: string }) =>
      addReview(eventId, reviewData),
    bookEvent: (bookingData: EventBookingRequest) =>
      bookEvent(eventId, bookingData),
  };
};

// Event Search with Filters
export const useEventSearchWithFilters = (searchParams: EventSearchParams) => {
  const { data, error, isLoading, mutate } = useEventSearch(searchParams);
  
  return {
    events: data?.results || [],
    pagination: {
      count: data?.count || 0,
      next: data?.next,
      previous: data?.previous,
    },
    isLoading,
    error,
    mutate,
  };
}; 