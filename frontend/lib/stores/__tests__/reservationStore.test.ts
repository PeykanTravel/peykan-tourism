import { renderHook, act } from '@testing-library/react';
import { useReservationStore } from '../reservationStore';

describe('ReservationStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useReservationStore());
    act(() => {
      result.current.reset();
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useReservationStore());

      expect(result.current.currentStep).toBe(1);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.reservationData).toBe(null);
      expect(result.current.pricingData).toBe(null);
    });
  });

  describe('Step Navigation', () => {
    it('should navigate to next step', () => {
      const { result } = renderHook(() => useReservationStore());

      act(() => {
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe(2);
    });

    it('should navigate to previous step', () => {
      const { result } = renderHook(() => useReservationStore());

      act(() => {
        result.current.nextStep();
        result.current.previousStep();
      });

      expect(result.current.currentStep).toBe(1);
    });

    it('should not go below step 1', () => {
      const { result } = renderHook(() => useReservationStore());

      act(() => {
        result.current.previousStep();
      });

      expect(result.current.currentStep).toBe(1);
    });

    it('should set specific step', () => {
      const { result } = renderHook(() => useReservationStore());

      act(() => {
        result.current.setCurrentStep(3);
      });

      expect(result.current.currentStep).toBe(3);
    });
  });

  describe('Loading State', () => {
    it('should set loading state', () => {
      const { result } = renderHook(() => useReservationStore());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should clear loading state', () => {
      const { result } = renderHook(() => useReservationStore());

      act(() => {
        result.current.setLoading(true);
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should set error', () => {
      const { result } = renderHook(() => useReservationStore());
      const errorMessage = 'Something went wrong';

      act(() => {
        result.current.setError(errorMessage);
      });

      expect(result.current.error).toBe(errorMessage);
    });

    it('should clear error', () => {
      const { result } = renderHook(() => useReservationStore());

      act(() => {
        result.current.setError('Error message');
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('Reservation Data', () => {
    it('should set reservation data', () => {
      const { result } = renderHook(() => useReservationStore());
      const mockData = {
        productType: 'tour',
        productId: '123',
        customerName: 'John Doe'
      };

      act(() => {
        result.current.setReservationData(mockData);
      });

      expect(result.current.reservationData).toEqual(mockData);
    });

    it('should update reservation data', () => {
      const { result } = renderHook(() => useReservationStore());
      const initialData = { productType: 'tour', productId: '123' };
      const updatedData = { productType: 'tour', productId: '123', customerName: 'John Doe' };

      act(() => {
        result.current.setReservationData(initialData);
        result.current.updateReservationData({ customerName: 'John Doe' });
      });

      expect(result.current.reservationData).toEqual(updatedData);
    });
  });

  describe('Pricing Data', () => {
    it('should set pricing data', () => {
      const { result } = renderHook(() => useReservationStore());
      const mockPricing = {
        base_price: 100,
        total_amount: 110,
        currency: 'USD'
      };

      act(() => {
        result.current.setPricingData(mockPricing);
      });

      expect(result.current.pricingData).toEqual(mockPricing);
    });
  });

  describe('Product Selection', () => {
    it('should set selected product', () => {
      const { result } = renderHook(() => useReservationStore());
      const mockProduct = {
        id: '123',
        title: 'Test Tour',
        type: 'tour'
      };

      act(() => {
        result.current.setSelectedProduct(mockProduct);
      });

      expect(result.current.selectedProduct).toEqual(mockProduct);
    });
  });

  describe('Booking Details', () => {
    it('should set booking details', () => {
      const { result } = renderHook(() => useReservationStore());
      const mockDetails = {
        date: '2024-01-15',
        time: '10:00',
        quantity: 2
      };

      act(() => {
        result.current.setBookingDetails(mockDetails);
      });

      expect(result.current.bookingDetails).toEqual(mockDetails);
    });

    it('should update booking details', () => {
      const { result } = renderHook(() => useReservationStore());
      const initialDetails = { date: '2024-01-15', time: '10:00' };
      const updatedDetails = { date: '2024-01-15', time: '10:00', quantity: 3 };

      act(() => {
        result.current.setBookingDetails(initialDetails);
        result.current.updateBookingDetails({ quantity: 3 });
      });

      expect(result.current.bookingDetails).toEqual(updatedDetails);
    });
  });

  describe('Options Selection', () => {
    it('should add option', () => {
      const { result } = renderHook(() => useReservationStore());
      const mockOption = { id: '1', name: 'Extra Service', price: 10 };

      act(() => {
        result.current.addOption(mockOption);
      });

      expect(result.current.selectedOptions).toContain(mockOption);
    });

    it('should remove option', () => {
      const { result } = renderHook(() => useReservationStore());
      const mockOption = { id: '1', name: 'Extra Service', price: 10 };

      act(() => {
        result.current.addOption(mockOption);
        result.current.removeOption('1');
      });

      expect(result.current.selectedOptions).not.toContain(mockOption);
    });

    it('should update option quantity', () => {
      const { result } = renderHook(() => useReservationStore());
      const mockOption = { id: '1', name: 'Extra Service', price: 10, quantity: 1 };

      act(() => {
        result.current.addOption(mockOption);
        result.current.updateOptionQuantity('1', 3);
      });

      const updatedOption = result.current.selectedOptions.find(opt => opt.id === '1');
      expect(updatedOption?.quantity).toBe(3);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset store to initial state', () => {
      const { result } = renderHook(() => useReservationStore());

      act(() => {
        result.current.nextStep();
        result.current.setLoading(true);
        result.current.setError('Error');
        result.current.setReservationData({ productType: 'tour' });
        result.current.setPricingData({ base_price: 100 });
        result.current.setSelectedProduct({ id: '123', title: 'Test' });
        result.current.setBookingDetails({ date: '2024-01-15' });
        result.current.addOption({ id: '1', name: 'Service' });
        
        result.current.reset();
      });

      expect(result.current.currentStep).toBe(1);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.reservationData).toBe(null);
      expect(result.current.pricingData).toBe(null);
      expect(result.current.selectedProduct).toBe(null);
      expect(result.current.bookingDetails).toBe(null);
      expect(result.current.selectedOptions).toEqual([]);
    });
  });

  describe('Validation', () => {
    it('should validate current step', () => {
      const { result } = renderHook(() => useReservationStore());

      // Step 1 should be valid by default
      expect(result.current.isCurrentStepValid()).toBe(true);

      // Set some required data and check validation
      act(() => {
        result.current.setSelectedProduct({ id: '123', title: 'Test' });
        result.current.setBookingDetails({ date: '2024-01-15', time: '10:00' });
      });

      expect(result.current.isCurrentStepValid()).toBe(true);
    });

    it('should check if can proceed to next step', () => {
      const { result } = renderHook(() => useReservationStore());

      // Should be able to proceed if current step is valid
      expect(result.current.canProceedToNextStep()).toBe(true);

      act(() => {
        result.current.setError('Validation error');
      });

      expect(result.current.canProceedToNextStep()).toBe(false);
    });
  });
}); 