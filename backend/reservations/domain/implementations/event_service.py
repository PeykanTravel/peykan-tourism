"""
Event-specific reservation service implementation
"""

from decimal import Decimal
from typing import List, Dict, Any, Optional
from django.utils import timezone
from django.db import transaction
from django.core.exceptions import ValidationError

from ..product_services import EventBookingData, SeatInfo, PricingResult
from ...models import Reservation, ReservationItem
from events.models import Event, Performance, Seat, EventPricingRule, EventDiscount


class EventReservationService:
    """Service for handling event reservations"""
    
    def check_availability(
        self,
        event_id: str,
        performance_id: str,
        seat_ids: List[str],
        booking_date: str,
        booking_time: str
    ) -> bool:
        """Check if seats are available for booking"""
        try:
            performance = Performance.objects.get(
                id=performance_id,
                event_id=event_id,
                date=booking_date,
                start_time=booking_time
            )
            
            # Check if seats are available
            seats = Seat.objects.filter(
                id__in=seat_ids,
                performance=performance,
                status='available'
            )
            
            return len(seats) == len(seat_ids)
            
        except (Performance.DoesNotExist, Seat.DoesNotExist):
            return False
    
    def reserve_capacity(
        self,
        event_id: str,
        performance_id: str,
        seat_ids: List[str],
        booking_date: str,
        booking_time: str,
        duration_minutes: int = 30
    ) -> bool:
        """Temporarily reserve seats"""
        try:
            with transaction.atomic():
                performance = Performance.objects.get(
                    id=performance_id,
                    event_id=event_id
                )
                
                # Mark seats as temporarily reserved
                seats = Seat.objects.filter(
                    id__in=seat_ids,
                    performance=performance,
                    status='available'
                )
                
                if len(seats) != len(seat_ids):
                    return False
                
                # Update seat status to temporarily reserved
                seats.update(
                    status='temporarily_reserved',
                    reserved_until=timezone.now() + timezone.timedelta(minutes=duration_minutes)
                )
                
                return True
                
        except Performance.DoesNotExist:
            return False
    
    def calculate_event_pricing(
        self,
        event_id: str,
        performance_id: str,
        seat_infos: List[SeatInfo],
        selected_options: List[Dict[str, Any]],
        discount_code: Optional[str] = None
    ) -> PricingResult:
        """Calculate pricing for event booking"""
        try:
            event = Event.objects.get(id=event_id)
            performance = Performance.objects.get(id=performance_id, event=event)
            
            # Calculate base price from seats
            base_price = Decimal('0.00')
            seat_details = []
            
            for seat_info in seat_infos:
                try:
                    seat = Seat.objects.get(
                        id=seat_info.id,
                        performance=performance
                    )
                    
                    # Get seat price based on section and ticket type
                    seat_price = self._get_seat_price(seat, performance)
                    base_price += seat_price
                    
                    seat_details.append({
                        'id': str(seat.id),
                        'seat_number': seat.seat_number,
                        'row_number': seat.row_number,
                        'section': seat.section.name,
                        'price': float(seat_price)
                    })
                    
                except Seat.DoesNotExist:
                    raise ValidationError(f"Seat {seat_info.id} not found")
            
            # Calculate options total
            options_total = Decimal('0.00')
            option_details = []
            
            for option in selected_options:
                option_price = Decimal(str(option.get('price', 0)))
                quantity = int(option.get('quantity', 1))
                options_total += option_price * quantity
                
                option_details.append({
                    'id': option.get('id'),
                    'name': option.get('name'),
                    'price': float(option_price),
                    'quantity': quantity
                })
            
            # Calculate subtotal
            subtotal = base_price + options_total
            
            # Apply discount if provided
            discount_amount = Decimal('0.00')
            if discount_code:
                discount_amount = self._apply_discount(
                    event, performance, subtotal, discount_code
                )
            
            # Calculate tax (10%)
            tax_amount = (subtotal - discount_amount) * Decimal('0.10')
            
            # Calculate total
            total_amount = subtotal - discount_amount + tax_amount
            
            return PricingResult(
                base_price=float(base_price),
                variant_price=0.0,  # Events don't have variants
                options_total=float(options_total),
                subtotal=float(subtotal),
                tax_amount=float(tax_amount),
                total_amount=float(total_amount),
                currency='USD',
                discount_amount=float(discount_amount),
                discount_code=discount_code or '',
                breakdown={
                    'seats': seat_details,
                    'options': option_details,
                    'event_name': event.title,
                    'performance_date': performance.date.isoformat(),
                    'performance_time': performance.start_time.isoformat()
                }
            )
            
        except (Event.DoesNotExist, Performance.DoesNotExist) as e:
            raise ValidationError(f"Event or performance not found: {str(e)}")
    
    def create_event_reservation(
        self,
        user_id: str,
        event_id: str,
        performance_id: str,
        seat_ids: List[str],
        customer_info: Dict[str, str],
        selected_options: List[Dict[str, Any]],
        pricing_result: PricingResult
    ) -> Reservation:
        """Create event reservation"""
        try:
            with transaction.atomic():
                event = Event.objects.get(id=event_id)
                performance = Performance.objects.get(id=performance_id, event=event)
                
                # Create reservation
                reservation = Reservation.objects.create(
                    user_id=user_id,
                    customer_name=customer_info['name'],
                    customer_email=customer_info['email'],
                    customer_phone=customer_info['phone'],
                    subtotal=Decimal(str(pricing_result.subtotal)),
                    tax_amount=Decimal(str(pricing_result.tax_amount)),
                    total_amount=Decimal(str(pricing_result.total_amount)),
                    currency=pricing_result.currency,
                    discount_amount=Decimal(str(pricing_result.discount_amount)),
                    discount_code=pricing_result.discount_code,
                    special_requirements=customer_info.get('special_requirements', ''),
                    status='draft'
                )
                
                # Create reservation item
                reservation_item = ReservationItem.objects.create(
                    reservation=reservation,
                    product_type='event',
                    product_id=event_id,
                    product_title=event.title,
                    product_slug=event.slug,
                    booking_date=performance.date,
                    booking_time=performance.start_time,
                    quantity=len(seat_ids),
                    unit_price=Decimal(str(pricing_result.base_price / len(seat_ids))),
                    total_price=Decimal(str(pricing_result.base_price)),
                    currency=pricing_result.currency,
                    selected_options=selected_options,
                    options_total=Decimal(str(pricing_result.options_total)),
                    booking_data={
                        'event_id': str(event.id),
                        'performance_id': str(performance.id),
                        'seat_ids': seat_ids,
                        'event_details': {
                            'title': event.title,
                            'venue': event.venue.name if event.venue else '',
                            'duration': event.duration,
                            'category': event.category.name if event.category else ''
                        }
                    }
                )
                
                # Mark seats as reserved
                seats = Seat.objects.filter(
                    id__in=seat_ids,
                    performance=performance
                )
                seats.update(status='reserved')
                
                return reservation
                
        except (Event.DoesNotExist, Performance.DoesNotExist) as e:
            raise ValidationError(f"Event or performance not found: {str(e)}")
    
    def _get_seat_price(self, seat: Seat, performance: Performance) -> Decimal:
        """Get price for a specific seat"""
        # Check for specific pricing rules
        pricing_rule = EventPricingRule.objects.filter(
            event=performance.event,
            section=seat.section,
            ticket_type=seat.ticket_type
        ).first()
        
        if pricing_rule:
            return pricing_rule.price
        
        # Fallback to section base price
        return seat.section.base_price or Decimal('50.00')
    
    def _apply_discount(
        self,
        event: Event,
        performance: Performance,
        subtotal: Decimal,
        discount_code: str
    ) -> Decimal:
        """Apply discount code"""
        try:
            discount = EventDiscount.objects.get(
                code=discount_code,
                event=event,
                is_active=True,
                valid_from__lte=timezone.now(),
                valid_until__gte=timezone.now()
            )
            
            if discount.discount_type == 'percentage':
                return subtotal * (discount.discount_value / Decimal('100'))
            else:
                return min(discount.discount_value, subtotal)
                
        except EventDiscount.DoesNotExist:
            return Decimal('0.00')
    
    def get_available_seats(
        self,
        event_id: str,
        performance_id: str
    ) -> List[Dict[str, Any]]:
        """Get available seats for a performance"""
        try:
            performance = Performance.objects.get(
                id=performance_id,
                event_id=event_id
            )
            
            seats = Seat.objects.filter(
                performance=performance,
                status='available'
            ).select_related('section', 'ticket_type')
            
            return [
                {
                    'id': str(seat.id),
                    'seat_number': seat.seat_number,
                    'row_number': seat.row_number,
                    'section': seat.section.name,
                    'ticket_type': seat.ticket_type.name if seat.ticket_type else 'Standard',
                    'price': float(self._get_seat_price(seat, performance)),
                    'status': seat.status
                }
                for seat in seats
            ]
            
        except Performance.DoesNotExist:
            return []
    
    def get_performance_details(
        self,
        event_id: str,
        performance_id: str
    ) -> Dict[str, Any]:
        """Get performance details"""
        try:
            performance = Performance.objects.get(
                id=performance_id,
                event_id=event_id
            )
            
            return {
                'id': str(performance.id),
                'date': performance.date.isoformat(),
                'start_time': performance.start_time.isoformat(),
                'end_time': performance.end_time.isoformat() if performance.end_time else None,
                'venue': performance.venue.name if performance.venue else '',
                'available_seats': performance.available_seats,
                'total_seats': performance.total_seats,
                'status': performance.status
            }
            
        except Performance.DoesNotExist:
            return {} 