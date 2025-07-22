import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';

// ===== Types =====
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  type: 'tour' | 'event' | 'transfer';
  rating?: number;
  reviewCount?: number;
  features?: string[];
  metadata?: Record<string, any>;
}

export interface TourProduct extends Product {
  type: 'tour';
  duration: string;
  location: string;
  maxParticipants: number;
  difficultyLevel: string;
  variants?: Array<{
    id: string;
    name: string;
    base_price: number;
    features: string[];
    capacity: number;
  }>;
  schedules?: Array<{
    id: string;
    date: string;
    time: string;
    available_capacity: number;
    total_capacity: number;
  }>;
}

export interface EventProduct extends Product {
  type: 'event';
  venue: string;
  date: string;
  time: string;
  capacity: number;
  ticketTypes?: Array<{
    id: string;
    name: string;
    price: number;
    description: string;
    features: string[];
  }>;
}

export interface TransferProduct extends Product {
  type: 'transfer';
  origin: string;
  destination: string;
  duration: string;
  vehicleTypes?: Array<{
    id: string;
    name: string;
    capacity: number;
    price_multiplier: number;
    features: string[];
  }>;
}

export interface BookingState {
  selectedProduct: Product | null;
  selectedVariant: string | null;
  selectedSchedule: string | null;
  selectedTicketType: string | null;
  selectedSeats: number[];
  selectedRoute: string | null;
  selectedVehicle: string | null;
  tripType: 'oneway' | 'roundtrip';
  participants: {
    adult: number;
    child: number;
    infant: number;
  };
  selectedOptions: Record<string, number>;
  specialRequests: string;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  totalPrice: number;
  isBooking: boolean;
  bookingStep: number;
}

export interface FilterState {
  searchQuery: string;
  selectedCategories: string[];
  selectedPriceRange: [number, number];
  selectedRating: number;
  selectedFeatures: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface CartState {
  items: Array<{
    id: string;
    product: Product;
    quantity: number;
    selectedOptions: Record<string, any>;
    price: number;
  }>;
  totalItems: number;
  totalPrice: number;
  currency: string;
  isOpen: boolean;
}

export interface UserPreferences {
  language: string;
  currency: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    reducedMotion: boolean;
  };
}

// ===== Tour Store =====
interface TourStore {
  // State
  tours: TourProduct[];
  filteredTours: TourProduct[];
  selectedTour: TourProduct | null;
  loading: boolean;
  error: string | null;
  
  // Filters
  filters: FilterState;
  
  // Actions
  setTours: (tours: TourProduct[]) => void;
  setSelectedTour: (tour: TourProduct | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Filter actions
  setSearchQuery: (query: string) => void;
  setSelectedCategories: (categories: string[]) => void;
  setPriceRange: (range: [number, number]) => void;
  setRating: (rating: number) => void;
  setFeatures: (features: string[]) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  
  // Computed
  applyFilters: () => void;
  getTourById: (id: string) => TourProduct | undefined;
  getToursByLocation: (location: string) => TourProduct[];
  getToursByPriceRange: (min: number, max: number) => TourProduct[];
}

export const useTourStore = create<TourStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        tours: [],
        filteredTours: [],
        selectedTour: null,
        loading: false,
        error: null,
        filters: {
          searchQuery: '',
          selectedCategories: [],
          selectedPriceRange: [0, 1000000],
          selectedRating: 0,
          selectedFeatures: [],
          sortBy: 'price',
          sortOrder: 'asc'
        },
        
        // Actions
        setTours: (tours) => set({ tours, filteredTours: tours }),
        setSelectedTour: (tour) => set({ selectedTour: tour }),
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        
        // Filter actions
        setSearchQuery: (query) => {
          set((state) => ({
            filters: { ...state.filters, searchQuery: query }
          }));
          get().applyFilters();
        },
        
        setSelectedCategories: (categories) => {
          set((state) => ({
            filters: { ...state.filters, selectedCategories: categories }
          }));
          get().applyFilters();
        },
        
        setPriceRange: (range) => {
          set((state) => ({
            filters: { ...state.filters, selectedPriceRange: range }
          }));
          get().applyFilters();
        },
        
        setRating: (rating) => {
          set((state) => ({
            filters: { ...state.filters, selectedRating: rating }
          }));
          get().applyFilters();
        },
        
