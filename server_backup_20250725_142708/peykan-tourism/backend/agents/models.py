"""
Agent models for Peykan Tourism Platform.
"""

from decimal import Decimal
from django.db import models
from django.utils.translation import gettext_lazy as _
from core.models import BaseModel


class AgentProfile(BaseModel):
    """
    Extended profile for agents.
    """
    
    user = models.OneToOneField(
        'users.User', 
        on_delete=models.CASCADE, 
        related_name='agent_profile',
        verbose_name=_('User')
    )
    
    # Agent details
    company_name = models.CharField(
        max_length=255, 
        blank=True,
        verbose_name=_('Company name')
    )
    license_number = models.CharField(
        max_length=100, 
        blank=True,
        verbose_name=_('License number')
    )
    
    # Contact information
    business_address = models.TextField(blank=True, verbose_name=_('Business address'))
    business_phone = models.CharField(max_length=20, blank=True, verbose_name=_('Business phone'))
    business_email = models.EmailField(blank=True, verbose_name=_('Business email'))
    website = models.URLField(blank=True, verbose_name=_('Website'))
    
    # Commission settings
    commission_rate = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0.00,
        verbose_name=_('Commission rate (%)')
    )
    min_commission = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0.00,
        verbose_name=_('Minimum commission')
    )
    max_commission = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        verbose_name=_('Maximum commission')
    )
    
    # Status
    is_active = models.BooleanField(default=True, verbose_name=_('Is active'))
    is_verified = models.BooleanField(default=False, verbose_name=_('Is verified'))
    
    # Performance metrics
    total_orders = models.PositiveIntegerField(default=0, verbose_name=_('Total orders'))
    total_commission = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0.00,
        verbose_name=_('Total commission earned')
    )
    
    class Meta:
        verbose_name = _('Agent Profile')
        verbose_name_plural = _('Agent Profiles')
    
    def __str__(self):
        return f"{self.user.username} - {self.company_name or 'Agent'}"


class AgentCustomer(BaseModel):
    """
    Customers created by agents.
    """
    
    agent = models.ForeignKey(
        'users.User', 
        on_delete=models.CASCADE, 
        related_name='agent_customers',
        verbose_name=_('Agent')
    )
    customer = models.ForeignKey(
        'users.User', 
        on_delete=models.CASCADE, 
        related_name='created_by_agent',
        verbose_name=_('Customer')
    )
    
    # Customer details
    customer_name = models.CharField(max_length=255, verbose_name=_('Customer name'))
    customer_email = models.EmailField(verbose_name=_('Customer email'))
    customer_phone = models.CharField(max_length=20, verbose_name=_('Customer phone'))
    
    # Relationship
    relationship_notes = models.TextField(blank=True, verbose_name=_('Relationship notes'))
    is_active = models.BooleanField(default=True, verbose_name=_('Is active'))
    
    class Meta:
        verbose_name = _('Agent Customer')
        verbose_name_plural = _('Agent Customers')
        unique_together = ['agent', 'customer']
    
    def __str__(self):
        return f"{self.agent.username} - {self.customer_name}"


class AgentCommission(BaseModel):
    """
    Commission tracking for agents.
    """
    
    agent = models.ForeignKey(
        'users.User', 
        on_delete=models.CASCADE, 
        related_name='commissions',
        verbose_name=_('Agent')
    )
    order = models.ForeignKey(
        'orders.Order', 
        on_delete=models.CASCADE, 
        related_name='agent_commissions',
        verbose_name=_('Order')
    )
    
    # Commission details
    commission_rate = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        verbose_name=_('Commission rate (%)')
    )
    order_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        verbose_name=_('Order amount')
    )
    commission_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        verbose_name=_('Commission amount')
    )
    currency = models.CharField(max_length=3, default='USD', verbose_name=_('Currency'))
    
    # Status
    STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('approved', _('Approved')),
        ('paid', _('Paid')),
        ('cancelled', _('Cancelled')),
    ]
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending',
        verbose_name=_('Status')
    )
    
    # Payment details
    payment_date = models.DateTimeField(
        null=True, 
        blank=True,
        verbose_name=_('Payment date')
    )
    payment_method = models.CharField(
        max_length=50, 
        blank=True,
        verbose_name=_('Payment method')
    )
    payment_reference = models.CharField(
        max_length=100, 
        blank=True,
        verbose_name=_('Payment reference')
    )
    
    # Notes
    notes = models.TextField(blank=True, verbose_name=_('Notes'))
    
    class Meta:
        verbose_name = _('Agent Commission')
        verbose_name_plural = _('Agent Commissions')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.agent.username} - {self.order.order_number} - {self.commission_amount}"


