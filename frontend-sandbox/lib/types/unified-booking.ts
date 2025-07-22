import { ReactNode } from 'react';

export type ProductType = 'tour' | 'event' | 'transfer';

// Progress Bar Types
export interface ProgressStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
  isDisabled: boolean;
  icon?: ReactNode;
}

// Sidebar Types
export interface ProductInfo {
  id: string;
  title: string;
  image?: string;
  type: 'tour' | 'event' | 'transfer';
  basePrice: number;
  currency: string;
}

export interface SelectedOption {
  id: string;
  name: string;
  price: number;
  quantity: number;
  currency: string;
}

export interface PricingBreakdown {
  basePrice: number;
  optionsTotal: number;
  discount?: number;
  tax?: number;
  total: number;
  currency: string;
}

export interface BookingSummary {
  productInfo: ProductInfo;
  selectedOptions: SelectedOption[];
  pricing: PricingBreakdown;
  totalPrice: number;
  currency: string;
  participants?: {
    adult: number;
    child: number;
    infant: number;
  };
  schedule?: {
    date: string;
    time: string;
  };
  seats?: Array<{
    id: string;
    seatNumber: string;
    rowNumber: string;
    section: string;
    price: number;
  }>;
}

// Main Content Types
export interface ContentTab {
  id: string;
  title: string;
  icon: ReactNode;
  content: ReactNode;
  isActive: boolean;
  isDisabled?: boolean;
}

// Booking State Types
export interface BookingState {
  currentStep: number;
  steps: ProgressStep[];
  formData: Record<string, any>;
  summary: BookingSummary;
  errors: Record<string, string>;
  isLoading: boolean;
}

// Form Field Types
export interface FormField {
  name: string;
  type: 'text' | 'number' | 'select' | 'date' | 'time' | 'checkbox' | 'radio' | 'textarea';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: Array<{
    value: string;
    label: string;
    price?: number;
  }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => string | null;
  };
}

// Step Configuration
export interface BookingStepConfig {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  isRequired: boolean;
  component?: string;
  validation?: (data: any) => Record<string, string>;
}

// Product Configuration
export interface UnifiedProductConfig {
  type: 'tour' | 'event' | 'transfer';
  steps: BookingStepConfig[];
  pricing: {
    type: 'dynamic' | 'fixed' | 'tiered';
    calculatePrice: (product: any, formData: any) => number;
    calculateBreakdown: (product: any, formData: any) => PricingBreakdown;
  };
  validation: {
    checkAvailability?: boolean;
    validateCapacity?: boolean;
    validateCutoffTime?: boolean;
  };
}

// API Integration Types
export interface BookingRequest {
  productId: string;
  productType: 'tour' | 'event' | 'transfer';
  formData: Record<string, any>;
  summary: BookingSummary;
}

export interface BookingResponse {
  success: boolean;
  bookingId?: string;
  cartItemId?: string;
  error?: string;
  message?: string;
}

export interface BaseBookingData {
  id: string;
  type: 'tour' | 'event' | 'transfer';
  title: string;
  description: string;
  price: number;
  currency: string;
  image: string;
}

export interface TourBookingData extends BaseBookingData {
  type: 'tour';
  duration: string;
  maxParticipants: number;
  includes: string[];
  schedule: {
    date: string;
    time: string;
    available: boolean;
  }[];
  variants: {
    id: string;
    name: string;
    price: number;
    description: string;
  }[];
}

export interface EventBookingData extends BaseBookingData {
  type: 'event';
  date: string;
  time: string;
  venue: string;
  capacity: number;
  availableSeats: number;
  categories: {
    id: string;
    name: string;
    price: number;
    description: string;
  }[];
}

export interface TransferBookingData extends BaseBookingData {
  type: 'transfer';
  from: string;
  to: string;
  vehicleType: string;
  maxPassengers: number;
  duration: string;
  schedules: {
    id: string;
    time: string;
    available: boolean;
  }[];
}

export type BookingData = TourBookingData | EventBookingData | TransferBookingData;

// Type guards
export function isTourBooking(data: BookingData): data is TourBookingData {
  return data.type === 'tour';
}

export function isEventBooking(data: BookingData): data is EventBookingData {
  return data.type === 'event';
}

export function isTransferBooking(data: BookingData): data is TransferBookingData {
  return data.type === 'transfer';
}

// Booking form data
export interface BookingFormData {
  productId: string;
  productType: 'tour' | 'event' | 'transfer';
  participants?: number;
  date?: string;
  time?: string;
  variantId?: string;
  categoryId?: string;
  scheduleId?: string;
  options: string[];
  specialRequests?: string;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

// Extended Pricing calculation
export interface ExtendedPricingBreakdown {
  basePrice: number;
  options: {
    name: string;
    price: number;
  }[];
  discount?: {
    type: string;
    amount: number;
    description: string;
  };
  total: number;
  currency: string;
}

// Booking steps configuration
export interface BookingStep {
  id: string;
  title: string;
  description: string;
  isRequired: boolean;
  isCompleted: boolean;
  fields: BookingField[];
}

export interface BookingField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'select' | 'date' | 'time' | 'checkbox' | 'textarea';
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    message?: string;
  };
  options?: {
    value: string;
    label: string;
  }[];
} 