"""
Event services for Peykan Tourism Platform.
"""

from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.db.models import Q, Sum, Count
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
from .models import (
    Event, EventPerformance, EventSection, SectionTicketType,
    Seat, TicketType, EventOption, EventDiscount, EventFee,
    EventPricingRule, EventBooking
)
from shared.services import CurrencyConverterService


class EventService:
    """
    Service for event-related operations.
    """
    
    @staticmethod
    def get_available_events(filters: Dict = None) -> List[Event]:
        """
        Get available events with optional filters.
        """
        queryset = Event.objects.filter(
            is_active=True,
            performances__date__gte=timezone.now().date()
        ).distinct()
        
        if filters:
            if filters.get('category'):
                queryset = queryset.filter(category_id=filters['category'])
            if filters.get('venue'):
                queryset = queryset.filter(venue_id=filters['venue'])
            if filters.get('style'):
                queryset = queryset.filter(style=filters['style'])
            if filters.get('city'):
                queryset = queryset.filter(venue__city__icontains=filters['city'])
            if filters.get('date_from'):
                queryset = queryset.filter(performances__date__gte=filters['date_from'])
            if filters.get('date_to'):
                queryset = queryset.filter(performances__date__lte=filters['date_to'])
            if filters.get('price_min'):
                queryset = queryset.filter(price__gte=filters['price_min'])
            if filters.get('price_max'):
                queryset = queryset.filter(price__lte=filters['price_max'])
        
        return queryset.select_related('category', 'venue').prefetch_related('artists')
    
    @staticmethod
    def get_event_performances(event_id: str, date_from: str = None, date_to: str = None) -> List[EventPerformance]:
        """
        Get available performances for an event.
        """
        queryset = EventPerformance.objects.filter(
            event_id=event_id,
            date__gte=timezone.now().date(),
            is_available=True
        )
        
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        
        return queryset.select_related('event').order_by('date', 'start_time')
    
    @staticmethod
    def get_performance_sections(performance_id: str) -> List[EventSection]:
        """
        Get sections for a performance with availability.
        """
        return EventSection.objects.filter(
            performance_id=performance_id,
            available_capacity__gt=0
        ).select_related('performance').prefetch_related('ticket_types')
    
    @staticmethod
    def get_available_seats(performance_id: str, section_name: str = None, ticket_type_id: str = None) -> List[Seat]:
        """
        Get available seats for a performance.
        """
        queryset = Seat.objects.filter(
            performance_id=performance_id,
            status='available'
        )
        
        if section_name:
            queryset = queryset.filter(section=section_name)
        if ticket_type_id:
            queryset = queryset.filter(ticket_type_id=ticket_type_id)
        
        return queryset.select_related('ticket_type').order_by('row_number', 'seat_number')


class EventPricingService:
    """
    Service for event pricing calculations.
    """
    
    @staticmethod
    def calculate_event_price(
        event: Event,
        performance: EventPerformance,
        section: EventSection,
        ticket_type: TicketType,
        quantity: int = 1,
        selected_options: List[Dict] = None,
        discount_code: str = None,
        user_currency: str = 'USD'
    ) -> Dict[str, Any]:
        """
        Calculate total price for event booking.
        """
        # Base price calculation
        base_price = EventPricingService._calculate_base_price(
            event, section, ticket_type
        )
        
        # Apply pricing rules
        adjusted_price = EventPricingService._apply_pricing_rules(
            event, performance, base_price
        )
        
        # Calculate subtotal
        subtotal = adjusted_price * quantity
        
        # Add options
        options_total = EventPricingService._calculate_options_total(
            event, selected_options or [], quantity
        )
        
        # Calculate fees
        fees_total = EventPricingService._calculate_fees_total(
            event, subtotal + options_total, quantity
        )
        
        # Apply discount
        discount_amount = EventPricingService._apply_discount(
            event, discount_code, subtotal + options_total
        )
        
        # Calculate total
        total = subtotal + options_total + fees_total - discount_amount
        
        # Convert currency if needed
        if user_currency != event.currency:
            total = CurrencyConverterService.convert_currency(
                total, event.currency, user_currency
            )
            base_price = CurrencyConverterService.convert_currency(
                base_price, event.currency, user_currency
            )
            options_total = CurrencyConverterService.convert_currency(
                options_total, event.currency, user_currency
            )
            fees_total = CurrencyConverterService.convert_currency(
                fees_total, event.currency, user_currency
            )
            discount_amount = CurrencyConverterService.convert_currency(
                discount_amount, event.currency, user_currency
            )
        
        return {
            'base_price': base_price,
            'adjusted_price': adjusted_price,
            'subtotal': subtotal,
            'options_total': options_total,
            'fees_total': fees_total,
            'discount_amount': discount_amount,
            'total': total,
            'currency': user_currency,
            'quantity': quantity,
            'pricing_breakdown': {
                'base_price_per_ticket': base_price,
                'options': options_total,
                'fees': fees_total,
                'discount': discount_amount,
                'total_per_ticket': total / quantity if quantity > 0 else 0
            }
        }
    
    @staticmethod
    def _calculate_base_price(event: Event, section: EventSection, ticket_type: TicketType) -> Decimal:
        """
        Calculate base price for a ticket.
        """
        base_price = event.price
        
        # Add section price modifier
        if section.base_price:
            base_price = section.base_price
        
        # Add ticket type price modifier
        if ticket_type.price_modifier:
            base_price += (base_price * ticket_type.price_modifier / 100)
        
        return base_price
    
    @staticmethod
    def _apply_pricing_rules(event: Event, performance: EventPerformance, base_price: Decimal) -> Decimal:
        """
        Apply dynamic pricing rules.
        """
        adjusted_price = base_price
        
        # Get active pricing rules
        rules = EventPricingRule.objects.filter(
            event=event,
            is_active=True
        ).order_by('-priority')
        
        for rule in rules:
            if rule.applies_to(performance):
                adjustment = rule.calculate_adjustment(base_price)
                adjusted_price += adjustment
        
        return adjusted_price
    
    @staticmethod
    def _calculate_options_total(event: Event, selected_options: List[Dict], quantity: int) -> Decimal:
        """
        Calculate total for selected options.
        """
        total = Decimal('0.00')
        
        for option_data in selected_options:
            try:
                option = EventOption.objects.get(
                    id=option_data['option_id'],
                    event=event,
                    is_active=True
                )
                option_quantity = option_data.get('quantity', 1)
                total += option.price * option_quantity
            except EventOption.DoesNotExist:
                continue
        
        return total
    
    @staticmethod
    def _calculate_fees_total(event: Event, subtotal: Decimal, quantity: int) -> Decimal:
        """
        Calculate total fees.
        """
        total = Decimal('0.00')
        
        fees = EventFee.objects.filter(
            event=event,
            is_active=True
        )
        
        for fee in fees:
            fee_amount = fee.calculate_fee(subtotal, quantity)
            total += fee_amount
        
        return total
    
    @staticmethod
    def _apply_discount(event: Event, discount_code: str, subtotal: Decimal) -> Decimal:
        """
        Apply discount code.
        """
        if not discount_code:
            return Decimal('0.00')
        
        try:
            discount = EventDiscount.objects.get(
                event=event,
                code=discount_code,
                is_active=True
            )
            
            if discount.is_valid():
                return discount.calculate_discount(subtotal)
        except EventDiscount.DoesNotExist:
            pass
        
        return Decimal('0.00')


