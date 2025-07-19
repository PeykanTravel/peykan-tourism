"""
Tour models for Peykan Tourism Platform.
"""

from decimal import Decimal
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from core.models import BaseProductModel, BaseVariantModel, BaseScheduleModel, BaseOptionModel, BaseModel, BaseTranslatableModel, BaseBookingModel
from parler.models import TranslatedFields


class TourCategory(BaseTranslatableModel):
    """
    Tour categories (historical, recreational, etc.).
    """
    
    # Translatable fields
    translations = TranslatedFields(
        name=models.CharField(max_length=255, verbose_name=_('Name')),
        description=models.TextField(verbose_name=_('Description')),
    )
    
    # Category specific fields
    icon = models.CharField(max_length=50, blank=True, verbose_name=_('Icon'))
    color = models.CharField(max_length=7, default='#007bff', verbose_name=_('Color'))
    
    class Meta:
        verbose_name = _('Tour Category')
        verbose_name_plural = _('Tour Categories')
    
    def __str__(self):
        return self.name or self.slug


class Tour(BaseProductModel):
    """
    Tour model with all required features.
    """
    
    # Translatable fields
    translations = TranslatedFields(
        title=models.CharField(max_length=255, verbose_name=_('Title')),
        description=models.TextField(verbose_name=_('Description')),
        short_description=models.TextField(max_length=500, verbose_name=_('Short description')),
        highlights=models.TextField(blank=True, verbose_name=_('Highlights')),
        rules=models.TextField(blank=True, verbose_name=_('Rules and regulations')),
        required_items=models.TextField(blank=True, verbose_name=_('Required items')),
    )
    
    # Tour specific fields
    category = models.ForeignKey(
        TourCategory, 
        on_delete=models.CASCADE, 
        related_name='tours',
        verbose_name=_('Category')
    )
    
    # Tour attributes
    TOUR_TYPE_CHOICES = [
        ('day', _('Day tour')),
        ('night', _('Night tour')),
    ]
    tour_type = models.CharField(
        max_length=10, 
        choices=TOUR_TYPE_CHOICES, 
        default='day',
        verbose_name=_('Tour type')
    )
    
    TRANSPORT_TYPE_CHOICES = [
        ('boat', _('Boat')),
        ('land', _('Land')),
        ('air', _('Air')),
    ]
    transport_type = models.CharField(
        max_length=10, 
        choices=TRANSPORT_TYPE_CHOICES, 
        default='land',
        verbose_name=_('Transport type')
    )
    
    # Duration and timing
    duration_hours = models.PositiveIntegerField(verbose_name=_('Duration (hours)'))
    pickup_time = models.TimeField(verbose_name=_('Pickup time'))
    start_time = models.TimeField(verbose_name=_('Start time'))
    end_time = models.TimeField(verbose_name=_('End time'))
    
    # Booking settings
    min_participants = models.PositiveIntegerField(default=1, verbose_name=_('Minimum participants'))
    max_participants = models.PositiveIntegerField(verbose_name=_('Maximum participants'))
    booking_cutoff_hours = models.PositiveIntegerField(default=8, verbose_name=_('Booking cutoff (hours)'))
    
    # Cancellation policy
    cancellation_hours = models.PositiveIntegerField(default=48, verbose_name=_('Cancellation hours'))
    refund_percentage = models.PositiveIntegerField(
        default=50, 
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name=_('Refund percentage')
    )
    
    # Services included
    includes_transfer = models.BooleanField(default=True, verbose_name=_('Includes transfer'))
    includes_guide = models.BooleanField(default=True, verbose_name=_('Includes guide'))
    includes_meal = models.BooleanField(default=True, verbose_name=_('Includes meal'))
    includes_photographer = models.BooleanField(default=False, verbose_name=_('Includes photographer'))
    
    # Additional images
    gallery = models.JSONField(default=list, blank=True, verbose_name=_('Gallery'))
    
    class Meta:
        verbose_name = _('Tour')
        verbose_name_plural = _('Tours')
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['category']),
            models.Index(fields=['tour_type']),
            models.Index(fields=['transport_type']),
            models.Index(fields=['created_at']),
            models.Index(fields=['is_active', 'category']),
            models.Index(fields=['is_active', 'tour_type']),
        ]
    
    def __str__(self):
        return self.title or self.slug
    
    @property
    def is_available_today(self):
        """Check if tour has available schedules in the future."""
        from datetime import date
        today = date.today()
        return self.schedules.filter(
            start_date__gte=today,
            is_available=True
        ).exists()


