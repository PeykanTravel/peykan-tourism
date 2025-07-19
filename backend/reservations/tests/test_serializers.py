"""
Tests for Reservation serializers
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from decimal import Decimal
import uuid
from datetime import date, time

from ..serializers import (
    ReservationSerializer, ReservationCreateSerializer, ReservationItemSerializer,
    PricingCalculationSerializer, PricingResponseSerializer,
    AvailabilityCheckSerializer, AvailabilityResponseSerializer,
    ReservationStatusUpdateSerializer
)
from ..models import Reservation, ReservationItem

User = get_user_model()


class ReservationSerializerTest(TestCase):
    """Test cases for ReservationSerializer"""
    
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.reservation = Reservation.objects.create(
            user=self.user,
            customer_name='John Doe',
            customer_email='john@example.com',
            customer_phone='+1234567890',
            subtotal=Decimal('100.00'),
            tax_amount=Decimal('10.00'),
            total_amount=Decimal('110.00'),
            currency='USD'
        )
        
        self.reservation_item = ReservationItem.objects.create(
            reservation=self.reservation,
            product_type='tour',
            product_id=uuid.uuid4(),
            product_title='Test Tour',
            product_slug='test-tour',
            booking_date=date.today(),
            booking_time=time(10, 0),
            quantity=1,
            unit_price=Decimal('100.00'),
            total_price=Decimal('100.00'),
            currency='USD'
        )
    
    def test_reservation_serialization(self):
        """Test reservation serialization"""
        serializer = ReservationSerializer(self.reservation)
        data = serializer.data
        
        self.assertEqual(data['customer_name'], 'John Doe')
        self.assertEqual(data['customer_email'], 'john@example.com')
        self.assertEqual(data['status'], 'draft')
        self.assertEqual(data['payment_status'], 'pending')
        self.assertEqual(data['subtotal'], '100.00')
        self.assertEqual(data['total_amount'], '110.00')
        self.assertEqual(data['currency'], 'USD')
        self.assertIn('items', data)
        self.assertIn('history', data)
    
    def test_reservation_item_serialization(self):
        """Test reservation item serialization"""
        serializer = ReservationItemSerializer(self.reservation_item)
        data = serializer.data
        
        self.assertEqual(data['product_type'], 'tour')
        self.assertEqual(data['product_title'], 'Test Tour')
        self.assertEqual(data['quantity'], 1)
        self.assertEqual(data['unit_price'], '100.00')
        self.assertEqual(data['total_price'], '100.00')


class ReservationCreateSerializerTest(TestCase):
    """Test cases for ReservationCreateSerializer"""
    
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.valid_data = {
            'customer_name': 'John Doe',
            'customer_email': 'john@example.com',
            'customer_phone': '+1234567890',
            'special_requirements': 'Window seat preferred',
            'items': [
                {
                    'product_type': 'tour',
                    'product_id': str(uuid.uuid4()),
                    'product_title': 'Test Tour',
                    'product_slug': 'test-tour',
                    'booking_date': date.today(),
                    'booking_time': time(10, 0),
                    'quantity': 2,
                    'unit_price': Decimal('50.00'),
                    'total_price': Decimal('100.00'),
                    'currency': 'USD',
                    'selected_options': [],
                    'options_total': Decimal('0.00'),
                    'booking_data': {}
                }
            ]
        }
    
    def test_valid_reservation_creation(self):
        """Test valid reservation creation data"""
        serializer = ReservationCreateSerializer(data=self.valid_data)
        self.assertTrue(serializer.is_valid())
    
    def test_invalid_reservation_creation_missing_items(self):
        """Test invalid reservation creation without items"""
        invalid_data = self.valid_data.copy()
        invalid_data['items'] = []
        
        serializer = ReservationCreateSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('items', serializer.errors)
    
    def test_invalid_reservation_creation_invalid_quantity(self):
        """Test invalid reservation creation with invalid quantity"""
        invalid_data = self.valid_data.copy()
        invalid_data['items'][0]['quantity'] = 0
        
        serializer = ReservationCreateSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('items', serializer.errors)


class PricingCalculationSerializerTest(TestCase):
    """Test cases for PricingCalculationSerializer"""
    
    def test_valid_tour_pricing_request(self):
        """Test valid tour pricing request"""
        data = {
            'product_type': 'tour',
            'product_id': str(uuid.uuid4()),
            'booking_date': date.today(),
            'booking_time': time(10, 0),
            'quantity': 2,
            'variant_id': str(uuid.uuid4()),
            'participants': {'adult': 2, 'child': 0},
            'selected_options': [],
            'discount_code': 'SAVE10'
        }
        
        serializer = PricingCalculationSerializer(data=data)
        self.assertTrue(serializer.is_valid())
    
    def test_valid_event_pricing_request(self):
        """Test valid event pricing request"""
        data = {
            'product_type': 'event',
            'product_id': str(uuid.uuid4()),
            'booking_date': date.today(),
            'booking_time': time(19, 0),
            'quantity': 1,
            'performance_id': str(uuid.uuid4()),
            'selected_seats': [str(uuid.uuid4()), str(uuid.uuid4())],
            'selected_options': [],
            'discount_code': 'EVENT20'
        }
        
        serializer = PricingCalculationSerializer(data=data)
        self.assertTrue(serializer.is_valid())
    
    def test_valid_transfer_pricing_request(self):
        """Test valid transfer pricing request"""
        data = {
            'product_type': 'transfer',
            'product_id': str(uuid.uuid4()),
            'booking_date': date.today(),
            'booking_time': time(8, 0),
            'quantity': 1,
            'route_id': str(uuid.uuid4()),
            'vehicle_type': 'economy',
            'trip_type': 'one_way',
            'pickup_date': date.today(),
            'pickup_time': time(8, 0),
            'selected_options': [],
            'discount_code': 'TRANSFER15'
        }
        
        serializer = PricingCalculationSerializer(data=data)
        self.assertTrue(serializer.is_valid())
    
    def test_invalid_event_pricing_missing_performance_id(self):
        """Test invalid event pricing request without performance_id"""
        data = {
            'product_type': 'event',
            'product_id': str(uuid.uuid4()),
            'booking_date': date.today(),
            'booking_time': time(19, 0),
            'quantity': 1,
            'selected_seats': [str(uuid.uuid4())],
            'selected_options': []
        }
        
        serializer = PricingCalculationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('performance_id', serializer.errors)
    
    def test_invalid_tour_pricing_missing_participants(self):
        """Test invalid tour pricing request without participants"""
        data = {
            'product_type': 'tour',
            'product_id': str(uuid.uuid4()),
            'booking_date': date.today(),
            'booking_time': time(10, 0),
            'quantity': 2,
            'variant_id': str(uuid.uuid4()),
            'selected_options': []
        }
        
        serializer = PricingCalculationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('participants', serializer.errors)
    
    def test_invalid_transfer_pricing_missing_route_id(self):
        """Test invalid transfer pricing request without route_id"""
        data = {
            'product_type': 'transfer',
            'product_id': str(uuid.uuid4()),
            'booking_date': date.today(),
            'booking_time': time(8, 0),
            'quantity': 1,
            'vehicle_type': 'economy',
            'trip_type': 'one_way',
            'pickup_date': date.today(),
            'pickup_time': time(8, 0),
            'selected_options': []
        }
        
        serializer = PricingCalculationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('route_id', serializer.errors)


class AvailabilityCheckSerializerTest(TestCase):
    """Test cases for AvailabilityCheckSerializer"""
    
    def test_valid_availability_request(self):
        """Test valid availability check request"""
        data = {
            'product_type': 'tour',
            'product_id': str(uuid.uuid4()),
            'booking_date': date.today(),
            'booking_time': time(10, 0),
            'quantity': 2,
            'variant_id': str(uuid.uuid4())
        }
        
        serializer = AvailabilityCheckSerializer(data=data)
        self.assertTrue(serializer.is_valid())
    
    def test_invalid_availability_request_missing_required_fields(self):
        """Test invalid availability check request with missing fields"""
        data = {
            'product_type': 'tour',
            'product_id': str(uuid.uuid4()),
            'quantity': 2
        }
        
        serializer = AvailabilityCheckSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('booking_date', serializer.errors)
        self.assertIn('booking_time', serializer.errors)


class ReservationStatusUpdateSerializerTest(TestCase):
    """Test cases for ReservationStatusUpdateSerializer"""
    
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.reservation = Reservation.objects.create(
            user=self.user,
            customer_name='John Doe',
            customer_email='john@example.com',
            customer_phone='+1234567890',
            subtotal=Decimal('100.00'),
            tax_amount=Decimal('10.00'),
            total_amount=Decimal('110.00'),
            currency='USD',
            status='pending'
        )
    
    def test_valid_status_update(self):
        """Test valid status update"""
        data = {
            'status': 'confirmed',
            'reason': 'Payment confirmed'
        }
        
        serializer = ReservationStatusUpdateSerializer(
            data=data,
            context={'request': None, 'reservation': self.reservation}
        )
        self.assertTrue(serializer.is_valid())
    
    def test_invalid_status_transition(self):
        """Test invalid status transition"""
        data = {
            'status': 'completed',
            'reason': 'Invalid transition'
        }
        
        serializer = ReservationStatusUpdateSerializer(
            data=data,
            context={'request': None, 'reservation': self.reservation}
        )
        self.assertFalse(serializer.is_valid())
        self.assertIn('status', serializer.errors) 