class EventBookingService:
    """
    Service for event booking operations.
    """
    
    @staticmethod
    @transaction.atomic
    def create_event_booking(
        user,
        event: Event,
        performance: EventPerformance,
        selected_seats: List[str],
        ticket_type: TicketType,
        selected_options: List[Dict] = None,
        special_requirements: str = '',
        discount_code: str = None
    ) -> EventBooking:
        """
        Create a new event booking.
        """
        # Validate seats
        EventBookingService._validate_seats(performance, selected_seats)
        
        # Calculate pricing
        pricing = EventPricingService.calculate_event_price(
            event=event,
            performance=performance,
            section=EventBookingService._get_section_from_seats(selected_seats),
            ticket_type=ticket_type,
            quantity=len(selected_seats),
            selected_options=selected_options,
            discount_code=discount_code,
            user_currency=user.preferred_currency
        )
        
        # Create booking
        booking = EventBooking.objects.create(
            event=event,
            performance=performance,
            user=user,
            booking_date=performance.date,
            booking_time=performance.start_time,
            participants_count=len(selected_seats),
            unit_price=pricing['base_price'],
            total_price=pricing['total'],
            currency=pricing['currency'],
            selected_seats=selected_seats,
            selected_options=selected_options or [],
            options_total=pricing['options_total'],
            special_requirements=special_requirements
        )
        
        # Update seat status
        EventBookingService._update_seat_status(selected_seats, 'sold')
        
        # Update capacity
        EventBookingService._update_capacity(performance, len(selected_seats))
        
        # Apply discount if used
        if discount_code:
            EventBookingService._apply_discount_usage(discount_code)
        
        return booking
    
    @staticmethod
    def _validate_seats(performance: EventPerformance, selected_seats: List[str]) -> None:
        """
        Validate that seats are available.
        """
        seats = Seat.objects.filter(
            performance=performance,
            seat_number__in=selected_seats
        )
        
        if seats.count() != len(selected_seats):
            raise ValidationError("Some selected seats are not available.")
        
        unavailable_seats = seats.filter(status__in=['sold', 'blocked'])
        if unavailable_seats.exists():
            raise ValidationError("Some selected seats are not available.")
    
    @staticmethod
    def _get_section_from_seats(selected_seats: List[str]) -> EventSection:
        """
        Get section from selected seats.
        """
        seat = Seat.objects.filter(seat_number__in=selected_seats).first()
        if not seat:
            raise ValidationError("Invalid seat selection.")
        
        return EventSection.objects.get(
            performance=seat.performance,
            name=seat.section
        )
    
    @staticmethod
    def _update_seat_status(selected_seats: List[str], status: str) -> None:
        """
        Update seat status.
        """
        Seat.objects.filter(seat_number__in=selected_seats).update(status=status)
    
    @staticmethod
    def _update_capacity(performance: EventPerformance, quantity: int) -> None:
        """
        Update performance capacity.
        """
        performance.current_capacity += quantity
        performance.save()
    
    @staticmethod
    def _apply_discount_usage(discount_code: str) -> None:
        """
        Increment discount usage count.
        """
        try:
            discount = EventDiscount.objects.get(code=discount_code)
            discount.current_uses += 1
            discount.save()
        except EventDiscount.DoesNotExist:
            pass


