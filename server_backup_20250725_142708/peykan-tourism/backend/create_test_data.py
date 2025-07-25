import uuid
from datetime import datetime, timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model
from tours.models import Tour, TourCategory, TourVariant, TourOption, TourSchedule, TourPricing
from events.models import Event, EventCategory, EventPerformance, Seat, TicketType, Venue
from transfers.models import TransferRoute, TransferRoutePricing
from cart.models import Cart, CartItem
from users.models import User

User = get_user_model()

def create_test_users():
    """Create test users for different roles"""
    users = []
    
    # Create admin user
    admin_user, created = User.objects.get_or_create(
        email='admin@peykan.com',
        defaults={
            'username': 'admin',
            'first_name': 'Admin',
            'last_name': 'User',
            'is_staff': True,
            'is_superuser': True,
            'is_active': True,
            'phone': '+989123456789'
        }
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
    users.append(admin_user)
    
    # Create customer user
    customer_user, created = User.objects.get_or_create(
        email='customer@test.com',
        defaults={
            'username': 'customer',
            'first_name': 'Test',
            'last_name': 'Customer',
            'is_active': True,
            'phone': '+989123456790'
        }
    )
    if created:
        customer_user.set_password('customer123')
        customer_user.save()
    users.append(customer_user)
    
    # Create agent user
    agent_user, created = User.objects.get_or_create(
        email='agent@test.com',
        defaults={
            'username': 'agent',
            'first_name': 'Test',
            'last_name': 'Agent',
            'is_active': True,
            'phone': '+989123456791',
            'role': 'agent'
        }
    )
    if created:
        agent_user.set_password('agent123')
        agent_user.save()
    users.append(agent_user)
    
    return users

def create_tour_test_data():
    """Create comprehensive tour test data"""
    tours = []
    
    # Create tour categories
    categories = {
        'cultural': {
            'name_en': 'Cultural Tours',
            'name_fa': 'تورهای فرهنگی',
            'name_tr': 'Kültür Turları',
            'description_en': 'Explore rich cultural heritage',
            'description_fa': 'کشف میراث فرهنگی غنی',
            'description_tr': 'Zengin kültürel mirası keşfedin'
        },
        'adventure': {
            'name_en': 'Adventure Tours',
            'name_fa': 'تورهای ماجراجویی',
            'name_tr': 'Macera Turları',
            'description_en': 'Thrilling adventure experiences',
            'description_fa': 'تجربیات ماجراجویی هیجان‌انگیز',
            'description_tr': 'Heyecan verici macera deneyimleri'
        },
        'historical': {
            'name_en': 'Historical Tours',
            'name_fa': 'تورهای تاریخی',
            'name_tr': 'Tarihi Turlar',
            'description_en': 'Discover ancient history',
            'description_fa': 'کشف تاریخ باستانی',
            'description_tr': 'Antik tarihi keşfedin'
        }
    }
    
    tour_categories = {}
    for key, data in categories.items():
        category, created = TourCategory.objects.get_or_create(slug=key)
        # Set translations for each language
        category.set_current_language('en')
        category.name = data['name_en']
        category.description = data['description_en']
        category.set_current_language('fa')
        category.name = data['name_fa']
        category.description = data['description_fa']
        category.set_current_language('tr')
        category.name = data['name_tr']
        category.description = data['description_tr']
        category.save()
        tour_categories[key] = category
    
    # Create sample tours
    tour_data = [
        {
            'slug': 'persepolis-cultural-tour',
            'title_en': 'Persepolis Cultural Tour',
            'title_fa': 'تور فرهنگی تخت جمشید',
            'title_tr': 'Persepolis Kültür Turu',
            'description_en': 'Explore the ancient capital of the Achaemenid Empire',
            'description_fa': 'کشف پایتخت باستانی امپراتوری هخامنشی',
            'description_tr': 'Ahameniş İmparatorluğu\'nun antik başkentini keşfedin',
            'category': 'cultural',
            'duration_hours': 8,
            'max_participants': 20,
            'base_price': 120.00,
            'pickup_time': '09:00',
            'start_time': '10:00',
            'end_time': '18:00'
        },
        {
            'slug': 'isfahan-historical-tour',
            'title_en': 'Isfahan Historical Tour',
            'title_fa': 'تور تاریخی اصفهان',
            'title_tr': 'İsfahan Tarihi Turu',
            'description_en': 'Discover the beautiful architecture of Isfahan',
            'description_fa': 'کشف معماری زیبای اصفهان',
            'description_tr': 'İsfahan\'ın güzel mimarisini keşfedin',
            'category': 'historical',
            'duration_hours': 10,
            'max_participants': 15,
            'base_price': 150.00,
            'pickup_time': '08:00',
            'start_time': '09:00',
            'end_time': '19:00'
        },
        {
            'slug': 'alborz-adventure-tour',
            'title_en': 'Alborz Adventure Tour',
            'title_fa': 'تور ماجراجویی البرز',
            'title_tr': 'Elburz Macera Turu',
            'description_en': 'Hiking and adventure in the Alborz Mountains',
            'description_fa': 'کوهنوردی و ماجراجویی در کوه‌های البرز',
            'description_tr': 'Elburz Dağları\'nda yürüyüş ve macera',
            'category': 'adventure',
            'duration_hours': 12,
            'max_participants': 12,
            'base_price': 200.00,
            'pickup_time': '07:00',
            'start_time': '08:00',
            'end_time': '20:00'
        }
    ]
    
    for data in tour_data:
        tour, created = Tour.objects.get_or_create(
            slug=data['slug'],
            defaults={
                'category': tour_categories[data['category']],
                'duration_hours': data['duration_hours'],
                'pickup_time': data['pickup_time'],
                'start_time': data['start_time'],
                'end_time': data['end_time'],
                'max_participants': data['max_participants'],
                'is_active': True,
                'price': data['base_price'],
            }
        )
        # Set translations for each language
        tour.set_current_language('en')
        tour.title = data['title_en']
        tour.description = data['description_en']
        tour.set_current_language('fa')
        tour.title = data['title_fa']
        tour.description = data['description_fa']
        tour.set_current_language('tr')
        tour.title = data['title_tr']
        tour.description = data['description_tr']
        tour.save()
        if created:
            # Create variants for this tour
            variants = [
                {
                    'key': 'eco',
                    'name_en': 'Eco', 'name_fa': 'اکو', 'name_tr': 'Eko',
                    'description_en': 'Basic tour package',
                    'description_fa': 'بسته تور پایه',
                    'description_tr': 'Temel tur paketi',
                    'price_multiplier': 0.8
                },
                {
                    'key': 'normal',
                    'name_en': 'Normal', 'name_fa': 'عادی', 'name_tr': 'Normal',
                    'description_en': 'Standard tour package',
                    'description_fa': 'بسته تور استاندارد',
                    'description_tr': 'Standart tur paketi',
                    'price_multiplier': 1.0
                },
                {
                    'key': 'vip',
                    'name_en': 'VIP', 'name_fa': 'وی‌آی‌پی', 'name_tr': 'VIP',
                    'description_en': 'Premium tour package',
                    'description_fa': 'بسته تور پریمیوم',
                    'description_tr': 'Premium tur paketi',
                    'price_multiplier': 1.5
                },
                {
                    'key': 'vvip',
                    'name_en': 'VVIP', 'name_fa': 'وی‌وی‌آی‌پی', 'name_tr': 'VVIP',
                    'description_en': 'Luxury tour package',
                    'description_fa': 'بسته تور لوکس',
                    'description_tr': 'Lüks tur paketi',
                    'price_multiplier': 2.0
                }
            ]
            for variant_data in variants:
                variant = TourVariant(
                    tour=tour,
                    name=variant_data['name_en'],
                    description=variant_data['description_en'],
                    base_price=data['base_price'] * variant_data['price_multiplier'],
                    capacity=tour.max_participants,
                    is_active=True
                )
                variant.save()
                # Create pricing for this variant
                # Adult pricing
                TourPricing.objects.get_or_create(
                    tour=tour,
                    variant=variant,
                    age_group='adult',
                    defaults={
                        'factor': 1.00,
                        'is_free': False
                    }
                )
                # Child pricing
                TourPricing.objects.get_or_create(
                    tour=tour,
                    variant=variant,
                    age_group='child',
                    defaults={
                        'factor': 0.70,
                        'is_free': False
                    }
                )
                # Infant pricing
                TourPricing.objects.get_or_create(
                    tour=tour,
                    variant=variant,
                    age_group='infant',
                    defaults={
                        'factor': 0.00,
                        'is_free': True
                    }
                )
            # Create schedules for the next 30 days
            for i in range(30):
                schedule_date = timezone.now().date() + timedelta(days=i+1)
                # Convert start_time and end_time to time objects if needed
                start_time = tour.start_time
                end_time = tour.end_time
                if isinstance(start_time, str):
                    start_time = datetime.strptime(start_time, "%H:%M").time()
                if isinstance(end_time, str):
                    end_time = datetime.strptime(end_time, "%H:%M").time()
                TourSchedule.objects.get_or_create(
                    tour=tour,
                    start_date=schedule_date,
                    end_date=schedule_date,
                    defaults={
                        'start_time': start_time,
                        'end_time': end_time,
                        'is_available': True,
                        'is_active': True,
                        'max_capacity': tour.max_participants,
                        'current_capacity': 0,
                        'day_of_week': schedule_date.weekday(),
                        'variant_capacities_raw': {
                            'eco': tour.max_participants,
                            'normal': tour.max_participants,
                            'vip': tour.max_participants,
                            'vvip': tour.max_participants
                        }
                    }
                )
        tours.append(tour)
    return tours

def create_event_test_data():
    """Create comprehensive event test data"""
    events = []
    
    # Create event categories
    categories = {
        'concert': {
            'name_en': 'Concerts',
            'name_fa': 'کنسرت‌ها',
            'name_tr': 'Konserler',
            'description_en': 'Live music performances',
            'description_fa': 'اجرای موسیقی زنده',
            'description_tr': 'Canlı müzik performansları'
        },
        'theater': {
            'name_en': 'Theater',
            'name_fa': 'تئاتر',
            'name_tr': 'Tiyatro',
            'description_en': 'Dramatic performances',
            'description_fa': 'اجرای نمایشی',
            'description_tr': 'Dramatik performanslar'
        },
        'festival': {
            'name_en': 'Festivals',
            'name_fa': 'جشنواره‌ها',
            'name_tr': 'Festivaller',
            'description_en': 'Cultural festivals',
            'description_fa': 'جشنواره‌های فرهنگی',
            'description_tr': 'Kültürel festivaller'
        }
    }
    
    event_categories = {}
    for key, data in categories.items():
        category, created = EventCategory.objects.get_or_create(slug=key)
        # Set translations for each language
        category.set_current_language('en')
        category.name = data['name_en']
        category.description = data['description_en']
        category.set_current_language('fa')
        category.name = data['name_fa']
        category.description = data['description_fa']
        category.set_current_language('tr')
        category.name = data['name_tr']
        category.description = data['description_tr']
        category.save()
        event_categories[key] = category
    
    # Create a test venue
    venue, _ = Venue.objects.get_or_create(
        slug='test-venue',
        defaults={
            'city': 'Tehran',
            'country': 'Iran',
            'total_capacity': 2000,
            'image': '',
            'website': '',
            'coordinates': {},
            'facilities': [],
        }
    )
    venue.set_current_language('en')
    venue.name = 'Test Venue'
    venue.description = 'A test venue for events.'
    venue.address = '123 Test St, Tehran'
    venue.set_current_language('fa')
    venue.name = 'ونوی تست'
    venue.description = 'محل تست برای رویدادها.'
    venue.address = 'تهران، خیابان تست ۱۲۳'
    venue.set_current_language('tr')
    venue.name = 'Test Mekan'
    venue.description = 'Etkinlikler için test mekanı.'
    venue.address = '123 Test Cad., Tahran'
    venue.save()

    # Create sample events (simplified for now)
    event_data = [
        {
            'slug': 'persian-classical-concert',
            'title_en': 'Persian Classical Concert',
            'title_fa': 'کنسرت کلاسیک ایرانی',
            'title_tr': 'İran Klasik Konseri',
            'description_en': 'Traditional Persian music performance',
            'description_fa': 'اجرای موسیقی سنتی ایرانی',
            'description_tr': 'Geleneksel İran müziği performansı',
            'category': 'concert',
            'style': 'music',
            'capacity': 500,
            'door_open_time': '18:00',
            'start_time': '19:00',
            'end_time': '22:00'
        },
        {
            'slug': 'shakespeare-theater',
            'title_en': 'Shakespeare Theater',
            'title_fa': 'تئاتر شکسپیر',
            'title_tr': 'Shakespeare Tiyatrosu',
            'description_en': 'Classic Shakespeare play',
            'description_fa': 'نمایش کلاسیک شکسپیر',
            'description_tr': 'Klasik Shakespeare oyunu',
            'category': 'theater',
            'style': 'theater',
            'capacity': 300,
            'door_open_time': '17:00',
            'start_time': '18:00',
            'end_time': '21:00'
        },
        {
            'slug': 'spring-festival',
            'title_en': 'Spring Festival',
            'title_fa': 'جشنواره بهار',
            'title_tr': 'Bahar Festivali',
            'description_en': 'Celebration of spring with music and dance',
            'description_fa': 'جشن بهار با موسیقی و رقص',
            'description_tr': 'Müzik ve dansla bahar kutlaması',
            'category': 'festival',
            'style': 'festival',
            'capacity': 1000,
            'door_open_time': '16:00',
            'start_time': '17:00',
            'end_time': '23:00'
        }
    ]
    
    for data in event_data:
        # For now, create events without venue and artists (they're required in the model)
        # In a real scenario, you'd need to create these first
        event, created = Event.objects.get_or_create(
            slug=data['slug'],
            defaults={
                'category': event_categories[data['category']],
                'venue': venue,
                'style': data['style'],
                'is_active': True,
                'price': 100.00,
                'door_open_time': data['door_open_time'],
                'start_time': data['start_time'],
                'end_time': data['end_time'],
            }
        )
        # Set translations for each language
        event.set_current_language('en')
        event.title = data['title_en']
        event.description = data['description_en']
        event.set_current_language('fa')
        event.title = data['title_fa']
        event.description = data['description_fa']
        event.set_current_language('tr')
        event.title = data['title_tr']
        event.description = data['description_tr']
        event.save()
        
        if created:
            # Create ticket types for this event
            ticket_types_data = [
                {'name': 'VIP', 'description': 'VIP ticket', 'price': 150.00},
                {'name': 'Normal', 'description': 'Normal ticket', 'price': 80.00},
                {'name': 'Economy', 'description': 'Economy ticket', 'price': 50.00}
            ]
            
            for ticket_data in ticket_types_data:
                ticket_type, created = TicketType.objects.get_or_create(
                    event=event,
                    name=ticket_data['name'],
                    defaults={
                        'description': ticket_data['description'],
                        'price_modifier': 1.0,
                        'capacity': data['capacity'],
                        'is_active': True
                    }
                )
            
            # Create performances for the next 4 days
            for i in range(4):
                performance_date = timezone.now().date() + timedelta(days=i+1)
                performance, created = EventPerformance.objects.get_or_create(
                    event=event,
                    start_date=performance_date,
                    end_date=performance_date,
                    defaults={
                        'start_time': event.start_time,
                        'end_time': event.end_time,
                        'is_available': True,
                        'is_active': True,
                        'max_capacity': data['capacity'],
                        'current_capacity': 0,
                        'date': performance_date,
                        'is_special': False,
                        'ticket_capacities': {
                            'VIP': data['capacity'],
                            'Normal': data['capacity'],
                            'Economy': data['capacity']
                        }
                    }
                )
                
                # Create seats for this performance
                if created:
                    sections = ['A', 'B', 'C']
                    rows = ['1', '2', '3', '4', '5']
                    seats_per_row = 10

                    for section in sections:
                        for row in rows:
                            for seat_num in range(1, seats_per_row + 1):
                                seat_number = f"{seat_num:02d}"
                                price = float(event.price)
                                Seat.objects.create(
                                    performance=performance,
                                    seat_number=seat_number,
                                    row_number=row,
                                    section=section,
                                    status='available',
                                    price=price,
                                    currency=event.currency,
                                    is_wheelchair_accessible=False,
                                    is_premium=False
                                )
        
        events.append(event)
    
    return events

def create_transfer_test_data():
    """Create comprehensive transfer test data"""
    transfers = []
    
    # Create transfer routes
    routes = [
        {
            'origin': 'Tehran Airport',
            'destination': 'Tehran City Center',
            'name_en': 'Tehran Airport to City Center',
            'name_fa': 'فرودگاه تهران به مرکز شهر',
            'name_tr': 'Tahran Havalimanından Şehir Merkezine',
            'distance': 45,
            'duration': 60
        },
        {
            'origin': 'Isfahan Airport',
            'destination': 'Isfahan City Center',
            'name_en': 'Isfahan Airport to City Center',
            'name_fa': 'فرودگاه اصفهان به مرکز شهر',
            'name_tr': 'İsfahan Havalimanından Şehir Merkezine',
            'distance': 25,
            'duration': 30
        }
    ]
    
    transfer_routes = []
    for route_data in routes:
        route, created = TransferRoute.objects.get_or_create(
            origin=route_data['origin'],
            destination=route_data['destination'],
            defaults={
                'name_en': route_data['name_en'],
                'name_fa': route_data['name_fa'],
                'name_tr': route_data['name_tr'],
                'is_active': True
            }
        )
        transfer_routes.append(route)
    
    # Create pricing for each route and vehicle type
    vehicle_types = [
        {
            'type': 'sedan',
            'name': 'Economy Sedan',
            'description': 'Comfortable sedan for up to 4 passengers',
            'base_price': 30.00,
            'max_passengers': 4,
            'max_luggage': 2
        },
        {
            'type': 'suv',
            'name': 'Luxury SUV',
            'description': 'Spacious SUV for up to 6 passengers',
            'base_price': 80.00,
            'max_passengers': 6,
            'max_luggage': 4
        },
        {
            'type': 'van',
            'name': 'Minibus',
            'description': 'Large van for up to 12 passengers',
            'base_price': 120.00,
            'max_passengers': 12,
            'max_luggage': 8
        }
    ]
    
    for route in transfer_routes:
        for vehicle_data in vehicle_types:
            pricing, created = TransferRoutePricing.objects.get_or_create(
                route=route,
                vehicle_type=vehicle_data['type'],
                defaults={
                    'vehicle_name': vehicle_data['name'],
                    'vehicle_description': vehicle_data['description'],
                    'base_price': vehicle_data['base_price'],
                    'max_passengers': vehicle_data['max_passengers'],
                    'max_luggage': vehicle_data['max_luggage'],
                    'is_active': True
                }
            )
        
        transfers.append(route)
    
    return transfers

def create_test_cart_data(user):
    """Create test cart data for a user"""
    # Get a sample tour
    tour = Tour.objects.filter(is_active=True).first()
    if not tour:
        return None
    
    # Get a sample event
    event = Event.objects.filter(is_active=True).first()
    if not event:
        return None
    
    # Create or get user's cart
    cart, created = Cart.objects.get_or_create(
        user=user,
        defaults={
            'session_id': str(uuid.uuid4())
        }
    )
    
    # Add tour to cart
    if tour:
        tour_variant = TourVariant.objects.filter(name_en='Normal').first()
        if tour_variant:
            tour_schedule = TourSchedule.objects.filter(tour=tour, is_active=True).first()
            if tour_schedule:
                cart_item, created = CartItem.objects.get_or_create(
                    cart=cart,
                    product_type='tour',
                    product_id=tour.id,
                    defaults={
                        'variant_id': tour_variant.id,
                        'schedule_id': tour_schedule.id,
                        'adults': 2,
                        'children': 1,
                        'infants': 0,
                        'quantity': 1
                    }
                )
    
    # Add event to cart
    if event:
        event_ticket_type = TicketType.objects.filter(event=event, name_en='Normal').first()
        if event_ticket_type:
            event_performance = EventPerformance.objects.filter(event=event, is_active=True).first()
            if event_performance:
                cart_item, created = CartItem.objects.get_or_create(
                    cart=cart,
                    product_type='event',
                    product_id=event.id,
                    defaults={
                        'variant_id': event_ticket_type.id,
                        'schedule_id': event_performance.id,
                        'adults': 2,
                        'children': 0,
                        'infants': 0,
                        'quantity': 1
                    }
                )
    
    return cart 