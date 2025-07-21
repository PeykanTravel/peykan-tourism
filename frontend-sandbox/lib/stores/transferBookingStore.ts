import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as transfersApi from '../api/transfers';

export interface TransferBookingState {
  // Route & Vehicle
  route_id: string | null;
  route_data: transfersApi.TransferRoute | null;
  vehicle_type: string | null;
  
  // DateTime
  trip_type: 'one_way' | 'round_trip';
  outbound_date: string | null;
  outbound_time: string | null;
  return_date: string | null;
  return_time: string | null;
  
  // Passengers
  passenger_count: number;
  luggage_count: number;
  
  // Options
  selected_options: Array<{
    option_id: string;
    quantity: number;
    name?: string;
    price?: number;
    description?: string;
  }>;
  
  // Contact
  pickup_address: string;
  dropoff_address: string;
  contact_name: string;
  contact_phone: string;
  special_requirements: string;
  
  // Pricing
  pricing_breakdown: transfersApi.PricingCalculationResponse | null;
  final_price: number | null;
  
  // UI State
  current_step: 'route' | 'vehicle' | 'datetime' | 'passengers' | 'options' | 'contact' | 'summary';
  is_calculating_price: boolean;
  price_calculation_error: string | null;
}

interface TransferBookingActions {
  // State updates
  updateBookingData: (updates: Partial<TransferBookingState>) => void;
  setRoute: (route: transfersApi.TransferRoute) => void;
  setVehicleType: (vehicleType: string) => void;
  setTripType: (tripType: 'one_way' | 'round_trip') => void;
  setDateTime: (date: string, time: string, isReturn?: boolean) => void;
  setPassengers: (passengerCount: number, luggageCount: number) => void;
  setOptions: (options: Array<{ 
    option_id: string; 
    quantity: number;
    name?: string;
    price?: number;
    description?: string;
  }>) => void;
  setContact: (contactData: {
    pickup_address: string;
    dropoff_address: string;
    contact_name: string;
    contact_phone: string;
    special_requirements?: string;
  }) => void;
  setCurrentStep: (step: TransferBookingState['current_step']) => void;
  
  // Price calculation
  calculatePrice: () => Promise<void>;
  
  // Cart integration
  addToCart: () => Promise<{ success: boolean; error?: string }>;
  
  // Utilities
  clearBookingData: () => void;
  isStepValid: (step: TransferBookingState['current_step']) => boolean;
  getNextStep: () => TransferBookingState['current_step'] | null;
  getPreviousStep: () => TransferBookingState['current_step'] | null;
}

const initialState: TransferBookingState = {
  // Route & Vehicle
  route_id: null,
  route_data: null,
  vehicle_type: null,
  
  // DateTime
  trip_type: 'one_way',
  outbound_date: null,
  outbound_time: null,
  return_date: null,
  return_time: null,
  
  // Passengers
  passenger_count: 1,
  luggage_count: 0,
  
  // Options
  selected_options: [],
  
  // Contact
  pickup_address: '',
  dropoff_address: '',
  contact_name: '',
  contact_phone: '',
  special_requirements: '',
  
  // Pricing
  pricing_breakdown: null,
  final_price: null,
  
  // UI State
  current_step: 'route',
  is_calculating_price: false,
  price_calculation_error: null,
};

const STEPS: TransferBookingState['current_step'][] = [
  'route', 'vehicle', 'datetime', 'passengers', 'options', 'contact', 'summary'
];