class TourVariant(BaseVariantModel):
    """
    Tour variants (Eco, Normal, VIP, VVIP).
    """
    
    tour = models.ForeignKey(
        Tour, 
        on_delete=models.CASCADE, 
        related_name='variants',
        verbose_name=_('Tour')
    )
    
    # Base price for this variant (replaces price_modifier)
    base_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        default=0.00,
        verbose_name=_('Base price (USD)')
    )
    
    # Variant specific fields
    includes_transfer = models.BooleanField(default=True, verbose_name=_('Includes transfer'))
    includes_guide = models.BooleanField(default=True, verbose_name=_('Includes guide'))
    includes_meal = models.BooleanField(default=True, verbose_name=_('Includes meal'))
    includes_photographer = models.BooleanField(default=False, verbose_name=_('Includes photographer'))
    
    # Extended services
    extended_hours = models.PositiveIntegerField(default=0, verbose_name=_('Extended hours'))
    private_transfer = models.BooleanField(default=False, verbose_name=_('Private transfer'))
    expert_guide = models.BooleanField(default=False, verbose_name=_('Expert guide'))
    special_meal = models.BooleanField(default=False, verbose_name=_('Special meal'))
    
    class Meta:
        verbose_name = _('Tour Variant')
        verbose_name_plural = _('Tour Variants')
        unique_together = ['tour', 'name']
    
    def __str__(self):
        return f"{self.tour.title} - {self.name}"
    
    def clean(self):
        """Validate variant data."""
        from django.core.exceptions import ValidationError
        
        # Validate base_price
        if self.base_price is None or self.base_price <= 0:
            raise ValidationError({
                'base_price': 'Base price must be greater than zero.'
            })
        
        # Validate name uniqueness within tour
        if self.pk is None:  # Only check on creation
            if TourVariant.objects.filter(tour=self.tour, name=self.name).exists():
                raise ValidationError({
                    'name': 'A variant with this name already exists for this tour.'
                })
    
    def save(self, *args, **kwargs):
        """Override save to ensure validation."""
        self.full_clean()
        super().save(*args, **kwargs)


class TourSchedule(BaseScheduleModel):
    """
    Tour schedules with availability tracking.
    """
    
    tour = models.ForeignKey(
        Tour, 
        on_delete=models.CASCADE, 
        related_name='schedules',
        verbose_name=_('Tour')
    )
    
    # Schedule specific fields
    day_of_week = models.PositiveIntegerField(
        choices=[
            (0, _('Monday')),
            (1, _('Tuesday')),
            (2, _('Wednesday')),
            (3, _('Thursday')),
            (4, _('Friday')),
            (5, _('Saturday')),
            (6, _('Sunday')),
        ],
        verbose_name=_('Day of week')
    )
    
    # Variant capacities
    variant_capacities_raw = models.JSONField(
        default=dict,
        verbose_name=_('Variant capacities')
    )
    
    class Meta:
        verbose_name = _('Tour Schedule')
        verbose_name_plural = _('Tour Schedules')
        unique_together = ['tour', 'start_date']
        indexes = [
            models.Index(fields=['tour']),
            models.Index(fields=['start_date']),
            models.Index(fields=['is_available']),
            models.Index(fields=['tour', 'start_date']),
            models.Index(fields=['tour', 'is_available']),
            models.Index(fields=['start_date', 'is_available']),
        ]
    
    def __str__(self):
        return f"{self.tour.title} - {self.start_date}"
    
    def save(self, *args, **kwargs):
        # Ensure variant_capacities_raw keys are strings before saving
        if self.variant_capacities_raw:
            self.variant_capacities_raw = {str(k): v for k, v in self.variant_capacities_raw.items()}
        super().save(*args, **kwargs)

    @property
    def variant_capacities(self):
        """Safe property that always returns string keys."""
        orig = self.variant_capacities_raw
        if not isinstance(orig, dict):
            return {}
        return {str(k): v for k, v in orig.items()}


