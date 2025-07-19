"""
Tests for Reservation models
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
from datetime import timedelta
import uuid

from ..models import Reservation, ReservationItem, ReservationHistory

User = get_user_model()


class ReservationModelTest(TestCase):
    """Test cases for Reservation model"""
    
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
    
    def test_reservation_creation(self):
        """Test reservation creation"""
        self.assertIsNotNone(self.reservation.id)
        self.assertIsNotNone(self.reservation.reservation_number)
        self.assertEqual(self.reservation.status, 'draft')
        self.assertEqual(self.reservation.payment_status, 'pending')
        self.assertEqual(self.reservation.customer_name, 'John Doe')
    
    def test_reservation_number_generation(self):
        """Test automatic reservation number generation"""
        self.assertTrue(self.reservation.reservation_number.startswith('RV'))
        self.assertEqual(len(self.reservation.reservation_number), 10)
    
    def test_reservation_confirmation(self):
        """Test reservation confirmation"""
        # Set payment status to paid
        self.reservation.payment_status = 'paid'
        self.reservation.status = 'pending'
        self.reservation.save()
        
        # Create a reservation item
        ReservationItem.objects.create(
            reservation=self.reservation,
            product_type='tour',
            product_id=uuid.uuid4(),
            product_title='Test Tour',
            product_slug='test-tour',
            booking_date=timezone.now().date(),
            booking_time=timezone.now().time(),
            quantity=1,
            unit_price=Decimal('100.00'),
            total_price=Decimal('100.00'),
            currency='USD'
        )
        
        # Test confirmation
        self.assertTrue(self.reservation.can_be_confirmed)
        self.reservation.confirm()
        self.assertEqual(self.reservation.status, 'confirmed')
    
    def test_reservation_cancellation(self):
        """Test reservation cancellation"""
        self.reservation.cancel()
        self.assertEqual(self.reservation.status, 'cancelled')
    
    def test_reservation_expiration(self):
        """Test reservation expiration"""
        # Set expiration to past
        self.reservation.expires_at = timezone.now() - timedelta(hours=1)
        self.reservation.save()
        
        self.assertTrue(self.reservation.is_expired)
    
    def test_reservation_str_representation(self):
        """Test string representation"""
        expected = f"{self.reservation.reservation_number} - {self.reservation.customer_name}"
        self.assertEqual(str(self.reservation), expected)


class ReservationItemModelTest(TestCase):
    """Test cases for ReservationItem model"""
    
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
        
        self.product_id = uuid.uuid4()
        
        self.reservation_item = ReservationItem.objects.create(
            reservation=self.reservation,
            product_type='tour',
            product_id=self.product_id,
            product_title='Test Tour',
            product_slug='test-tour',
            booking_date=timezone.now().date(),
            booking_time=timezone.now().time(),
            quantity=2,
            unit_price=Decimal('50.00'),
            total_price=Decimal('100.00'),
            currency='USD',
            selected_options=[],
            options_total=Decimal('0.00'),
            booking_data={}
        )
    
    def test_reservation_item_creation(self):
        """Test reservation item creation"""
        self.assertIsNotNone(self.reservation_item.id)
        self.assertEqual(self.reservation_item.product_type, 'tour')
        self.assertEqual(self.reservation_item.product_id, self.product_id)
        self.assertEqual(self.reservation_item.quantity, 2)
        self.assertEqual(self.reservation_item.unit_price, Decimal('50.00'))
    
    def test_total_price_calculation(self):
        """Test automatic total price calculation"""
        item = ReservationItem.objects.create(
            reservation=self.reservation,
            product_type='event',
            product_id=uuid.uuid4(),
            product_title='Test Event',
            product_slug='test-event',
            booking_date=timezone.now().date(),
            booking_time=timezone.now().time(),
            quantity=3,
            unit_price=Decimal('30.00'),
            options_total=Decimal('15.00'),
            currency='USD',
            selected_options=[],
            booking_data={}
        )
        
        expected_total = (Decimal('30.00') * 3) + Decimal('15.00')
        self.assertEqual(item.total_price, expected_total)
    
    def test_reservation_item_str_representation(self):
        """Test string representation"""
        expected = f"{self.reservation_item.product_title} - {self.reservation_item.quantity}"
        self.assertEqual(str(self.reservation_item), expected)


class ReservationHistoryModelTest(TestCase):
    """Test cases for ReservationHistory model"""
    
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
        
        self.history = ReservationHistory.objects.create(
            reservation=self.reservation,
            from_status='draft',
            to_status='pending',
            changed_by=self.user,
            reason='Payment received'
        )
    
    def test_history_creation(self):
        """Test history entry creation"""
        self.assertIsNotNone(self.history.id)
        self.assertEqual(self.history.from_status, 'draft')
        self.assertEqual(self.history.to_status, 'pending')
        self.assertEqual(self.history.changed_by, self.user)
        self.assertEqual(self.history.reason, 'Payment received')
    
    def test_history_str_representation(self):
        """Test string representation"""
        expected = f"{self.reservation.reservation_number} - draft → pending"
        self.assertEqual(str(self.history), expected) 