class EventCapacityManager:
    """
    Service for managing event capacity and seat availability.
    """
    
    @staticmethod
    def get_capacity_summary(performance: EventPerformance) -> Dict[str, Any]:
        """
        Get capacity summary for a performance.
        """
        sections = performance.sections.all()
        
        summary = {
            'performance_id': performance.id,
            'date': performance.date,
            'total_capacity': sum(s.total_capacity for s in sections),
            'available_capacity': sum(s.available_capacity for s in sections),
            'reserved_capacity': sum(s.reserved_capacity for s in sections),
            'sold_capacity': sum(s.sold_capacity for s in sections),
            'sections': []
        }
        
        for section in sections:
            section_summary = {
                'id': section.id,
                'name': section.name,
                'total_capacity': section.total_capacity,
                'available_capacity': section.available_capacity,
                'reserved_capacity': section.reserved_capacity,
                'sold_capacity': section.sold_capacity,
                'occupancy_rate': section.occupancy_rate,
                'ticket_types': []
            }
            
            for section_ticket in section.ticket_types.all():
                ticket_summary = {
                    'ticket_type_id': section_ticket.ticket_type.id,
                    'ticket_type_name': section_ticket.ticket_type.name,
                    'allocated_capacity': section_ticket.allocated_capacity,
                    'available_capacity': section_ticket.available_capacity,
                    'reserved_capacity': section_ticket.reserved_capacity,
                    'sold_capacity': section_ticket.sold_capacity,
                    'final_price': section_ticket.final_price
                }
                section_summary['ticket_types'].append(ticket_summary)
            
            summary['sections'].append(section_summary)
        
        return summary
    
    @staticmethod
    def reserve_seats(
        performance: EventPerformance,
        ticket_type_id: str,
        section_name: str,
        count: int
    ) -> Tuple[bool, Any]:
        """
        Reserve seats for a performance.
        """
        try:
            section_ticket = SectionTicketType.objects.get(
                section__performance=performance,
                section__name=section_name,
                ticket_type_id=ticket_type_id
            )
            
            if section_ticket.can_reserve(count):
                section_ticket.reserve_capacity(count)
                return True, section_ticket
            else:
                return False, "Not enough capacity available"
                
        except SectionTicketType.DoesNotExist:
            return False, "Invalid section or ticket type"
    
    @staticmethod
    def get_available_seats(
        performance: EventPerformance,
        ticket_type_id: str = None,
        section_name: str = None
    ) -> List[SectionTicketType]:
        """
        Get available seats for a performance.
        """
        queryset = SectionTicketType.objects.filter(
            section__performance=performance,
            available_capacity__gt=0
        )
        
        if ticket_type_id:
            queryset = queryset.filter(ticket_type_id=ticket_type_id)
        if section_name:
            queryset = queryset.filter(section__name=section_name)
        
        return queryset.select_related('section', 'ticket_type')


class EventSearchService:
    """
    Service for event search and filtering.
    """
    
    @staticmethod
    def search_events(
        query: str = None,
        category: str = None,
        venue: str = None,
        style: str = None,
        city: str = None,
        date_from: str = None,
        date_to: str = None,
        price_min: Decimal = None,
        price_max: Decimal = None,
        available_only: bool = True
    ) -> List[Event]:
        """
        Search events with various filters.
        """
        queryset = Event.objects.filter(is_active=True)
        
        # Text search
        if query:
            queryset = queryset.filter(
                Q(translations__title__icontains=query) |
                Q(translations__description__icontains=query) |
                Q(venue__translations__name__icontains=query) |
                Q(artists__translations__name__icontains=query)
            ).distinct()
        
        # Category filter
        if category:
            queryset = queryset.filter(category_id=category)
        
        # Venue filter
        if venue:
            queryset = queryset.filter(venue_id=venue)
        
        # Style filter
        if style:
            queryset = queryset.filter(style=style)
        
        # City filter
        if city:
            queryset = queryset.filter(venue__city__icontains=city)
        
        # Date range filter
        if date_from or date_to:
            performances_filter = Q()
            if date_from:
                performances_filter &= Q(performances__date__gte=date_from)
            if date_to:
                performances_filter &= Q(performances__date__lte=date_to)
            queryset = queryset.filter(performances_filter)
        
        # Price range filter
        if price_min is not None:
            queryset = queryset.filter(price__gte=price_min)
        if price_max is not None:
            queryset = queryset.filter(price__lte=price_max)
        
        # Available performances only
        if available_only:
            queryset = queryset.filter(
                performances__date__gte=timezone.now().date(),
                performances__is_available=True
            ).distinct()
        
        return queryset.select_related('category', 'venue').prefetch_related('artists') 