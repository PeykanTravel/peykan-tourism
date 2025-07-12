"""
Event Pricing Service for comprehensive price calculation.
Handles base price, options, discounts, fees, and taxes.
"""

from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, List, Optional, Any
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from .models import Event, EventPerformance, EventSection, SectionTicketType, EventOption, EventBooking


class EventPriceCalculator:
    """
    Comprehensive price calculator for events.
    """
    
    def __init__(self, event: Event, performance: EventPerformance):
        self.event = event
        self.performance = performance
        self.currency = 'USD'  # Default currency
    
    def calculate_ticket_price(
        self,
        section_name: str,
        ticket_type_id: str,
        quantity: int = 1,
        selected_options: Optional[List[Dict]] = None,
        discount_code: Optional[str] = None,
        is_group_booking: bool = False,
        apply_fees: bool = True,
        apply_taxes: bool = True
    ) -> Dict[str, Any]:
        """
        Calculate comprehensive ticket price with all components.
        
        Args:
            section_name: Name of the section (e.g., 'VIP', 'Normal')
            ticket_type_id: ID of the ticket type
            quantity: Number of tickets
            selected_options: List of selected options with quantities
            discount_code: Optional discount/promo code
            is_group_booking: Whether this is a group booking
            apply_fees: Whether to apply service fees
            apply_taxes: Whether to apply taxes
        
        Returns:
            Dict with complete price breakdown
        """
        try:
            # Get section and ticket type
            section = self.performance.sections.get(name=section_name)
            section_ticket = section.ticket_types.get(ticket_type_id=ticket_type_id)
            
            # Base calculation
            base_price = section.base_price
            price_modifier = section_ticket.price_modifier
            unit_price = base_price * price_modifier
            
            # Calculate subtotal
            subtotal = unit_price * quantity
            
            # Initialize breakdown
            breakdown = {
                'base_price': base_price,
                'price_modifier': price_modifier,
                'unit_price': unit_price,
                'quantity': quantity,
                'subtotal': subtotal,
                'options': [],
                'options_total': Decimal('0.00'),
                'discounts': [],
                'discount_total': Decimal('0.00'),
                'fees': [],
                'fees_total': Decimal('0.00'),
                'taxes': [],
                'taxes_total': Decimal('0.00'),
                'final_price': Decimal('0.00')
            }
            
            # Calculate options
            if selected_options:
                options_result = self._calculate_options(selected_options, subtotal)
                breakdown['options'] = options_result['options']
                breakdown['options_total'] = options_result['total']
            
            # Calculate discounts
            if discount_code or is_group_booking:
                discounts_result = self._calculate_discounts(
                    subtotal + breakdown['options_total'],
                    discount_code,
                    is_group_booking
                )
                breakdown['discounts'] = discounts_result['discounts']
                breakdown['discount_total'] = discounts_result['total']
            
            # Calculate fees
            if apply_fees:
                fees_result = self._calculate_fees(
                    subtotal + breakdown['options_total'] - breakdown['discount_total']
                )
                breakdown['fees'] = fees_result['fees']
                breakdown['fees_total'] = fees_result['total']
            
            # Calculate taxes
            if apply_taxes:
                taxes_result = self._calculate_taxes(
                    subtotal + breakdown['options_total'] - breakdown['discount_total'] + breakdown['fees_total']
                )
                breakdown['taxes'] = taxes_result['taxes']
                breakdown['taxes_total'] = taxes_result['total']
            
            # Calculate final price
            breakdown['final_price'] = (
                subtotal +
                breakdown['options_total'] -
                breakdown['discount_total'] +
                breakdown['fees_total'] +
                breakdown['taxes_total']
            )
            
            return breakdown
            
        except Exception as e:
            raise ValidationError(f"Price calculation error: {str(e)}")
    
    def _calculate_options(self, selected_options: List[Dict], subtotal: Decimal) -> Dict[str, Any]:
        """Calculate options pricing."""
        options_breakdown = []
        options_total = Decimal('0.00')
        
        for option_data in selected_options:
            option_id = option_data.get('option_id')
            quantity = int(option_data.get('quantity', 1))
            
            try:
                option = EventOption.objects.get(
                    id=option_id,
                    event=self.event,
                    is_active=True
                )
                
                # Calculate option price
                if hasattr(option, 'price_percentage') and option.price_percentage > 0:
                    # Percentage-based pricing
                    option_price = subtotal * (option.price_percentage / Decimal('100'))
                else:
                    # Fixed pricing
                    option_price = option.price
                
                option_total = option_price * quantity
                options_total += option_total
                
                options_breakdown.append({
                    'option_id': str(option.id),
                    'name': option.name,
                    'type': option.option_type,
                    'price': option_price,
                    'quantity': quantity,
                    'total': option_total
                })
                
            except EventOption.DoesNotExist:
                continue
        
        return {
            'options': options_breakdown,
            'total': options_total
        }
    
    def _calculate_discounts(
        self,
        amount: Decimal,
        discount_code: Optional[str] = None,
        is_group_booking: bool = False
    ) -> Dict[str, Any]:
        """Calculate discounts."""
        discounts = []
        discount_total = Decimal('0.00')
        
        # Group booking discount
        if is_group_booking and amount >= Decimal('500.00'):
            group_discount = amount * Decimal('0.10')  # 10% for groups over $500
            discount_total += group_discount
            discounts.append({
                'type': 'group_booking',
                'name': 'Group Booking Discount',
                'percentage': 10.0,
                'amount': group_discount
            })
        
        # Promo code discount (placeholder for future implementation)
        if discount_code:
            # TODO: Implement promo code validation and calculation
            # For now, apply a mock 5% discount
            promo_discount = amount * Decimal('0.05')
            discount_total += promo_discount
            discounts.append({
                'type': 'promo_code',
                'name': f'Promo Code: {discount_code}',
                'percentage': 5.0,
                'amount': promo_discount
            })
        
        return {
            'discounts': discounts,
            'total': discount_total
        }
    
    def _calculate_fees(self, amount: Decimal) -> Dict[str, Any]:
        """Calculate service fees."""
        fees = []
        fees_total = Decimal('0.00')
        
        # Service fee (3% of amount)
        service_fee = amount * Decimal('0.03')
        fees_total += service_fee
        fees.append({
            'type': 'service_fee',
            'name': 'Service Fee',
            'percentage': 3.0,
            'amount': service_fee
        })
        
        # Booking fee (fixed $2.50 per booking)
        booking_fee = Decimal('2.50')
        fees_total += booking_fee
        fees.append({
            'type': 'booking_fee',
            'name': 'Booking Fee',
            'percentage': 0.0,
            'amount': booking_fee
        })
        
        return {
            'fees': fees,
            'total': fees_total
        }
    
    def _calculate_taxes(self, amount: Decimal) -> Dict[str, Any]:
        """Calculate taxes."""
        taxes = []
        taxes_total = Decimal('0.00')
        
        # VAT (9% for events in Iran)
        vat_rate = Decimal('0.09')
        vat_amount = amount * vat_rate
        taxes_total += vat_amount
        taxes.append({
            'type': 'vat',
            'name': 'Value Added Tax (VAT)',
            'percentage': 9.0,
            'amount': vat_amount
        })
        
        return {
            'taxes': taxes,
            'total': taxes_total
        }
    
    def get_available_sections(self) -> List[Dict]:
        """Get available sections with pricing information."""
        sections = []
        
        for section in self.performance.sections.all():
            section_data = {
                'name': section.name,
                'description': section.description,
                'base_price': float(section.base_price),
                'total_capacity': section.total_capacity,
                'available_capacity': section.available_capacity,
                'is_premium': section.is_premium,
                'is_wheelchair_accessible': section.is_wheelchair_accessible,
                'ticket_types': []
            }
            
            for stt in section.ticket_types.all():
                ticket_data = {
                    'id': str(stt.ticket_type.id),
                    'name': stt.ticket_type.name,
                    'price_modifier': float(stt.price_modifier),
                    'final_price': float(stt.final_price),
                    'allocated_capacity': stt.allocated_capacity,
                    'available_capacity': stt.available_capacity
                }
                section_data['ticket_types'].append(ticket_data)
            
            sections.append(section_data)
        
        return sections
    
    def get_available_options(self) -> List[Dict]:
        """Get available options for this event."""
        options = []
        
        for option in self.event.options.filter(is_active=True):
            option_data = {
                'id': str(option.id),
                'name': option.name,
                'description': option.description,
                'type': option.option_type,
                'price': float(option.price),
                'price_percentage': float(getattr(option, 'price_percentage', 0)),
                'max_quantity': option.max_quantity,
                'is_available': option.is_available
            }
            options.append(option_data)
        
        return options
    
    @staticmethod
    def validate_booking(
        performance: EventPerformance,
        section_name: str,
        ticket_type_id: str,
        quantity: int
    ) -> bool:
        """Validate if booking is possible."""
        try:
            section = performance.sections.get(name=section_name)
            section_ticket = section.ticket_types.get(ticket_type_id=ticket_type_id)
            
            # Check capacity
            if section_ticket.available_capacity < quantity:
                return False
            
            # Check if performance is available
            if not performance.is_available:
                return False
            
            return True
            
        except (EventSection.DoesNotExist, SectionTicketType.DoesNotExist):
            return False
    
    @staticmethod
    def reserve_tickets(
        performance: EventPerformance,
        section_name: str,
        ticket_type_id: str,
        quantity: int
    ) -> bool:
        """Reserve tickets for a booking."""
        try:
            section = performance.sections.get(name=section_name)
            section_ticket = section.ticket_types.get(ticket_type_id=ticket_type_id)
            
            if section_ticket.can_reserve(quantity):
                section_ticket.reserve_capacity(quantity)
                return True
            
            return False
            
        except (EventSection.DoesNotExist, SectionTicketType.DoesNotExist):
            return False
    
    @staticmethod
    def release_tickets(
        performance: EventPerformance,
        section_name: str,
        ticket_type_id: str,
        quantity: int
    ) -> bool:
        """Release reserved tickets."""
        try:
            section = performance.sections.get(name=section_name)
            section_ticket = section.ticket_types.get(ticket_type_id=ticket_type_id)
            
            section_ticket.release_capacity(quantity)
            return True
            
        except (EventSection.DoesNotExist, SectionTicketType.DoesNotExist):
            return False


