"""
Cart models for Peykan Tourism Platform.
"""

from decimal import Decimal
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.cache import cache
from core.models import BaseModel
import uuid


class Cart(BaseModel):
    """
    Shopping cart for users.
    """
    
    # Cart identification
    session_id = models.CharField(
        max_length=40, 
        unique=True,
        verbose_name=_('Session ID')
    )
    user = models.ForeignKey(
        'users.User', 
        on_delete=models.CASCADE, 
        related_name='carts',
        null=True, 
        blank=True,
        verbose_name=_('User')
    )
    
    # Cart details
    currency = models.CharField(
        max_length=3, 
        default='USD',
        verbose_name=_('Currency')
    )
    
    # Status
    is_active = models.BooleanField(default=True, verbose_name=_('Is active'))
    expires_at = models.DateTimeField(verbose_name=_('Expires at'))
    
    class Meta:
        verbose_name = _('Cart')
        verbose_name_plural = _('Carts')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Cart {self.session_id}"
    
    @property
    def total_items(self):
        """Get total number of items in cart."""
        return self.items.count()
    
    @property
    def subtotal(self):
        """Calculate cart subtotal."""
        return sum(item.total_price for item in self.items.all())
    
    @property
    def total(self):
        """Calculate cart total with any fees."""
        return self.subtotal
    
    def is_expired(self):
        """Check if cart has expired."""
        from django.utils import timezone
        return timezone.now() > self.expires_at
    
    def clear_expired_items(self):
        """Remove expired items from cart."""
        from django.utils import timezone
        now = timezone.now()
        
        for item in self.items.all():
            if item.expires_at and now > item.expires_at:
                item.delete()


