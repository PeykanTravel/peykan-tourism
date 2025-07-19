"""
Test data factory for reservation tests
"""

from decimal import Decimal
from django.utils import timezone
from django.contrib.auth import get_user_model
from datetime import date, time, timedelta

from events.models import Event, EventPerformance, Seat, EventSection, EventPricingRule, EventDiscount
from tours.models import Tour, TourVariant, TourSchedule, TourPricing
from transfers.models import TransferRoute, TransferRoutePricing
from reservations.models import Reservation, ReservationItem

User = get_user_model()


class ReservationTestDataFactory:
    """Factory for creating test data for reservation tests"""
    
    @classmethod
    def create_test_user(cls, **kwargs):
        """Create a test user"""
        defaults = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User'
        }
        defaults.update(kwargs)
        
        user = User.objects.create_user(**defaults)
        return user
    
    @classmethod
    def create_test_event(cls, **kwargs):
        """Create a test event with performance and seats"""
        defaults = {
            'title': 'Test Concert',
            'slug': 'test-concert',
            'description': 'A test concert event',
            'duration': 120,
            'is_active': True
        }
        defaults.update(kwargs)
        
        event = Event.objects.create(**defaults)
        
        # Create performance
        performance = EventPerformance.objects.create(
            event=event,
            date=date.today() + timedelta(days=7),
            start_time=time(19, 0),
            end_time=time(21, 0),
            venue_name='Test Venue',
            is_active=True
        )
        
        # Create section
        section = EventSection.objects.create(
            performance=performance,
            name='Main Floor',
            base_price=Decimal('50.00'),
            total_capacity=100,
            available_capacity=100
        )
        
        # Create seats
        seats = []
        for row in range(1, 11):
            for seat_num in range(1, 11):
                seat = Seat.objects.create(
                    performance=performance,
                    section=section.name,
                    seat_number=str(seat_num),
                    row_number=str(row),
                    status='available',
                    price=Decimal('50.00')
                )
                seats.append(seat)
        
        # Create pricing rule
        EventPricingRule.objects.create(
            event=event,
            name='Standard Pricing',
            adjustment_type='fixed',
            adjustment_value=Decimal('50.00'),
            is_active=True
        )
        
        return event, performance, seats
    
    @classmethod
    def create_test_tour(cls, **kwargs):
        """Create a test tour with variant and schedule"""
        defaults = {
            'title': 'City Tour',
            'slug': 'city-tour',
            'description': 'A guided city tour',
            'is_active': True
        }
        defaults.update(kwargs)
        
        tour = Tour.objects.create(**defaults)
        
        # Create variant
        variant = TourVariant.objects.create(
            tour=tour,
            name='Standard Tour',
            description='Standard city tour',
            duration=180,
            max_participants=20,
            min_participants=1,
            base_price=Decimal('75.00'),
            is_active=True
        )
        
        # Create schedule
        schedule = TourSchedule.objects.create(
            tour=tour,
            variant=variant,
            date=date.today() + timedelta(days=3),
            start_time=time(9, 0),
            end_time=time(12, 0),
            max_capacity=20,
            available_capacity=20,
            meeting_point='Central Station',
            start_location='Central Station',
            is_active=True
        )
        
        # Create pricing
        TourPricing.objects.create(
            tour=tour,
            variant=variant,
            participant_type='adult',
            price=Decimal('75.00')
        )
        
        TourPricing.objects.create(
            tour=tour,
            variant=variant,
            participant_type='child',
            price=Decimal('50.00')
        )
        
        return tour, variant, schedule
    
    @classmethod
    def create_test_transfer(cls, **kwargs):
        """Create a test transfer route with pricing"""
        defaults = {
            'from_location': 'Airport',
            'to_location': 'City Center',
            'distance': Decimal('25.5'),
            'estimated_duration': 45,
            'base_price': Decimal('60.00'),
            'is_active': True
        }
        defaults.update(kwargs)
        
        route = TransferRoute.objects.create(**defaults)
        
        # Create pricing
        TransferRoutePricing.objects.create(
            route=route,
            vehicle_type='sedan',
            trip_type='one_way',
            base_price=Decimal('60.00'),
            passenger_surcharge=Decimal('15.00'),
            luggage_surcharge=Decimal('10.00'),
            included_passengers=2,
            included_luggage=1,
            is_active=True
        )
        
        return route
    
    @classmethod
    def create_test_reservation(cls, user, **kwargs):
        """Create a test reservation"""
        defaults = {
            'user': user,
            'customer_name': 'Test Customer',
            'customer_email': 'customer@example.com',
            'customer_phone': '+1234567890',
            'subtotal': Decimal('100.00'),
            'tax_amount': Decimal('10.00'),
            'total_amount': Decimal('110.00'),
            'currency': 'USD',
            'status': 'draft'
        }
        defaults.update(kwargs)
        
        reservation = Reservation.objects.create(**defaults)
        return reservation
    
    @classmethod
    def create_test_reservation_item(cls, reservation, **kwargs):
        """Create a test reservation item"""
        defaults = {
            'reservation': reservation,
            'product_type': 'tour',
            'product_id': 'test-product-id',
            'product_title': 'Test Product',
            'product_slug': 'test-product',
            'booking_date': date.today() + timedelta(days=7),
            'booking_time': time(10, 0),
            'quantity': 2,
            'unit_price': Decimal('50.00'),
            'total_price': Decimal('100.00'),
            'currency': 'USD'
        }
        defaults.update(kwargs)
        
        item = ReservationItem.objects.create(**defaults)
        return item
    
    @classmethod
    def create_test_discount(cls, product_type, product_id, **kwargs):
        """Create a test discount"""
        defaults = {
            'code': 'TEST10',
            'discount_type': 'percentage',
            'discount_value': Decimal('10.00'),
            'is_active': True,
            'valid_from': timezone.now() - timedelta(days=1),
            'valid_until': timezone.now() + timedelta(days=30)
        }
        defaults.update(kwargs)
        
        if product_type == 'event':
            event = Event.objects.get(id=product_id)
            discount = EventDiscount.objects.create(event=event, **defaults)
        else:
            # For tours and transfers, create a simple discount object
            discount = type('Discount', (), {
                'code': defaults['code'],
                'discount_type': defaults['discount_type'],
                'discount_value': defaults['discount_value'],
                'is_active': defaults['is_active']
            })()
        
        return discount 