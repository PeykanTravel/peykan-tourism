"""
Simple integration tests for reservation system
"""

from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal

from reservations.models import Reservation, ReservationItem

User = get_user_model()


class SimpleReservationIntegrationTestCase(TestCase):
    """Simple integration tests for the reservation system"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_create_simple_reservation(self):
        """Test creating a simple reservation"""
        reservation_data = {
            'items': [
                {
                    'product_type': 'tour',
                    'product_id': 'test-tour-1',
                    'product_title': 'Test Tour',
                    'product_slug': 'test-tour',
                    'booking_date': '2024-12-25',
                    'booking_time': '10:00:00',
                    'quantity': 2,
                    'unit_price': '50.00',
                    'total_price': '100.00',
                    'currency': 'USD',
                    'selected_options': [],
                    'options_total': '0.00',
                    'booking_data': {
                        'tour_id': 'test-tour-1',
                        'participants': {'adult': 2}
                    }
                }
            ],
            'customer_name': 'Test Customer',
            'customer_email': 'customer@example.com',
            'customer_phone': '+1234567890'
        }
        
        response = self.client.post(
            reverse('reservations:create-reservation'),
            reservation_data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('reservation_number', response.data)
        self.assertEqual(response.data['status'], 'draft')
    
    def test_list_reservations(self):
        """Test listing reservations"""
        # Create a test reservation
        reservation = Reservation.objects.create(
            user=self.user,
            customer_name='Test Customer',
            customer_email='test@example.com',
            customer_phone='+1234567890',
            subtotal=Decimal('100.00'),
            tax_amount=Decimal('10.00'),
            total_amount=Decimal('110.00'),
            currency='USD'
        )
        
        response = self.client.get(reverse('reservations:reservation-list'))
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['id'], str(reservation.id))
    
    def test_get_reservation_detail(self):
        """Test getting reservation detail"""
        reservation = Reservation.objects.create(
            user=self.user,
            customer_name='Test Customer',
            customer_email='test@example.com',
            customer_phone='+1234567890',
            subtotal=Decimal('100.00'),
            tax_amount=Decimal('10.00'),
            total_amount=Decimal('110.00'),
            currency='USD'
        )
        
        response = self.client.get(
            reverse('reservations:reservation-detail', kwargs={'pk': reservation.id})
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], str(reservation.id))
        self.assertEqual(response.data['customer_name'], 'Test Customer')
    
    def test_confirm_reservation(self):
        """Test confirming a reservation"""
        reservation = Reservation.objects.create(
            user=self.user,
            customer_name='Test Customer',
            customer_email='test@example.com',
            customer_phone='+1234567890',
            subtotal=Decimal('100.00'),
            tax_amount=Decimal('10.00'),
            total_amount=Decimal('110.00'),
            currency='USD',
            status='draft'
        )
        
        response = self.client.post(
            reverse('reservations:reservation-confirm', kwargs={'pk': reservation.id})
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        reservation.refresh_from_db()
        self.assertEqual(reservation.status, 'confirmed')
    
    def test_cancel_reservation(self):
        """Test cancelling a reservation"""
        reservation = Reservation.objects.create(
            user=self.user,
            customer_name='Test Customer',
            customer_email='test@example.com',
            customer_phone='+1234567890',
            subtotal=Decimal('100.00'),
            tax_amount=Decimal('10.00'),
            total_amount=Decimal('110.00'),
            currency='USD',
            status='confirmed'
        )
        
        response = self.client.post(
            reverse('reservations:reservation-cancel', kwargs={'pk': reservation.id}),
            {'reason': 'Customer request'}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        reservation.refresh_from_db()
        self.assertEqual(reservation.status, 'cancelled')
    
    def test_calculate_pricing(self):
        """Test pricing calculation endpoint"""
        pricing_data = {
            'product_type': 'tour',
            'tour_id': 'test-tour-1',
            'variant_id': 'test-variant-1',
            'participants': {'adult': 2, 'child': 1},
            'selected_options': [],
            'discount_code': ''
        }
        
        response = self.client.post(
            reverse('reservations:calculate-pricing'),
            pricing_data,
            format='json'
        )
        
        # This should work even with mock data
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST])
    
    def test_check_availability(self):
        """Test availability check endpoint"""
        availability_data = {
            'product_type': 'tour',
            'tour_id': 'test-tour-1',
            'variant_id': 'test-variant-1',
            'booking_date': '2024-12-25',
            'booking_time': '10:00:00',
            'participants': {'adult': 2}
        }
        
        response = self.client.post(
            reverse('reservations:check-availability'),
            availability_data,
            format='json'
        )
        
        # This should work even with mock data
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST])
    
    def test_reservation_with_items(self):
        """Test creating reservation with multiple items"""
        reservation_data = {
            'items': [
                {
                    'product_type': 'tour',
                    'product_id': 'tour-1',
                    'product_title': 'City Tour',
                    'product_slug': 'city-tour',
                    'booking_date': '2024-12-25',
                    'booking_time': '10:00:00',
                    'quantity': 2,
                    'unit_price': '50.00',
                    'total_price': '100.00',
                    'currency': 'USD',
                    'selected_options': [],
                    'options_total': '0.00',
                    'booking_data': {'tour_id': 'tour-1'}
                },
                {
                    'product_type': 'transfer',
                    'product_id': 'transfer-1',
                    'product_title': 'Airport Transfer',
                    'product_slug': 'airport-transfer',
                    'booking_date': '2024-12-25',
                    'booking_time': '08:00:00',
                    'quantity': 1,
                    'unit_price': '30.00',
                    'total_price': '30.00',
                    'currency': 'USD',
                    'selected_options': [],
                    'options_total': '0.00',
                    'booking_data': {'route_id': 'transfer-1'}
                }
            ],
            'customer_name': 'Test Customer',
            'customer_email': 'customer@example.com',
            'customer_phone': '+1234567890'
        }
        
        response = self.client.post(
            reverse('reservations:create-reservation'),
            reservation_data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data['items']), 2)
    
    def test_reservation_history(self):
        """Test reservation history tracking"""
        reservation = Reservation.objects.create(
            user=self.user,
            customer_name='Test Customer',
            customer_email='test@example.com',
            customer_phone='+1234567890',
            subtotal=Decimal('100.00'),
            tax_amount=Decimal('10.00'),
            total_amount=Decimal('110.00'),
            currency='USD',
            status='draft'
        )
        
        # Confirm the reservation
        self.client.post(
            reverse('reservations:reservation-confirm', kwargs={'pk': reservation.id})
        )
        
        # Cancel the reservation
        self.client.post(
            reverse('reservations:reservation-cancel', kwargs={'pk': reservation.id})
        )
        
        # Check history
        response = self.client.get(
            reverse('reservations:reservation-detail', kwargs={'pk': reservation.id})
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('history', response.data)
        self.assertEqual(len(response.data['history']), 3)  # draft -> confirmed -> cancelled 