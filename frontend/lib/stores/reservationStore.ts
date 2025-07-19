import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface ReservationItem {
  id: string;
  productType: 'tour' | 'event' | 'transfer';
  productId: string;
  productTitle: string;
  productSlug: string;
  bookingDate: string;
  bookingTime: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  variantId?: string;
  variantName?: string;
  selectedOptions: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  optionsTotal: number;
  bookingData: Record<string, any>;
}

export interface ReservationState {
  items: ReservationItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  discountCode?: string;
  discountAmount: number;
  specialRequirements: string;
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
  };
  currentStep: number;
  isLoading: boolean;
  error: string | null;
}

export interface ReservationActions {
  // Item Management
  addItem: (item: Omit<ReservationItem, 'id'>) => void;
  updateItem: (id: string, updates: Partial<ReservationItem>) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;
  
  // Pricing
  updatePricing: (pricing: {
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    currency: string;
  }) => void;
  
  // Discount
  applyDiscount: (code: string, amount: number) => void;
  removeDiscount: () => void;
  
  // Customer Info
  updateCustomerInfo: (info: Partial<ReservationState['customerInfo']>) => void;
  
  // Step Management
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  
  // Special Requirements
  setSpecialRequirements: (requirements: string) => void;
  
  // Loading & Error
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Reset
  reset: () => void;
}

const initialState: ReservationState = {
  items: [],
  subtotal: 0,
  taxAmount: 0,
  totalAmount: 0,
  currency: 'USD',
  discountAmount: 0,
  specialRequirements: '',
  customerInfo: {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
  },
  currentStep: 1,
  isLoading: false,
  error: null,
};

export const useReservationStore = create<ReservationState & ReservationActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Item Management
      addItem: (item) => {
        const newItem: ReservationItem = {
          ...item,
          id: crypto.randomUUID(),
        };
        
        set((state) => {
          const newItems = [...state.items, newItem];
          const subtotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
          const taxAmount = subtotal * 0.1; // 10% tax
          const totalAmount = subtotal + taxAmount - state.discountAmount;
          
          return {
            items: newItems,
            subtotal,
            taxAmount,
            totalAmount,
          };
        });
      },

      updateItem: (id, updates) => {
        set((state) => {
          const newItems = state.items.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          );
          
          const subtotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
          const taxAmount = subtotal * 0.1;
          const totalAmount = subtotal + taxAmount - state.discountAmount;
          
          return {
            items: newItems,
            subtotal,
            taxAmount,
            totalAmount,
          };
        });
      },

      removeItem: (id) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== id);
          const subtotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
          const taxAmount = subtotal * 0.1;
          const totalAmount = subtotal + taxAmount - state.discountAmount;
          
          return {
            items: newItems,
            subtotal,
            taxAmount,
            totalAmount,
          };
        });
      },

      clearItems: () => {
        set((state) => ({
          items: [],
          subtotal: 0,
          taxAmount: 0,
          totalAmount: 0,
        }));
      },

      // Pricing
      updatePricing: (pricing) => {
        set((state) => ({
          ...pricing,
          totalAmount: pricing.subtotal + pricing.taxAmount - state.discountAmount,
        }));
      },

      // Discount
      applyDiscount: (code, amount) => {
        set((state) => ({
          discountCode: code,
          discountAmount: amount,
          totalAmount: state.subtotal + state.taxAmount - amount,
        }));
      },

      removeDiscount: () => {
        set((state) => ({
          discountCode: undefined,
          discountAmount: 0,
          totalAmount: state.subtotal + state.taxAmount,
        }));
      },

      // Customer Info
      updateCustomerInfo: (info) => {
        set((state) => ({
          customerInfo: { ...state.customerInfo, ...info },
        }));
      },

      // Step Management
      setCurrentStep: (step) => {
        set({ currentStep: step });
      },

      nextStep: () => {
        set((state) => ({ currentStep: state.currentStep + 1 }));
      },

      previousStep: () => {
        set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) }));
      },

      // Special Requirements
      setSpecialRequirements: (requirements) => {
        set({ specialRequirements: requirements });
      },

      // Loading & Error
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      // Reset
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'reservation-store',
    }
  )
);

// Selectors for better performance
export const useReservationItems = () => useReservationStore((state) => state.items);
export const useReservationPricing = () => useReservationStore((state) => ({
  subtotal: state.subtotal,
  taxAmount: state.taxAmount,
  totalAmount: state.totalAmount,
  currency: state.currency,
  discountAmount: state.discountAmount,
  discountCode: state.discountCode,
}));
export const useReservationCustomerInfo = () => useReservationStore((state) => state.customerInfo);
export const useReservationStep = () => useReservationStore((state) => state.currentStep);
export const useReservationLoading = () => useReservationStore((state) => state.isLoading);
export const useReservationError = () => useReservationStore((state) => state.error); 