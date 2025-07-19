"""
Domain Events system for Peykan Tourism Platform.
Following Domain-Driven Design principles.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional
from decimal import Decimal
import uuid
import json
from enum import Enum


class EventType(Enum):
    """Domain event types"""
    # User Management Events
    USER_REGISTERED = "user_registered"
    USER_LOGGED_IN = "user_logged_in"
    USER_LOGGED_OUT = "user_logged_out"
    USER_PROFILE_UPDATED = "user_profile_updated"
    USER_EMAIL_VERIFIED = "user_email_verified"
    USER_PHONE_VERIFIED = "user_phone_verified"
    
    # Product Catalog Events
    PRODUCT_CREATED = "product_created"
    PRODUCT_UPDATED = "product_updated"
    PRODUCT_DEACTIVATED = "product_deactivated"
    PRICING_UPDATED = "pricing_updated"
    
    # Booking Events
    CART_ITEM_ADDED = "cart_item_added"
    CART_ITEM_REMOVED = "cart_item_removed"
    CART_CLEARED = "cart_cleared"
    ORDER_CREATED = "order_created"
    ORDER_CONFIRMED = "order_confirmed"
    ORDER_CANCELLED = "order_cancelled"
    ORDER_COMPLETED = "order_completed"
    
    # Inventory Events
    SEATS_RESERVED = "seats_reserved"
    SEATS_RELEASED = "seats_released"
    CAPACITY_UPDATED = "capacity_updated"
    INVENTORY_LOW = "inventory_low"
    INVENTORY_DEPLETED = "inventory_depleted"
    
    # Payment Events
    PAYMENT_INITIATED = "payment_initiated"
    PAYMENT_COMPLETED = "payment_completed"
    PAYMENT_FAILED = "payment_failed"
    REFUND_REQUESTED = "refund_requested"
    REFUND_PROCESSED = "refund_processed"


@dataclass
class DomainEvent(ABC):
    """Base domain event class"""
    event_id: uuid.UUID = field(default_factory=uuid.uuid4)
    aggregate_id: uuid.UUID = field(default_factory=uuid.uuid4)
    occurred_on: datetime = field(default_factory=datetime.now)
    event_type: str = field(default="")
    version: int = field(default=1)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        if not self.event_type:
            self.event_type = self.__class__.__name__
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert event to dictionary"""
        return {
            'event_id': str(self.event_id),
            'aggregate_id': str(self.aggregate_id),
            'occurred_on': self.occurred_on.isoformat(),
            'event_type': self.event_type,
            'version': self.version,
            'metadata': self.metadata,
            'data': self._get_event_data()
        }
    
    def to_json(self) -> str:
        """Convert event to JSON string"""
        return json.dumps(self.to_dict(), default=str)
    
    @abstractmethod
    def _get_event_data(self) -> Dict[str, Any]:
        """Get event-specific data"""
        pass


# User Management Events
@dataclass
class UserRegisteredEvent(DomainEvent):
    """Event raised when user is registered"""
    user_id: uuid.UUID = field(default_factory=uuid.uuid4)
    email: str = ""
    username: str = ""
    first_name: str = ""
    last_name: str = ""
    role: str = "customer"
    
    def _get_event_data(self) -> Dict[str, Any]:
        return {
            'user_id': str(self.user_id),
            'email': self.email,
            'username': self.username,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'role': self.role
        }


@dataclass
class UserLoggedInEvent(DomainEvent):
    """Event raised when user logs in"""
    user_id: uuid.UUID = field(default_factory=uuid.uuid4)
    session_id: uuid.UUID = field(default_factory=uuid.uuid4)
    ip_address: str = ""
    user_agent: str = ""
    
    def _get_event_data(self) -> Dict[str, Any]:
        return {
            'user_id': str(self.user_id),
            'session_id': str(self.session_id),
            'ip_address': self.ip_address,
            'user_agent': self.user_agent
        }


@dataclass
class UserProfileUpdatedEvent(DomainEvent):
    """Event raised when user profile is updated"""
    user_id: uuid.UUID = field(default_factory=uuid.uuid4)
    updated_fields: List[str] = field(default_factory=list)
    
    def _get_event_data(self) -> Dict[str, Any]:
        return {
            'user_id': str(self.user_id),
            'updated_fields': self.updated_fields
        }


# Product Catalog Events
@dataclass
class ProductCreatedEvent(DomainEvent):
    """Event raised when product is created"""
    product_id: uuid.UUID = field(default_factory=uuid.uuid4)
    product_type: str = ""  # tour, event, transfer
    title: str = ""
    slug: str = ""
    price: Decimal = field(default=Decimal('0.00'))
    currency: str = "USD"
    
    def _get_event_data(self) -> Dict[str, Any]:
        return {
            'product_id': str(self.product_id),
            'product_type': self.product_type,
            'title': self.title,
            'slug': self.slug,
            'price': str(self.price),
            'currency': self.currency
        }


