"""
Domain Services for Reservation System
Following Domain-Driven Design principles
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from decimal import Decimal
from datetime import date, time

from .entities import (
    Reservation, ReservationItem, ReservationRequest, 
    PricingBreakdown, ProductType, ReservationStatus
)


class ReservationService(ABC):
    """Abstract reservation service"""
    
    @abstractmethod
    def create_reservation(self, request: ReservationRequest, user_id: str) -> Reservation:
        """Create a new reservation"""
        pass
    
    @abstractmethod
    def get_reservation(self, reservation_id: str) -> Optional[Reservation]:
        """Get reservation by ID"""
        pass
    
    @abstractmethod
    def update_reservation(self, reservation_id: str, **kwargs) -> Reservation:
        """Update reservation"""
        pass
    
    @abstractmethod
    def cancel_reservation(self, reservation_id: str) -> Reservation:
        """Cancel reservation"""
        pass


class PricingService(ABC):
    """Abstract pricing service"""
    
    @abstractmethod
    def calculate_pricing(
        self, 
        product_type: ProductType, 
        product_id: str, 
        quantity: int = 1,
        variant_id: Optional[str] = None,
        selected_options: List[Dict[str, Any]] = None,
        discount_code: Optional[str] = None
    ) -> PricingBreakdown:
        """Calculate pricing for reservation"""
        pass


class AvailabilityService(ABC):
    """Abstract availability service"""
    
    @abstractmethod
    def check_availability(
        self, 
        product_type: ProductType, 
        product_id: str, 
        booking_date: date,
        booking_time: time,
        quantity: int = 1
    ) -> bool:
        """Check if product is available for booking"""
        pass
    
    @abstractmethod
    def reserve_capacity(
        self, 
        product_type: ProductType, 
        product_id: str, 
        booking_date: date,
        booking_time: time,
        quantity: int = 1
    ) -> bool:
        """Reserve capacity for booking"""
        pass


class ReservationValidationService:
    """Service for validating reservations"""
    
    @staticmethod
    def validate_reservation_request(request: ReservationRequest) -> List[str]:
        """Validate reservation request"""
        errors = []
        
        # Basic validation
        if request.quantity <= 0:
            errors.append("Quantity must be greater than 0")
        
        if request.booking_date < date.today():
            errors.append("Booking date cannot be in the past")
        
        # Product-specific validation
        if request.product_type == ProductType.TOUR:
            if request.quantity > 50:  # Max 50 people per tour
                errors.append("Maximum 50 people allowed per tour")
        
        elif request.product_type == ProductType.EVENT:
            if request.quantity > 10:  # Max 10 tickets per order
                errors.append("Maximum 10 tickets allowed per order")
        
        elif request.product_type == ProductType.TRANSFER:
            if request.quantity > 20:  # Max 20 passengers per transfer
                errors.append("Maximum 20 passengers allowed per transfer")
        
        return errors
    
    @staticmethod
    def validate_reservation(reservation: Reservation) -> List[str]:
        """Validate reservation"""
        errors = []
        
        if not reservation.items:
            errors.append("Reservation must have at least one item")
        
        if reservation.total_amount <= 0:
            errors.append("Reservation total must be greater than 0")
        
        if not reservation.customer_email:
            errors.append("Customer email is required")
        
        return errors


class ReservationWorkflowService:
    """Service for managing reservation workflow"""
    
    def __init__(self, reservation_service: ReservationService):
        self.reservation_service = reservation_service
    
    def start_reservation(self, request: ReservationRequest, user_id: str) -> Reservation:
        """Start reservation process"""
        # Validate request
        validation_service = ReservationValidationService()
        errors = validation_service.validate_reservation_request(request)
        if errors:
            raise ValueError(f"Invalid reservation request: {', '.join(errors)}")
        
        # Create reservation
        reservation = self.reservation_service.create_reservation(request, user_id)
        reservation.status = ReservationStatus.DRAFT
        
        return reservation
    
    def confirm_reservation(self, reservation_id: str) -> Reservation:
        """Confirm reservation"""
        reservation = self.reservation_service.get_reservation(reservation_id)
        if not reservation:
            raise ValueError("Reservation not found")
        
        if reservation.can_be_confirmed():
            reservation.confirm()
            return self.reservation_service.update_reservation(reservation_id, status=reservation.status)
        else:
            raise ValueError("Reservation cannot be confirmed")
    
    def cancel_reservation(self, reservation_id: str) -> Reservation:
        """Cancel reservation"""
        reservation = self.reservation_service.get_reservation(reservation_id)
        if not reservation:
            raise ValueError("Reservation not found")
        
        reservation.cancel()
        return self.reservation_service.update_reservation(reservation_id, status=reservation.status) 