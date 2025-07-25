"""
Unified Capacity Management Models for Events.
This module provides a comprehensive solution for managing event capacity
from Venue → Performance → Section → TicketType → Seat hierarchy.
"""

from decimal import Decimal
from django.db import models
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.db.models import Sum, Q
from core.models import BaseModel


class EventSection(BaseModel):
    """
    Event sections (A, B, C, VIP, etc.) with capacity management.
    """
    
    performance = models.ForeignKey(
        'EventPerformance',
        on_delete=models.CASCADE,
        related_name='sections',
        verbose_name=_('Performance')
    )
    
    name = models.CharField(max_length=50, verbose_name=_('Section name'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    
    # Capacity management
    total_capacity = models.PositiveIntegerField(verbose_name=_('Total capacity'))
    available_capacity = models.PositiveIntegerField(verbose_name=_('Available capacity'))
    reserved_capacity = models.PositiveIntegerField(default=0, verbose_name=_('Reserved capacity'))
    sold_capacity = models.PositiveIntegerField(default=0, verbose_name=_('Sold capacity'))
    
    # Pricing
    base_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        verbose_name=_('Base price')
    )
    currency = models.CharField(max_length=3, default='USD', verbose_name=_('Currency'))
    
    # Features
    is_wheelchair_accessible = models.BooleanField(default=False, verbose_name=_('Wheelchair accessible'))
    is_premium = models.BooleanField(default=False, verbose_name=_('Premium section'))
    
    class Meta:
        verbose_name = _('Event Section')
        verbose_name_plural = _('Event Sections')
        unique_together = ['performance', 'name']
        ordering = ['name']
    
    def __str__(self):
        return f"{self.performance.event.title} - {self.name}"
    
    def clean(self):
        super().clean()
        # Validate capacity consistency
        if self.available_capacity + self.reserved_capacity + self.sold_capacity != self.total_capacity:
            raise ValidationError(_('Capacity components must sum to total capacity'))
        
        if self.available_capacity < 0:
            raise ValidationError(_('Available capacity cannot be negative'))
    
    @property
    def occupancy_rate(self):
        """Calculate occupancy rate as percentage."""
        if self.total_capacity == 0:
            return 0
        return ((self.reserved_capacity + self.sold_capacity) / self.total_capacity) * 100
    
    @property
    def is_full(self):
        """Check if section is full."""
        return self.available_capacity == 0
    
    def can_reserve(self, count=1):
        """Check if section can reserve specified number of seats."""
        return self.available_capacity >= count
    
    def reserve_capacity(self, count=1):
        """Reserve capacity in this section."""
        if not self.can_reserve(count):
            raise ValidationError(f'Cannot reserve {count} seats. Only {self.available_capacity} available.')
        
        self.available_capacity -= count
        self.reserved_capacity += count
        self.save()
    
    def release_capacity(self, count=1):
        """Release reserved capacity."""
        if self.reserved_capacity < count:
            raise ValidationError(f'Cannot release {count} seats. Only {self.reserved_capacity} reserved.')
        
        self.reserved_capacity -= count
        self.available_capacity += count
        self.save()
    
    def sell_capacity(self, count=1):
        """Sell capacity (convert from reserved to sold)."""
        if self.reserved_capacity < count:
            raise ValidationError(f'Cannot sell {count} seats. Only {self.reserved_capacity} reserved.')
        
        self.reserved_capacity -= count
        self.sold_capacity += count
        self.save()


class SectionTicketType(BaseModel):
    """
    Ticket types available in each section with capacity allocation.
    """
    
    section = models.ForeignKey(
        EventSection,
        on_delete=models.CASCADE,
        related_name='ticket_types',
        verbose_name=_('Section')
    )
    ticket_type = models.ForeignKey(
        'TicketType',
        on_delete=models.CASCADE,
        related_name='section_allocations',
        verbose_name=_('Ticket type')
    )
    
    # Capacity allocation
    allocated_capacity = models.PositiveIntegerField(verbose_name=_('Allocated capacity'))
    available_capacity = models.PositiveIntegerField(verbose_name=_('Available capacity'))
    reserved_capacity = models.PositiveIntegerField(default=0, verbose_name=_('Reserved capacity'))
    sold_capacity = models.PositiveIntegerField(default=0, verbose_name=_('Sold capacity'))
    
    # Pricing
    price_modifier = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=1.00,
        verbose_name=_('Price modifier')
    )
    
    class Meta:
        verbose_name = _('Section Ticket Type')
        verbose_name_plural = _('Section Ticket Types')
        unique_together = ['section', 'ticket_type']
    
    def __str__(self):
        return f"{self.section.name} - {self.ticket_type.name}"
    
    def clean(self):
        super().clean()
        # Validate capacity allocation
        if self.allocated_capacity > self.section.total_capacity:
            raise ValidationError(_('Allocated capacity cannot exceed section capacity'))
        
        if self.available_capacity + self.reserved_capacity + self.sold_capacity != self.allocated_capacity:
            raise ValidationError(_('Capacity components must sum to allocated capacity'))
    
    @property
    def final_price(self):
        """Calculate final price for this ticket type in this section."""
        return self.section.base_price * self.price_modifier
    
    def can_reserve(self, count=1):
        """Check if this ticket type can reserve specified number of seats."""
        return self.available_capacity >= count
    
    def reserve_capacity(self, count=1):
        """Reserve capacity for this ticket type."""
        if not self.can_reserve(count):
            raise ValidationError(f'Cannot reserve {count} seats. Only {self.available_capacity} available.')
        
        self.available_capacity -= count
        self.reserved_capacity += count
        self.save()
        
        # Also update section capacity
        self.section.reserve_capacity(count)
    
    def release_capacity(self, count=1):
        """Release reserved capacity for this ticket type."""
        if self.reserved_capacity < count:
            raise ValidationError(f'Cannot release {count} seats. Only {self.reserved_capacity} reserved.')
        
        self.reserved_capacity -= count
        self.available_capacity += count
        self.save()
        
        # Also update section capacity
        self.section.release_capacity(count)
    
    def sell_capacity(self, count=1):
        """Sell capacity for this ticket type."""
        if self.reserved_capacity < count:
            raise ValidationError(f'Cannot sell {count} seats. Only {self.reserved_capacity} reserved.')
        
        self.reserved_capacity -= count
        self.sold_capacity += count
        self.save()
        
        # Also update section capacity
        self.section.sell_capacity(count)