@dataclass
class PricingUpdatedEvent(DomainEvent):
    """Event raised when product pricing is updated"""
    product_id: uuid.UUID = field(default_factory=uuid.uuid4)
    product_type: str = ""
    old_price: Decimal = field(default=Decimal('0.00'))
    new_price: Decimal = field(default=Decimal('0.00'))
    currency: str = "USD"
    reason: str = ""
    
    def _get_event_data(self) -> Dict[str, Any]:
        return {
            'product_id': str(self.product_id),
            'product_type': self.product_type,
            'old_price': str(self.old_price),
            'new_price': str(self.new_price),
            'currency': self.currency,
            'reason': self.reason
        }


# Booking Events
@dataclass
class CartItemAddedEvent(DomainEvent):
    """Event raised when item is added to cart"""
    cart_id: uuid.UUID = field(default_factory=uuid.uuid4)
    user_id: uuid.UUID = field(default_factory=uuid.uuid4)
    item_id: uuid.UUID = field(default_factory=uuid.uuid4)
    product_type: str = ""
    product_id: uuid.UUID = field(default_factory=uuid.uuid4)
    quantity: int = 1
    unit_price: Decimal = field(default=Decimal('0.00'))
    total_price: Decimal = field(default=Decimal('0.00'))
    currency: str = "USD"
    
    def _get_event_data(self) -> Dict[str, Any]:
        return {
            'cart_id': str(self.cart_id),
            'user_id': str(self.user_id),
            'item_id': str(self.item_id),
            'product_type': self.product_type,
            'product_id': str(self.product_id),
            'quantity': self.quantity,
            'unit_price': str(self.unit_price),
            'total_price': str(self.total_price),
            'currency': self.currency
        }


@dataclass
class OrderCreatedEvent(DomainEvent):
    """Event raised when order is created"""
    order_id: uuid.UUID = field(default_factory=uuid.uuid4)
    user_id: uuid.UUID = field(default_factory=uuid.uuid4)
    order_number: str = ""
    total_amount: Decimal = field(default=Decimal('0.00'))
    currency: str = "USD"
    items_count: int = 0
    
    def _get_event_data(self) -> Dict[str, Any]:
        return {
            'order_id': str(self.order_id),
            'user_id': str(self.user_id),
            'order_number': self.order_number,
            'total_amount': str(self.total_amount),
            'currency': self.currency,
            'items_count': self.items_count
        }


@dataclass
class OrderConfirmedEvent(DomainEvent):
    """Event raised when order is confirmed"""
    order_id: uuid.UUID = field(default_factory=uuid.uuid4)
    order_number: str = ""
    confirmed_by: uuid.UUID = field(default_factory=uuid.uuid4)
    confirmation_notes: str = ""
    
    def _get_event_data(self) -> Dict[str, Any]:
        return {
            'order_id': str(self.order_id),
            'order_number': self.order_number,
            'confirmed_by': str(self.confirmed_by),
            'confirmation_notes': self.confirmation_notes
        }


# Inventory Events
@dataclass
class SeatsReservedEvent(DomainEvent):
    """Event raised when seats are reserved"""
    event_id: uuid.UUID = field(default_factory=uuid.uuid4)
    performance_id: uuid.UUID = field(default_factory=uuid.uuid4)
    seat_ids: List[uuid.UUID] = field(default_factory=list)
    user_id: uuid.UUID = field(default_factory=uuid.uuid4)
    reservation_id: uuid.UUID = field(default_factory=uuid.uuid4)
    expires_at: datetime = field(default_factory=datetime.now)
    
    def _get_event_data(self) -> Dict[str, Any]:
        return {
            'event_id': str(self.event_id),
            'performance_id': str(self.performance_id),
            'seat_ids': [str(seat_id) for seat_id in self.seat_ids],
            'user_id': str(self.user_id),
            'reservation_id': str(self.reservation_id),
            'expires_at': self.expires_at.isoformat()
        }


@dataclass
class SeatsReleasedEvent(DomainEvent):
    """Event raised when seats are released"""
    event_id: uuid.UUID = field(default_factory=uuid.uuid4)
    performance_id: uuid.UUID = field(default_factory=uuid.uuid4)
    seat_ids: List[uuid.UUID] = field(default_factory=list)
    reason: str = ""  # timeout, cancellation, etc.
    
    def _get_event_data(self) -> Dict[str, Any]:
        return {
            'event_id': str(self.event_id),
            'performance_id': str(self.performance_id),
            'seat_ids': [str(seat_id) for seat_id in self.seat_ids],
            'reason': self.reason
        }