class CartItem(BaseModel):
    """
    Individual items in the shopping cart.
    """
    
    cart = models.ForeignKey(
        Cart, 
        on_delete=models.CASCADE, 
        related_name='items',
        verbose_name=_('Cart')
    )
    
    # Product identification
    PRODUCT_TYPE_CHOICES = [
        ('tour', _('Tour')),
        ('event', _('Event')),
        ('transfer', _('Transfer')),
    ]
    product_type = models.CharField(
        max_length=20, 
        choices=PRODUCT_TYPE_CHOICES,
        verbose_name=_('Product type')
    )
    product_id = models.UUIDField(verbose_name=_('Product ID'))
    
    # Booking details
    booking_date = models.DateField(verbose_name=_('Booking date'))
    booking_time = models.TimeField(verbose_name=_('Booking time'))
    
    # Variant/Options
    variant_id = models.UUIDField(
        null=True, 
        blank=True,
        verbose_name=_('Variant ID')
    )
    variant_name = models.CharField(
        max_length=100, 
        blank=True,
        verbose_name=_('Variant name')
    )
    
    # Quantity and pricing
    quantity = models.PositiveIntegerField(default=1, verbose_name=_('Quantity'))
    unit_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        verbose_name=_('Unit price')
    )
    total_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        verbose_name=_('Total price')
    )
    currency = models.CharField(max_length=3, default='USD', verbose_name=_('Currency'))
    
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
    
    # Booking specific data
    booking_data = models.JSONField(
        default=dict,
        verbose_name=_('Booking data')
    )
    
    # Reservation
    is_reserved = models.BooleanField(default=False, verbose_name=_('Is reserved'))
    reservation_expires_at = models.DateTimeField(
        null=True, 
        blank=True,
        verbose_name=_('Reservation expires at')
    )
    
    class Meta:
        verbose_name = _('Cart Item')
        verbose_name_plural = _('Cart Items')
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.cart} - {self.product_type} - {self.quantity}"
    
    def save(self, *args, **kwargs):
        # Check if total_price should be manually overridden (for tours with complex pricing)
        skip_price_calculation = kwargs.pop('skip_price_calculation', False)
        
        # Always recalculate options_total from selected_options
        from decimal import Decimal
        options_total = Decimal('0.00')
        if self.selected_options:
            for option in self.selected_options:
                option_price = Decimal(str(option.get('price', 0)))
                option_quantity = int(option.get('quantity', 1))
                options_total += option_price * option_quantity
        self.options_total = options_total
        
        # Always recalculate total_price to include options_total
        unit_price_decimal = Decimal(str(self.unit_price))
        quantity_decimal = Decimal(str(self.quantity))
        self.total_price = (unit_price_decimal * quantity_decimal) + options_total
        
        # For tours, calculate price based on participants if available
        if not skip_price_calculation:
            if self.product_type == 'tour' and self.booking_data.get('participants'):
                try:
                    from tours.models import Tour, TourVariant, TourPricing
                    tour = Tour.objects.get(id=self.product_id)
                    variant = TourVariant.objects.get(id=self.variant_id, tour=tour)
                    participants = self.booking_data.get('participants', {})
                    tour_total = Decimal('0.00')
                    total_participants = 0
                    for age_group, count in participants.items():
                        if count > 0:
                            total_participants += count
                            try:
                                pricing = TourPricing.objects.get(
                                    tour=tour,
                                    variant=variant,
                                    age_group=age_group
                                )
                                # Ensure infant pricing is always 0
                                if age_group == 'infant' or pricing.is_free:
                                    subtotal = Decimal('0.00')
                                else:
                                    subtotal = Decimal(str(pricing.final_price)) * count
                                tour_total += subtotal
                            except TourPricing.DoesNotExist:
                                # Fallback to variant base_price for missing age groups
                                # But ensure infant is always free
                                if age_group == 'infant':
                                    subtotal = Decimal('0.00')
                                else:
                                    subtotal = Decimal(str(variant.base_price)) * count
                                tour_total += subtotal
                    # Update quantity to match total participants
                    self.quantity = total_participants
                    self.unit_price = variant.base_price
                    self.total_price = tour_total + options_total
                except (Tour.DoesNotExist, TourVariant.DoesNotExist):
                    # Fallback to simple calculation
                    unit_price_decimal = Decimal(str(self.unit_price))
                    quantity_decimal = Decimal(str(self.quantity))
                    self.total_price = (unit_price_decimal * quantity_decimal) + options_total
        super().save(*args, **kwargs)
    
    @property
    def grand_total(self):
        """Calculate grand total including options."""
        return self.total_price
    
    def is_reservation_expired(self):
        """Check if reservation has expired."""
        if not self.is_reserved or not self.reservation_expires_at:
            return False
        
        from django.utils import timezone
        return timezone.now() > self.reservation_expires_at
    
    def create_reservation(self, duration_minutes=30):
        """Create a temporary reservation."""
        from django.utils import timezone
        from datetime import timedelta
        
        self.is_reserved = True
        self.reservation_expires_at = timezone.now() + timedelta(minutes=duration_minutes)
        self.save()
        
        # Update product availability
        self._update_product_availability(reserve=True)
    
    def release_reservation(self):
        """Release the temporary reservation."""
        if self.is_reserved:
            self.is_reserved = False
            self.reservation_expires_at = None
            self.save()
            
            # Update product availability
            self._update_product_availability(reserve=False)
    
    def _update_product_availability(self, reserve=True):
        """Update product availability when reserving/releasing."""
        try:
            if self.product_type == 'tour':
                from tours.models import TourSchedule
                schedule = TourSchedule.objects.get(id=self.booking_data.get('schedule_id'))
                if reserve:
                    schedule.book_capacity(self.quantity)
                else:
                    schedule.release_capacity(self.quantity)
            
            elif self.product_type == 'event':
                from events.models import EventPerformance
                performance = EventPerformance.objects.get(id=self.booking_data.get('performance_id'))
                if reserve:
                    performance.book_capacity(self.quantity)
                else:
                    performance.release_capacity(self.quantity)
            
            elif self.product_type == 'transfer':
                # This part of the logic needs to be refactored to use TransferRoutePricing
                # or the new models only. For now, we'll remove the TransferSchedule usage.
                pass # Placeholder for new logic
        
        except Exception as e:
            # Log error but don't fail the cart operation
            print(f"Error updating availability: {e}")


