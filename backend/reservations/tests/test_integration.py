"""
Integration tests for reservation system
"""

from decimal import Decimal
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
from datetime import date, time, timedelta

from .test_data_factory import ReservationTestDataFactory
from reservations.models import Reservation, ReservationItem
from reservations.domain.product_services import ProductReservationFactory

User = get_user_model()


class ReservationIntegrationTestCase(TestCase):
    """Integration tests for the complete reservation system"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        self.user = ReservationTestDataFactory.create_test_user()
        self.client.force_authenticate(user=self.user)
        
        # Create test products
        self.event, self.performance, self.seats = ReservationTestDataFactory.create_test_event()
        self.tour, self.variant, self.schedule = ReservationTestDataFactory.create_test_tour()
        self.route, self.vehicle = ReservationTestDataFactory.create_test_transfer()
        
        # Create test discounts
        self.event_discount = ReservationTestDataFactory.create_test_discount(
            'event', str(self.event.id)
        )
        self.tour_discount = ReservationTestDataFactory.create_test_discount(
            'tour', str(self.tour.id)
        )
        self.transfer_discount = ReservationTestDataFactory.create_test_discount(
            'transfer', str(self.route.id)
        )
    
    def test_event_reservation_flow(self):
        """Test complete event reservation flow"""
        # Step 1: Check availability
        availability_data = {
            'product_type': 'event',
            'event_id': str(self.event.id),
            'performance_id': str(self.performance.id),
            'seat_ids': [str(self.seats[0].id), str(self.seats[1].id)],
            'booking_date': self.performance.date.isoformat(),
            'booking_time': self.performance.start_time.isoformat()
        }
        
        response = self.client.post(
            reverse('reservations:check-availability'),
            availability_data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['available'])
        
        # Step 2: Calculate pricing
        pricing_data = {
            'product_type': 'event',
            'event_id': str(self.event.id),
            'performance_id': str(self.performance.id),
            'selected_seats': [
                {
                    'id': str(self.seats[0].id),
                    'seat_number': self.seats[0].seat_number,
                    'row_number': self.seats[0].row_number,
                    'section': self.seats[0].section.name
                },
                {
                    'id': str(self.seats[1].id),
                    'seat_number': self.seats[1].seat_number,
                    'row_number': self.seats[1].row_number,
                    'section': self.seats[1].section.name
                }
            ],
            'selected_options': [],
            'discount_code': self.event_discount.code
        }
        
        response = self.client.post(
            reverse('reservations:calculate-pricing'),
            pricing_data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_amount', response.data)
        self.assertIn('breakdown', response.data)
        
        pricing_result = response.data
        
        # Step 3: Reserve capacity
        reserve_data = {
            'product_type': 'event',
            'event_id': str(self.event.id),
            'performance_id': str(self.performance.id),
            'seat_ids': [str(self.seats[0].id), str(self.seats[1].id)],
            'booking_date': self.performance.date.isoformat(),
            'booking_time': self.performance.start_time.isoformat(),
            'duration_minutes': 30
        }
        
        response = self.client.post(
            reverse('reservations:reserve-capacity'),
            reserve_data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        
        # Step 4: Create reservation
        reservation_data = {
            'items': [
                {
                    'product_type': 'event',
                    'product_id': str(self.event.id),
                    'product_title': self.event.title,
                    'product_slug': self.event.slug,
                    'booking_date': self.performance.date.isoformat(),
                    'booking_time': self.performance.start_time.isoformat(),
                    'quantity': 2,
                    'unit_price': pricing_result['base_price'] / 2,
                    'total_price': pricing_result['base_price'],
                    'currency': pricing_result['currency'],
                    'selected_options': [],
                    'options_total': pricing_result['options_total'],
                    'booking_data': {
                        'event_id': str(self.event.id),
                        'performance_id': str(self.performance.id),
                        'seat_ids': [str(self.seats[0].id), str(self.seats[1].id)]
                    }
                }
            ],
            'customer_name': 'Test Customer',
            'customer_email': 'customer@example.com',
            'customer_phone': '+1234567890',
            'special_requirements': 'Wheelchair accessible seats'
        }
        
        response = self.client.post(
            reverse('reservations:create-reservation'),
            reservation_data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('reservation_number', response.data)
        
        # Step 5: Verify reservation was created
        reservation_id = response.data['id']
        response = self.client.get(
            reverse('reservations:reservation-detail', kwargs={'pk': reservation_id})
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'draft')
        self.assertEqual(len(response.data['items']), 1)
    
    def test_tour_reservation_flow(self):
        """Test complete tour reservation flow"""
        # Step 1: Check availability
        availability_data = {
            'product_type': 'tour',
            'tour_id': str(self.tour.id),
            'variant_id': str(self.variant.id),
            'booking_date': self.schedule.date.isoformat(),
            'booking_time': self.schedule.start_time.isoformat(),
            'participants': {'adult': 2, 'child': 1}
        }
        
        response = self.client.post(
            reverse('reservations:check-availability'),
            availability_data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['available'])
        
        # Step 2: Calculate pricing
        pricing_data = {
            'product_type': 'tour',
            'tour_id': str(self.tour.id),
            'variant_id': str(self.variant.id),
            'participants': {'adult': 2, 'child': 1},
            'selected_options': [],
            'discount_code': self.tour_discount.code
        }
        
        response = self.client.post(
            reverse('reservations:calculate-pricing'),
            pricing_data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        pricing_result = response.data
        
        # Step 3: Create reservation
        reservation_data = {
            'items': [
                {
                    'product_type': 'tour',
                    'product_id': str(self.tour.id),
                    'product_title': self.tour.title,
                    'product_slug': self.tour.slug,
                    'booking_date': self.schedule.date.isoformat(),
                    'booking_time': self.schedule.start_time.isoformat(),
                    'quantity': 3,
                    'unit_price': pricing_result['base_price'] / 3,
                    'total_price': pricing_result['base_price'],
                    'currency': pricing_result['currency'],
                    'variant_id': str(self.variant.id),
                    'variant_name': self.variant.name,
                    'selected_options': [],
                    'options_total': pricing_result['options_total'],
                    'booking_data': {
                        'tour_id': str(self.tour.id),
                        'variant_id': str(self.variant.id),
                        'schedule_id': str(self.schedule.id),
                        'participants': {'adult': 2, 'child': 1}
                    }
                }
            ],
            'customer_name': 'Tour Customer',
            'customer_email': 'tour@example.com',
            'customer_phone': '+1234567890'
        }
        
        response = self.client.post(
            reverse('reservations:create-reservation'),
            reservation_data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_transfer_reservation_flow(self):
        """Test complete transfer reservation flow"""
        # Step 1: Check availability
        availability_data = {
            'product_type': 'transfer',
            'route_id': str(self.route.id),
            'vehicle_type': 'sedan',
            'trip_type': 'one_way',
            'pickup_date': (date.today() + timedelta(days=1)).isoformat(),
            'pickup_time': time(10, 0).isoformat(),
            'passenger_count': 3,
            'luggage_count': 2
        }
        
        response = self.client.post(
            reverse('reservations:check-availability'),
            availability_data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['available'])
        
        # Step 2: Calculate pricing
        pricing_data = {
            'product_type': 'transfer',
            'route_id': str(self.route.id),
            'vehicle_type': 'sedan',
            'trip_type': 'one_way',
            'passenger_count': 3,
            'luggage_count': 2,
            'selected_options': [],
            'discount_code': self.transfer_discount.code
        }
        
        response = self.client.post(
            reverse('reservations:calculate-pricing'),
            pricing_data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        pricing_result = response.data
        
        # Step 3: Create reservation
        reservation_data = {
            'items': [
                {
                    'product_type': 'transfer',
                    'product_id': str(self.route.id),
                    'product_title': f"Transfer: {self.route.from_location} to {self.route.to_location}",
                    'product_slug': self.route.slug,
                    'booking_date': (date.today() + timedelta(days=1)).isoformat(),
                    'booking_time': time(10, 0).isoformat(),
                    'quantity': 3,
                    'unit_price': pricing_result['base_price'] / 3,
                    'total_price': pricing_result['base_price'],
                    'currency': pricing_result['currency'],
                    'selected_options': [],
                    'options_total': pricing_result['options_total'],
                    'booking_data': {
                        'route_id': str(self.route.id),
                        'vehicle_type': 'sedan',
                        'trip_type': 'one_way',
                        'pickup_date': (date.today() + timedelta(days=1)).isoformat(),
                        'pickup_time': time(10, 0).isoformat(),
                        'passenger_count': 3,
                        'luggage_count': 2,
                        'pickup_address': 'Airport Terminal 1',
                        'dropoff_address': 'City Center Hotel'
                    }
                }
            ],
            'customer_name': 'Transfer Customer',
            'customer_email': 'transfer@example.com',
            'customer_phone': '+1234567890'
        }
        
        response = self.client.post(
            reverse('reservations:create-reservation'),
            reservation_data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_reservation_status_workflow(self):
        """Test reservation status transitions"""
        # Create a reservation
        reservation = ReservationTestDataFactory.create_test_reservation(self.user)
        
        # Test status transitions
        # Draft -> Confirmed
        response = self.client.post(
            reverse('reservations:reservation-confirm', kwargs={'pk': reservation.id})
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        reservation.refresh_from_db()
        self.assertEqual(reservation.status, 'confirmed')
        
        # Confirmed -> Cancelled
        response = self.client.post(
            reverse('reservations:reservation-cancel', kwargs={'pk': reservation.id})
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        reservation.refresh_from_db()
        self.assertEqual(reservation.status, 'cancelled')
    
    def test_reservation_listing_and_filtering(self):
        """Test reservation listing and filtering"""
        # Create multiple reservations
        reservation1 = ReservationTestDataFactory.create_test_reservation(
            self.user, status='draft'
        )
        reservation2 = ReservationTestDataFactory.create_test_reservation(
            self.user, status='confirmed'
        )
        
        # Test listing
        response = self.client.get(reverse('reservations:reservation-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
        
        # Test filtering by status
        response = self.client.get(
            reverse('reservations:reservation-list'),
            {'status': 'draft'}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['status'], 'draft')
    
    def test_error_handling(self):
        """Test error handling in reservation system"""
        # Test invalid product type
        response = self.client.post(
            reverse('reservations:calculate-pricing'),
            {'product_type': 'invalid'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Test missing required fields
        response = self.client.post(
            reverse('reservations:calculate-pricing'),
            {'product_type': 'event'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Test non-existent product
        response = self.client.post(
            reverse('reservations:calculate-pricing'),
            {
                'product_type': 'event',
                'event_id': 'non-existent-id',
                'performance_id': 'non-existent-id',
                'selected_seats': []
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST) 