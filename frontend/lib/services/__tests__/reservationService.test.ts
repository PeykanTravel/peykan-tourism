import { reservationService } from '../reservationService';
import { PricingRequest, AvailabilityRequest, ReservationRequest } from '../reservationService';

// Mock fetch
global.fetch = jest.fn();

describe('ReservationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'mock-token'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  describe('calculatePricing', () => {
    it('should calculate pricing successfully', async () => {
      const mockResponse = {
        base_price: 100,
        variant_price: 0,
        options_total: 10,
        subtotal: 110,
        tax_amount: 11,
        total_amount: 121,
        currency: 'USD',
        discount_amount: 0,
        discount_code: '',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const request: PricingRequest = {
        product_type: 'tour',
        product_id: '123',
        booking_date: '2024-01-15',
        booking_time: '10:00',
        quantity: 2,
        participants: { adult: 2, child: 0 },
      };

      const result = await reservationService.calculatePricing(request);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/calculate-pricing/'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on failed request', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      const request: PricingRequest = {
        product_type: 'tour',
        product_id: '123',
        booking_date: '2024-01-15',
        booking_time: '10:00',
        quantity: 2,
      };

      await expect(reservationService.calculatePricing(request)).rejects.toThrow(
        'Failed to calculate pricing'
      );
    });
  });

  describe('checkAvailability', () => {
    it('should check availability successfully', async () => {
      const mockResponse = {
        available: true,
        available_quantity: 10,
        message: 'Available',
        details: { capacity: 50 },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const request: AvailabilityRequest = {
        product_type: 'tour',
        product_id: '123',
        booking_date: '2024-01-15',
        booking_time: '10:00',
        quantity: 2,
      };

      const result = await reservationService.checkAvailability(request);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/check-availability/'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on failed request', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      const request: AvailabilityRequest = {
        product_type: 'tour',
        product_id: '123',
        booking_date: '2024-01-15',
        booking_time: '10:00',
        quantity: 2,
      };

      await expect(reservationService.checkAvailability(request)).rejects.toThrow(
        'Failed to check availability'
      );
    });
  });

  describe('reserveCapacity', () => {
    it('should reserve capacity successfully', async () => {
      const mockResponse = {
        message: 'Capacity reserved successfully',
        expires_at: '2024-01-15T10:30:00Z',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const request = {
        product_type: 'tour' as const,
        product_id: '123',
        booking_date: '2024-01-15',
        booking_time: '10:00',
        quantity: 2,
      };

      const result = await reservationService.reserveCapacity(request);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/reserve-capacity/'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on failed request', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      const request = {
        product_type: 'tour' as const,
        product_id: '123',
        booking_date: '2024-01-15',
        booking_time: '10:00',
        quantity: 2,
      };

      await expect(reservationService.reserveCapacity(request)).rejects.toThrow(
        'Failed to reserve capacity'
      );
    });
  });

  describe('createReservation', () => {
    it('should create reservation successfully', async () => {
      const mockResponse = {
        id: 'res-123',
        reservation_number: 'RV12345678',
        user: 'user-123',
        status: 'draft',
        payment_status: 'pending',
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        customer_phone: '+1234567890',
        subtotal: 100,
        tax_amount: 10,
        total_amount: 110,
        currency: 'USD',
        discount_amount: 0,
        special_requirements: '',
        is_expired: false,
        can_be_confirmed: false,
        items: [],
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const request: ReservationRequest = {
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        customer_phone: '+1234567890',
        items: [
          {
            product_type: 'tour',
            product_id: '123',
            product_title: 'Test Tour',
            product_slug: 'test-tour',
            booking_date: '2024-01-15',
            booking_time: '10:00',
            quantity: 2,
            unit_price: 50,
            total_price: 100,
            currency: 'USD',
            selected_options: [],
            options_total: 0,
            booking_data: {},
          },
        ],
      };

      const result = await reservationService.createReservation(request);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/create-reservation/'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token',
          },
          body: JSON.stringify(request),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on failed request', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      const request: ReservationRequest = {
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        customer_phone: '+1234567890',
        items: [],
      };

      await expect(reservationService.createReservation(request)).rejects.toThrow(
        'Failed to create reservation'
      );
    });
  });

  describe('getReservations', () => {
    it('should fetch reservations successfully', async () => {
      const mockResponse = [
        {
          id: 'res-123',
          reservation_number: 'RV12345678',
          customer_name: 'John Doe',
          status: 'confirmed',
          total_amount: 110,
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await reservationService.getReservations();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/reservations/'),
        expect.objectContaining({
          headers: { 'Authorization': 'Bearer mock-token' },
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on failed request', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      await expect(reservationService.getReservations()).rejects.toThrow(
        'Failed to fetch reservations'
      );
    });
  });

  describe('getReservation', () => {
    it('should fetch single reservation successfully', async () => {
      const mockResponse = {
        id: 'res-123',
        reservation_number: 'RV12345678',
        customer_name: 'John Doe',
        status: 'confirmed',
        total_amount: 110,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await reservationService.getReservation('res-123');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/reservations/res-123/'),
        expect.objectContaining({
          headers: { 'Authorization': 'Bearer mock-token' },
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on failed request', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(reservationService.getReservation('res-123')).rejects.toThrow(
        'Failed to fetch reservation'
      );
    });
  });

  describe('confirmReservation', () => {
    it('should confirm reservation successfully', async () => {
      const mockResponse = {
        message: 'Reservation confirmed successfully',
        status: 'confirmed',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await reservationService.confirmReservation('res-123');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/reservations/res-123/confirm/'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Authorization': 'Bearer mock-token' },
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on failed request', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      await expect(reservationService.confirmReservation('res-123')).rejects.toThrow(
        'Failed to confirm reservation'
      );
    });
  });

  describe('cancelReservation', () => {
    it('should cancel reservation successfully', async () => {
      const mockResponse = {
        message: 'Reservation cancelled successfully',
        status: 'cancelled',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await reservationService.cancelReservation('res-123', 'Changed plans');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/reservations/res-123/cancel/'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token',
          },
          body: JSON.stringify({ reason: 'Changed plans' }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on failed request', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      await expect(reservationService.cancelReservation('res-123')).rejects.toThrow(
        'Failed to cancel reservation'
      );
    });
  });

  describe('updateReservationStatus', () => {
    it('should update reservation status successfully', async () => {
      const mockResponse = {
        message: 'Status updated successfully',
        status: 'completed',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await reservationService.updateReservationStatus(
        'res-123',
        'completed',
        'Tour completed'
      );

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/reservations/res-123/update_status/'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token',
          },
          body: JSON.stringify({
            status: 'completed',
            reason: 'Tour completed',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on failed request', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      await expect(
        reservationService.updateReservationStatus('res-123', 'completed')
      ).rejects.toThrow('Failed to update reservation status');
    });
  });
}); 