        setFeatures: (features) => {
          set((state) => ({
            filters: { ...state.filters, selectedFeatures: features }
          }));
          get().applyFilters();
        },
        
        setSortBy: (sortBy) => {
          set((state) => ({
            filters: { ...state.filters, sortBy }
          }));
          get().applyFilters();
        },
        
        setSortOrder: (order) => {
          set((state) => ({
            filters: { ...state.filters, sortOrder: order }
          }));
          get().applyFilters();
        },
        
        // Computed actions
        applyFilters: () => {
          const { tours, filters } = get();
          let filtered = [...tours];
          
          // Search filter
          if (filters.searchQuery) {
            filtered = filtered.filter(tour =>
              tour.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
              tour.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
              tour.location.toLowerCase().includes(filters.searchQuery.toLowerCase())
            );
          }
          
          // Category filter
          if (filters.selectedCategories.length > 0) {
            filtered = filtered.filter(tour =>
              filters.selectedCategories.includes(tour.difficultyLevel)
            );
          }
          
          // Price range filter
          filtered = filtered.filter(tour =>
            tour.price >= filters.selectedPriceRange[0] &&
            tour.price <= filters.selectedPriceRange[1]
          );
          
          // Rating filter
          if (filters.selectedRating > 0) {
            filtered = filtered.filter(tour =>
              (tour.rating || 0) >= filters.selectedRating
            );
          }
          
          // Features filter
          if (filters.selectedFeatures.length > 0) {
            filtered = filtered.filter(tour =>
              filters.selectedFeatures.every(feature =>
                tour.features?.includes(feature)
              )
            );
          }
          
          // Sort
          filtered.sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (filters.sortBy) {
              case 'price':
                aValue = a.price;
                bValue = b.price;
                break;
              case 'rating':
                aValue = a.rating || 0;
                bValue = b.rating || 0;
                break;
              case 'title':
                aValue = a.title;
                bValue = b.title;
                break;
              default:
                aValue = a.price;
                bValue = b.price;
            }
            
            if (filters.sortOrder === 'asc') {
              return aValue > bValue ? 1 : -1;
            } else {
              return aValue < bValue ? 1 : -1;
            }
          });
          
          set({ filteredTours: filtered });
        },
        
        getTourById: (id) => {
          return get().tours.find(tour => tour.id === id);
        },
        
        getToursByLocation: (location) => {
          return get().tours.filter(tour => tour.location === location);
        },
        
        getToursByPriceRange: (min, max) => {
          return get().tours.filter(tour => tour.price >= min && tour.price <= max);
        }
      }),
      {
        name: 'tour-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          tours: state.tours,
          selectedTour: state.selectedTour,
          filters: state.filters
        })
      }
    )
  )
);

// ===== Event Store =====
interface EventStore {
  // State
  events: EventProduct[];
  filteredEvents: EventProduct[];
  selectedEvent: EventProduct | null;
  loading: boolean;
  error: string | null;
  
  // Filters
  filters: FilterState;
  
  // Actions
  setEvents: (events: EventProduct[]) => void;
  setSelectedEvent: (event: EventProduct | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Filter actions (same as tour store)
  setSearchQuery: (query: string) => void;
  setSelectedCategories: (categories: string[]) => void;
  setPriceRange: (range: [number, number]) => void;
  setRating: (rating: number) => void;
  setFeatures: (features: string[]) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  
  // Computed
  applyFilters: () => void;
  getEventById: (id: string) => EventProduct | undefined;
  getEventsByVenue: (venue: string) => EventProduct[];
  getEventsByDate: (date: string) => EventProduct[];
}

export const useEventStore = create<EventStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        events: [],
        filteredEvents: [],
        selectedEvent: null,
        loading: false,
        error: null,
        filters: {
          searchQuery: '',
          selectedCategories: [],
          selectedPriceRange: [0, 1000000],
          selectedRating: 0,
          selectedFeatures: [],
          sortBy: 'date',
          sortOrder: 'asc'
        },
        
        // Actions
        setEvents: (events) => set({ events, filteredEvents: events }),
        setSelectedEvent: (event) => set({ selectedEvent: event }),
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        
        // Filter actions (same implementation as tour store)
        setSearchQuery: (query) => {
          set((state) => ({
            filters: { ...state.filters, searchQuery: query }
          }));
          get().applyFilters();
        },
        
