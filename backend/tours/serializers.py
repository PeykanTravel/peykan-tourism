"""
DRF Serializers for Tours app.
"""

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import (
    Tour, TourCategory, TourVariant, TourSchedule, 
    TourOption, TourReview, TourPricing, TourItinerary
)
from django.db.models import Avg
import copy


class TourCategorySerializer(serializers.ModelSerializer):
    """Serializer for TourCategory model."""
    
    class Meta:
        model = TourCategory
        fields = ['id', 'slug', 'name', 'description', 'icon', 'color', 'is_active']


class TourPricingSerializer(serializers.ModelSerializer):
    """Serializer for TourPricing model."""
    
    age_group_display = serializers.CharField(source='get_age_group_display', read_only=True)
    
    class Meta:
        model = TourPricing
        fields = [
            'id', 'age_group', 'age_group_display', 'factor', 'is_free', 'requires_services'
        ]


class TourVariantSerializer(serializers.ModelSerializer):
    """Serializer for TourVariant model with pricing."""
    
    pricing = TourPricingSerializer(many=True, read_only=True)
    
    class Meta:
        model = TourVariant
        fields = [
            'id', 'name', 'description', 'base_price',
            'capacity', 'is_active', 'includes_transfer', 'includes_guide',
            'includes_meal', 'includes_photographer', 'extended_hours',
            'private_transfer', 'expert_guide', 'special_meal', 'pricing'
        ]


class TourOptionSerializer(serializers.ModelSerializer):
    """Serializer for TourOption model."""
    
    class Meta:
        model = TourOption
        fields = [
            'id', 'name', 'description', 'price', 'price_percentage', 'currency',
            'option_type', 'is_available', 'max_quantity'
        ]


class TourScheduleSerializer(serializers.ModelSerializer):
    """Serializer for TourSchedule model."""
    
    available_capacity = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    cutoff_datetime = serializers.SerializerMethodField()
    variant_capacities = serializers.SerializerMethodField()
    
    class Meta:
        model = TourSchedule
        fields = [
            'id', 'start_date', 'end_date', 'start_time', 'end_time',
            'is_available', 'max_capacity', 'current_capacity',
            'available_capacity', 'is_full', 'day_of_week',
            'variant_capacities', 'cutoff_datetime'
        ]
    
    def get_cutoff_datetime(self, obj):
        """Calculate booking cutoff datetime."""
        from datetime import datetime, timedelta
        tour = obj.tour
        cutoff_hours = tour.booking_cutoff_hours
        
        # Calculate cutoff time based on start date and time
        start_datetime = datetime.combine(obj.start_date, obj.start_time)
        cutoff_datetime = start_datetime - timedelta(hours=cutoff_hours)
        
        return cutoff_datetime.isoformat()
    
    def get_variant_capacities(self, obj):
        """Get variant_capacities from the safe property."""
        return obj.variant_capacities


class TourReviewSerializer(serializers.ModelSerializer):
    """Serializer for TourReview model."""
    
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = TourReview
        fields = [
            'id', 'rating', 'title', 'comment', 'is_verified',
            'is_helpful', 'created_at', 'user_name'
        ]
        read_only_fields = ['id', 'is_verified', 'is_helpful', 'created_at', 'user_name']
    
    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip()


class TourReviewCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating tour reviews."""
    
    class Meta:
        model = TourReview
        fields = ['rating', 'title', 'comment']
    
    def validate(self, attrs):
        user = self.context['request'].user
        tour = self.context['tour']
        
        # Check if user has already reviewed this tour
        if TourReview.objects.filter(user=user, tour=tour).exists():
            raise serializers.ValidationError(_('You have already reviewed this tour.'))
        
        return attrs
    
    def create(self, validated_data):
        user = self.context['request'].user
        tour = self.context['tour']
        return TourReview.objects.create(user=user, tour=tour, **validated_data)


class TourListSerializer(serializers.ModelSerializer):
    """Serializer for tour list view."""
    
    category = TourCategorySerializer(read_only=True)
    
    class Meta:
        model = Tour
        fields = [
            'id', 'slug', 'title', 'price', 'currency', 'duration_hours', 
            'is_active', 'created_at', 'category', 'image', 'gallery',
            'is_featured', 'is_popular', 'city', 'country'
        ]


class TourDetailSerializer(serializers.ModelSerializer):
    """Comprehensive serializer for tour detail view."""
    
    # Related data
    variants = TourVariantSerializer(many=True, read_only=True)
    schedules = serializers.SerializerMethodField()
    itinerary = serializers.SerializerMethodField()
    options = TourOptionSerializer(many=True, read_only=True)
    reviews = TourReviewSerializer(many=True, read_only=True)
    category = TourCategorySerializer(read_only=True)
    
    # Calculated fields
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    is_available_today = serializers.SerializerMethodField()
    pricing_summary = serializers.SerializerMethodField()
    
    class Meta:
        model = Tour
        fields = [
            'id', 'slug', 'title', 'description', 'short_description', 
            'highlights', 'rules', 'required_items', 'image', 'gallery',
            'price', 'currency', 'duration_hours', 'pickup_time', 
            'start_time', 'end_time', 'min_participants', 'max_participants', 
            'booking_cutoff_hours', 'cancellation_hours', 'refund_percentage', 
            'includes_transfer', 'includes_guide', 'includes_meal', 
            'includes_photographer', 'tour_type', 'transport_type', 
            'is_active', 'created_at', 'category', 'variants', 'schedules',
            'itinerary', 'options', 'reviews', 'average_rating', 
            'review_count', 'is_available_today', 'pricing_summary'
        ]
    
    def get_itinerary(self, obj):
        """Get tour itinerary items."""
        itinerary_items = TourItinerary.objects.filter(tour=obj).order_by('order')
        return [
            {
                'id': str(item.id),
                'title': item.title,
                'description': item.description,
                'order': item.order,
                'duration_minutes': item.duration_minutes,
                'location': item.location,
                'image': item.image.url if item.image else None
            }
            for item in itinerary_items
        ]
    
    def get_average_rating(self, obj):
        """Calculate average rating from reviews."""
        avg_rating = obj.reviews.filter(is_verified=True).aggregate(
            avg_rating=Avg('rating')
        )['avg_rating']
        return float(avg_rating) if avg_rating else None
    
    def get_review_count(self, obj):
        """Get count of verified reviews."""
        return obj.reviews.filter(is_verified=True).count()
    
    def get_is_available_today(self, obj):
        """Check if tour is available today."""
        return obj.is_available_today
    
    def get_pricing_summary(self, obj):
        summary = {}
        for variant in obj.variants.filter(is_active=True):
            variant_data = {
                'base_price': float(variant.base_price),
                'age_groups': {},
                'options': []
            }
            for pricing in variant.pricing.filter():
                variant_data['age_groups'][pricing.age_group] = {
                    'factor': float(pricing.factor),
                    'final_price': float(variant.base_price) * float(pricing.factor),
                    'is_free': pricing.is_free
                }
            for option in obj.options.filter(is_available=True):
                option_data = {
                    'name': option.name,
                    'price': float(option.price),
                    'price_percentage': float(option.price_percentage)
                }
                variant_data['options'].append(option_data)
            summary[str(variant.id)] = variant_data
        return summary
    
    def get_schedules(self, obj):
        # Use TourScheduleSerializer to serialize each schedule safely
        schedules = obj.schedules.all()
        return [TourScheduleSerializer(s).data for s in schedules]
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Patch schedules if present
        schedules = data.get('schedules')
        if isinstance(schedules, list):
            for sched in schedules:
                vc = sched.get('variant_capacities')
                if not isinstance(vc, dict):
                    sched['variant_capacities'] = {}
                else:
                    sched['variant_capacities'] = {str(k): v for k, v in vc.items()}
        return data


class TourSearchSerializer(serializers.Serializer):
    """Serializer for tour search parameters."""
    
    query = serializers.CharField(required=False, help_text=_('Search query'))
    category = serializers.UUIDField(required=False, help_text=_('Category ID'))
    min_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False,
        help_text=_('Minimum price')
    )
    max_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False,
        help_text=_('Maximum price')
    )
    min_duration = serializers.IntegerField(required=False, help_text=_('Minimum duration in hours'))
    max_duration = serializers.IntegerField(required=False, help_text=_('Maximum duration in hours'))
    date_from = serializers.DateField(required=False, help_text=_('Available from date'))
    date_to = serializers.DateField(required=False, help_text=_('Available to date'))
    includes_transfer = serializers.BooleanField(required=False, help_text=_('Includes transfer'))
    includes_guide = serializers.BooleanField(required=False, help_text=_('Includes guide'))
    includes_meal = serializers.BooleanField(required=False, help_text=_('Includes meal'))
    sort_by = serializers.ChoiceField(
        choices=[
            ('price_asc', _('Price: Low to High')),
            ('price_desc', _('Price: High to Low')),
            ('duration_asc', _('Duration: Short to Long')),
            ('duration_desc', _('Duration: Long to Short')),
            ('rating_desc', _('Rating: High to Low')),
            ('created_desc', _('Newest First')),
            ('created_asc', _('Oldest First')),
        ],
        required=False,
        default='created_desc'
    )


class TourBookingSerializer(serializers.Serializer):
    """Serializer for tour booking."""
    
    tour_id = serializers.UUIDField()
    variant_id = serializers.UUIDField(required=False)
    schedule_id = serializers.UUIDField()
    
    # Passenger counts
    adult_count = serializers.IntegerField(min_value=0, max_value=50)
    child_count = serializers.IntegerField(min_value=0, max_value=50)
    infant_count = serializers.IntegerField(min_value=0, max_value=50)
    
    # Options and requests
    selected_options = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )
    special_requests = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, attrs):
        """Validate booking data."""
        from .models import Tour, TourVariant, TourSchedule
        
        # Validate tour exists
        try:
            tour = Tour.objects.get(id=attrs['tour_id'], is_active=True)
        except Tour.DoesNotExist:
            raise serializers.ValidationError(_('Tour not found or inactive.'))
        
        # Validate variant if provided
        if attrs.get('variant_id'):
            try:
                variant = TourVariant.objects.get(
                    id=attrs['variant_id'], 
                    tour=tour, 
                    is_active=True
                )
            except TourVariant.DoesNotExist:
                raise serializers.ValidationError(_('Tour variant not found or inactive.'))
        
        # Validate schedule
        try:
            schedule = TourSchedule.objects.get(
                id=attrs['schedule_id'],
                tour=tour,
                is_available=True
            )
        except TourSchedule.DoesNotExist:
            raise serializers.ValidationError(_('Schedule not found or unavailable.'))
        
        # Validate passenger counts
        total_passengers = (
            attrs['adult_count'] + 
            attrs['child_count'] + 
            attrs['infant_count']
        )
        
        if total_passengers == 0:
            raise serializers.ValidationError(_('At least one passenger is required.'))
        
        if total_passengers > tour.max_participants:
            raise serializers.ValidationError(
                _('Total passengers cannot exceed maximum participants.')
            )
        
        if total_passengers < tour.min_participants:
            raise serializers.ValidationError(
                _('Total passengers must meet minimum participants requirement.')
            )
        
        # Check capacity
        available_capacity = schedule.available_capacity
        if total_passengers > available_capacity:
            raise serializers.ValidationError(
                _('Not enough capacity available for selected schedule.')
            )
        
        return attrs 


class CheckTourAvailabilitySerializer(serializers.Serializer):
    """Serializer for checking tour availability before booking."""
    
    tour_id = serializers.UUIDField()
    variant_id = serializers.UUIDField()
    schedule_id = serializers.UUIDField()
    
    participants = serializers.DictField(
        child=serializers.IntegerField(min_value=0, max_value=20)
    )
    
    def validate_participants(self, value):
        """Validate participants dictionary."""
        required_keys = {'adult', 'child', 'infant'}
        if not all(key in value for key in required_keys):
            raise serializers.ValidationError(
                f"Participants must include: {', '.join(required_keys)}"
            )
        
        total_participants = sum(value.values())
        if total_participants <= 0:
            raise serializers.ValidationError(
                "At least one participant is required"
            )
        
        if total_participants > 20:
            raise serializers.ValidationError(
                "Maximum 20 participants allowed per booking"
            )
        
        return value 