class EventPricingRules:
    """
    Rules and configurations for event pricing.
    """
    
    # Default fee rates
    SERVICE_FEE_RATE = Decimal('0.03')  # 3%
    BOOKING_FEE_AMOUNT = Decimal('2.50')  # $2.50
    VAT_RATE = Decimal('0.09')  # 9%
    
    # Discount rules
    GROUP_DISCOUNT_THRESHOLD = Decimal('500.00')  # $500
    GROUP_DISCOUNT_RATE = Decimal('0.10')  # 10%
    EARLY_BIRD_DISCOUNT_RATE = Decimal('0.15')  # 15%
    EARLY_BIRD_DAYS = 30  # 30 days before event
    
    # Capacity rules
    MIN_GROUP_SIZE = 10
    MAX_GROUP_SIZE = 100
    
    @classmethod
    def get_fee_rates(cls) -> Dict[str, Decimal]:
        """Get current fee rates."""
        return {
            'service_fee_rate': cls.SERVICE_FEE_RATE,
            'booking_fee_amount': cls.BOOKING_FEE_AMOUNT,
            'vat_rate': cls.VAT_RATE
        }
    
    @classmethod
    def get_discount_rules(cls) -> Dict[str, Any]:
        """Get current discount rules."""
        return {
            'group_discount_threshold': cls.GROUP_DISCOUNT_THRESHOLD,
            'group_discount_rate': cls.GROUP_DISCOUNT_RATE,
            'early_bird_discount_rate': cls.EARLY_BIRD_DISCOUNT_RATE,
            'early_bird_days': cls.EARLY_BIRD_DAYS,
            'min_group_size': cls.MIN_GROUP_SIZE,
            'max_group_size': cls.MAX_GROUP_SIZE
        } 