        setSelectedCategories: (categories) => {
          set((state) => ({
            filters: { ...state.filters, selectedCategories: categories }
          }));
          get().applyFilters();
        },
        
        setPriceRange: (range) => {
          set((state) => ({
            filters: { ...state.filters, selectedPriceRange: range }
          }));
          get().applyFilters();
        },
        
        setRating: (rating) => {
          set((state) => ({
            filters: { ...state.filters, selectedRating: rating }
          }));
          get().applyFilters();
        },
        
        setFeatures: (features) => {
          set((state) => ({
            filters: { ...state.filters, selectedFeatures: features }
          }));
          get().applyFilters();
        },
        
        setSortBy: (sortBy) => {
          set((state) => ({
            filters: { ...state.filters, sortBy }
          }));
          get().applyFilters();
        },
        
        setSortOrder: (order) => {
          set((state) => ({
            filters: { ...state.filters, sortOrder: order }
          }));
          get().applyFilters();
        },
        
        // Computed actions
        applyFilters: () => {
          const { events, filters } = get();
          let filtered = [...events];
          
          // Search filter
          if (filters.searchQuery) {
            filtered = filtered.filter(event =>
              event.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
              event.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
              event.venue.toLowerCase().includes(filters.searchQuery.toLowerCase())
            );
          }
          
          // Price range filter
          filtered = filtered.filter(event =>
            event.price >= filters.selectedPriceRange[0] &&
            event.price <= filters.selectedPriceRange[1]
          );
          
          // Rating filter
          if (filters.selectedRating > 0) {
            filtered = filtered.filter(event =>
              (event.rating || 0) >= filters.selectedRating
            );
          }
          
          // Sort
          filtered.sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (filters.sortBy) {
              case 'price':
                aValue = a.price;
                bValue = b.price;
                break;
              case 'date':
                aValue = new Date(a.date);
                bValue = new Date(b.date);
                break;
              case 'rating':
                aValue = a.rating || 0;
                bValue = b.rating || 0;
                break;
              default:
                aValue = new Date(a.date);
                bValue = new Date(b.date);
            }
            
            if (filters.sortOrder === 'asc') {
              return aValue > bValue ? 1 : -1;
            } else {
              return aValue < bValue ? 1 : -1;
            }
          });
          
          set({ filteredEvents: filtered });
        },
        
        getEventById: (id) => {
          return get().events.find(event => event.id === id);
        },
        
        getEventsByVenue: (venue) => {
          return get().events.filter(event => event.venue === venue);
        },
        
        getEventsByDate: (date) => {
          return get().events.filter(event => event.date === date);
        }
      }),
      {
        name: 'event-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          events: state.events,
          selectedEvent: state.selectedEvent,
          filters: state.filters
        })
      }
    )
  )
);

// ===== Transfer Store =====
interface TransferStore {
  // State
  transfers: TransferProduct[];
  filteredTransfers: TransferProduct[];
  selectedTransfer: TransferProduct | null;
  loading: boolean;
  error: string | null;
  
  // Filters
  filters: FilterState;
  
  // Actions
  setTransfers: (transfers: TransferProduct[]) => void;
  setSelectedTransfer: (transfer: TransferProduct | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Filter actions
  setSearchQuery: (query: string) => void;
  setSelectedCategories: (categories: string[]) => void;
  setPriceRange: (range: [number, number]) => void;
  setRating: (rating: number) => void;
  setFeatures: (features: string[]) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  
  // Computed
  applyFilters: () => void;
  getTransferById: (id: string) => TransferProduct | undefined;
  getTransfersByRoute: (origin: string, destination: string) => TransferProduct[];
  getTransfersByVehicleType: (vehicleType: string) => TransferProduct[];
}

export const useTransferStore = create<TransferStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        transfers: [],
        filteredTransfers: [],
        selectedTransfer: null,
        loading: false,
        error: null,
        filters: {
          searchQuery: '',
          selectedCategories: [],
          selectedPriceRange: [0, 1000000],
          selectedRating: 0,
          selectedFeatures: [],
          sortBy: 'price',
          sortOrder: 'asc'
        },
        
