"""
Simplified Transfer models for Peykan Tourism Platform.
"""

from decimal import Decimal
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils.text import slugify
from core.models import BaseModel, BaseBookingModel, BaseTranslatableModel
from parler.models import TranslatedFields
import uuid


class TransferRoute(BaseTranslatableModel):
    """
    Simple transfer routes with origin and destination.
    """
    
    # Translatable fields
    translations = TranslatedFields(
        name=models.CharField(max_length=255, verbose_name=_('Name')),
        description=models.TextField(blank=True, verbose_name=_('Description')),
    )
    
    # Route details
    origin = models.CharField(max_length=255, verbose_name=_('Origin'))
    destination = models.CharField(max_length=255, verbose_name=_('Destination'))
    
    # Slug field for SEO-friendly URLs
    slug = models.SlugField(
        max_length=255, 
        unique=True, 
        null=True, 
        blank=True,
        verbose_name=_('Slug')
    )
    
    # Round trip settings
    round_trip_discount_enabled = models.BooleanField(
        default=False, 
        verbose_name=_('Round trip discount enabled')
    )
    round_trip_discount_percentage = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=10.00,
        verbose_name=_('Round trip discount (%)')
    )
    
    # Time-based surcharges
    peak_hour_surcharge = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=10.00,
        verbose_name=_('Peak hour surcharge (%)')
    )
    midnight_surcharge = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=5.00,
        verbose_name=_('Midnight surcharge (%)')
    )
    
    # Admin fields for popularity
    is_admin_selected = models.BooleanField(default=False, verbose_name=_('Admin selected'))
    is_popular = models.BooleanField(default=False, verbose_name=_('Is popular'))
    popularity_score = models.PositiveIntegerField(default=0, verbose_name=_('Popularity score'))
    booking_count = models.PositiveIntegerField(default=0, verbose_name=_('Booking count'))
    
    # Status
    is_active = models.BooleanField(default=True, verbose_name=_('Is active'))
    
    class Meta:
        verbose_name = _('Transfer Route')
        verbose_name_plural = _('Transfer Routes')
        unique_together = ['origin', 'destination']
        ordering = ['origin', 'destination']
        indexes = [
            models.Index(fields=['origin', 'destination']),
            models.Index(fields=['is_active']),
            models.Index(fields=['slug']),
        ]
    
    def __str__(self):
        return f"{self.origin} → {self.destination}"
    
    def clean(self):
        """Custom validation."""
        super().clean()
        
        # Validate that origin and destination are different
        if self.origin and self.destination and self.origin.lower() == self.destination.lower():
            raise ValidationError(_('Origin and destination cannot be the same.'))
        
        # Validate surcharge percentages
        if self.peak_hour_surcharge < 0 or self.midnight_surcharge < 0:
            raise ValidationError(_('Surcharge percentages cannot be negative.'))
        
        if self.round_trip_discount_percentage < 0 or self.round_trip_discount_percentage > 100:
            raise ValidationError(_('Round trip discount percentage must be between 0 and 100.'))
    
    def save(self, *args, **kwargs):
        """Auto-generate slug if not provided."""
        if not self.slug:
            # Create a base slug from origin and destination
            base_slug = f"{self.origin}-to-{self.destination}"
            self.slug = slugify(base_slug)
            
            # Ensure uniqueness
            counter = 1
            original_slug = self.slug
            while TransferRoute.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
        
        super().save(*args, **kwargs)
    
    def get_available_vehicle_types(self):
        """Get all available vehicle types for this route."""
        return list(self.pricing.filter(is_active=True).values_list('vehicle_type', flat=True))
    
    def calculate_time_surcharge(self, base_price, hour):
        """Calculate time-based surcharge."""
        if 7 <= hour <= 9 or 17 <= hour <= 19:  # Peak hours
            return base_price * (Decimal(str(self.peak_hour_surcharge)) / Decimal('100'))
        elif 22 <= hour <= 23 or 0 <= hour <= 6:  # Midnight
            return base_price * (Decimal(str(self.midnight_surcharge)) / Decimal('100'))
        else:  # Normal hours
            return Decimal('0.00')


