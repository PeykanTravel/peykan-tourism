/**
 * SWR hooks for Event data management.
 */

import useSWR, { SWRConfiguration, mutate } from 'swr';
import { 
  Event, EventListResponse, EventDetailResponse, 
  EventSearchParams, EventBookingRequest, EventReview,
  EventCategory, Venue, Artist, EventPerformance
} from '../types/api';
import * as eventsApi from '../api/events';

// Event Categories
export const useEventCategories = (config?: SWRConfiguration) => {
  return useSWR<EventCategory[]>(
    'event-categories',
    () => eventsApi.getEventCategories(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...config
    }
  );
};

// Venues
export const useVenues = (
  params?: {
    search?: string;
    city?: string;
    country?: string;
  },
  config?: SWRConfiguration
) => {
  const key = params ? ['venues', params] : 'venues';
  
  return useSWR<Venue[]>(
    key,
    () => eventsApi.getVenues(params),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...config
    }
  );
};

// Artists
export const useArtists = (
  params?: {
    search?: string;
  },
  config?: SWRConfiguration
) => {
  const key = params ? ['artists', params] : 'artists';
  
  return useSWR<Artist[]>(
    key,
    () => eventsApi.getArtists(params),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...config
    }
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
  },
  config?: SWRConfiguration
) => {
  const key = params ? ['events', params] : 'events';
  
  return useSWR<EventListResponse>(
    key,
    () => eventsApi.getEvents(params),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...config
    }
  );
};

// Event Search
export const useEventSearch = (
  searchParams: EventSearchParams,
  config?: SWRConfiguration
) => {
  const key = ['event-search', searchParams];
  
  return useSWR<EventListResponse>(
    key,
    () => eventsApi.searchEvents(searchParams),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...config
    }
  );
};

// Event Detail by Slug
export const useEventBySlug = (
  slug: string,
  config?: SWRConfiguration
) => {
  return useSWR<EventDetailResponse>(
    slug ? ['event', slug] : null,
    () => eventsApi.getEventBySlug(slug),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...config
    }
  );
};

// Event Detail by ID
export const useEventById = (
  id: string,
  config?: SWRConfiguration
) => {
  return useSWR<EventDetailResponse>(
    id ? ['event', id] : null,
    () => eventsApi.getEventById(id),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...config
    }
  );
};

// Event Performances
export const useEventPerformances = (
  eventId: string,
  config?: SWRConfiguration
) => {
  return useSWR<{
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
    () => eventsApi.getEventPerformancesDetailed(eventId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...config
    }
  );
};

// Event Reviews
export const useEventReviews = (
  eventId: string,
  params?: {
    page?: number;
    page_size?: number;
    ordering?: string;
  },
  config?: SWRConfiguration
) => {
  const key = eventId ? ['event-reviews', eventId, params] : null;
  
  return useSWR<{
    count: number;
    next: string | null;
    previous: string | null;
    results: EventReview[];
  }>(
    key,
    () => eventsApi.getEventReviews(eventId, params),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...config
    }
  );
};

// Event Pricing
export const useEventPricing = (
  eventId: string,
  config?: SWRConfiguration
) => {
  return useSWR<{
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
    () => eventsApi.getEventPricing(eventId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...config
    }
  );
};

// Event Availability
export const useEventAvailability = (
  eventId: string,
  config?: SWRConfiguration
) => {
  return useSWR<{
    available_performances: EventPerformance[];
    is_available_today: boolean;
  }>(
    eventId ? ['event-availability', eventId] : null,
    () => eventsApi.getEventAvailability(eventId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...config
    }
  );
};

// Event Filters
export const useEventFilters = (config?: SWRConfiguration) => {
  return useSWR<{
    categories: EventCategory[];
    venues: Venue[];
    styles: Array<{ value: string; label: string }>;
  }>(
    'event-filters',
    () => eventsApi.getEventFilters(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...config
    }
  );
};

// Event Statistics
export const useEventStats = (
  eventId: string,
  config?: SWRConfiguration
) => {
  return useSWR<{
    average_rating: number;
    review_count: number;
    total_performances: number;
    upcoming_performances: number;
  }>(
    eventId ? ['event-stats', eventId] : null,
    () => eventsApi.getEventStats(eventId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...config
    }
  );
};

// Mutations for Event actions
export const useEventMutations = () => {
  // Add review mutation
  const addReview = async (
    eventId: string,
    reviewData: {
      rating: number;
      title: string;
      comment: string;
    }
  ) => {
    try {
      const newReview = await eventsApi.addEventReview(eventId, reviewData);
      
      // Update the reviews cache
      await mutate(
        ['event-reviews', eventId],
        (current: any) => {
          if (!current) return current;
          return {
            ...current,
            count: current.count + 1,
            results: [newReview, ...current.results]
          };
        },
        false
      );
      
      // Update event stats
      await mutate(['event-stats', eventId]);
      
      return newReview;
    } catch (error) {
      throw error;
    }
  };

  // Book event mutation
  const bookEvent = async (
    eventId: string,
    bookingData: EventBookingRequest
  ) => {
    try {
      const result = await eventsApi.bookEvent(eventId, bookingData);
      
      // Invalidate related caches
      await mutate(['event', eventId]);
      await mutate(['event-availability', eventId]);
      await mutate(['event-performances', eventId]);
      
      return result;
    } catch (error) {
      throw error;
    }
  };

  return {
    addReview,
    bookEvent
  };
};

// Custom hook for event booking flow
export const useEventBooking = (eventId: string) => {
  const { data: event, error: eventError, isLoading: eventLoading } = useEventById(eventId);
  const { data: performances, error: performancesError, isLoading: performancesLoading } = useEventPerformances(eventId);
  const { data: pricing, error: pricingError, isLoading: pricingLoading } = useEventPricing(eventId);
  const { data: availability, error: availabilityError, isLoading: availabilityLoading } = useEventAvailability(eventId);
  const { bookEvent } = useEventMutations();

  const isLoading = eventLoading || performancesLoading || pricingLoading || availabilityLoading;
  const error = eventError || performancesError || pricingError || availabilityError;

  return {
    event,
    performances,
    pricing,
    availability,
    isLoading,
    error,
    bookEvent
  };
};

// Custom hook for event search with filters
export const useEventSearchWithFilters = (searchParams: EventSearchParams) => {
  const { data: filters, error: filtersError, isLoading: filtersLoading } = useEventFilters();
  const { data: searchResults, error: searchError, isLoading: searchLoading, mutate: mutateSearch } = useEventSearch(searchParams);

  const isLoading = filtersLoading || searchLoading;
  const error = filtersError || searchError;

  return {
    filters,
    searchResults,
    isLoading,
    error,
    mutateSearch
  };
}; 