        // Actions
        setTransfers: (transfers) => set({ transfers, filteredTransfers: transfers }),
        setSelectedTransfer: (transfer) => set({ selectedTransfer: transfer }),
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        
        // Filter actions (same implementation as tour store)
        setSearchQuery: (query) => {
          set((state) => ({
            filters: { ...state.filters, searchQuery: query }
          }));
          get().applyFilters();
        },
        
        setSelectedCategories: (categories) => {
          set((state) => ({
            filters: { ...state.filters, selectedCategories: categories }
          }));
          get().applyFilters();
        },
        
        setPriceRange: (range) => {
          set((state) => ({
            filters: { ...state.filters, selectedPriceRange: range }
          }));
          get().applyFilters();
        },
        
        setRating: (rating) => {
          set((state) => ({
            filters: { ...state.filters, selectedRating: rating }
          }));
          get().applyFilters();
        },
        
        setFeatures: (features) => {
          set((state) => ({
            filters: { ...state.filters, selectedFeatures: features }
          }));
          get().applyFilters();
        },
        
        setSortBy: (sortBy) => {
          set((state) => ({
            filters: { ...state.filters, sortBy }
          }));
          get().applyFilters();
        },
        
        setSortOrder: (order) => {
          set((state) => ({
            filters: { ...state.filters, sortOrder: order }
          }));
          get().applyFilters();
        },
        
        // Computed actions
        applyFilters: () => {
          const { transfers, filters } = get();
          let filtered = [...transfers];
          
          // Search filter
          if (filters.searchQuery) {
            filtered = filtered.filter(transfer =>
              transfer.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
              transfer.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
              transfer.origin.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
              transfer.destination.toLowerCase().includes(filters.searchQuery.toLowerCase())
            );
          }
          
          // Price range filter
          filtered = filtered.filter(transfer =>
            transfer.price >= filters.selectedPriceRange[0] &&
            transfer.price <= filters.selectedPriceRange[1]
          );
          
          // Rating filter
          if (filters.selectedRating > 0) {
            filtered = filtered.filter(transfer =>
              (transfer.rating || 0) >= filters.selectedRating
            );
          }
          
          // Sort
          filtered.sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (filters.sortBy) {
              case 'price':
                aValue = a.price;
                bValue = b.price;
                break;
              case 'duration':
                aValue = a.duration;
                bValue = b.duration;
                break;
              case 'rating':
                aValue = a.rating || 0;
                bValue = b.rating || 0;
                break;
              default:
                aValue = a.price;
                bValue = b.price;
            }
            
            if (filters.sortOrder === 'asc') {
              return aValue > bValue ? 1 : -1;
            } else {
              return aValue < bValue ? 1 : -1;
            }
          });
          
          set({ filteredTransfers: filtered });
        },
        
        getTransferById: (id) => {
          return get().transfers.find(transfer => transfer.id === id);
        },
        
        getTransfersByRoute: (origin, destination) => {
          return get().transfers.filter(transfer =>
            transfer.origin === origin && transfer.destination === destination
          );
        },
        
        getTransfersByVehicleType: (vehicleType) => {
          return get().transfers.filter(transfer =>
            transfer.vehicleTypes?.some(vt => vt.name === vehicleType)
          );
        }
      }),
      {
        name: 'transfer-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          transfers: state.transfers,
          selectedTransfer: state.selectedTransfer,
          filters: state.filters
        })
      }
    )
  )
);

// ===== Booking Store =====
interface BookingStore {
  // State
  bookingState: BookingState;
  
  // Actions
  setSelectedProduct: (product: Product | null) => void;
  setSelectedVariant: (variant: string | null) => void;
  setSelectedSchedule: (schedule: string | null) => void;
  setSelectedTicketType: (ticketType: string | null) => void;
  setSelectedSeats: (seats: number[]) => void;
  setSelectedRoute: (route: string | null) => void;
  setSelectedVehicle: (vehicle: string | null) => void;
  setTripType: (tripType: 'oneway' | 'roundtrip') => void;
  setParticipants: (participants: BookingState['participants']) => void;
  setSelectedOptions: (options: Record<string, number>) => void;
  setSpecialRequests: (requests: string) => void;
  setContactInfo: (contactInfo: BookingState['contactInfo']) => void;
  setTotalPrice: (price: number) => void;
  setIsBooking: (isBooking: boolean) => void;
  setBookingStep: (step: number) => void;
  
