"""
Order models for Peykan Tourism Platform.
"""

from decimal import Decimal
from django.db import models
from django.utils.translation import gettext_lazy as _
from core.models import BaseModel


class Order(BaseModel):
    """
    Order model for completed bookings.
    """
    
    # Order identification
    order_number = models.CharField(
        max_length=20, 
        unique=True,
        verbose_name=_('Order number')
    )
    user = models.ForeignKey(
        'users.User', 
        on_delete=models.CASCADE, 
        related_name='orders',
        verbose_name=_('User')
    )
    agent = models.ForeignKey(
        'users.User', 
        on_delete=models.SET_NULL, 
        related_name='agent_orders',
        null=True, 
        blank=True,
        verbose_name=_('Agent')
    )
    
    # Order details
    STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('confirmed', _('Confirmed')),
        ('paid', _('Paid')),
        ('processing', _('Processing')),
        ('completed', _('Completed')),
        ('cancelled', _('Cancelled')),
        ('refunded', _('Refunded')),
    ]
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending',
        verbose_name=_('Status')
    )
    
    # Payment information
    PAYMENT_STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('paid', _('Paid')),
        ('failed', _('Failed')),
        ('refunded', _('Refunded')),
    ]
    payment_status = models.CharField(
        max_length=20, 
        choices=PAYMENT_STATUS_CHOICES, 
        default='pending',
        verbose_name=_('Payment status')
    )
    payment_method = models.CharField(
        max_length=50, 
        blank=True,
        verbose_name=_('Payment method')
    )
    
    # Pricing
    subtotal = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        verbose_name=_('Subtotal')
    )
    tax_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0.00,
        verbose_name=_('Tax amount')
    )
    discount_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0.00,
        verbose_name=_('Discount amount')
    )
    total_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        verbose_name=_('Total amount')
    )
    currency = models.CharField(max_length=3, default='USD', verbose_name=_('Currency'))
    
    # Agent commission
    agent_commission_rate = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0.00,
        verbose_name=_('Agent commission rate (%)')
    )
    agent_commission_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0.00,
        verbose_name=_('Agent commission amount')
    )
    commission_paid = models.BooleanField(default=False, verbose_name=_('Commission paid'))
    
    # Customer information
    customer_name = models.CharField(max_length=255, verbose_name=_('Customer name'))
    customer_email = models.EmailField(verbose_name=_('Customer email'))
    customer_phone = models.CharField(max_length=20, verbose_name=_('Customer phone'))
    
    # Billing information
    billing_address = models.TextField(blank=True, verbose_name=_('Billing address'))
    billing_city = models.CharField(max_length=100, blank=True, verbose_name=_('Billing city'))
    billing_country = models.CharField(max_length=100, blank=True, verbose_name=_('Billing country'))
    
    # Notes
    customer_notes = models.TextField(blank=True, verbose_name=_('Customer notes'))
    internal_notes = models.TextField(blank=True, verbose_name=_('Internal notes'))
    
    class Meta:
        verbose_name = _('Order')
        verbose_name_plural = _('Orders')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Order {self.order_number}"
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f"ORD{str(self.id)[:8].upper()}"
        
        # Calculate total
        self.total_amount = self.subtotal + self.tax_amount - self.discount_amount
        
        # Calculate agent commission
        if self.agent and self.agent_commission_rate > 0:
            self.agent_commission_amount = self.total_amount * (self.agent_commission_rate / 100)
        
        super().save(*args, **kwargs)
    
    @property
    def total_items(self):
        """Get total number of items in order."""
        return self.items.count()
    
    @property
    def is_paid(self):
        """Check if order is paid."""
        return self.payment_status == 'paid'
    
    @property
    def is_completed(self):
        """Check if order is completed."""
        return self.status == 'completed'
    
    @property
    def is_cancelled(self):
        """Check if order is cancelled."""
        return self.status == 'cancelled'
    
    def can_cancel(self):
        """Check if order can be cancelled."""
        return self.status in ['pending', 'confirmed'] and not self.is_paid
    
    def cancel_order(self, reason=None):
        """Cancel the order."""
        if self.can_cancel():
            self.status = 'cancelled'
            if reason:
                self.internal_notes += f"\nCancelled: {reason}"
            self.save()
            
            # Release inventory
            for item in self.items.all():
                item.release_inventory()
            
            return True
        return False