class AgentService:
    """
    Service class for agent operations.
    """
    
    @staticmethod
    def create_customer(agent, customer_data):
        """Create a customer for an agent."""
        from users.models import User
        
        # Create user account
        user = User.objects.create_user(
            username=customer_data['email'],
            email=customer_data['email'],
            password=customer_data.get('password', User.objects.make_random_password()),
            first_name=customer_data.get('first_name', ''),
            last_name=customer_data.get('last_name', ''),
            phone_number=customer_data.get('phone', ''),
            role='customer',
        )
        
        # Create agent customer relationship
        agent_customer = AgentCustomer.objects.create(
            agent=agent,
            customer=user,
            customer_name=f"{user.first_name} {user.last_name}".strip() or user.username,
            customer_email=user.email,
            customer_phone=user.phone_number or '',
        )
        
        return user, agent_customer
    
    @staticmethod
    def create_order_for_customer(agent, customer, order_data):
        """Create an order for a customer."""
        from orders.models import OrderService
        from cart.models import CartService
        
        # Create cart for the customer
        cart = CartService.get_or_create_cart(
            session_id=f"agent_{agent.id}_{customer.id}",
            user=customer
        )
        
        # Add items to cart
        for item_data in order_data['items']:
            CartService.add_to_cart(cart, item_data)
        
        # Create order
        order = OrderService.create_order_from_cart(
            cart=cart,
            user=customer,
            agent=agent
        )
        
        return order
    
    @staticmethod
    def calculate_commission(order, agent):
        """Calculate commission for an order."""
        if not agent.is_agent:
            return Decimal('0.00')
        
        # Get agent profile
        try:
            profile = agent.agent_profile
            commission_rate = profile.commission_rate
        except AgentProfile.DoesNotExist:
            commission_rate = Decimal('0.00')
        
        if commission_rate <= 0:
            return Decimal('0.00')
        
        # Calculate commission
        commission_amount = order.total_amount * (commission_rate / 100)
        
        # Apply min/max limits
        if profile.min_commission > 0 and commission_amount < profile.min_commission:
            commission_amount = profile.min_commission
        
        if profile.max_commission and commission_amount > profile.max_commission:
            commission_amount = profile.max_commission
        
        return commission_amount
    
    @staticmethod
    def create_commission_record(order, agent):
        """Create commission record for an order."""
        commission_amount = AgentService.calculate_commission(order, agent)
        
        if commission_amount > 0:
            commission = AgentCommission.objects.create(
                agent=agent,
                order=order,
                commission_rate=agent.agent_profile.commission_rate,
                order_amount=order.total_amount,
                commission_amount=commission_amount,
                currency=order.currency,
                status='pending',
            )
            
            # Update agent profile
            profile = agent.agent_profile
            profile.total_orders += 1
            profile.total_commission += commission_amount
            profile.save()
            
            return commission
        
        return None
    
    @staticmethod
    def approve_commission(commission, approved_by=None, notes=None):
        """Approve a commission."""
        commission.status = 'approved'
        if notes:
            commission.notes += f"\nApproved: {notes}"
        commission.save()
        
        return commission
    
    @staticmethod
    def pay_commission(commission, payment_data):
        """Mark commission as paid."""
        from django.utils import timezone
        
        commission.status = 'paid'
        commission.payment_date = timezone.now()
        commission.payment_method = payment_data.get('payment_method', '')
        commission.payment_reference = payment_data.get('payment_reference', '')
        commission.save()
        
        return commission
    
    @staticmethod
    def get_agent_summary(agent):
        """Get agent summary with statistics."""
        try:
            profile = agent.agent_profile
        except AgentProfile.DoesNotExist:
            return None
        
        customers = agent.agent_customers.filter(is_active=True)
        commissions = agent.commissions.all()
        orders = agent.agent_orders.all()
        
        summary = {
            'agent_id': str(agent.id),
            'agent_name': agent.get_full_name() or agent.username,
            'company_name': profile.company_name,
            'commission_rate': float(profile.commission_rate),
            'total_customers': customers.count(),
            'total_orders': profile.total_orders,
            'total_commission': float(profile.total_commission),
            'currency': 'USD',
            'is_active': profile.is_active,
            'is_verified': profile.is_verified,
            'recent_orders': [],
            'recent_commissions': [],
        }
        
        # Recent orders
        for order in orders.order_by('-created_at')[:5]:
            summary['recent_orders'].append({
                'order_number': order.order_number,
                'customer_name': order.customer_name,
                'total_amount': float(order.total_amount),
                'status': order.status,
                'created_at': order.created_at.isoformat(),
            })
        
        # Recent commissions
        for commission in commissions.order_by('-created_at')[:5]:
            summary['recent_commissions'].append({
                'id': str(commission.id),
                'order_number': commission.order.order_number,
                'commission_amount': float(commission.commission_amount),
                'status': commission.status,
                'created_at': commission.created_at.isoformat(),
            })
        
        return summary
    
    @staticmethod
    def get_customer_orders(agent, customer):
        """Get orders for a specific customer."""
        orders = agent.agent_orders.filter(user=customer).order_by('-created_at')
        
        order_list = []
        for order in orders:
            order_list.append({
                'order_number': order.order_number,
                'total_amount': float(order.total_amount),
                'status': order.status,
                'payment_status': order.payment_status,
                'created_at': order.created_at.isoformat(),
                'items': []
            })
            
            for item in order.items.all():
                order_list[-1]['items'].append({
                    'product_type': item.product_type,
                    'product_title': item.product_title,
                    'quantity': item.quantity,
                    'total_price': float(item.total_price),
                })
        
        return order_list


class Agent(BaseModel):
    """
    Agent model representing a travel agent entity.
    """
    user = models.OneToOneField(
        'users.User',
        on_delete=models.CASCADE,
        related_name='agent',
        verbose_name=_('User')
    )
    company_name = models.CharField(max_length=255, verbose_name=_('Company name'))
    license_number = models.CharField(max_length=100, blank=True, verbose_name=_('License number'))
    email = models.EmailField(blank=True, verbose_name=_('Email'))
    phone = models.CharField(max_length=20, blank=True, verbose_name=_('Phone'))
    address = models.TextField(blank=True, verbose_name=_('Address'))
    website = models.URLField(blank=True, verbose_name=_('Website'))
    is_active = models.BooleanField(default=True, verbose_name=_('Is active'))
    is_verified = models.BooleanField(default=False, verbose_name=_('Is verified'))

    class Meta:
        verbose_name = _('Agent')
        verbose_name_plural = _('Agents')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.company_name} ({self.user.username})" 