class TourItinerary(BaseTranslatableModel):
    """
    Tour itinerary stops and activities.
    """
    
    tour = models.ForeignKey(
        Tour, 
        on_delete=models.CASCADE, 
        related_name='itinerary',
        verbose_name=_('Tour')
    )
    
    # Translatable fields
    translations = TranslatedFields(
        title=models.CharField(max_length=255, verbose_name=_('Title')),
        description=models.TextField(verbose_name=_('Description')),
    )
    
    # Itinerary details
    order = models.PositiveIntegerField(verbose_name=_('Order'))
    duration_minutes = models.PositiveIntegerField(verbose_name=_('Duration (minutes)'))
    location = models.CharField(max_length=255, verbose_name=_('Location'))
    
    # Optional fields
    image = models.ImageField(
        upload_to='itinerary/', 
        null=True, 
        blank=True,
        verbose_name=_('Image')
    )
    coordinates = models.JSONField(
        null=True, 
        blank=True,
        verbose_name=_('Coordinates')
    )
    
    class Meta:
        verbose_name = _('Tour Itinerary')
        verbose_name_plural = _('Tour Itinerary')
        ordering = ['order']
    
    def __str__(self):
        return f"{self.tour.title} - {self.title}"


class TourPricing(BaseModel):
    """
    Age-based pricing for tour variants.
    """
    
    tour = models.ForeignKey(
        Tour, 
        on_delete=models.CASCADE, 
        related_name='pricing',
        verbose_name=_('Tour')
    )
    variant = models.ForeignKey(
        TourVariant, 
        on_delete=models.CASCADE, 
        related_name='pricing',
        verbose_name=_('Variant')
    )
    
    # Age groups
    AGE_GROUP_CHOICES = [
        ('infant', _('Infant (0-2)')),
        ('child', _('Child (2-10)')),
        ('adult', _('Adult (11+)')),
    ]
    age_group = models.CharField(
        max_length=10, 
        choices=AGE_GROUP_CHOICES,
        verbose_name=_('Age group')
    )
    
    # Pricing factor (replaces base_price and discount_percentage)
    factor = models.DecimalField(
        max_digits=3, 
        decimal_places=2, 
        default=1.00,
        validators=[MinValueValidator(0.00), MaxValueValidator(2.00)],
        verbose_name=_('Price factor')
    )
    
    # Conditions
    is_free = models.BooleanField(default=False, verbose_name=_('Is free'))
    requires_services = models.BooleanField(default=True, verbose_name=_('Requires services'))
    
    class Meta:
        verbose_name = _('Tour Pricing')
        verbose_name_plural = _('Tour Pricing')
        unique_together = ['tour', 'variant', 'age_group']
    
    def __str__(self):
        return f"{self.tour.title} - {self.variant.name} - {self.get_age_group_display()}"
    
    @property
    def final_price(self):
        """Calculate final price based on variant base price and factor."""
        if self.is_free:
            return Decimal('0.00')
        
        # Use variant base_price instead of tour price
        base_price = self.variant.base_price
        
        # Validate base_price and factor
        if not base_price or base_price <= 0:
            return Decimal('0.00')
        
        if not self.factor or self.factor <= 0:
            return Decimal('0.00')
        
        try:
            return base_price * self.factor
        except (TypeError, ValueError):
            return Decimal('0.00')
        return base_price * self.factor