  // Computed actions
  resetBooking: () => void;
  calculateTotalPrice: () => number;
  validateBooking: () => { isValid: boolean; errors: string[] };
}

export const useBookingStore = create<BookingStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        bookingState: {
          selectedProduct: null,
          selectedVariant: null,
          selectedSchedule: null,
          selectedTicketType: null,
          selectedSeats: [],
          selectedRoute: null,
          selectedVehicle: null,
          tripType: 'oneway',
          participants: {
            adult: 1,
            child: 0,
            infant: 0
          },
          selectedOptions: {},
          specialRequests: '',
          contactInfo: {
            name: '',
            email: '',
            phone: ''
          },
          totalPrice: 0,
          isBooking: false,
          bookingStep: 0
        },
        
        // Actions
        setSelectedProduct: (product) => {
          set((state) => ({
            bookingState: {
              ...state.bookingState,
              selectedProduct: product,
              selectedVariant: null,
              selectedSchedule: null,
              selectedTicketType: null,
              selectedSeats: [],
              selectedRoute: null,
              selectedVehicle: null,
              bookingStep: 0
            }
          }));
        },
        
        setSelectedVariant: (variant) => {
          set((state) => ({
            bookingState: {
              ...state.bookingState,
              selectedVariant: variant
            }
          }));
        },
        
        setSelectedSchedule: (schedule) => {
          set((state) => ({
            bookingState: {
              ...state.bookingState,
              selectedSchedule: schedule
            }
          }));
        },
        
        setSelectedTicketType: (ticketType) => {
          set((state) => ({
            bookingState: {
              ...state.bookingState,
              selectedTicketType: ticketType
            }
          }));
        },
        
        setSelectedSeats: (seats) => {
          set((state) => ({
            bookingState: {
              ...state.bookingState,
              selectedSeats: seats
            }
          }));
        },
        
        setSelectedRoute: (route) => {
          set((state) => ({
            bookingState: {
              ...state.bookingState,
              selectedRoute: route
            }
          }));
        },
        
        setSelectedVehicle: (vehicle) => {
          set((state) => ({
            bookingState: {
              ...state.bookingState,
              selectedVehicle: vehicle
            }
          }));
        },
        
        setTripType: (tripType) => {
          set((state) => ({
            bookingState: {
              ...state.bookingState,
              tripType
            }
          }));
        },
        
        setParticipants: (participants) => {
          set((state) => ({
            bookingState: {
              ...state.bookingState,
              participants
            }
          }));
        },
        
        setSelectedOptions: (options) => {
          set((state) => ({
            bookingState: {
              ...state.bookingState,
              selectedOptions: options
            }
          }));
        },
        
        setSpecialRequests: (requests) => {
          set((state) => ({
            bookingState: {
              ...state.bookingState,
              specialRequests: requests
            }
          }));
        },
        
        setContactInfo: (contactInfo) => {
          set((state) => ({
            bookingState: {
              ...state.bookingState,
              contactInfo
            }
          }));
        },
        
        setTotalPrice: (price) => {
          set((state) => ({
            bookingState: {
              ...state.bookingState,
              totalPrice: price
            }
          }));
        },
        
        setIsBooking: (isBooking) => {
          set((state) => ({
            bookingState: {
              ...state.bookingState,
              isBooking
            }
          }));
        },
        
        setBookingStep: (step) => {
          set((state) => ({
            bookingState: {
              ...state.bookingState,
              bookingStep: step
            }
          }));
        },
        
        // Computed actions
        resetBooking: () => {
          set({
            bookingState: {
              selectedProduct: null,
              selectedVariant: null,
              selectedSchedule: null,
              selectedTicketType: null,
              selectedSeats: [],
              selectedRoute: null,
              selectedVehicle: null,
              tripType: 'oneway',
              participants: {
                adult: 1,
                child: 0,
                infant: 0
              },
              selectedOptions: {},
              specialRequests: '',
              contactInfo: {
                name: '',
                email: '',
                phone: ''
              },
              totalPrice: 0,
              isBooking: false,
              bookingStep: 0
            }
          });
        },
        
        calculateTotalPrice: () => {
          const { bookingState } = get();
          let total = 0;
          
          if (bookingState.selectedProduct) {
            total = bookingState.selectedProduct.price;
            
            // Add variant price if selected
            if (bookingState.selectedVariant && bookingState.selectedProduct.type === 'tour') {
              const tour = bookingState.selectedProduct as TourProduct;
              const variant = tour.variants?.find(v => v.id === bookingState.selectedVariant);
              if (variant) {
                total = variant.base_price;
              }
            }
            
            // Add ticket type price if selected
            if (bookingState.selectedTicketType && bookingState.selectedProduct.type === 'event') {
              const event = bookingState.selectedProduct as EventProduct;
              const ticketType = event.ticketTypes?.find(t => t.id === bookingState.selectedTicketType);
              if (ticketType) {
                total = ticketType.price;
              }
            }
            
            // Multiply by participants
            const totalParticipants = 
              bookingState.participants.adult + 
              bookingState.participants.child + 
              bookingState.participants.infant;
            total *= totalParticipants;
            
            // Add selected options
            Object.entries(bookingState.selectedOptions).forEach(([optionId, quantity]) => {
              // This would need to be implemented based on your options pricing logic
              total += quantity * 10000; // Example: 10,000 per option
            });
            
            // Multiply by 2 for round trip
            if (bookingState.tripType === 'roundtrip') {
              total *= 2;
            }
          }
          
          return total;
        },
        
        validateBooking: () => {
          const { bookingState } = get();
          const errors: string[] = [];
          
          if (!bookingState.selectedProduct) {
            errors.push('محصول انتخاب نشده است');
          }
          
          if (!bookingState.contactInfo.name) {
            errors.push('نام وارد نشده است');
          }
          
          if (!bookingState.contactInfo.email) {
            errors.push('ایمیل وارد نشده است');
          }
          
          if (!bookingState.contactInfo.phone) {
            errors.push('شماره تلفن وارد نشده است');
          }
          
          if (bookingState.participants.adult === 0) {
            errors.push('حداقل یک بزرگسال باید انتخاب شود');
          }
          
          return {
            isValid: errors.length === 0,
            errors
          };
        }
      }),
      {
        name: 'booking-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          bookingState: state.bookingState
        })
      }
    )
  )
);