class CartService:
    """
    Service class for cart operations.
    """
    
    @staticmethod
    def get_or_create_cart(session_id, user=None):
        """Get existing cart or create new one with proper user/session logic."""
        from django.utils import timezone
        from datetime import timedelta
        
        # For authenticated users, prioritize user-based cart
        if user and user.is_authenticated:
            # First, try to get existing user cart
            user_cart = Cart.objects.filter(user=user, is_active=True).first()
            
            if user_cart:
                # User has an existing cart, return it
                return user_cart
            
            # Check if there's a session cart that should be migrated
            session_cart = Cart.objects.filter(session_id=session_id, user__isnull=True, is_active=True).first()
            
            if session_cart:
                # Migrate session cart to user cart
                session_cart.user = user
                session_cart.save()
                return session_cart
            
            # Create new user cart
            cart = Cart.objects.create(
                session_id=session_id,
                user=user,
                expires_at=timezone.now() + timedelta(hours=24),
            )
            return cart
        
        else:
            # For guest users, use session-based cart
            cart, created = Cart.objects.get_or_create(
                session_id=session_id,
                user__isnull=True,
                is_active=True,
                defaults={
                    'expires_at': timezone.now() + timedelta(hours=24),
                }
            )
            
            # If cart was found but has a user (shouldn't happen), create new one
            if not created and cart.user:
                cart = Cart.objects.create(
                    session_id=f"{session_id}_{uuid.uuid4().hex[:8]}",
                    expires_at=timezone.now() + timedelta(hours=24),
                )
            
            return cart
    
    @staticmethod
    def migrate_session_cart_to_user(session_id, user):
        """Migrate session cart to user cart."""
        try:
            session_cart = Cart.objects.get(session_id=session_id, user__isnull=True, is_active=True)
            user_cart = Cart.objects.filter(user=user, is_active=True).first()
            
            if user_cart:
                # Merge session cart items into user cart
                for item in session_cart.items.all():
                    existing_item = user_cart.items.filter(
                        product_type=item.product_type,
                        product_id=item.product_id,
                        variant_id=item.variant_id
                    ).first()
                    
                    if existing_item:
                        # Update quantity
                        existing_item.quantity += item.quantity
                        existing_item.save()
                    else:
                        # Move item to user cart
                        item.cart = user_cart
                        item.save()
                
                # Delete session cart
                session_cart.delete()
                return user_cart
            else:
                # No user cart exists, migrate session cart
                session_cart.user = user
                session_cart.save()
                return session_cart
                
        except Cart.DoesNotExist:
            # No session cart to migrate
            return None
    
    @staticmethod
    def get_session_id(request):
        """Get consistent session ID for the request."""
        # Ensure session is created
        if not request.session.session_key:
            request.session.create()
        
        # Use session key as session ID
        session_id = request.session.session_key
        
        # For authenticated users, include user ID for consistency
        if request.user.is_authenticated:
            session_id = f"user_{request.user.id}_{session_id}"
        
        return session_id
    
    @staticmethod
    def add_to_cart(cart, product_data):
        """Add item to cart with reservation."""
        # Check if item already exists
        existing_item = cart.items.filter(
            product_type=product_data['product_type'],
            product_id=product_data['product_id'],
            booking_date=product_data['booking_date'],
            booking_time=product_data['booking_time'],
            variant_id=product_data.get('variant_id')
        ).first()
        
        if existing_item:
            # Update existing item
            existing_item.quantity += product_data.get('quantity', 1)
            existing_item.selected_options = product_data.get('selected_options', [])
            existing_item.booking_data = product_data.get('booking_data', {})
            existing_item.save()
            
            # Extend reservation
            existing_item.create_reservation()
            return existing_item
        
        else:
            # Create new item
            item = CartItem.objects.create(
                cart=cart,
                product_type=product_data['product_type'],
                product_id=product_data['product_id'],
                booking_date=product_data['booking_date'],
                booking_time=product_data['booking_time'],
                variant_id=product_data.get('variant_id'),
                variant_name=product_data.get('variant_name', ''),
                quantity=product_data.get('quantity', 1),
                unit_price=product_data['unit_price'],
                selected_options=product_data.get('selected_options', []),
                options_total=product_data.get('options_total', 0),
                booking_data=product_data.get('booking_data', {}),
            )
            
            # Create reservation
            item.create_reservation()
            return item
    
    @staticmethod
    def remove_from_cart(cart, item_id):
        """Remove item from cart and release reservation."""
        try:
            item = cart.items.get(id=item_id)
            item.release_reservation()
            item.delete()
            return True
        except CartItem.DoesNotExist:
            return False
    
    @staticmethod
    def update_cart_item(cart, item_id, quantity=None, options=None):
        """Update cart item quantity or options."""
        try:
            item = cart.items.get(id=item_id)
            
            if quantity is not None:
                item.quantity = quantity
            
            if options is not None:
                item.selected_options = options
            
            item.save()
            return item
        except CartItem.DoesNotExist:
            return None
    
    @staticmethod
    def clear_cart(cart):
        """Clear all items from cart."""
        for item in cart.items.all():
            item.release_reservation()
        cart.items.all().delete()
    
    @staticmethod
    def get_cart_summary(cart):
        """Get cart summary with totals."""
        items = cart.items.all()
        
        summary = {
            'total_items': len(items),
            'subtotal': sum(item.total_price for item in items),
            'currency': cart.currency,
            'items': []
        }
        
        for item in items:
            summary['items'].append({
                'id': str(item.id),
                'product_type': item.product_type,
                'product_id': str(item.product_id),
                'quantity': item.quantity,
                'unit_price': float(item.unit_price),
                'total_price': float(item.total_price),
                'variant_name': item.variant_name,
                'booking_date': item.booking_date.isoformat(),
                'booking_time': item.booking_time.isoformat(),
            })
        
        return summary
    
    @staticmethod
    def cleanup_expired_carts():
        """Clean up expired carts and reservations."""
        from django.utils import timezone
        
        # Clear expired carts
        expired_carts = Cart.objects.filter(expires_at__lt=timezone.now())
        for cart in expired_carts:
            cart.clear_expired_items()
        
        # Clear expired reservations
        expired_items = CartItem.objects.filter(
            is_reserved=True,
            reservation_expires_at__lt=timezone.now()
        )
        for item in expired_items:
            item.release_reservation() 