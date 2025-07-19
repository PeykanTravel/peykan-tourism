"""
Management command to create test data for reservations
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
from datetime import date, time, timedelta

from events.models import Event, EventCategory, Venue, EventPerformance, EventSection, Seat, EventPricingRule
from tours.models import Tour, TourCategory, TourVariant, TourSchedule, TourPricing
from transfers.models import TransferRoute, TransferRoutePricing
from reservations.models import Reservation, ReservationItem

User = get_user_model()


class Command(BaseCommand):
    help = 'Create test data for reservation system'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing test data before creating new data',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing test data...')
            self.clear_test_data()

        self.stdout.write('Creating test data for reservation system...')
        
        # Create test users
        users = self.create_test_users()
        
        # Create test events
        events = self.create_test_events()
        
        # Create test tours
        tours = self.create_test_tours()
        
        # Create test transfers
        transfers = self.create_test_transfers()
        
        # Create test reservations
        reservations = self.create_test_reservations(users, events, tours, transfers)
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created test data:\n'
                f'- {len(users)} users\n'
                f'- {len(events)} events\n'
                f'- {len(tours)} tours\n'
                f'- {len(transfers)} transfers\n'
                f'- {len(reservations)} reservations'
            )
        )

    def clear_test_data(self):
        """Clear existing test data"""
        Reservation.objects.filter(customer_email__contains='test').delete()
        Event.objects.filter(title__contains='Test').delete()
        Tour.objects.filter(title__contains='Test').delete()
        TransferRoute.objects.filter(from_location__contains='Test').delete()
        User.objects.filter(email__contains='test').delete()

    def create_test_users(self):
        """Create test users"""
        users = []
        
        # Create admin user
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@test.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
        users.append(admin_user)
        
        # Create regular users
        for i in range(1, 4):
            user, created = User.objects.get_or_create(
                username=f'testuser{i}',
                defaults={
                    'email': f'testuser{i}@test.com',
                    'first_name': f'Test{i}',
                    'last_name': 'User',
                }
            )
            if created:
                user.set_password('test123')
                user.save()
            users.append(user)
        
        return users

    def create_test_events(self):
        """Create test events"""
        events = []
        
        # Create venue
        venue, created = Venue.objects.get_or_create(
            name='Test Concert Hall',
            defaults={
                'city': 'Test City',
                'country': 'Test Country',
                'total_capacity': 1000,
                'description': 'A beautiful test concert hall'
            }
        )
        
        # Create category
        category, created = EventCategory.objects.get_or_create(
            name='Music',
            defaults={
                'description': 'Music events'
            }
        )
        
        # Create events
        event_data = [
            {
                'title': 'Test Rock Concert',
                'slug': 'test-rock-concert',
                'description': 'An amazing rock concert for testing',
                'style': 'music',
                'door_open_time': time(18, 0),
                'start_time': time(19, 0),
                'end_time': time(22, 0),
            },
            {
                'title': 'Test Jazz Night',
                'slug': 'test-jazz-night',
                'description': 'A relaxing jazz evening',
                'style': 'music',
                'door_open_time': time(19, 0),
                'start_time': time(20, 0),
                'end_time': time(23, 0),
            }
        ]
        
        for data in event_data:
            event, created = Event.objects.get_or_create(
                slug=data['slug'],
                defaults={
                    **data,
                    'venue': venue,
                    'category': category,
                    'is_active': True
                }
            )
            
            if created:
                # Create performance
                performance = EventPerformance.objects.create(
                    event=event,
                    date=date.today() + timedelta(days=7),
                    start_time=data['start_time'],
                    end_time=data['end_time'],
                    venue_name=venue.name,
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
                for row in range(1, 11):
                    for seat_num in range(1, 11):
                        Seat.objects.create(
                            performance=performance,
                            section=section.name,
                            seat_number=str(seat_num),
                            row_number=str(row),
                            status='available',
                            price=Decimal('50.00')
                        )
                
                # Create pricing rule
                EventPricingRule.objects.create(
                    event=event,
                    name='Standard Pricing',
                    adjustment_type='fixed',
                    adjustment_value=Decimal('50.00'),
                    is_active=True
                )
            
            events.append(event)
        
        return events

    def create_test_tours(self):
        """Create test tours"""
        tours = []
        
        # Create category
        category, created = TourCategory.objects.get_or_create(
            name='City Tours',
            defaults={
                'description': 'City sightseeing tours'
            }
        )
        
        # Create tours
        tour_data = [
            {
                'title': 'Test City Tour',
                'slug': 'test-city-tour',
                'description': 'Explore the beautiful test city',
                'duration': 180,
            },
            {
                'title': 'Test Historical Tour',
                'slug': 'test-historical-tour',
                'description': 'Discover the rich history',
                'duration': 240,
            }
        ]
        
        for data in tour_data:
            tour, created = Tour.objects.get_or_create(
                slug=data['slug'],
                defaults={
                    **data,
                    'category': category,
                    'is_active': True
                }
            )
            
            if created:
                # Create variant
                variant = TourVariant.objects.create(
                    tour=tour,
                    name='Standard',
                    description='Standard tour package',
                    duration=data['duration'],
                    max_participants=20,
                    min_participants=1,
                    base_price=Decimal('75.00'),
                    is_active=True
                )
                
                # Create schedule
                TourSchedule.objects.create(
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
            
            tours.append(tour)
        
        return tours

    def create_test_transfers(self):
        """Create test transfers"""
        transfers = []
        
        # Create transfer routes
        route_data = [
            {
                'from_location': 'Test Airport',
                'to_location': 'Test City Center',
                'distance': Decimal('25.5'),
                'estimated_duration': 45,
                'base_price': Decimal('60.00'),
            },
            {
                'from_location': 'Test Hotel District',
                'to_location': 'Test Airport',
                'distance': Decimal('20.0'),
                'estimated_duration': 35,
                'base_price': Decimal('50.00'),
            }
        ]
        
        for data in route_data:
            route, created = TransferRoute.objects.get_or_create(
                from_location=data['from_location'],
                to_location=data['to_location'],
                defaults={
                    **data,
                    'is_active': True
                }
            )
            
            if created:
                # Create pricing
                TransferRoutePricing.objects.create(
                    route=route,
                    vehicle_type='sedan',
                    trip_type='one_way',
                    base_price=data['base_price'],
                    passenger_surcharge=Decimal('15.00'),
                    luggage_surcharge=Decimal('10.00'),
                    included_passengers=2,
                    included_luggage=1,
                    is_active=True
                )
            
            transfers.append(route)
        
        return transfers

    def create_test_reservations(self, users, events, tours, transfers):
        """Create test reservations"""
        reservations = []
        
        # Create event reservation
        if events and users:
            event = events[0]
            user = users[0]
            
            reservation = Reservation.objects.create(
                user=user,
                customer_name='Event Customer',
                customer_email='event@test.com',
                customer_phone='+1234567890',
                subtotal=Decimal('100.00'),
                tax_amount=Decimal('10.00'),
                total_amount=Decimal('110.00'),
                currency='USD',
                status='confirmed'
            )
            
            ReservationItem.objects.create(
                reservation=reservation,
                product_type='event',
                product_id=str(event.id),
                product_title=event.title,
                product_slug=event.slug,
                booking_date=date.today() + timedelta(days=7),
                booking_time=time(19, 0),
                quantity=2,
                unit_price=Decimal('50.00'),
                total_price=Decimal('100.00'),
                currency='USD',
                booking_data={
                    'event_id': str(event.id),
                    'seat_ids': ['1', '2']
                }
            )
            
            reservations.append(reservation)
        
        # Create tour reservation
        if tours and users:
            tour = tours[0]
            user = users[1] if len(users) > 1 else users[0]
            
            reservation = Reservation.objects.create(
                user=user,
                customer_name='Tour Customer',
                customer_email='tour@test.com',
                customer_phone='+1234567891',
                subtotal=Decimal('150.00'),
                tax_amount=Decimal('15.00'),
                total_amount=Decimal('165.00'),
                currency='USD',
                status='draft'
            )
            
            ReservationItem.objects.create(
                reservation=reservation,
                product_type='tour',
                product_id=str(tour.id),
                product_title=tour.title,
                product_slug=tour.slug,
                booking_date=date.today() + timedelta(days=3),
                booking_time=time(9, 0),
                quantity=2,
                unit_price=Decimal('75.00'),
                total_price=Decimal('150.00'),
                currency='USD',
                booking_data={
                    'tour_id': str(tour.id),
                    'participants': {'adult': 2}
                }
            )
            
            reservations.append(reservation)
        
        # Create transfer reservation
        if transfers and users:
            transfer = transfers[0]
            user = users[2] if len(users) > 2 else users[0]
            
            reservation = Reservation.objects.create(
                user=user,
                customer_name='Transfer Customer',
                customer_email='transfer@test.com',
                customer_phone='+1234567892',
                subtotal=Decimal('60.00'),
                tax_amount=Decimal('6.00'),
                total_amount=Decimal('66.00'),
                currency='USD',
                status='confirmed'
            )
            
            ReservationItem.objects.create(
                reservation=reservation,
                product_type='transfer',
                product_id=str(transfer.id),
                product_title=f"Transfer: {transfer.from_location} to {transfer.to_location}",
                product_slug=transfer.slug,
                booking_date=date.today() + timedelta(days=1),
                booking_time=time(10, 0),
                quantity=1,
                unit_price=Decimal('60.00'),
                total_price=Decimal('60.00'),
                currency='USD',
                booking_data={
                    'route_id': str(transfer.id),
                    'vehicle_type': 'sedan',
                    'passenger_count': 2
                }
            )
            
            reservations.append(reservation)
        
        return reservations 