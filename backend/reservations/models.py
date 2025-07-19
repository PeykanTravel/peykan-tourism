"""
Reservation models with database optimizations
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from django.utils import timezone
from decimal import Decimal
import uuid

User = get_user_model()


class Reservation(models.Model):
    """Reservation aggregate root"""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
        ('expired', 'Expired'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    # Core fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reservation_number = models.CharField(max_length=20, unique=True, db_index=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reservations', db_index=True)
    agent = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='agent_reservations')
    
    # Status fields
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', db_index=True)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending', db_index=True)
    
    # Customer information
    customer_name = models.CharField(max_length=255)
    customer_email = models.EmailField(db_index=True)
    customer_phone = models.CharField(max_length=20)
    
    # Pricing information
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))])
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))])
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))])
    currency = models.CharField(max_length=3, default='USD')
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    discount_code = models.CharField(max_length=50, blank=True, null=True, db_index=True)
    
    # Additional information
    special_requirements = models.TextField(blank=True)
    expires_at = models.DateTimeField(null=True, blank=True, db_index=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reservations'
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['customer_email', 'status']),
            models.Index(fields=['reservation_number', 'status']),
            models.Index(fields=['expires_at', 'status']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Reservation {self.reservation_number}"
    
    def save(self, *args, **kwargs):
        if not self.reservation_number:
            self.reservation_number = self._generate_reservation_number()
        super().save(*args, **kwargs)
    
    def _generate_reservation_number(self):
        """Generate unique reservation number"""
        timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
        random_suffix = str(uuid.uuid4())[:8].upper()
        return f"RES{timestamp}{random_suffix}"
    
    @property
    def is_expired(self):
        """Check if reservation has expired"""
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False
    
    @property
    def can_be_confirmed(self):
        """Check if reservation can be confirmed"""
        return self.status == 'draft' and not self.is_expired
    
    def confirm(self):
        """Confirm the reservation"""
        if self.can_be_confirmed:
            self.status = 'confirmed'
            self.save()
            return True
        return False
    
    def cancel(self, reason="Cancelled by user"):
        """Cancel the reservation"""
        if self.status in ['draft', 'confirmed']:
            self.status = 'cancelled'
            self.save()
            # Log the cancellation
            ReservationHistory.objects.create(
                reservation=self,
                from_status=self.status,
                to_status='cancelled',
                reason=reason
            )
            return True
        return False


class ReservationItem(models.Model):
    """Individual items within a reservation"""
    
    PRODUCT_TYPE_CHOICES = [
        ('event', 'Event'),
        ('tour', 'Tour'),
        ('transfer', 'Transfer'),
    ]
    
    # Core fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE, related_name='items', db_index=True)
    
    # Product information
    product_type = models.CharField(max_length=20, choices=PRODUCT_TYPE_CHOICES, db_index=True)
    product_id = models.CharField(max_length=100, db_index=True)
    product_title = models.CharField(max_length=255)
    product_slug = models.CharField(max_length=255, blank=True)
    
    # Variant information (for tours)
    variant_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    variant_name = models.CharField(max_length=255, blank=True, null=True)
    
    # Booking information
    booking_date = models.DateField(db_index=True)
    booking_time = models.TimeField()
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    
    # Pricing information
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))])
    total_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))])
    currency = models.CharField(max_length=3, default='USD')
    
    # Options
    selected_options = models.JSONField(default=list, blank=True)
    options_total = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    
    # Product-specific booking data
    booking_data = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reservation_items'
        indexes = [
            models.Index(fields=['reservation', 'product_type']),
            models.Index(fields=['product_type', 'product_id']),
            models.Index(fields=['booking_date', 'product_type']),
            models.Index(fields=['variant_id', 'product_type']),
        ]
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.product_title} - {self.reservation.reservation_number}"


class ReservationHistory(models.Model):
    """History of reservation status changes"""
    
    # Core fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE, related_name='history', db_index=True)
    
    # Status change information
    from_status = models.CharField(max_length=20)
    to_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    reason = models.TextField(blank=True)
    
    # Additional information
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        db_table = 'reservation_history'
        indexes = [
            models.Index(fields=['reservation', 'created_at']),
            models.Index(fields=['from_status', 'to_status']),
            models.Index(fields=['changed_by', 'created_at']),
        ]
        ordering = ['-created_at']
        verbose_name_plural = 'Reservation histories'
    
    def __str__(self):
        return f"{self.reservation.reservation_number} - {self.from_status} to {self.to_status}"
    
    @property
    def changed_by_name(self):
        """Get the name of the user who made the change"""
        if self.changed_by:
            return f"{self.changed_by.first_name} {self.changed_by.last_name}".strip() or self.changed_by.username
        return "System" 