// ===== User Preferences Store =====
interface UserPreferencesStore {
  // State
  preferences: UserPreferences;
  
  // Actions
  setLanguage: (language: string) => void;
  setCurrency: (currency: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setNotifications: (notifications: UserPreferences['notifications']) => void;
  setAccessibility: (accessibility: UserPreferences['accessibility']) => void;
  
  // Computed
  resetPreferences: () => void;
}

export const useUserPreferencesStore = create<UserPreferencesStore>()(
  subscribeWithSelector(
    persist(
      (set) => ({
        // Initial state
        preferences: {
          language: 'fa',
          currency: 'IRR',
          theme: 'auto',
          notifications: {
            email: true,
            push: true,
            sms: false
          },
          accessibility: {
            highContrast: false,
            largeText: false,
            reducedMotion: false
          }
        },
        
        // Actions
        setLanguage: (language) => {
          set((state) => ({
            preferences: {
              ...state.preferences,
              language
            }
          }));
        },
        
        setCurrency: (currency) => {
          set((state) => ({
            preferences: {
              ...state.preferences,
              currency
            }
          }));
        },
        
        setTheme: (theme) => {
          set((state) => ({
            preferences: {
              ...state.preferences,
              theme
            }
          }));
        },
        
        setNotifications: (notifications) => {
          set((state) => ({
            preferences: {
              ...state.preferences,
              notifications
            }
          }));
        },
        
        setAccessibility: (accessibility) => {
          set((state) => ({
            preferences: {
              ...state.preferences,
              accessibility
            }
          }));
        },
        
        // Computed
        resetPreferences: () => {
          set({
            preferences: {
              language: 'fa',
              currency: 'IRR',
              theme: 'auto',
              notifications: {
                email: true,
                push: true,
                sms: false
              },
              accessibility: {
                highContrast: false,
                largeText: false,
                reducedMotion: false
              }
            }
          });
        }
      }),
      {
        name: 'user-preferences-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          preferences: state.preferences
        })
      }
    )
  )
); 