export const useTransferBookingStore = create<TransferBookingState & TransferBookingActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // State updates
      updateBookingData: (updates) => {
        set((state) => ({ ...state, ...updates }));
      },
      
      setRoute: (route) => {
        set((state) => ({
          ...state,
          route_id: route.id,
          route_data: route,
          vehicle_type: null, // Reset vehicle when route changes
          pricing_breakdown: null,
          final_price: null,
        }));
      },
      
      setVehicleType: (vehicleType) => {
        set((state) => ({
          ...state,
          vehicle_type: vehicleType,
          pricing_breakdown: null,
          final_price: null,
        }));
      },
      
      setTripType: (tripType) => {
        set((state) => ({
          ...state,
          trip_type: tripType,
          return_date: tripType === 'one_way' ? null : state.return_date,
          return_time: tripType === 'one_way' ? null : state.return_time,
          pricing_breakdown: null,
          final_price: null,
        }));
      },
      
      setDateTime: (date, time, isReturn = false) => {
        set((state) => ({
          ...state,
          [isReturn ? 'return_date' : 'outbound_date']: date,
          [isReturn ? 'return_time' : 'outbound_time']: time,
          pricing_breakdown: null,
          final_price: null,
        }));
      },
      
      setPassengers: (passengerCount, luggageCount) => {
        set((state) => ({
          ...state,
          passenger_count: passengerCount,
          luggage_count: luggageCount,
          pricing_breakdown: null,
          final_price: null,
        }));
      },
      
      setOptions: (options) => {
        set((state) => ({
          ...state,
          selected_options: options,
          pricing_breakdown: null,
          final_price: null,
        }));
      },
      
      setContact: (contactData) => {
        set((state) => ({
          ...state,
          ...contactData,
        }));
      },
      
      setCurrentStep: (step) => {
        set((state) => ({ ...state, current_step: step }));
      },
      
      // Price calculation
      calculatePrice: async () => {
        const state = get();
        
        if (!state.route_id || !state.vehicle_type || !state.outbound_date || !state.outbound_time) {
          set((state) => ({
            ...state,
            price_calculation_error: 'Missing required data for price calculation'
          }));
          return;
        }
        
        set((state) => ({
          ...state,
          is_calculating_price: true,
          price_calculation_error: null,
        }));
        
        try {
          // Get current currency from localStorage or default to USD
          const currentCurrency = localStorage.getItem('selectedCurrency') || 'USD';
          
          const pricingRequest: transfersApi.PricingCalculationRequest = {
            vehicle_type: state.vehicle_type,
            trip_type: state.trip_type,
            booking_time: state.outbound_time,
            return_time: state.trip_type === 'round_trip' && state.return_time
              ? state.return_time
              : undefined,
            selected_options: state.selected_options,
          };
          
          // Use the public endpoint for price calculation
          const response = await fetch('http://localhost:8000/api/v1/transfers/routes/calculate_price_public/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              route_id: state.route_id,
              ...pricingRequest
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Price calculation failed');
          }
          
          const pricing = await response.json();
          
          set((state) => ({
            ...state,
            pricing_breakdown: pricing,
            final_price: pricing.price_breakdown.final_price,
            is_calculating_price: false,
            price_calculation_error: null,
          }));
        } catch (error: any) {
          set((state) => ({
            ...state,
            is_calculating_price: false,
            price_calculation_error: error.message || 'Failed to calculate price',
          }));
        }
      },
      
      // Cart integration
      addToCart: async () => {
        const state = get();
        
        if (!state.route_id || !state.vehicle_type || !state.outbound_date || !state.outbound_time) {
          return { success: false, error: 'Missing required booking data' };
        }
        
        try {
          const bookingData: transfersApi.TransferBookingRequest = {
            route_id: state.route_id,
            vehicle_type: state.vehicle_type,
            trip_type: state.trip_type,
            outbound_datetime: `${state.outbound_date} ${state.outbound_time}`,
            return_datetime: state.trip_type === 'round_trip' && state.return_date && state.return_time
              ? `${state.return_date} ${state.return_time}`
              : undefined,
            passenger_count: state.passenger_count,
            luggage_count: state.luggage_count,
            pickup_address: state.pickup_address,
            dropoff_address: state.dropoff_address,
            contact_name: state.contact_name,
            contact_phone: state.contact_phone,
            selected_options: state.selected_options,
            special_requirements: state.special_requirements || undefined,
          };
          
          const result = await transfersApi.addTransferToCart(bookingData);
          
          if (result.success) {
            // Clear booking data after successful cart addition
            get().clearBookingData();
          }
          
          return { success: result.success, error: result.success ? undefined : result.message };
        } catch (error: any) {
          return { success: false, error: error.message || 'Failed to add to cart' };
        }
      },
      
      // Utilities
      clearBookingData: () => {
        set(initialState);
      },
      
      isStepValid: (step): boolean => {
        const state = get();
        
        switch (step) {
          case 'route':
            return Boolean(state.route_id && state.route_data);
          case 'vehicle':
            return Boolean(state.vehicle_type);
          case 'datetime':
            // Check if outbound date and time are selected
            if (!state.outbound_date || !state.outbound_time) {
              return false;
            }
            
            // Validate outbound time (2-hour buffer for today)
            const today = new Date().toISOString().split('T')[0];
            if (state.outbound_date === today) {
              const now = new Date();
              now.setHours(now.getHours() + 2); // Add 2 hours buffer
              const minTime = now.toTimeString().slice(0, 5);
              if (state.outbound_time < minTime) {
                return false;
              }
            }
            
            // For round trip, check return date and time
            if (state.trip_type === 'round_trip') {
              if (!state.return_date || !state.return_time) {
                return false;
              }
              
              // Return date must be >= outbound date
              if (state.return_date < state.outbound_date) {
                return false;
              }
              
              // If same date, return time must be > outbound time
              if (state.return_date === state.outbound_date && state.return_time <= state.outbound_time) {
                return false;
              }
              
              // If return date is today, check 2-hour buffer
              if (state.return_date === today) {
                const now = new Date();
                now.setHours(now.getHours() + 2);
                const minTime = now.toTimeString().slice(0, 5);
                if (state.return_time < minTime) {
                  return false;
                }
              }
            }
            
            return true;
          case 'passengers':
            return state.passenger_count > 0;
          case 'options':
            // Options are optional, but previous steps must be completed
            return Boolean(state.route_id && state.vehicle_type && state.outbound_date && state.outbound_time && state.passenger_count > 0);
          case 'contact':
            // Contact info required, and previous steps must be completed
            return Boolean(state.contact_name && state.contact_phone && state.route_id && state.vehicle_type && state.outbound_date && state.outbound_time && state.passenger_count > 0);
          case 'summary':
            // Summary requires all previous steps to be completed
            return Boolean(
              state.route_id && 
              state.vehicle_type && 
              state.outbound_date && 
              state.outbound_time && 
              state.passenger_count > 0 &&
              state.contact_name && 
              state.contact_phone
            );
          default:
            return false;
        }
      },
      
      getNextStep: () => {
        const state = get();
        const currentIndex = STEPS.indexOf(state.current_step);
        if (currentIndex < STEPS.length - 1) {
          return STEPS[currentIndex + 1];
        }
        return null;
      },
      
      getPreviousStep: () => {
        const state = get();
        const currentIndex = STEPS.indexOf(state.current_step);
        if (currentIndex > 0) {
          return STEPS[currentIndex - 1];
        }
        return null;
      },
    }),
    {
      name: 'transfer-booking-storage',
      version: 1,
      partialize: (state) => ({
        // Only persist essential data, not UI state
        route_id: state.route_id,
        route_data: state.route_data,
        vehicle_type: state.vehicle_type,
        trip_type: state.trip_type,
        outbound_date: state.outbound_date,
        outbound_time: state.outbound_time,
        return_date: state.return_date,
        return_time: state.return_time,
        passenger_count: state.passenger_count,
        luggage_count: state.luggage_count,
        selected_options: state.selected_options,
        pickup_address: state.pickup_address,
        dropoff_address: state.dropoff_address,
        contact_name: state.contact_name,
        contact_phone: state.contact_phone,
        special_requirements: state.special_requirements,
        pricing_breakdown: state.pricing_breakdown,
        final_price: state.final_price,
      }),
    }
  )
); 