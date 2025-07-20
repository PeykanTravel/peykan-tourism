"""
DRF Serializers for Events app.
"""

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.db.models import Min, Max
from .models import (
    Event, EventCategory, Venue, Artist, TicketType, 
    EventPerformance, Seat, EventOption, EventReview,
    EventSection, SectionTicketType, EventDiscount, EventFee, EventPricingRule
)
from django.db.models import Count, Min, Max, Q


class EventCategorySerializer(serializers.ModelSerializer):
    """Serializer for EventCategory model."""
    
    class Meta:
        model = EventCategory
        fields = ['id', 'name', 'description', 'icon', 'color', 'slug', 'is_active']


class VenueSerializer(serializers.ModelSerializer):
    """Serializer for Venue model."""
    
    class Meta:
        model = Venue
        fields = [
            'id', 'name', 'description', 'address', 'image', 'website',
            'city', 'country', 'coordinates', 'total_capacity', 'facilities', 'slug'
        ]


class ArtistSerializer(serializers.ModelSerializer):
    """Serializer for Artist model."""
    
    class Meta:
        model = Artist
        fields = ['id', 'name', 'bio', 'image', 'website', 'social_media', 'slug']


class TicketTypeSerializer(serializers.ModelSerializer):
    """Serializer for TicketType model."""
    
    class Meta:
        model = TicketType
        fields = [
            'id', 'name', 'description', 'ticket_type', 'price_modifier',
            'capacity', 'benefits', 'age_min', 'age_max', 'is_active'
        ]


class SeatSerializer(serializers.ModelSerializer):
    """Serializer for Seat model."""
    
    is_available = serializers.ReadOnlyField()
    is_bookable = serializers.ReadOnlyField()
    
    class Meta:
        model = Seat
        fields = [
            'id', 'seat_number', 'row_number', 'section', 'status',
            'price', 'currency', 'is_wheelchair_accessible', 'is_premium',
            'is_available', 'is_bookable'
        ]


class EventOptionSerializer(serializers.ModelSerializer):
    """Serializer for EventOption model."""
    
    class Meta:
        model = EventOption
        fields = [
            'id', 'name', 'description', 'price', 'currency', 'option_type',
            'is_available', 'max_quantity'
        ]


class EventPerformanceSerializer(serializers.ModelSerializer):
    """Serializer for EventPerformance model."""
    
    sections_summary = serializers.SerializerMethodField()
    ticket_availability = serializers.SerializerMethodField()
    cutoff_datetime = serializers.SerializerMethodField()
    sections = serializers.SerializerMethodField()
    min_price = serializers.SerializerMethodField()
    
    class Meta:
        model = EventPerformance
        fields = [
            'id', 'date', 'start_time', 'end_time', 'is_available',
            'max_capacity', 'current_capacity', 'available_capacity',
            'is_full', 'is_special', 'ticket_capacities',
            'sections_summary', 'ticket_availability', 'cutoff_datetime', 'sections',
            'min_price',
        ]
    
    def get_sections_summary(self, obj):
        """Get sections summary grouped by ticket type using efficient database queries."""
        sections_data = {}
        
        # Get all available seats grouped by section
        seat_aggregates = obj.seats.filter(status='available').values(
            'section'
        ).annotate(
            total_seats=Count('id'),
            min_price=Min('price'),
            max_price=Max('price'),
            has_premium=Count('id', filter=Q(is_premium=True))
        )
        
        # Create sections data for each ticket type
        for ticket_type in obj.event.ticket_types.filter(is_active=True):
            ticket_type_id = str(ticket_type.id)
            sections_data[ticket_type_id] = {}
            
            for aggregate in seat_aggregates:
                section = aggregate['section']
                sections_data[ticket_type_id][section] = {
                    'section_name': section,
                    'total_seats': aggregate['total_seats'],
                    'min_price': float(aggregate['min_price']),
                    'max_price': float(aggregate['max_price']),
                    'has_premium': aggregate['has_premium'] > 0
                }
        
        return sections_data
    
    def get_ticket_availability(self, obj):
        """Get ticket type availability for this performance."""
        availability = {}
        
        for ticket_type in obj.event.ticket_types.filter(is_active=True):
            # Count all available seats (since seats are not tied to specific ticket types)
            available_seats = obj.seats.filter(status='available').count()
            
            availability[str(ticket_type.id)] = {
                'ticket_type_name': ticket_type.name,
                'available_count': available_seats,
                'total_capacity': ticket_type.capacity,
                'price_modifier': float(ticket_type.price_modifier)
            }
        
        return availability
    
    def get_cutoff_datetime(self, obj):
        """Calculate booking cutoff datetime."""
        from datetime import datetime, timedelta
        
        # Default cutoff is 2 hours before performance
        cutoff_hours = 2
        
        # Calculate cutoff time based on performance date and time
        performance_datetime = datetime.combine(obj.date, obj.start_time)
        cutoff_datetime = performance_datetime - timedelta(hours=cutoff_hours)
        
        return cutoff_datetime.isoformat()
    
    def get_sections(self, obj):
        """Get sections for this performance."""
        sections = obj.sections.all()
        return EventSectionSerializer(sections, many=True).data
    
    def get_min_price(self, obj):
        prices = []
        for section in obj.sections.all():
            for stt in section.ticket_types.all():
                if section.base_price is not None and stt.price_modifier is not None:
                    prices.append(float(section.base_price) * float(stt.price_modifier))
        return min(prices) if prices else 0.0