class TourOption(BaseOptionModel):
    """
    Tour options and add-ons.
    """
    
    tour = models.ForeignKey(
        Tour, 
        on_delete=models.CASCADE, 
        related_name='options',
        verbose_name=_('Tour')
    )
    
    # Option specific fields
    OPTION_TYPE_CHOICES = [
        ('service', _('Service')),
        ('equipment', _('Equipment')),
        ('food', _('Food')),
        ('transport', _('Transport')),
    ]
    option_type = models.CharField(
        max_length=20, 
        choices=OPTION_TYPE_CHOICES,
        default='service',
        verbose_name=_('Option type')
    )
    
    # Percentage-based pricing (new field)
    price_percentage = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0.00,
        verbose_name=_('Price percentage')
    )
    
    # Availability
    is_available = models.BooleanField(default=True, verbose_name=_('Is available'))
    max_quantity = models.PositiveIntegerField(
        default=1, 
        verbose_name=_('Maximum quantity')
    )
    
    class Meta:
        verbose_name = _('Tour Option')
        verbose_name_plural = _('Tour Options')
    
    def __str__(self):
        return f"{self.tour.title} - {self.name}"


class TourReview(BaseModel):
    """
    Tour reviews and ratings.
    """
    
    tour = models.ForeignKey(
        Tour, 
        on_delete=models.CASCADE, 
        related_name='reviews',
        verbose_name=_('Tour')
    )
    user = models.ForeignKey(
        'users.User', 
        on_delete=models.CASCADE, 
        related_name='tour_reviews',
        verbose_name=_('User')
    )
    
    # Review content
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name=_('Rating')
    )
    title = models.CharField(max_length=255, verbose_name=_('Title'))
    comment = models.TextField(verbose_name=_('Comment'))
    
    # Review metadata
    is_verified = models.BooleanField(default=False, verbose_name=_('Is verified'))
    is_helpful = models.PositiveIntegerField(default=0, verbose_name=_('Helpful votes'))
    
    class Meta:
        verbose_name = _('Tour Review')
        verbose_name_plural = _('Tour Reviews')
        unique_together = ['tour', 'user']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.tour.title} - {self.user.username} - {self.rating}"


class TourBooking(BaseBookingModel):
    """
    Tour bookings with variant and pricing details.
    """
    
    tour = models.ForeignKey(
        Tour, 
        on_delete=models.CASCADE, 
        related_name='bookings',
        verbose_name=_('Tour')
    )
    variant = models.ForeignKey(
        TourVariant, 
        on_delete=models.CASCADE, 
        related_name='bookings',
        verbose_name=_('Variant')
    )
    schedule = models.ForeignKey(
        TourSchedule, 
        on_delete=models.CASCADE, 
        related_name='bookings',
        verbose_name=_('Schedule')
    )
    user = models.ForeignKey(
        'users.User', 
        on_delete=models.CASCADE, 
        related_name='tour_bookings',
        verbose_name=_('User')
    )
    
    # Booking details
    booking_reference = models.CharField(
        max_length=20, 
        unique=True,
        verbose_name=_('Booking reference')
    )
    
    # Participant breakdown
    adult_count = models.PositiveIntegerField(default=0, verbose_name=_('Adult count'))
    child_count = models.PositiveIntegerField(default=0, verbose_name=_('Child count'))
    infant_count = models.PositiveIntegerField(default=0, verbose_name=_('Infant count'))
    
    # Pricing breakdown
    adult_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        verbose_name=_('Adult price')
    )
    child_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        verbose_name=_('Child price')
    )
    infant_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        verbose_name=_('Infant price')
    )
    
    # Options
    selected_options = models.JSONField(
        default=list,
        verbose_name=_('Selected options')
    )
    options_total = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        default=0.00,
        verbose_name=_('Options total')
    )
    
    # Special requirements
    special_requirements = models.TextField(blank=True, verbose_name=_('Special requirements'))
    
    class Meta:
        verbose_name = _('Tour Booking')
        verbose_name_plural = _('Tour Bookings')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.booking_reference} - {self.tour.title}"
    
    def save(self, *args, **kwargs):
        if not self.booking_reference:
            self.booking_reference = f"TB{str(self.id)[:8].upper()}"
        super().save(*args, **kwargs)
    
    @property
    def total_participants(self):
        return self.adult_count + self.child_count + self.infant_count
    
    @property
    def subtotal(self):
        return (
            self.adult_price * self.adult_count +
            self.child_price * self.child_count +
            self.infant_price * self.infant_count
        )
    
    @property
    def grand_total(self):
        return self.subtotal + self.options_total 