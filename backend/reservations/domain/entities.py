"""
Domain Entities for Reservation System
Following Domain-Driven Design principles
"""

from dataclasses import dataclass, field
from datetime import datetime, date, time
from decimal import Decimal
from typing import List, Dict, Optional, Any
from enum import Enum
import uuid


class ReservationStatus(Enum):
    """Reservation status enumeration"""
    DRAFT = "draft"
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class ProductType(Enum):
    """Product type enumeration"""
    TOUR = "tour"
    EVENT = "event"
    TRANSFER = "transfer"


class PaymentStatus(Enum):
    """Payment status enumeration"""
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"


@dataclass
class ReservationItem:
    """Individual item in a reservation"""
    id: uuid.UUID = field(default_factory=uuid.uuid4)
    product_type: ProductType = ProductType.TOUR
    product_id: uuid.UUID = field(default_factory=uuid.uuid4)
    product_title: str = ""
    product_slug: str = ""
    
    # Booking details
    booking_date: date = field(default_factory=date.today)
    booking_time: time = field(default_factory=lambda: time(12, 0))
    
    # Variant/Options
    variant_id: Optional[uuid.UUID] = None
    variant_name: str = ""
    
    # Quantity and pricing
    quantity: int = 1
    unit_price: Decimal = Decimal('0.00')
    total_price: Decimal = Decimal('0.00')
    currency: str = "USD"
    
    # Options
    selected_options: List[Dict[str, Any]] = field(default_factory=list)
    options_total: Decimal = Decimal('0.00')
    
    # Product-specific data
    booking_data: Dict[str, Any] = field(default_factory=dict)
    
    def calculate_total(self) -> Decimal:
        """Calculate total price including options"""
        return self.unit_price * self.quantity + self.options_total


@dataclass
class Reservation:
    """Reservation aggregate root"""
    id: uuid.UUID = field(default_factory=uuid.uuid4)
    user_id: Optional[uuid.UUID] = None
    agent_id: Optional[uuid.UUID] = None
    
    # Reservation details
    reservation_number: str = ""
    status: ReservationStatus = ReservationStatus.DRAFT
    payment_status: PaymentStatus = PaymentStatus.PENDING
    
    # Customer information
    customer_name: str = ""
    customer_email: str = ""
    customer_phone: str = ""
    
    # Pricing
    subtotal: Decimal = Decimal('0.00')
    tax_amount: Decimal = Decimal('0.00')
    total_amount: Decimal = Decimal('0.00')
    currency: str = "USD"
    
    # Items
    items: List[ReservationItem] = field(default_factory=list)
    
    # Metadata
    special_requirements: str = ""
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    
    def add_item(self, item: ReservationItem) -> None:
        """Add item to reservation"""
        self.items.append(item)
        self._recalculate_totals()
    
    def remove_item(self, item_id: uuid.UUID) -> None:
        """Remove item from reservation"""
        self.items = [item for item in self.items if item.id != item_id]
        self._recalculate_totals()
    
    def update_item(self, item_id: uuid.UUID, **kwargs) -> None:
        """Update item in reservation"""
        for item in self.items:
            if item.id == item_id:
                for key, value in kwargs.items():
                    if hasattr(item, key):
                        setattr(item, key, value)
                item.calculate_total()
                break
        self._recalculate_totals()
    
    def _recalculate_totals(self) -> None:
        """Recalculate reservation totals"""
        self.subtotal = sum(item.calculate_total() for item in self.items)
        # Tax calculation (10% for now)
        self.tax_amount = self.subtotal * Decimal('0.10')
        self.total_amount = self.subtotal + self.tax_amount
    
    def can_be_confirmed(self) -> bool:
        """Check if reservation can be confirmed"""
        return (
            self.status == ReservationStatus.PENDING and
            self.payment_status == PaymentStatus.PAID and
            len(self.items) > 0
        )
    
    def confirm(self) -> None:
        """Confirm reservation"""
        if not self.can_be_confirmed():
            raise ValueError("Reservation cannot be confirmed")
        self.status = ReservationStatus.CONFIRMED
        self.updated_at = datetime.now()
    
    def cancel(self) -> None:
        """Cancel reservation"""
        if self.status in [ReservationStatus.CONFIRMED, ReservationStatus.COMPLETED]:
            raise ValueError("Cannot cancel confirmed or completed reservation")
        self.status = ReservationStatus.CANCELLED
        self.updated_at = datetime.now()


@dataclass
class ReservationRequest:
    """Request for creating a reservation"""
    product_type: ProductType
    product_id: uuid.UUID
    booking_date: date
    booking_time: time
    quantity: int = 1
    variant_id: Optional[uuid.UUID] = None
    selected_options: List[Dict[str, Any]] = field(default_factory=list)
    special_requirements: str = ""
    
    def validate(self) -> List[str]:
        """Validate reservation request"""
        errors = []
        
        if self.quantity <= 0:
            errors.append("Quantity must be greater than 0")
        
        if self.booking_date < date.today():
            errors.append("Booking date cannot be in the past")
        
        return errors


@dataclass
class PricingBreakdown:
    """Pricing breakdown for reservation"""
    base_price: Decimal
    variant_price: Decimal = Decimal('0.00')
    options_total: Decimal = Decimal('0.00')
    subtotal: Decimal = Decimal('0.00')
    tax_amount: Decimal = Decimal('0.00')
    total_amount: Decimal = Decimal('0.00')
    currency: str = "USD"
    discount_amount: Decimal = Decimal('0.00')
    discount_code: str = ""
    
    def calculate_totals(self) -> None:
        """Calculate all totals"""
        self.subtotal = self.base_price + self.variant_price + self.options_total - self.discount_amount
        self.tax_amount = self.subtotal * Decimal('0.10')  # 10% tax
        self.total_amount = self.subtotal + self.tax_amount 