class OrderItem(BaseModel):
    """
    Individual items in an order.
    """
    
    order = models.ForeignKey(
        Order, 
        on_delete=models.CASCADE, 
        related_name='items',
        verbose_name=_('Order')
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
    product_title = models.CharField(max_length=255, verbose_name=_('Product title'))
    product_slug = models.CharField(max_length=255, verbose_name=_('Product slug'))
    
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
    
    # Status
    STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('confirmed', _('Confirmed')),
        ('completed', _('Completed')),
        ('cancelled', _('Cancelled')),
    ]
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending',
        verbose_name=_('Status')
    )
    
    class Meta:
        verbose_name = _('Order Item')
        verbose_name_plural = _('Order Items')
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.order.order_number} - {self.product_title}"
    
    def save(self, *args, **kwargs):
        # Calculate total price
        self.total_price = (self.unit_price * self.quantity) + self.options_total
        super().save(*args, **kwargs)
    
    @property
    def grand_total(self):
        """Calculate grand total including options."""
        return self.total_price
    
    def release_inventory(self):
        """Release inventory when order is cancelled."""
        try:
            if self.product_type == 'tour':
                from tours.models import TourSchedule
                schedule = TourSchedule.objects.get(id=self.booking_data.get('schedule_id'))
                schedule.release_capacity(self.quantity)
            
            elif self.product_type == 'event':
                from events.models import EventPerformance
                performance = EventPerformance.objects.get(id=self.booking_data.get('performance_id'))
                performance.release_capacity(self.quantity)
            
            # Remove all usages of TransferSchedule
        
        except Exception as e:
            # Log error but don't fail the operation
            print(f"Error releasing inventory: {e}")


class OrderHistory(BaseModel):
    """
    Order status history for tracking changes.
    """
    
    order = models.ForeignKey(
        Order, 
        on_delete=models.CASCADE, 
        related_name='history',
        verbose_name=_('Order')
    )
    user = models.ForeignKey(
        'users.User', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name=_('User')
    )
    
    # Change details
    field_name = models.CharField(max_length=100, verbose_name=_('Field name'))
    old_value = models.TextField(blank=True, verbose_name=_('Old value'))
    new_value = models.TextField(blank=True, verbose_name=_('New value'))
    change_reason = models.TextField(blank=True, verbose_name=_('Change reason'))
    
    class Meta:
        verbose_name = _('Order History')
        verbose_name_plural = _('Order History')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.order.order_number} - {self.field_name}"