@dataclass
class CapacityUpdatedEvent(DomainEvent):
    """Event raised when capacity is updated"""
    product_id: uuid.UUID = field(default_factory=uuid.uuid4)
    product_type: str = ""
    old_capacity: int = 0
    new_capacity: int = 0
    available_capacity: int = 0
    reason: str = ""
    
    def _get_event_data(self) -> Dict[str, Any]:
        return {
            'product_id': str(self.product_id),
            'product_type': self.product_type,
            'old_capacity': self.old_capacity,
            'new_capacity': self.new_capacity,
            'available_capacity': self.available_capacity,
            'reason': self.reason
        }


# Payment Events
@dataclass
class PaymentInitiatedEvent(DomainEvent):
    """Event raised when payment is initiated"""
    payment_id: uuid.UUID = field(default_factory=uuid.uuid4)
    order_id: uuid.UUID = field(default_factory=uuid.uuid4)
    user_id: uuid.UUID = field(default_factory=uuid.uuid4)
    amount: Decimal = field(default=Decimal('0.00'))
    currency: str = "USD"
    payment_method: str = ""
    
    def _get_event_data(self) -> Dict[str, Any]:
        return {
            'payment_id': str(self.payment_id),
            'order_id': str(self.order_id),
            'user_id': str(self.user_id),
            'amount': str(self.amount),
            'currency': self.currency,
            'payment_method': self.payment_method
        }


@dataclass
class PaymentCompletedEvent(DomainEvent):
    """Event raised when payment is completed"""
    payment_id: uuid.UUID = field(default_factory=uuid.uuid4)
    order_id: uuid.UUID = field(default_factory=uuid.uuid4)
    transaction_id: str = ""
    amount: Decimal = field(default=Decimal('0.00'))
    currency: str = "USD"
    payment_method: str = ""
    
    def _get_event_data(self) -> Dict[str, Any]:
        return {
            'payment_id': str(self.payment_id),
            'order_id': str(self.order_id),
            'transaction_id': self.transaction_id,
            'amount': str(self.amount),
            'currency': self.currency,
            'payment_method': self.payment_method
        }


# Domain Event Publisher
class DomainEventPublisher:
    """Domain event publisher with handler management"""
    
    def __init__(self):
        self._handlers: Dict[str, List[callable]] = {}
        self._middleware: List[callable] = []
    
    def subscribe(self, event_type: str, handler: callable):
        """Subscribe to domain events"""
        if event_type not in self._handlers:
            self._handlers[event_type] = []
        self._handlers[event_type].append(handler)
    
    def unsubscribe(self, event_type: str, handler: callable):
        """Unsubscribe from domain events"""
        if event_type in self._handlers:
            try:
                self._handlers[event_type].remove(handler)
            except ValueError:
                pass
    
    def add_middleware(self, middleware: callable):
        """Add middleware to event processing"""
        self._middleware.append(middleware)
    
    def publish(self, event: DomainEvent):
        """Publish domain event"""
        # Apply middleware
        for middleware in self._middleware:
            event = middleware(event)
            if event is None:
                return  # Event was filtered out
        
        # Get handlers for this event type
        event_type = event.event_type
        handlers = self._handlers.get(event_type, [])
        
        # Also get handlers for the specific event class
        class_handlers = self._handlers.get(event.__class__.__name__, [])
        all_handlers = handlers + class_handlers
        
        # Execute handlers
        for handler in all_handlers:
            try:
                handler(event)
            except Exception as e:
                print(f"Error in event handler {handler.__name__}: {str(e)}")
                # In production, you might want to log this and/or retry
    
    def publish_all(self, events: List[DomainEvent]):
        """Publish multiple domain events"""
        for event in events:
            self.publish(event)


# Global event publisher instance
domain_event_publisher = DomainEventPublisher()


# Event handlers (examples)
def log_domain_event(event: DomainEvent):
    """Log domain events"""
    print(f"Domain Event: {event.event_type} - {event.to_json()}")


def send_notification_on_order_created(event: OrderCreatedEvent):
    """Send notification when order is created"""
    print(f"Sending notification for order {event.order_number}")


def update_inventory_on_seats_reserved(event: SeatsReservedEvent):
    """Update inventory when seats are reserved"""
    print(f"Updating inventory for {len(event.seat_ids)} seats")


# Register default handlers
domain_event_publisher.subscribe("OrderCreated", send_notification_on_order_created)
domain_event_publisher.subscribe("SeatsReserved", update_inventory_on_seats_reserved)
domain_event_publisher.add_middleware(log_domain_event) 