class TransferRoutePricing(BaseModel):
    """
    Fixed pricing for each route and vehicle type combination.
    """
    
    route = models.ForeignKey(
        TransferRoute, 
        on_delete=models.CASCADE, 
        related_name='pricing',
        verbose_name=_('Route')
    )
    
    # Vehicle type
    VEHICLE_CATEGORY_CHOICES = [
        ('sedan', _('Sedan')),
        ('suv', _('SUV')),
        ('van', _('Van')),
        ('sprinter', _('Sprinter')),
        ('bus', _('Bus')),
        ('limousine', _('Limousine')),
    ]
    vehicle_type = models.CharField(
        max_length=20, 
        choices=VEHICLE_CATEGORY_CHOICES,
        verbose_name=_('Vehicle type')
    )
    
    # Vehicle details
    vehicle_name = models.CharField(max_length=255, verbose_name=_('Vehicle name'))
    vehicle_description = models.TextField(blank=True, verbose_name=_('Vehicle description'))
    
    # Fixed pricing
    base_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name=_('Base price')
    )
    
    # Pricing metadata for flexible pricing logic
    pricing_metadata = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_('Pricing metadata')
    )
    
    # Capacity
    max_passengers = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        verbose_name=_('Max passengers')
    )
    max_luggage = models.PositiveIntegerField(
        validators=[MinValueValidator(0)],
        verbose_name=_('Max luggage')
    )
    
    # Features and amenities
    features = models.JSONField(default=list, blank=True, verbose_name=_('Features'))
    amenities = models.JSONField(default=list, blank=True, verbose_name=_('Amenities'))
    
    # Status
    is_active = models.BooleanField(default=True, verbose_name=_('Is active'))
    
    class Meta:
        verbose_name = _('Transfer Route Pricing')
        verbose_name_plural = _('Transfer Route Pricing')
        unique_together = ['route', 'vehicle_type']
        constraints = [
            models.UniqueConstraint(fields=['route', 'vehicle_type'], name='unique_route_vehicle')
        ]
        indexes = [
            models.Index(fields=['route', 'vehicle_type']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.route} - {self.vehicle_type} - ${self.base_price}"
    
    def clean(self):
        """Custom validation."""
        super().clean()
        
        # Validate base price
        if self.base_price <= 0:
            raise ValidationError(_('Base price must be greater than zero.'))
        
        # Validate pricing metadata structure
        if self.pricing_metadata:
            required_keys = ['pricing_type', 'calculation_method']
            for key in required_keys:
                if key not in self.pricing_metadata:
                    raise ValidationError(_(f'Pricing metadata must contain "{key}" field.'))
    
    def calculate_price(self, **kwargs):
        """
        Calculate price based on pricing metadata and product type.
        
        Args:
            **kwargs: Pricing parameters like hour, is_round_trip, selected_options, etc.
        
        Returns:
            dict: Price breakdown with all components
        """
        pricing_type = self.pricing_metadata.get('pricing_type', 'transfer')
        calculation_method = self.pricing_metadata.get('calculation_method', 'base_plus_surcharges')
        
        # Route to appropriate calculation method based on product type
        if pricing_type == 'transfer':
            return self._calculate_transfer_price(**kwargs)
        elif pricing_type == 'tour':
            return self._calculate_tour_price(**kwargs)
        elif pricing_type == 'event':
            return self._calculate_event_price(**kwargs)
        else:
            # Default to transfer pricing
            return self._calculate_transfer_price(**kwargs)
    
    def _calculate_transfer_price(self, hour=None, is_round_trip=False, selected_options=None, **kwargs):
        """Calculate transfer-specific pricing."""
        base_price = Decimal(str(self.base_price))
        
        # Time-based surcharges
        time_surcharge = Decimal('0.00')
        if hour is not None:
            time_surcharge = self.route.calculate_time_surcharge(base_price, hour)
        
        # Round trip discount
        round_trip_discount = Decimal('0.00')
        if is_round_trip and self.route.round_trip_discount_enabled:
            total_before_discount = base_price + time_surcharge
            round_trip_discount = total_before_discount * (Decimal(str(self.route.round_trip_discount_percentage)) / Decimal('100'))
        
        # Options calculation
        options_total = Decimal('0.00')
        options_breakdown = []
        if selected_options:
            for option_data in selected_options:
                option_id = option_data.get('option_id')
                quantity = int(option_data.get('quantity', 1))
                
                try:
                    from .models import TransferOption
                    option = TransferOption.objects.get(id=option_id, is_active=True)
                    option_price = option.calculate_price(base_price)
                    option_total = Decimal(str(option_price)) * quantity
                    options_total += option_total
                    options_breakdown.append({
                        'option_id': str(option.id),
                        'name': str(option.name),
                        'price': float(option_price),
                        'quantity': quantity,
                        'total': float(option_total)
                    })
                except TransferOption.DoesNotExist:
                    continue
        
        # Final calculation
        subtotal = base_price + time_surcharge
        final_price = subtotal + options_total - round_trip_discount
        
        return {
            'base_price': float(base_price),
            'time_surcharge': float(time_surcharge),
            'round_trip_discount': float(round_trip_discount),
            'options_total': float(options_total),
            'subtotal': float(subtotal),
            'final_price': float(final_price),
            'options_breakdown': options_breakdown,
            'pricing_type': 'transfer',
            'calculation_method': 'base_plus_surcharges'
        }
    
    def _calculate_tour_price(self, participants=None, selected_options=None, **kwargs):
        """Calculate tour-specific pricing."""
        # This would implement tour pricing logic
        # For now, return transfer pricing as fallback
        return self._calculate_transfer_price(**kwargs)
    
    def _calculate_event_price(self, ticket_type=None, selected_options=None, **kwargs):
        """Calculate event-specific pricing."""
        # This would implement event pricing logic
        # For now, return transfer pricing as fallback
        return self._calculate_transfer_price(**kwargs)
    
    def get_total_price(self, hour=None, is_round_trip=False, round_trip_discount=0):
        """Legacy method for backward compatibility."""
        result = self.calculate_price(hour=hour, is_round_trip=is_round_trip)
        return result['final_price']


class TransferOption(BaseTranslatableModel):
    """
    Transfer options and add-ons.
    """
    
    # Translatable fields
    translations = TranslatedFields(
        name=models.CharField(max_length=255, verbose_name=_('Name')),
        description=models.TextField(verbose_name=_('Description')),
    )
    
    # Option type
    OPTION_TYPE_CHOICES = [
        ('wheelchair', _('Wheelchair')),
        ('extra_stop', _('Extra Stop')),
        ('extra_luggage', _('Extra Luggage')),
        ('english_driver', _('English Speaking Driver')),
        ('insurance', _('Travel Insurance')),
        ('meet_greet', _('Meet & Greet')),
        ('flight_monitoring', _('Flight Monitoring')),
    ]
    option_type = models.CharField(
        max_length=20, 
        choices=OPTION_TYPE_CHOICES,
        default='wheelchair',
        verbose_name=_('Option type')
    )
    
    # Pricing
    price_type = models.CharField(
        max_length=20,
        choices=[
            ('fixed', _('Fixed Amount')),
            ('percentage', _('Percentage of Base Price')),
        ],
        default='fixed',
        verbose_name=_('Price type')
    )
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        default=0.00,
        verbose_name=_('Fixed price')
    )
    price_percentage = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0.00,
        verbose_name=_('Price percentage')
    )
    
    # Restrictions
    max_quantity = models.PositiveIntegerField(
        null=True, 
        blank=True,
        verbose_name=_('Max quantity')
    )
    
    # Status
    is_active = models.BooleanField(default=True, verbose_name=_('Is active'))
    
    class Meta:
        verbose_name = _('Transfer Option')
        verbose_name_plural = _('Transfer Options')
        ordering = ['option_type']
        indexes = [
            models.Index(fields=['option_type']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return self.name
    
    def calculate_price(self, base_price):
        """Calculate option price."""
        if self.price_type == 'fixed':
            return self.price
        elif self.price_type == 'percentage':
            return base_price * (self.price_percentage / Decimal('100'))
        return Decimal('0.00')
    
    def clean(self):
        """Custom validation."""
        super().clean()
        
        if self.price < 0:
            raise ValidationError(_('Price cannot be negative.'))
        
        if self.price_percentage < 0 or self.price_percentage > 100:
            raise ValidationError(_('Price percentage must be between 0 and 100.'))


class TransferBooking(BaseBookingModel):
    """
    Transfer bookings with passenger and luggage details.
    """
    
    route = models.ForeignKey(
        TransferRoute, 
        on_delete=models.CASCADE, 
        related_name='bookings',
        verbose_name=_('Route')
    )
    pricing = models.ForeignKey(
        TransferRoutePricing, 
        on_delete=models.CASCADE, 
        related_name='bookings',
        verbose_name=_('Pricing')
    )
    user = models.ForeignKey(
        'users.User', 
        on_delete=models.CASCADE, 
        related_name='transfer_bookings',
        verbose_name=_('User')
    )
    
    # Booking details
    booking_reference = models.CharField(
        max_length=20, 
        unique=True,
        verbose_name=_('Booking reference')
    )
    
    # Trip details
    trip_type = models.CharField(
        max_length=20,
        choices=[
            ('one_way', _('One Way')),
            ('round_trip', _('Round Trip')),
        ],
        default='one_way',
        verbose_name=_('Trip type')
    )
    
    # Outbound details
    outbound_date = models.DateField(verbose_name=_('Outbound date'))
    outbound_time = models.TimeField(verbose_name=_('Outbound time'))
    outbound_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, verbose_name=_('Outbound price'))
    
    # Return details (for round trip)
    return_date = models.DateField(
        null=True, 
        blank=True,
        verbose_name=_('Return date')
    )
    return_time = models.TimeField(
        null=True, 
        blank=True,
        verbose_name=_('Return time')
    )
    return_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, null=True, blank=True, verbose_name=_('Return price'))
    
    # Passenger details
    passenger_count = models.PositiveIntegerField(verbose_name=_('Passenger count'))
    luggage_count = models.PositiveIntegerField(default=0, verbose_name=_('Luggage count'))
    
    # Pickup details
    pickup_address = models.TextField(verbose_name=_('Pickup address'))
    pickup_instructions = models.TextField(blank=True, verbose_name=_('Pickup instructions'))
    
    # Drop-off details
    dropoff_address = models.TextField(verbose_name=_('Drop-off address'))
    dropoff_instructions = models.TextField(blank=True, verbose_name=_('Drop-off instructions'))
    
    # Contact information
    contact_name = models.CharField(max_length=255, verbose_name=_('Contact name'))
    contact_phone = models.CharField(max_length=20, verbose_name=_('Contact phone'))
    
    # Pricing breakdown
    round_trip_discount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, null=True, blank=True, verbose_name=_('Round trip discount'))
    options_total = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        default=0.00,
        verbose_name=_('Options total')
    )
    final_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        default=0.00,
        verbose_name=_('Final price')
    )
    
    # Options
    selected_options = models.JSONField(
        default=list,
        verbose_name=_('Selected options')
    )
    
    # Special requirements
    special_requirements = models.TextField(blank=True, verbose_name=_('Special requirements'))
    
    class Meta:
        verbose_name = _('Transfer Booking')
        verbose_name_plural = _('Transfer Bookings')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['booking_reference']),
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['route', 'outbound_date']),
        ]
    
    def __str__(self):
        return f"Booking {self.booking_reference} - {self.route}"
    
    def save(self, *args, **kwargs):
        """Auto-generate booking reference if not provided."""
        if not self.booking_reference:
            self.booking_reference = f"TRF-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)
    
    @property
    def total_base_price(self):
        """Get total base price for the booking."""
        total = self.outbound_price
        if self.trip_type == 'round_trip' and self.return_price:
            total += self.return_price
        return total
    
    def validate_capacity(self):
        """Validate passenger and luggage capacity."""
        if self.passenger_count > self.pricing.max_passengers:
            raise ValidationError(
                f'Passenger count ({self.passenger_count}) exceeds vehicle capacity ({self.pricing.max_passengers})'
            )
        
        if self.luggage_count > self.pricing.max_luggage:
            raise ValidationError(
                f'Luggage count ({self.luggage_count}) exceeds vehicle capacity ({self.pricing.max_luggage})'
            )
    
    def clean(self):
        """Custom validation."""
        super().clean()
        
        # Validate capacity
        self.validate_capacity()
        
        # Validate round trip dates
        if self.trip_type == 'round_trip':
            if not self.return_date or not self.return_time:
                raise ValidationError(_('Return date and time are required for round trips.'))
            
            if self.return_date < self.outbound_date:
                raise ValidationError(_('Return date cannot be before outbound date.'))
        
        # Validate contact information
        if not self.contact_name or not self.contact_phone:
            raise ValidationError(_('Contact name and phone are required.')) 