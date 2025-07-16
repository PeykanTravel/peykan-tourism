import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Product, 
  Tour, 
  Event, 
  Transfer, 
  ProductFilters, 
  ProductSearchQuery,
  EventCategory,
  Location
} from '../../domain/entities/Product';
import { PaginatedResponse } from '../../domain/entities/Common';
import { productsApi } from '../../infrastructure/api/products';

interface ProductsState {
  // State
  tours: {
    items: Tour[];
    pagination: {
      page: number;
      totalPages: number;
      totalCount: number;
      hasMore: boolean;
    };
    filters: ProductFilters;
    isLoading: boolean;
    error: string | null;
  };
  
  events: {
    items: Event[];
    pagination: {
      page: number;
      totalPages: number;
      totalCount: number;
      hasMore: boolean;
    };
    filters: ProductFilters;
    isLoading: boolean;
    error: string | null;
  };
  
  transfers: {
    items: Transfer[];
    pagination: {
      page: number;
      totalPages: number;
      totalCount: number;
      hasMore: boolean;
    };
    filters: ProductFilters;
    isLoading: boolean;
    error: string | null;
  };
  
  search: {
    query: string;
    results: Product[];
    suggestions: string[];
    isLoading: boolean;
    error: string | null;
  };
  
  categories: EventCategory[];
  locations: Location[];
  recentlyViewed: Product[];
  wishlist: Product[];
  
  // Actions
  // Tours
  loadTours: (filters?: ProductFilters, page?: number) => Promise<void>;
  loadMoreTours: () => Promise<void>;
  getTourById: (id: string) => Promise<Tour>;
  getTourBySlug: (slug: string) => Promise<Tour>;
  setTourFilters: (filters: ProductFilters) => void;
  
  // Events
  loadEvents: (filters?: ProductFilters, page?: number) => Promise<void>;
  loadMoreEvents: () => Promise<void>;
  getEventById: (id: string) => Promise<Event>;
  getEventBySlug: (slug: string) => Promise<Event>;
  setEventFilters: (filters: ProductFilters) => void;
  
  // Transfers
  loadTransfers: (filters?: ProductFilters, page?: number) => Promise<void>;
  loadMoreTransfers: () => Promise<void>;
  getTransferById: (id: string) => Promise<Transfer>;
  setTransferFilters: (filters: ProductFilters) => void;
  
  // Search
  searchProducts: (query: ProductSearchQuery) => Promise<void>;
  getProductSuggestions: (query: string) => Promise<void>;
  clearSearch: () => void;
  
  // Categories and locations
  loadCategories: () => Promise<void>;
  loadLocations: () => Promise<void>;
  
  // Wishlist
  loadWishlist: () => Promise<void>;
  addToWishlist: (productId: string, productType: string) => Promise<void>;
  removeFromWishlist: (productId: string, productType: string) => Promise<void>;
  
  // Recently viewed
  loadRecentlyViewed: () => Promise<void>;
  addToRecentlyViewed: (productId: string, productType: string) => Promise<void>;
  
  // Utilities
  clearError: (section: 'tours' | 'events' | 'transfers' | 'search') => void;
  resetFilters: (section: 'tours' | 'events' | 'transfers') => void;
  isProductInWishlist: (productId: string, productType: string) => boolean;
}

const initialPagination = {
  page: 1,
  totalPages: 1,
  totalCount: 0,
  hasMore: false,
};

const initialFilters: ProductFilters = {
  page: 1,
  limit: 20,
};