class EventReviewSerializer(serializers.ModelSerializer):
    """Serializer for EventReview model."""
    
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = EventReview
        fields = [
            'id', 'rating', 'title', 'comment', 'is_verified', 'is_helpful',
            'user_name', 'created_at'
        ]


class EventReviewCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating EventReview."""
    
    class Meta:
        model = EventReview
        fields = ['rating', 'title', 'comment']
    
    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value


class EventListSerializer(serializers.ModelSerializer):
    """Serializer for Event list view."""
    
    category = EventCategorySerializer(read_only=True)
    venue = VenueSerializer(read_only=True)
    artists = ArtistSerializer(many=True, read_only=True)
    average_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)
    min_price = serializers.SerializerMethodField()
    max_price = serializers.SerializerMethodField()
    pricing_summary = serializers.SerializerMethodField()
    performance_calendar = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'slug', 'title', 'short_description', 'image', 'style',
            'category', 'venue', 'artists', 'average_rating', 'review_count',
            'min_price', 'max_price', 'pricing_summary', 'performance_calendar',
            'is_available_today', 'is_active'
        ]
    
    def get_min_price(self, obj):
        """Get minimum price from all performances and sections."""
        try:
            # Get minimum price from section base_price
            section_min = obj.performances.aggregate(
                min_price=Min('sections__base_price')
            ).get('min_price')
            
            # Also consider the event base price
            event_price = obj.price
            
            # Return the minimum of available prices
            prices = [p for p in [section_min, event_price] if p is not None]
            min_price = float(min(prices)) if prices else None
            
            # Convert to user's preferred currency
            if min_price is not None and min_price > 0:
                from shared.services import CurrencyConverterService
                request = self.context.get('request')
                if request:
                    user_currency = CurrencyConverterService.get_user_currency(request)
                    if user_currency != obj.currency:
                        converted_amount = CurrencyConverterService.convert_currency(
                            min_price, obj.currency, user_currency
                        )
                        return float(converted_amount)
            
            return min_price
        except Exception:
            # Fallback to event base price
            return float(obj.price) if obj.price else None
    
    def get_max_price(self, obj):
        """Get maximum price from all performances and sections."""
        try:
            # Get maximum price from section base_price
            section_max = obj.performances.aggregate(
                max_price=Max('sections__base_price')
            ).get('max_price')
            
            # Also consider the event base price
            event_price = obj.price
            
            # Return the maximum of available prices
            prices = [p for p in [section_max, event_price] if p is not None]
            return float(max(prices)) if prices else None
        except Exception:
            # Fallback to event base price
            return float(obj.price) if obj.price else None
    
    def get_pricing_summary(self, obj):
        """Get pricing summary for all ticket types."""
        summary = {}
        
        for ticket_type in obj.ticket_types.all():
            # Get base price from first available section
            base_price = None
            for performance in obj.performances.all():
                for section in performance.sections.all():
                    for stt in section.ticket_types.all():
                        if stt.ticket_type.id == ticket_type.id:
                            base_price = section.base_price
                            break
                    if base_price:
                        break
                if base_price:
                    break
            
            # If no base price found from sections, use a default base price
            if not base_price:
                base_price = 100.0  # Default base price
            
            # Convert both to float to avoid decimal/float multiplication issues
            base_price_float = float(base_price)
            price_modifier_float = float(ticket_type.price_modifier)
            modified_price = base_price_float * price_modifier_float
            summary[str(ticket_type.id)] = {
                'ticket_type_name': ticket_type.name,
                'ticket_type_code': ticket_type.ticket_type,
                'base_price': float(base_price),
                'modified_price': float(modified_price),
                'price_modifier': float(ticket_type.price_modifier),
                'capacity': ticket_type.capacity,
                'benefits': ticket_type.benefits,
                'age_min': ticket_type.age_min,
                'age_max': ticket_type.age_max
            }
        
        return summary
    
    def get_performance_calendar(self, obj):
        """Get next 30 days of performances for calendar view."""
        from datetime import datetime, timedelta
        
        today = datetime.now().date()
        end_date = today + timedelta(days=30)
        
        performances = obj.performances.filter(
            date__gte=today,
            date__lte=end_date,
            is_available=True
        ).order_by('date')
        
        calendar_data = []
        for performance in performances[:5]:  # Limit to first 5 performances for list view
            # Get basic capacity info
            capacity_summary = {
                'total_capacity': performance.max_capacity,
                'available_capacity': performance.available_capacity,
                'occupancy_rate': ((performance.max_capacity - performance.available_capacity) / performance.max_capacity * 100) if performance.max_capacity > 0 else 0
            }
            
            calendar_data.append({
                'id': performance.id,
                'date': performance.date,
                'start_time': performance.start_time,
                'end_time': performance.end_time,
                'is_special': performance.is_special,
                'capacity_summary': capacity_summary,
                'booking_cutoff': performance.date - timedelta(hours=2)
            })
        
        return calendar_data


class EventSectionSerializer(serializers.ModelSerializer):
    """Serializer for EventSection model."""
    
    occupancy_rate = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    ticket_types = serializers.SerializerMethodField()
    
    class Meta:
        model = EventSection
        fields = [
            'id', 'name', 'description', 'total_capacity', 'available_capacity',
            'reserved_capacity', 'sold_capacity', 'base_price', 'currency',
            'is_wheelchair_accessible', 'is_premium', 'occupancy_rate', 'is_full',
            'ticket_types', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_ticket_types(self, obj):
        """Get ticket types for this section."""
        return SectionTicketTypeSerializer(obj.ticket_types.all(), many=True).data
    
    def validate(self, data):
        """Validate capacity consistency."""
        total_capacity = data.get('total_capacity', 0)
        available = data.get('available_capacity', 0)
        reserved = data.get('reserved_capacity', 0)
        sold = data.get('sold_capacity', 0)
        
        if available + reserved + sold != total_capacity:
            raise serializers.ValidationError(
                'Capacity components must sum to total capacity'
            )
        
        return data


class SectionTicketTypeSerializer(serializers.ModelSerializer):
    ticket_type = TicketTypeSerializer(read_only=True)
    section = serializers.SerializerMethodField()

    class Meta:
        model = SectionTicketType
        fields = [
            'id', 'section', 'ticket_type',
            'allocated_capacity', 'available_capacity', 'reserved_capacity', 'sold_capacity',
            'price_modifier', 'final_price'
        ]

    def get_section(self, obj):
        # Only return minimal info to avoid recursion
        return {
            'id': obj.section.id,
            'name': obj.section.name,
        }


class EventPerformanceDetailSerializer(EventPerformanceSerializer):
    """Enhanced detailed serializer for EventPerformance with full section and pricing info."""
    
    sections = EventSectionSerializer(many=True, read_only=True)
    capacity_summary = serializers.SerializerMethodField()
    pricing_matrix = serializers.SerializerMethodField()
    seat_availability = serializers.SerializerMethodField()
    
    class Meta(EventPerformanceSerializer.Meta):
        fields = EventPerformanceSerializer.Meta.fields + [
            'sections', 'capacity_summary', 'pricing_matrix', 'seat_availability'
        ]
    
    def get_pricing_matrix(self, obj):
        """Get pricing matrix for all sections and ticket types."""
        pricing_matrix = {}
        
        for section in obj.sections.all():
            section_pricing = {}
            for section_ticket in section.ticket_types.all():
                section_pricing[str(section_ticket.ticket_type.id)] = {
                    'ticket_type_name': section_ticket.ticket_type.name,
                    'base_price': section.base_price,
                    'price_modifier': section_ticket.price_modifier,
                    'final_price': section_ticket.final_price,
                    'available_capacity': section_ticket.available_capacity,
                    'benefits': section_ticket.ticket_type.benefits
                }
            pricing_matrix[section.name] = section_pricing
        
        return pricing_matrix
    
    def get_seat_availability(self, obj):
        """Get seat availability by section."""
        availability = {}
        
        for section in obj.sections.all():
            availability[section.name] = {
                'total_capacity': section.total_capacity,
                'available_capacity': section.available_capacity,
                'reserved_capacity': section.reserved_capacity,
                'sold_capacity': section.sold_capacity,
                'is_wheelchair_accessible': section.is_wheelchair_accessible,
                'is_premium': section.is_premium
            }
        
        return availability


class EventDiscountSerializer(serializers.ModelSerializer):
    """Serializer for EventDiscount model."""
    
    is_valid = serializers.SerializerMethodField()
    
    def get_is_valid(self, obj):
        return obj.is_valid()
    
    class Meta:
        model = EventDiscount
        fields = [
            'id', 'code', 'name', 'description', 'discount_type', 'discount_value',
            'min_amount', 'max_discount', 'max_uses', 'current_uses',
            'valid_from', 'valid_until', 'is_active'
        ]
        read_only_fields = ['id', 'current_uses', 'created_at', 'updated_at']


class EventFeeSerializer(serializers.ModelSerializer):
    """Serializer for EventFee model."""
    
    class Meta:
        model = EventFee
        fields = [
            'id', 'name', 'description', 'fee_type', 'calculation_type',
            'fee_value', 'min_amount', 'max_fee', 'is_active', 'is_mandatory'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EventPricingRuleSerializer(serializers.ModelSerializer):
    """Serializer for EventPricingRule model."""
    
    class Meta:
        model = EventPricingRule
        fields = [
            'id', 'name', 'description', 'rule_type', 'adjustment_type',
            'adjustment_value', 'conditions', 'priority', 'is_active'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EventPricingCalculatorSerializer(serializers.Serializer):
    """Serializer for event pricing calculation requests."""
    
    performance_id = serializers.CharField(required=True)
    section_name = serializers.CharField(required=True)
    ticket_type_id = serializers.CharField(required=True)
    quantity = serializers.IntegerField(min_value=1, default=1)
    selected_options = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        default=list
    )
    discount_code = serializers.CharField(required=False, allow_blank=True)
    is_group_booking = serializers.BooleanField(default=False)
    apply_fees = serializers.BooleanField(default=True)
    apply_taxes = serializers.BooleanField(default=True)
    
    def validate_selected_options(self, value):
        """Validate selected options format."""
        for option in value:
            if 'option_id' not in option or 'quantity' not in option:
                raise serializers.ValidationError(
                    "Each option must have 'option_id' and 'quantity' fields"
                )
            if option['quantity'] < 1:
                raise serializers.ValidationError(
                    "Option quantity must be at least 1"
                )
        return value


class EventPricingResultSerializer(serializers.Serializer):
    """Serializer for event pricing calculation results."""
    
    base_price = serializers.FloatField()
    price_modifier = serializers.FloatField()
    unit_price = serializers.FloatField()
    quantity = serializers.IntegerField()
    subtotal = serializers.FloatField()
    options = serializers.ListField(child=serializers.DictField())
    options_total = serializers.FloatField()
    discounts = serializers.ListField(child=serializers.DictField())
    discount_total = serializers.FloatField()
    fees = serializers.ListField(child=serializers.DictField())
    fees_total = serializers.FloatField()
    taxes = serializers.ListField(child=serializers.DictField())
    taxes_total = serializers.FloatField()
    final_price = serializers.FloatField()
    
    # Additional metadata
    currency = serializers.CharField(default='USD')
    calculation_timestamp = serializers.DateTimeField()
    pricing_rules_applied = serializers.ListField(child=serializers.CharField(), required=False)


# Update existing EventDetailSerializer to include pricing information
class EventDetailSerializer(serializers.ModelSerializer):
    """Enhanced serializer for Event detail view with pricing information."""
    
    category = EventCategorySerializer(read_only=True)
    venue = VenueSerializer(read_only=True)
    artists = ArtistSerializer(many=True, read_only=True)
    ticket_types = TicketTypeSerializer(many=True, read_only=True)
    options = EventOptionSerializer(many=True, read_only=True)
    performances = EventPerformanceSerializer(many=True, read_only=True)
    reviews = EventReviewSerializer(many=True, read_only=True)
    average_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)
    
    # Enhanced booking-related computed fields
    available_performances = serializers.SerializerMethodField()
    pricing_summary = serializers.SerializerMethodField()
    booking_info = serializers.SerializerMethodField()
    
    # New fields for enhanced frontend
    performance_calendar = serializers.SerializerMethodField()
    seat_map_info = serializers.SerializerMethodField()
    available_options = serializers.SerializerMethodField()
    capacity_overview = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'slug', 'title', 'description', 'short_description',
            'highlights', 'rules', 'required_items', 'image', 'gallery',
            'style', 'door_open_time', 'start_time', 'end_time',
            'age_restriction', 'price', 'currency', 'category', 'venue', 'artists',
            'ticket_types', 'options', 'performances', 'reviews',
            'average_rating', 'review_count', 'available_performances',
            'pricing_summary', 'booking_info', 'performance_calendar',
            'seat_map_info', 'available_options', 'capacity_overview',
            'is_active', 'created_at', 'updated_at'
        ]
    
    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if reviews:
            return sum(review.rating for review in reviews) / len(reviews)
        return 0
    
    def get_review_count(self, obj):
        return obj.reviews.count()
    
    def get_available_performances(self, obj):
        """Get available performances for the next 30 days."""
        from datetime import date, timedelta
        
        today = date.today()
        end_date = today + timedelta(days=30)
        
        performances = obj.performances.filter(
            date__gte=today,
            date__lte=end_date,
            is_available=True
        ).order_by('date', 'start_time')
        
        return EventPerformanceSerializer(performances, many=True).data
    
    def get_pricing_summary(self, obj):
        """Get pricing summary for all ticket types."""
        summary = {}
        
        for ticket_type in obj.ticket_types.all():
            # Get base price from first available section
            base_price = None
            for performance in obj.performances.all():
                for section in performance.sections.all():
                    for stt in section.ticket_types.all():
                        if stt.ticket_type.id == ticket_type.id:
                            base_price = section.base_price
                            break
                    if base_price:
                        break
                if base_price:
                    break
            
            # If no base price found from sections, use a default base price
            if not base_price:
                base_price = 100.0  # Default base price
            
            # Convert both to float to avoid decimal/float multiplication issues
            base_price_float = float(base_price)
            price_modifier_float = float(ticket_type.price_modifier)
            modified_price = base_price_float * price_modifier_float
            summary[str(ticket_type.id)] = {
                'ticket_type_name': ticket_type.name,
                'ticket_type_code': ticket_type.ticket_type,
                'base_price': float(base_price),
                'modified_price': float(modified_price),
                'price_modifier': float(ticket_type.price_modifier),
                'capacity': ticket_type.capacity,
                'benefits': ticket_type.benefits,
                'age_min': ticket_type.age_min,
                'age_max': ticket_type.age_max
            }
        
        return summary
    
    def get_booking_info(self, obj):
        """Get booking information and requirements."""
        return {
            'age_restriction': obj.age_restriction,
            'door_open_time': obj.door_open_time.strftime('%H:%M') if obj.door_open_time else None,
            'start_time': obj.start_time.strftime('%H:%M') if obj.start_time else None,
            'end_time': obj.end_time.strftime('%H:%M') if obj.end_time else None,
            'style': obj.style,
            'venue_capacity': obj.venue.total_capacity,
            'venue_facilities': obj.venue.facilities,
        }

    def get_pricing_calculator(self, obj):
        """Get pricing calculator information."""
        return {
            'supports_dynamic_pricing': True,
            'supports_discounts': obj.discounts.filter(is_active=True).exists(),
            'supports_fees': obj.fees.filter(is_active=True).exists(),
            'supports_pricing_rules': obj.pricing_rules.filter(is_active=True).exists(),
            'currency': 'USD'
        }
    
    def get_available_discounts(self, obj):
        """Get available discounts for this event."""
        discounts = obj.discounts.filter(is_active=True)
        return EventDiscountSerializer(discounts, many=True).data
    
    def get_pricing_rules(self, obj):
        """Get active pricing rules for this event."""
        rules = obj.pricing_rules.filter(is_active=True).order_by('-priority')
        return EventPricingRuleSerializer(rules, many=True).data

    def get_performance_calendar(self, obj):
        """Get next 30 days of performances for calendar view."""
        from datetime import datetime, timedelta
        
        today = datetime.now().date()
        end_date = today + timedelta(days=30)
        
        performances = obj.performances.filter(
            date__gte=today,
            date__lte=end_date,
            is_available=True
        ).order_by('date')
        
        calendar_data = []
        for performance in performances[:10]:  # Limit to first 10 performances
            # Get basic capacity info
            capacity_summary = {
                'total_capacity': performance.max_capacity,
                'available_capacity': performance.available_capacity,
                'occupancy_rate': ((performance.max_capacity - performance.available_capacity) / performance.max_capacity * 100) if performance.max_capacity > 0 else 0
            }
            
            calendar_data.append({
                'id': performance.id,
                'date': performance.date,
                'start_time': performance.start_time,
                'end_time': performance.end_time,
                'is_special': performance.is_special,
                'capacity_summary': capacity_summary,
                'booking_cutoff': performance.date - timedelta(hours=2)
            })
        
        return calendar_data
    
    def get_seat_map_info(self, obj):
        """Get seat map structure information."""
        # Get unique sections from all performances
        sections = set()
        for performance in obj.performances.all():
            for section in performance.sections.all():
                sections.add(section.name)
        
        return {
            'venue_name': obj.venue.name,
            'total_capacity': obj.venue.total_capacity,
            'available_sections': sorted(list(sections)),
            'has_seat_map': True,  # Assuming all venues have seat maps
            'facilities': obj.venue.facilities
        }
    
    def get_available_options(self, obj):
        """Get available options grouped by type."""
        options = obj.options.filter(is_active=True)
        
        grouped_options = {}
        for option in options:
            option_type = option.option_type
            if option_type not in grouped_options:
                grouped_options[option_type] = []
            
            grouped_options[option_type].append({
                'id': option.id,
                'name': option.name,
                'description': option.description,
                'price': option.price,
                'currency': option.currency,
                'max_quantity': option.max_quantity
            })
        
        return grouped_options
    
    def get_capacity_overview(self, obj):
        """Get overall capacity overview for the event."""
        total_performances = obj.performances.count()
        available_performances = obj.performances.filter(is_available=True).count()
        
        # Calculate average capacity across all performances
        performances = obj.performances.all()
        if performances:
            total_capacity = sum(p.max_capacity for p in performances)
            available_capacity = sum(p.available_capacity for p in performances)
            
            return {
                'total_performances': total_performances,
                'available_performances': available_performances,
                'total_capacity': total_capacity,
                'available_capacity': available_capacity,
                'overall_occupancy_rate': ((total_capacity - available_capacity) / total_capacity * 100) if total_capacity > 0 else 0
            }
        
        return {
            'total_performances': 0,
            'available_performances': 0,
            'total_capacity': 0,
            'available_capacity': 0,
            'overall_occupancy_rate': 0
        }


class EventSearchSerializer(serializers.Serializer):
    """Serializer for event search parameters."""
    
    query = serializers.CharField(required=False, allow_blank=True)
    category = serializers.CharField(required=False, allow_blank=True)
    venue = serializers.CharField(required=False, allow_blank=True)
    style = serializers.CharField(required=False, allow_blank=True)
    min_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    max_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False)
    sort_by = serializers.CharField(required=False, default='date_asc')


class EventBookingSerializer(serializers.ModelSerializer):
    """Serializer for EventBooking model."""
    
    class Meta:
        model = EventReview  # Placeholder - should be EventBooking
        fields = ['selected_seats', 'selected_options', 'special_requirements']


class EventPricingBreakdownSerializer(serializers.Serializer):
    """Serializer for event pricing breakdown."""
    
    base_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    price_modifier = serializers.DecimalField(max_digits=10, decimal_places=2)
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    quantity = serializers.IntegerField()
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2)
    
    options = serializers.ListField()
    options_total = serializers.DecimalField(max_digits=10, decimal_places=2)
    
    discounts = serializers.ListField()
    discount_total = serializers.DecimalField(max_digits=10, decimal_places=2)
    
    fees = serializers.ListField()
    fees_total = serializers.DecimalField(max_digits=10, decimal_places=2)
    
    taxes = serializers.ListField()
    taxes_total = serializers.DecimalField(max_digits=10, decimal_places=2)
    
    final_price = serializers.DecimalField(max_digits=10, decimal_places=2) 


class EventBookingRequestSerializer(serializers.Serializer):
    """Serializer for event booking requests."""
    
    event_id = serializers.CharField(required=True)
    performance_id = serializers.CharField(required=True)
    section_name = serializers.CharField(required=True)
    ticket_type_id = serializers.CharField(required=True)
    quantity = serializers.IntegerField(min_value=1, max_value=10, default=1)
    
    selected_seats = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=list
    )
    
    selected_options = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        default=list
    )
    
    discount_code = serializers.CharField(required=False, allow_blank=True)
    special_requirements = serializers.CharField(required=False, allow_blank=True)
    
    def validate_selected_options(self, value):
        """Validate selected options format."""
        for option in value:
            if not all(k in option for k in ['option_id', 'quantity']):
                raise serializers.ValidationError(
                    "Each option must include 'option_id' and 'quantity'"
                )
        return value


class EventPricingRequestSerializer(serializers.Serializer):
    """Serializer for pricing calculation requests."""
    
    performance_id = serializers.CharField(required=True)
    section_name = serializers.CharField(required=True)
    ticket_type_id = serializers.CharField(required=True)
    quantity = serializers.IntegerField(min_value=1, max_value=10, default=1)
    selected_options = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        default=list
    )
    discount_code = serializers.CharField(required=False, allow_blank=True)
    
    def validate_selected_options(self, value):
        """Validate selected options format."""
        for option in value:
            if not all(k in option for k in ['option_id', 'quantity']):
                raise serializers.ValidationError(
                    "Each option must include 'option_id' and 'quantity'"
                )
        return value


class EventSeatReservationSerializer(serializers.Serializer):
    """Serializer for seat reservation requests."""
    
    performance_id = serializers.CharField(required=True)
    section_name = serializers.CharField(required=True)
    ticket_type_id = serializers.CharField(required=True)
    quantity = serializers.IntegerField(min_value=1, max_value=10, default=1)
    
    def validate(self, data):
        """Validate reservation data."""
        # Add custom validation logic here
        return data 