class OrderService:
    """
    Service class for order operations.
    """
    
    @staticmethod
    def create_order_from_cart(cart, user, payment_data=None, agent=None):
        """Create order from cart items with transaction safety."""
        from decimal import Decimal
        from django.db import transaction
        from tours.models import TourSchedule
        from events.models import EventSchedule
        # Remove: from transfers.models import TransferSchedule
        
        with transaction.atomic():
            # Create order
            order = Order.objects.create(
                user=user,
                agent=agent,
                currency=cart.currency,
                customer_name=user.get_full_name() or user.username,
                customer_email=user.email,
                customer_phone=user.phone_number or '',
                subtotal=cart.subtotal,
                total_amount=cart.total,
            )
            
            # Create order items and update capacities
            for cart_item in cart.items.all():
                # Get product details
                product_details = OrderService._get_product_details(cart_item)
                
                # Update capacity with select_for_update to prevent race conditions
                OrderService._update_capacity(cart_item)
                
                order_item = OrderItem.objects.create(
                    order=order,
                    product_type=cart_item.product_type,
                    product_id=cart_item.product_id,
                    product_title=product_details.get('title', ''),
                    product_slug=product_details.get('slug', ''),
                    booking_date=cart_item.booking_date,
                    booking_time=cart_item.booking_time,
                    variant_id=cart_item.variant_id,
                    variant_name=cart_item.variant_name,
                    quantity=cart_item.quantity,
                    unit_price=cart_item.unit_price,
                    selected_options=cart_item.selected_options,
                    options_total=cart_item.options_total,
                    booking_data=cart_item.booking_data,
                )
            
            # Set agent commission if applicable
            if agent and agent.is_agent:
                order.agent_commission_rate = agent.commission_rate
                order.save()
            
            # Clear cart
            from cart.models import CartService
            CartService.clear_cart(cart)
            
            return order
    
    @staticmethod
    def _update_capacity(cart_item):
        """Update capacity with proper locking to prevent overbooking."""
        try:
            if cart_item.product_type == 'tour':
                schedule_id = cart_item.booking_data.get('schedule_id')
                if schedule_id:
                    schedule = TourSchedule.objects.select_for_update().get(id=schedule_id)
                    variant_id = str(cart_item.variant_id)
                    
                    capacities = schedule.variant_capacities_raw
                    if variant_id in capacities:
                        current_booked = capacities[variant_id].get('booked', 0)
                        new_booked = current_booked + cart_item.quantity
                        
                        # Check if capacity is available
                        total_capacity = capacities[variant_id].get('total', 0)
                        if new_booked > total_capacity:
                            raise ValueError(f"Insufficient capacity for variant {variant_id}")
                        
                        capacities[variant_id]['booked'] = new_booked
                        capacities[variant_id]['available'] = total_capacity - new_booked
                        schedule.variant_capacities_raw = capacities
                        schedule.save()
            
            elif cart_item.product_type == 'event':
                schedule_id = cart_item.booking_data.get('schedule_id')
                if schedule_id:
                    schedule = EventSchedule.objects.select_for_update().get(id=schedule_id)
                    if schedule.current_capacity < cart_item.quantity:
                        raise ValueError("Insufficient capacity for event")
                    
                    schedule.current_capacity -= cart_item.quantity
                    schedule.save()
            
            # Remove all usages of TransferSchedule
        
        except Exception as e:
            raise ValueError(f"Capacity update failed: {str(e)}")
    
    @staticmethod
    def _get_product_details(cart_item):
        """Get product details for order item."""
        try:
            if cart_item.product_type == 'tour':
                from tours.models import Tour
                tour = Tour.objects.get(id=cart_item.product_id)
                return {
                    'title': tour.title,
                    'slug': tour.slug,
                }
            
            elif cart_item.product_type == 'event':
                from events.models import Event
                event = Event.objects.get(id=cart_item.product_id)
                return {
                    'title': event.title,
                    'slug': event.slug,
                }
            
            elif cart_item.product_type == 'transfer':
                from transfers.models import TransferRoute
                route = TransferRoute.objects.get(id=cart_item.product_id)
                return {
                    'title': route.name or f"{route.origin} → {route.destination}",
                    'slug': route.slug,
                }
            
        except Exception as e:
            print(f"Error getting product details: {e}")
            return {'title': '', 'slug': ''}
    
    @staticmethod
    def update_order_status(order, new_status, user=None, reason=None):
        """Update order status and log change."""
        old_status = order.status
        order.status = new_status
        order.save()
        
        # Log the change
        OrderHistory.objects.create(
            order=order,
            user=user,
            field_name='status',
            old_value=old_status,
            new_value=new_status,
            change_reason=reason,
        )
    
    @staticmethod
    def update_payment_status(order, new_status, payment_method=None):
        """Update payment status."""
        old_status = order.payment_status
        order.payment_status = new_status
        if payment_method:
            order.payment_method = payment_method
        order.save()
        
        # Log the change
        OrderHistory.objects.create(
            order=order,
            field_name='payment_status',
            old_value=old_status,
            new_value=new_status,
        )
    
    @staticmethod
    def get_order_summary(order):
        """Get order summary with details."""
        items = order.items.all()
        
        summary = {
            'order_number': order.order_number,
            'status': order.status,
            'payment_status': order.payment_status,
            'total_items': len(items),
            'subtotal': float(order.subtotal),
            'tax_amount': float(order.tax_amount),
            'discount_amount': float(order.discount_amount),
            'total_amount': float(order.total_amount),
            'currency': order.currency,
            'customer_name': order.customer_name,
            'customer_email': order.customer_email,
            'created_at': order.created_at.isoformat(),
            'items': []
        }
        
        for item in items:
            summary['items'].append({
                'id': str(item.id),
                'product_type': item.product_type,
                'product_title': item.product_title,
                'quantity': item.quantity,
                'unit_price': float(item.unit_price),
                'total_price': float(item.total_price),
                'variant_name': item.variant_name,
                'booking_date': item.booking_date.isoformat(),
                'booking_time': item.booking_time.isoformat(),
                'status': item.status,
            })
        
        return summary 