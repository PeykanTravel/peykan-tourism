import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Event, EventCategory, Venue, Artist, EventReview,
  EventSearchParams, EventBookingRequest
} from '../../types/api';
import { PaginatedResponse } from '../../domain/entities/Common';
import { EventsService } from '../services/EventsService';
import { EventsRepositoryImpl } from '../../infrastructure/repositories/EventsRepositoryImpl';

// Create singleton instances
const eventsRepository = new EventsRepositoryImpl();
const eventsService = new EventsService(eventsRepository);

interface EventsState {
  // State
  events: {
    items: Event[];
    pagination: {
      page: number;
      totalPages: number;
      totalCount: number;
      hasMore: boolean;
    };
    filters: EventSearchParams;
    isLoading: boolean;
    error: string | null;
  };
  
  eventDetail: {
    currentEvent: Event | null;
    isLoading: boolean;
    error: string | null;
  };
  
  categories: {
    items: EventCategory[];
    isLoading: boolean;
    error: string | null;
  };
  
  venues: {
    items: Venue[];
    isLoading: boolean;
    error: string | null;
  };
  
  artists: {
    items: Artist[];
    isLoading: boolean;
    error: string | null;
  };
  
  filters: {
    categories: EventCategory[];
    venues: Venue[];
    styles: Array<{ value: string; label: string }>;
    isLoading: boolean;
    error: string | null;
  };
  
  reviews: {
    items: EventReview[];
    pagination: {
      page: number;
      totalPages: number;
      totalCount: number;
      hasMore: boolean;
    };
    isLoading: boolean;
    error: string | null;
  };
  
  recentlyViewed: Event[];
  wishlist: Event[];
  
  // Actions
  // Events
  loadEvents: (filters?: EventSearchParams, page?: number) => Promise<void>;
  loadMoreEvents: () => Promise<void>;
  getEventBySlug: (slug: string) => Promise<Event | null>;
  getEventById: (id: string) => Promise<Event | null>;
  setEventFilters: (filters: EventSearchParams) => void;
  clearEventFilters: () => void;
  
  // Categories
  loadEventCategories: () => Promise<void>;
  
  // Venues
  loadVenues: (params?: { search?: string; city?: string; country?: string }) => Promise<void>;
  
  // Artists
  loadArtists: (params?: { search?: string }) => Promise<void>;
  
  // Filters
  loadEventFilters: () => Promise<void>;
  
  // Reviews
  loadEventReviews: (eventId: string, page?: number) => Promise<void>;
  addEventReview: (eventId: string, review: { rating: number; title: string; comment: string }) => Promise<void>;
  
  // Wishlist
  addToWishlist: (event: Event) => void;
  removeFromWishlist: (eventId: string) => void;
  isInWishlist: (eventId: string) => boolean;
  
  // Recently Viewed
  addToRecentlyViewed: (event: Event) => void;
  clearRecentlyViewed: () => void;
  
  // Utilities
  clearErrors: () => void;
}

