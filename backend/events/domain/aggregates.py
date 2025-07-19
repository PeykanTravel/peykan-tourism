"""
Event Aggregate Roots for Peykan Tourism Platform.
Following Domain-Driven Design principles.
"""

from typing import List, Optional, Dict, Any
from decimal import Decimal
from datetime import datetime, timedelta
import uuid
from django.db import transaction
from django.core.exceptions import ValidationError

from core.domain_events import (
    DomainEvent, SeatsReservedEvent, SeatsReleasedEvent, 
    CapacityUpdatedEvent, domain_event_publisher
)
from ..models import Event, EventPerformance, EventSection, Seat, EventBooking


class EventAggregate:
    """Event aggregate root - manages event state and business rules"""
    
    def __init__(self, event: Event):
        self.event = event
        self._domain_events: List[DomainEvent] = []
        self._version = 0
    
    def reserve_seats(
        self, 
        performance_id: uuid.UUID, 
        seat_ids: List[uuid.UUID], 
        user_id: uuid.UUID,
        reservation_duration: int = 15  # minutes
    ) -> bool:
        """Reserve seats for event with business logic validation"""
        try:
            # Business logic validation
            if not self._can_reserve_seats(performance_id, seat_ids):
                return False
            
            # Update aggregate state
            self._reserve_seats_internal(performance_id, seat_ids)
            
            # Raise domain event
            event = SeatsReservedEvent(
                aggregate_id=self.event.id,
                event_id=uuid.uuid4(),
                occurred_on=datetime.now(),
                event_type="SeatsReserved",
                event_id=self.event.id,
                performance_id=performance_id,
                seat_ids=seat_ids,
                user_id=user_id,
                reservation_id=uuid.uuid4(),
                expires_at=datetime.now() + timedelta(minutes=reservation_duration)
            )
            
            self._domain_events.append(event)
            self._version += 1
            
            return True
            
        except Exception as e:
            print(f"Error reserving seats: {str(e)}")
            return False
    
    def release_seats(
        self, 
        performance_id: uuid.UUID, 
        seat_ids: List[uuid.UUID],
        reason: str = "manual_release"
    ) -> bool:
        """Release reserved seats"""
        try:
            # Update aggregate state
            self._release_seats_internal(performance_id, seat_ids)
            
            # Raise domain event
            event = SeatsReleasedEvent(
                aggregate_id=self.event.id,
                event_id=uuid.uuid4(),
                occurred_on=datetime.now(),
                event_type="SeatsReleased",
                event_id=self.event.id,
                performance_id=performance_id,
                seat_ids=seat_ids,
                reason=reason
            )
            
            self._domain_events.append(event)
            self._version += 1
            
            return True
            
        except Exception as e:
            print(f"Error releasing seats: {str(e)}")
            return False
    
    def update_capacity(
        self, 
        performance_id: uuid.UUID, 
        new_capacity: int,
        reason: str = "capacity_update"
    ) -> bool:
        """Update performance capacity"""
        try:
            performance = self.event.performances.filter(id=performance_id).first()
            if not performance:
                return False
            
            old_capacity = performance.max_capacity
            available_capacity = performance.current_capacity
            
            # Update capacity
            performance.max_capacity = new_capacity
            performance.save()
            
            # Raise domain event
            event = CapacityUpdatedEvent(
                aggregate_id=self.event.id,
                event_id=uuid.uuid4(),
                occurred_on=datetime.now(),
                event_type="CapacityUpdated",
                product_id=self.event.id,
                product_type="event",
                old_capacity=old_capacity,
                new_capacity=new_capacity,
                available_capacity=available_capacity,
                reason=reason
            )
            
            self._domain_events.append(event)
            self._version += 1
            
            return True
            
        except Exception as e:
            print(f"Error updating capacity: {str(e)}")
            return False
    
    def calculate_pricing(
        self, 
        performance_id: uuid.UUID, 
        seat_ids: List[uuid.UUID],
        selected_options: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """Calculate pricing for selected seats and options"""
        try:
            # Get performance
            performance = self.event.performances.filter(id=performance_id).first()
            if not performance:
                return {}
            
            # Get seats
            seats = Seat.objects.filter(
                performance=performance,
                id__in=seat_ids,
                status='available'
            )
            
            if len(seats) != len(seat_ids):
                return {}
            
            # Calculate base price
            base_price = sum(seat.price for seat in seats)
            
            # Calculate options price
            options_price = Decimal('0.00')
            options_breakdown = []
            
            if selected_options:
                for option in selected_options:
                    option_price = Decimal(str(option.get('price', 0)))
                    quantity = option.get('quantity', 1)
                    total_option_price = option_price * quantity
                    options_price += total_option_price
                    
                    options_breakdown.append({
                        'id': option.get('id'),
                        'name': option.get('name'),
                        'price': str(option_price),
                        'quantity': quantity,
                        'total': str(total_option_price)
                    })
            
            # Calculate taxes and fees
            subtotal = base_price + options_price
            tax_rate = Decimal('0.10')  # 10% tax
            service_fee_rate = Decimal('0.05')  # 5% service fee
            
            tax_amount = subtotal * tax_rate
            service_fee = subtotal * service_fee_rate
            total = subtotal + tax_amount + service_fee
            
            return {
                'base_price': str(base_price),
                'options_price': str(options_price),
                'options_breakdown': options_breakdown,
                'subtotal': str(subtotal),
                'tax_rate': str(tax_rate),
                'tax_amount': str(tax_amount),
                'service_fee_rate': str(service_fee_rate),
                'service_fee': str(service_fee),
                'total': str(total),
                'currency': 'USD',
                'seats_breakdown': [
                    {
                        'id': str(seat.id),
                        'section': seat.section,
                        'row': seat.row_number,
                        'seat': seat.seat_number,
                        'price': str(seat.price)
                    } for seat in seats
                ]
            }
            
        except Exception as e:
            print(f"Error calculating pricing: {str(e)}")
            return {}
    
    def _can_reserve_seats(self, performance_id: uuid.UUID, seat_ids: List[uuid.UUID]) -> bool:
        """Check if seats can be reserved"""
        try:
            # Check if performance exists and is available
            performance = self.event.performances.filter(
                id=performance_id,
                is_available=True
            ).first()
            
            if not performance:
                return False
            
            # Check if event is active
            if not self.event.is_active:
                return False
            
            # Check seat availability
            seats = Seat.objects.filter(
                performance=performance,
                id__in=seat_ids,
                status='available'
            )
            
            if len(seats) != len(seat_ids):
                return False
            
            # Check if seats belong to the same performance
            if any(seat.performance_id != performance_id for seat in seats):
                return False
            
            return True
            
        except Exception as e:
            print(f"Error checking seat availability: {str(e)}")
            return False
    
    def _reserve_seats_internal(self, performance_id: uuid.UUID, seat_ids: List[uuid.UUID]):
        """Internal method to reserve seats"""
        with transaction.atomic():
            # Update seat status
            Seat.objects.filter(id__in=seat_ids).update(status='reserved')
            
            # Update performance capacity
            performance = EventPerformance.objects.select_for_update().get(id=performance_id)
            performance.current_capacity -= len(seat_ids)
            performance.save()
    
    def _release_seats_internal(self, performance_id: uuid.UUID, seat_ids: List[uuid.UUID]):
        """Internal method to release seats"""
        with transaction.atomic():
            # Update seat status
            Seat.objects.filter(id__in=seat_ids).update(status='available')
            
            # Update performance capacity
            performance = EventPerformance.objects.select_for_update().get(id=performance_id)
            performance.current_capacity += len(seat_ids)
            performance.save()
    
    def get_domain_events(self) -> List[DomainEvent]:
        """Get pending domain events"""
        events = self._domain_events.copy()
        self._domain_events.clear()
        return events
    
    def get_version(self) -> int:
        """Get aggregate version"""
        return self._version
    
    def is_available_for_date(self, date: datetime.date) -> bool:
        """Check if event is available for a specific date"""
        return self.event.performances.filter(
            date=date,
            is_available=True
        ).exists()
    
    def get_available_performances(self) -> List[EventPerformance]:
        """Get all available performances"""
        return list(self.event.performances.filter(is_available=True).order_by('date'))
    
    def get_performance_capacity_summary(self, performance_id: uuid.UUID) -> Dict[str, Any]:
        """Get capacity summary for a performance"""
        performance = self.event.performances.filter(id=performance_id).first()
        if not performance:
            return {}
        
        sections = performance.sections.all()
        total_capacity = sum(section.total_capacity for section in sections)
        available_capacity = sum(section.available_capacity for section in sections)
        reserved_capacity = sum(section.reserved_capacity for section in sections)
        sold_capacity = sum(section.sold_capacity for section in sections)
        
        return {
            'performance_id': str(performance_id),
            'date': performance.date.isoformat(),
            'time': performance.time.strftime('%H:%M'),
            'total_capacity': total_capacity,
            'available_capacity': available_capacity,
            'reserved_capacity': reserved_capacity,
            'sold_capacity': sold_capacity,
            'occupancy_rate': ((reserved_capacity + sold_capacity) / total_capacity * 100) if total_capacity > 0 else 0,
            'sections': [
                {
                    'id': str(section.id),
                    'name': section.name,
                    'total_capacity': section.total_capacity,
                    'available_capacity': section.available_capacity,
                    'base_price': str(section.base_price),
                    'currency': section.currency,
                    'is_premium': section.is_premium
                } for section in sections
            ]
        }


class CartAggregate:
    """Cart aggregate root - manages shopping cart state and business rules"""
    
    def __init__(self, cart):
        self.cart = cart
        self._domain_events: List[DomainEvent] = []
        self._version = 0
    
    def add_item(
        self, 
        product_type: str, 
        product_id: uuid.UUID, 
        quantity: int, 
        unit_price: Decimal,
        booking_data: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Add item to cart with business logic validation"""
        try:
            # Business logic validation
            if not self._can_add_item(product_type, product_id, quantity):
                return False
            
            # Create cart item
            from cart.models import CartItem
            
            cart_item = CartItem.objects.create(
                cart=self.cart,
                product_type=product_type,
                product_id=product_id,
                quantity=quantity,
                unit_price=unit_price,
                total_price=unit_price * quantity,
                booking_data=booking_data or {}
            )
            
            # Raise domain event
            from core.domain_events import CartItemAddedEvent
            
            event = CartItemAddedEvent(
                aggregate_id=self.cart.id,
                event_id=uuid.uuid4(),
                occurred_on=datetime.now(),
                event_type="CartItemAdded",
                cart_id=self.cart.id,
                user_id=self.cart.user.id if self.cart.user else uuid.uuid4(),
                item_id=cart_item.id,
                product_type=product_type,
                product_id=product_id,
                quantity=quantity,
                unit_price=unit_price,
                total_price=unit_price * quantity,
                currency='USD'
            )
            
            self._domain_events.append(event)
            self._version += 1
            
            return True
            
        except Exception as e:
            print(f"Error adding item to cart: {str(e)}")
            return False
    
    def remove_item(self, item_id: uuid.UUID) -> bool:
        """Remove item from cart"""
        try:
            from cart.models import CartItem
            
            cart_item = CartItem.objects.filter(
                cart=self.cart,
                id=item_id
            ).first()
            
            if not cart_item:
                return False
            
            # Remove item
            cart_item.delete()
            
            # Raise domain event
            from core.domain_events import CartItemRemovedEvent
            
            event = CartItemRemovedEvent(
                aggregate_id=self.cart.id,
                event_id=uuid.uuid4(),
                occurred_on=datetime.now(),
                event_type="CartItemRemoved",
                cart_id=self.cart.id,
                item_id=item_id,
                product_type=cart_item.product_type,
                product_id=cart_item.product_id
            )
            
            self._domain_events.append(event)
            self._version += 1
            
            return True
            
        except Exception as e:
            print(f"Error removing item from cart: {str(e)}")
            return False
    
    def clear_cart(self) -> bool:
        """Clear all items from cart"""
        try:
            # Clear all items
            self.cart.items.all().delete()
            
            # Raise domain event
            from core.domain_events import CartClearedEvent
            
            event = CartClearedEvent(
                aggregate_id=self.cart.id,
                event_id=uuid.uuid4(),
                occurred_on=datetime.now(),
                event_type="CartCleared",
                cart_id=self.cart.id,
                user_id=self.cart.user.id if self.cart.user else uuid.uuid4()
            )
            
            self._domain_events.append(event)
            self._version += 1
            
            return True
            
        except Exception as e:
            print(f"Error clearing cart: {str(e)}")
            return False
    
    def _can_add_item(self, product_type: str, product_id: uuid.UUID, quantity: int) -> bool:
        """Check if item can be added to cart"""
        try:
            # Basic validation
            if quantity <= 0:
                return False
            
            # Check product availability based on type
            if product_type == 'event':
                event = Event.objects.filter(id=product_id, is_active=True).first()
                if not event:
                    return False
                
                # Check if event has available performances
                if not event.is_available_today:
                    return False
            
            elif product_type == 'tour':
                from tours.models import Tour
                tour = Tour.objects.filter(id=product_id, is_active=True).first()
                if not tour:
                    return False
            
            elif product_type == 'transfer':
                from transfers.models import TransferRoute
                transfer = TransferRoute.objects.filter(id=product_id, is_active=True).first()
                if not transfer:
                    return False
            
            else:
                return False
            
            return True
            
        except Exception as e:
            print(f"Error checking item availability: {str(e)}")
            return False
    
    def get_total(self) -> Decimal:
        """Calculate cart total"""
        return sum(item.total_price for item in self.cart.items.all())
    
    def get_items_count(self) -> int:
        """Get total number of items in cart"""
        return self.cart.items.count()
    
    def get_domain_events(self) -> List[DomainEvent]:
        """Get pending domain events"""
        events = self._domain_events.copy()
        self._domain_events.clear()
        return events
    
    def get_version(self) -> int:
        """Get aggregate version"""
        return self._version 