export const useProductsStore = create<ProductsState>()(
  persist(
    (set, get) => ({
      // Initial state
      tours: {
        items: [],
        pagination: initialPagination,
        filters: initialFilters,
        isLoading: false,
        error: null,
      },
      
      events: {
        items: [],
        pagination: initialPagination,
        filters: initialFilters,
        isLoading: false,
        error: null,
      },
      
      transfers: {
        items: [],
        pagination: initialPagination,
        filters: initialFilters,
        isLoading: false,
        error: null,
      },
      
      search: {
        query: '',
        results: [],
        suggestions: [],
        isLoading: false,
        error: null,
      },
      
      categories: [],
      locations: [],
      recentlyViewed: [],
      wishlist: [],

      // Tours actions
      loadTours: async (filters?: ProductFilters, page = 1) => {
        set((state) => ({
          tours: {
            ...state.tours,
            isLoading: true,
            error: null,
            filters: filters || state.tours.filters,
          },
        }));

        try {
          const finalFilters = { ...get().tours.filters, ...filters, page };
          const response = await productsApi.getTours(finalFilters);
          
          set((state) => ({
            tours: {
              ...state.tours,
              items: page === 1 ? response.results : [...state.tours.items, ...response.results],
              pagination: {
                page,
                totalPages: Math.ceil(response.count / (finalFilters.limit || 20)),
                totalCount: response.count,
                hasMore: !!response.next,
              },
              isLoading: false,
            },
          }));
        } catch (error: any) {
          set((state) => ({
            tours: {
              ...state.tours,
              error: error.message || 'Failed to load tours',
              isLoading: false,
            },
          }));
        }
      },

      loadMoreTours: async () => {
        const { tours } = get();
        if (tours.pagination.hasMore && !tours.isLoading) {
          await get().loadTours(tours.filters, tours.pagination.page + 1);
        }
      },

      getTourById: async (id: string) => {
        return await productsApi.getTourById(id);
      },

      getTourBySlug: async (slug: string) => {
        return await productsApi.getTourBySlug(slug);
      },

      setTourFilters: (filters: ProductFilters) => {
        set((state) => ({
          tours: {
            ...state.tours,
            filters: { ...state.tours.filters, ...filters },
          },
        }));
      },

      // Events actions
      loadEvents: async (filters?: ProductFilters, page = 1) => {
        set((state) => ({
          events: {
            ...state.events,
            isLoading: true,
            error: null,
            filters: filters || state.events.filters,
          },
        }));

        try {
          const finalFilters = { ...get().events.filters, ...filters, page };
          const response = await productsApi.getEvents(finalFilters);
          
          set((state) => ({
            events: {
              ...state.events,
              items: page === 1 ? response.results : [...state.events.items, ...response.results],
              pagination: {
                page,
                totalPages: Math.ceil(response.count / (finalFilters.limit || 20)),
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

      getEventById: async (id: string) => {
        return await productsApi.getEventById(id);
      },

      getEventBySlug: async (slug: string) => {
        return await productsApi.getEventBySlug(slug);
      },

      setEventFilters: (filters: ProductFilters) => {
        set((state) => ({
          events: {
            ...state.events,
            filters: { ...state.events.filters, ...filters },
          },
        }));
      },

      // Transfers actions
      loadTransfers: async (filters?: ProductFilters, page = 1) => {
        set((state) => ({
          transfers: {
            ...state.transfers,
            isLoading: true,
            error: null,
            filters: filters || state.transfers.filters,
          },
        }));

        try {
          const finalFilters = { ...get().transfers.filters, ...filters, page };
          const response = await productsApi.getTransfers(finalFilters);
          
          set((state) => ({
            transfers: {
              ...state.transfers,
              items: page === 1 ? response.results : [...state.transfers.items, ...response.results],
              pagination: {
                page,
                totalPages: Math.ceil(response.count / (finalFilters.limit || 20)),
                totalCount: response.count,
                hasMore: !!response.next,
              },
              isLoading: false,
            },
          }));
        } catch (error: any) {
          set((state) => ({
            transfers: {
              ...state.transfers,
              error: error.message || 'Failed to load transfers',
              isLoading: false,
            },
          }));
        }
      },

      loadMoreTransfers: async () => {
        const { transfers } = get();
        if (transfers.pagination.hasMore && !transfers.isLoading) {
          await get().loadTransfers(transfers.filters, transfers.pagination.page + 1);
        }
      },

      getTransferById: async (id: string) => {
        return await productsApi.getTransferById(id);
      },

      setTransferFilters: (filters: ProductFilters) => {
        set((state) => ({
          transfers: {
            ...state.transfers,
            filters: { ...state.transfers.filters, ...filters },
          },
        }));
      },

      // Search actions
      searchProducts: async (query: ProductSearchQuery) => {
        set((state) => ({
          search: {
            ...state.search,
            query: query.query,
            isLoading: true,
            error: null,
          },
        }));

        try {
          const response = await productsApi.searchProducts(query);
          set((state) => ({
            search: {
              ...state.search,
              results: response.results,
              isLoading: false,
            },
          }));
        } catch (error: any) {
          set((state) => ({
            search: {
              ...state.search,
              error: error.message || 'Search failed',
              isLoading: false,
            },
          }));
        }
      },

      getProductSuggestions: async (query: string) => {
        try {
          const suggestions = await productsApi.getProductSuggestions(query);
          set((state) => ({
            search: {
              ...state.search,
              suggestions,
            },
          }));
        } catch (error: any) {
          // Suggestions are not critical, so we don't set error state
          console.warn('Failed to load suggestions:', error);
        }
      },

      clearSearch: () => {
        set((state) => ({
          search: {
            ...state.search,
            query: '',
            results: [],
            suggestions: [],
            error: null,
          },
        }));
      },

      // Categories and locations
      loadCategories: async () => {
        try {
          const categories = await productsApi.getEventCategories();
          set({ categories });
        } catch (error: any) {
          console.warn('Failed to load categories:', error);
        }
      },

      loadLocations: async () => {
        try {
          const locations = await productsApi.getLocations();
          set({ locations });
        } catch (error: any) {
          console.warn('Failed to load locations:', error);
        }
      },

      // Wishlist
      loadWishlist: async () => {
        try {
          const response = await productsApi.getWishlist();
          set({ wishlist: response.results });
        } catch (error: any) {
          console.warn('Failed to load wishlist:', error);
        }
      },

      addToWishlist: async (productId: string, productType: string) => {
        try {
          await productsApi.addToWishlist(productId, productType);
          await get().loadWishlist();
        } catch (error: any) {
          throw error;
        }
      },

      removeFromWishlist: async (productId: string, productType: string) => {
        try {
          await productsApi.removeFromWishlist(productId, productType);
          await get().loadWishlist();
        } catch (error: any) {
          throw error;
        }
      },

      // Recently viewed
      loadRecentlyViewed: async () => {
        try {
          const recentlyViewed = await productsApi.getRecentlyViewed();
          set({ recentlyViewed });
        } catch (error: any) {
          console.warn('Failed to load recently viewed:', error);
        }
      },

      addToRecentlyViewed: async (productId: string, productType: string) => {
        try {
          await productsApi.addToRecentlyViewed(productId, productType);
          await get().loadRecentlyViewed();
        } catch (error: any) {
          // Recently viewed is not critical
          console.warn('Failed to add to recently viewed:', error);
        }
      },

      // Utilities
      clearError: (section: 'tours' | 'events' | 'transfers' | 'search') => {
        set((state) => ({
          [section]: {
            ...state[section],
            error: null,
          },
        }));
      },

      resetFilters: (section: 'tours' | 'events' | 'transfers') => {
        set((state) => ({
          [section]: {
            ...state[section],
            filters: initialFilters,
          },
        }));
      },

      isProductInWishlist: (productId: string, productType: string) => {
        const { wishlist } = get();
        return wishlist.some((item) => 
          item.id === productId && item.type === productType
        );
      },
    }),
    {
      name: 'products-store',
      partialize: (state) => ({
        recentlyViewed: state.recentlyViewed,
        wishlist: state.wishlist,
        categories: state.categories,
        locations: state.locations,
      }),
    }
  )
);

// Initialize data on store creation
if (typeof window !== 'undefined') {
  const store = useProductsStore.getState();
  store.loadCategories();
  store.loadLocations();
  store.loadRecentlyViewed();
  store.loadWishlist();
} 