export const useEventsStore = create<EventsState>()(
  persist(
    (set, get) => ({
      // Initial State
      events: {
        items: [],
        pagination: {
          page: 1,
          totalPages: 1,
          totalCount: 0,
          hasMore: false,
        },
        filters: {},
        isLoading: false,
        error: null,
      },
      
      eventDetail: {
        currentEvent: null,
        isLoading: false,
        error: null,
      },
      
      categories: {
        items: [],
        isLoading: false,
        error: null,
      },
      
      venues: {
        items: [],
        isLoading: false,
        error: null,
      },
      
      artists: {
        items: [],
        isLoading: false,
        error: null,
      },
      
      filters: {
        categories: [],
        venues: [],
        styles: [],
        isLoading: false,
        error: null,
      },
      
      reviews: {
        items: [],
        pagination: {
          page: 1,
          totalPages: 1,
          totalCount: 0,
          hasMore: false,
        },
        isLoading: false,
        error: null,
      },
      
      recentlyViewed: [],
      wishlist: [],
      
      // Actions
      // Events
      loadEvents: async (filters?: EventSearchParams, page = 1) => {
        set((state) => ({
          events: {
            ...state.events,
            isLoading: true,
            error: null,
            filters: filters || state.events.filters,
          },
        }));

        try {
          const finalFilters = { ...get().events.filters, ...filters, page_size: 20 };
          const response = await eventsService.getEvents(finalFilters);
          
          set((state) => ({
            events: {
              ...state.events,
              items: page === 1 ? response.results : [...state.events.items, ...response.results],
              pagination: {
                page,
                totalPages: Math.ceil(response.count / 20),
                totalCount: response.count,
                hasMore: !!response.next,
              },
              isLoading: false,
            },
          }));
        } catch (error: any) {
          set((state) => ({
            events: {
              ...state.events,
              error: error.message || 'Failed to load events',
              isLoading: false,
            },
          }));
        }
      },

      loadMoreEvents: async () => {
        const { events } = get();
        if (events.pagination.hasMore && !events.isLoading) {
          await get().loadEvents(events.filters, events.pagination.page + 1);
        }
      },

      getEventBySlug: async (slug: string) => {
        set((state) => ({
          eventDetail: {
            ...state.eventDetail,
            isLoading: true,
            error: null,
          },
        }));

        try {
          const response = await eventsService.getEventBySlug(slug);
          if (response.success) {
            set((state) => ({
              eventDetail: {
                currentEvent: response.data,
                isLoading: false,
                error: null,
              },
            }));
            
            // Add to recently viewed
            get().addToRecentlyViewed(response.data);
            
            return response.data;
          } else {
            set((state) => ({
              eventDetail: {
                ...state.eventDetail,
                error: response.message,
                isLoading: false,
              },
            }));
            return null;
          }
        } catch (error: any) {
          set((state) => ({
            eventDetail: {
              ...state.eventDetail,
              error: error.message || 'Failed to load event',
              isLoading: false,
            },
          }));
          return null;
        }
      },

      getEventById: async (id: string) => {
        set((state) => ({
          eventDetail: {
            ...state.eventDetail,
            isLoading: true,
            error: null,
          },
        }));

        try {
          const response = await eventsService.getEventById(id);
          if (response.success) {
            set((state) => ({
              eventDetail: {
                currentEvent: response.data,
                isLoading: false,
                error: null,
              },
            }));
            
            // Add to recently viewed
            get().addToRecentlyViewed(response.data);
            
            return response.data;
          } else {
            set((state) => ({
              eventDetail: {
                ...state.eventDetail,
                error: response.message,
                isLoading: false,
              },
            }));
            return null;
          }
        } catch (error: any) {
          set((state) => ({
            eventDetail: {
              ...state.eventDetail,
              error: error.message || 'Failed to load event',
              isLoading: false,
            },
          }));
          return null;
        }
      },

      setEventFilters: (filters: EventSearchParams) => {
        set((state) => ({
          events: {
            ...state.events,
            filters: { ...state.events.filters, ...filters },
          },
        }));
      },

      clearEventFilters: () => {
        set((state) => ({
          events: {
            ...state.events,
            filters: {},
          },
        }));
      },

      // Categories
      loadEventCategories: async () => {
        set((state) => ({
          categories: {
            ...state.categories,
            isLoading: true,
            error: null,
          },
        }));

        try {
          const response = await eventsService.getEventCategories();
          if (response.success) {
            set((state) => ({
              categories: {
                items: response.data,
                isLoading: false,
                error: null,
              },
            }));
          } else {
            set((state) => ({
              categories: {
                ...state.categories,
                error: response.message,
                isLoading: false,
              },
            }));
          }
        } catch (error: any) {
          set((state) => ({
            categories: {
              ...state.categories,
              error: error.message || 'Failed to load categories',
              isLoading: false,
            },
          }));
        }
      },

      // Venues
      loadVenues: async (params?: { search?: string; city?: string; country?: string }) => {
        set((state) => ({
          venues: {
            ...state.venues,
            isLoading: true,
            error: null,
          },
        }));

        try {
          const response = await eventsService.getVenues(params);
          if (response.success) {
            set((state) => ({
              venues: {
                items: response.data,
                isLoading: false,
                error: null,
              },
            }));
          } else {
            set((state) => ({
              venues: {
                ...state.venues,
                error: response.message,
                isLoading: false,
              },
            }));
          }
        } catch (error: any) {
          set((state) => ({
            venues: {
              ...state.venues,
              error: error.message || 'Failed to load venues',
              isLoading: false,
            },
          }));
        }
      },

      // Artists
      loadArtists: async (params?: { search?: string }) => {
        set((state) => ({
          artists: {
            ...state.artists,
            isLoading: true,
            error: null,
          },
        }));

        try {
          const response = await eventsService.getArtists(params);
          if (response.success) {
            set((state) => ({
              artists: {
                items: response.data,
                isLoading: false,
                error: null,
              },
            }));
          } else {
            set((state) => ({
              artists: {
                ...state.artists,
                error: response.message,
                isLoading: false,
              },
            }));
          }
        } catch (error: any) {
          set((state) => ({
            artists: {
              ...state.artists,
              error: error.message || 'Failed to load artists',
              isLoading: false,
            },
          }));
        }
      },

      // Filters
      loadEventFilters: async () => {
        set((state) => ({
          filters: {
            ...state.filters,
            isLoading: true,
            error: null,
          },
        }));

        try {
          const response = await eventsService.getEventFilters();
          if (response.success) {
            set((state) => ({
              filters: {
                categories: response.data.categories,
                venues: response.data.venues,
                styles: response.data.styles,
                isLoading: false,
                error: null,
              },
            }));
          } else {
            set((state) => ({
              filters: {
                ...state.filters,
                error: response.message,
                isLoading: false,
              },
            }));
          }
        } catch (error: any) {
          set((state) => ({
            filters: {
              ...state.filters,
              error: error.message || 'Failed to load filters',
              isLoading: false,
            },
          }));
        }
      },

      // Reviews
      loadEventReviews: async (eventId: string, page = 1) => {
        set((state) => ({
          reviews: {
            ...state.reviews,
            isLoading: true,
            error: null,
          },
        }));

        try {
          const response = await eventsService.getEventReviews(eventId, { page });
          
          set((state) => ({
            reviews: {
              items: page === 1 ? response.results : [...state.reviews.items, ...response.results],
              pagination: {
                page,
                totalPages: Math.ceil(response.count / 10),
                totalCount: response.count,
                hasMore: !!response.next,
              },
              isLoading: false,
              error: null,
            },
          }));
        } catch (error: any) {
          set((state) => ({
            reviews: {
              ...state.reviews,
              error: error.message || 'Failed to load reviews',
              isLoading: false,
            },
          }));
        }
      },

      addEventReview: async (eventId: string, review: { rating: number; title: string; comment: string }) => {
        try {
          const response = await eventsService.addEventReview(eventId, review);
          if (response.success) {
            // Reload reviews to include the new one
            await get().loadEventReviews(eventId, 1);
          }
        } catch (error: any) {
          throw error;
        }
      },

      // Wishlist
      addToWishlist: (event: Event) => {
        set((state) => ({
          wishlist: state.wishlist.some(e => e.id === event.id) 
            ? state.wishlist 
            : [...state.wishlist, event],
        }));
      },

      removeFromWishlist: (eventId: string) => {
        set((state) => ({
          wishlist: state.wishlist.filter(e => e.id !== eventId),
        }));
      },

      isInWishlist: (eventId: string) => {
        return get().wishlist.some(e => e.id === eventId);
      },

      // Recently Viewed
      addToRecentlyViewed: (event: Event) => {
        set((state) => {
          const filtered = state.recentlyViewed.filter(e => e.id !== event.id);
          return {
            recentlyViewed: [event, ...filtered].slice(0, 10), // Keep only last 10
          };
        });
      },

      clearRecentlyViewed: () => {
        set({ recentlyViewed: [] });
      },

      // Utilities
      clearErrors: () => {
        set((state) => ({
          events: { ...state.events, error: null },
          eventDetail: { ...state.eventDetail, error: null },
          categories: { ...state.categories, error: null },
          venues: { ...state.venues, error: null },
          artists: { ...state.artists, error: null },
          filters: { ...state.filters, error: null },
          reviews: { ...state.reviews, error: null },
        }));
      },
    }),
    {
      name: 'events-store',
      partialize: (state) => ({
        recentlyViewed: state.recentlyViewed,
        wishlist: state.wishlist,
      }),
    }
  )
); 