class CapacityManager:
    """
    Service class for managing capacity across the entire hierarchy.
    """
    
    @staticmethod
    def validate_venue_capacity(venue, performances):
        """Validate that venue can accommodate all performances."""
        total_performance_capacity = sum(p.max_capacity for p in performances)
        if total_performance_capacity > venue.total_capacity:
            raise ValidationError(
                f'Total performance capacity ({total_performance_capacity}) '
                f'exceeds venue capacity ({venue.total_capacity})'
            )
    
    @staticmethod
    def validate_performance_capacity(performance, sections):
        """Validate that performance capacity matches sections."""
        total_section_capacity = sum(s.total_capacity for s in sections)
        if total_section_capacity != performance.max_capacity:
            raise ValidationError(
                f'Total section capacity ({total_section_capacity}) '
                f'does not match performance capacity ({performance.max_capacity})'
            )
    
    @staticmethod
    def validate_section_capacity(section, ticket_allocations):
        """Validate that section capacity matches ticket allocations."""
        total_ticket_capacity = sum(stt.allocated_capacity for stt in ticket_allocations)
        if total_ticket_capacity != section.total_capacity:
            raise ValidationError(
                f'Total ticket capacity ({total_ticket_capacity}) '
                f'does not match section capacity ({section.total_capacity})'
            )
    
    @staticmethod
    def create_performance_capacity(performance, capacity_config):
        """
        Create complete capacity structure for a performance.
        
        capacity_config = {
            'sections': [
                {
                    'name': 'VIP',
                    'total_capacity': 200,
                    'base_price': 150.00,
                    'ticket_types': [
                        {'ticket_type_id': 'vip_id', 'allocated_capacity': 200, 'price_modifier': 1.5}
                    ]
                },
                {
                    'name': 'Normal',
                    'total_capacity': 800,
                    'base_price': 100.00,
                    'ticket_types': [
                        {'ticket_type_id': 'normal_id', 'allocated_capacity': 800, 'price_modifier': 1.0}
                    ]
                }
            ]
        }
        """
        from django.db import transaction
        
        with transaction.atomic():
            # Validate venue capacity
            total_capacity = sum(s['total_capacity'] for s in capacity_config['sections'])
            if total_capacity > performance.event.venue.total_capacity:
                raise ValidationError('Total capacity exceeds venue capacity')
            
            # Update performance capacity
            performance.max_capacity = total_capacity
            performance.current_capacity = 0
            performance.save()
            
            # Create sections and ticket allocations
            for section_config in capacity_config['sections']:
                section = EventSection.objects.create(
                    performance=performance,
                    name=section_config['name'],
                    total_capacity=section_config['total_capacity'],
                    available_capacity=section_config['total_capacity'],
                    base_price=section_config['base_price']
                )
                
                for ticket_config in section_config['ticket_types']:
                    SectionTicketType.objects.create(
                        section=section,
                        ticket_type_id=ticket_config['ticket_type_id'],
                        allocated_capacity=ticket_config['allocated_capacity'],
                        available_capacity=ticket_config['allocated_capacity'],
                        price_modifier=ticket_config['price_modifier']
                    )
    
    @staticmethod
    def get_available_seats(performance, ticket_type_id=None, section_name=None):
        """Get available seats for a performance with optional filters."""
        query = Q(section__performance=performance, available_capacity__gt=0)
        
        if ticket_type_id:
            query &= Q(ticket_type_id=ticket_type_id)
        
        if section_name:
            query &= Q(section__name=section_name)
        
        return SectionTicketType.objects.filter(query).select_related(
            'section', 'ticket_type'
        )
    
    @staticmethod
    def reserve_seats(performance, ticket_type_id, section_name, count):
        """Reserve seats for a specific ticket type and section."""
        try:
            section_ticket = SectionTicketType.objects.get(
                section__performance=performance,
                section__name=section_name,
                ticket_type_id=ticket_type_id
            )
            
            section_ticket.reserve_capacity(count)
            return True, section_ticket
            
        except SectionTicketType.DoesNotExist:
            return False, "Section ticket type not found"
        except ValidationError as e:
            return False, str(e)
    
    @staticmethod
    def get_capacity_summary(performance):
        """Get comprehensive capacity summary for a performance."""
        sections = performance.sections.all()
        
        summary = {
            'performance': {
                'max_capacity': performance.max_capacity,
                'current_capacity': performance.current_capacity,
                'available_capacity': performance.available_capacity,
                'occupancy_rate': (performance.current_capacity / performance.max_capacity * 100) if performance.max_capacity > 0 else 0
            },
            'sections': []
        }
        
        for section in sections:
            section_summary = {
                'name': section.name,
                'total_capacity': section.total_capacity,
                'available_capacity': section.available_capacity,
                'reserved_capacity': section.reserved_capacity,
                'sold_capacity': section.sold_capacity,
                'occupancy_rate': section.occupancy_rate,
                'ticket_types': []
            }
            
            for stt in section.ticket_types.all():
                ticket_summary = {
                    'name': stt.ticket_type.name,
                    'allocated_capacity': stt.allocated_capacity,
                    'available_capacity': stt.available_capacity,
                    'reserved_capacity': stt.reserved_capacity,
                    'sold_capacity': stt.sold_capacity,
                    'final_price': stt.final_price
                }
                section_summary['ticket_types'].append(ticket_summary)
            
            summary['sections'].append(section_summary)
        
        return summary 