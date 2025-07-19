"""
Product-specific reservation services and interfaces
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Dict, Any, Optional
from decimal import Decimal


@dataclass
class SeatInfo:
    """Information about a seat"""
    id: str
    seat_number: str
    row_number: str
    section: str
    price: Decimal
    currency: str = 'USD'
    status: str = 'available'
    is_wheelchair_accessible: bool = False
    is_premium: bool = False


@dataclass
class PricingResult:
    """Result of pricing calculation"""
    base_price: float
    variant_price: float
    options_total: float
    subtotal: float
    tax_amount: float
    total_amount: float
    currency: str
    discount_amount: float
    discount_code: str
    breakdown: Dict[str, Any]


@dataclass
class EventBookingData:
    """Event-specific booking data"""
    event_id: str
    performance_id: str
    selected_seats: List[SeatInfo]
    selected_options: List[Dict[str, Any]]


@dataclass
class TourBookingData:
    """Tour-specific booking data"""
    tour_id: str
    variant_id: str
    schedule_id: str
    participants: Dict[str, int]
    selected_options: List[Dict[str, Any]]


@dataclass
class TransferBookingData:
    """Transfer-specific booking data"""
    route_id: str
    vehicle_type: str
    trip_type: str
    pickup_date: str
    pickup_time: str
    return_date: Optional[str]
    return_time: Optional[str]
    passenger_count: int
    luggage_count: int
    pickup_address: str
    dropoff_address: str
    selected_options: List[Dict[str, Any]]


class ProductReservationService(ABC):
    """Abstract base class for product-specific reservation services"""
    
    @abstractmethod
    def check_availability(self, **kwargs) -> bool:
        """Check if product is available for booking"""
        pass
    
    @abstractmethod
    def reserve_capacity(self, **kwargs) -> bool:
        """Temporarily reserve product capacity"""
        pass
    
    @abstractmethod
    def calculate_pricing(self, **kwargs) -> PricingResult:
        """Calculate pricing for product booking"""
        pass
    
    @abstractmethod
    def create_reservation(self, **kwargs) -> Any:
        """Create product reservation"""
        pass


class EventReservationService(ProductReservationService):
    """Interface for event reservation service"""
    
    def check_availability(
        self,
        event_id: str,
        performance_id: str,
        seat_ids: List[str],
        booking_date: str,
        booking_time: str
    ) -> bool:
        """Check if seats are available for booking"""
        pass
    
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
        pass
    
    def calculate_pricing(
        self,
        event_id: str,
        performance_id: str,
        seat_infos: List[SeatInfo],
        selected_options: List[Dict[str, Any]],
        discount_code: Optional[str] = None
    ) -> PricingResult:
        """Calculate pricing for event booking"""
        pass
    
    def create_reservation(
        self,
        user_id: str,
        event_id: str,
        performance_id: str,
        seat_ids: List[str],
        customer_info: Dict[str, str],
        selected_options: List[Dict[str, Any]],
        pricing_result: PricingResult
    ) -> Any:
        """Create event reservation"""
        pass


class TourReservationService(ProductReservationService):
    """Interface for tour reservation service"""
    
    def check_availability(
        self,
        tour_id: str,
        variant_id: str,
        booking_date: str,
        booking_time: str,
        participants: Dict[str, int]
    ) -> bool:
        """Check if tour is available for booking"""
        pass
    
    def reserve_capacity(
        self,
        tour_id: str,
        variant_id: str,
        booking_date: str,
        booking_time: str,
        participants: Dict[str, int],
        duration_minutes: int = 30
    ) -> bool:
        """Temporarily reserve tour capacity"""
        pass
    
    def calculate_pricing(
        self,
        tour_id: str,
        variant_id: str,
        participants: Dict[str, int],
        selected_options: List[Dict[str, Any]],
        discount_code: Optional[str] = None
    ) -> PricingResult:
        """Calculate pricing for tour booking"""
        pass
    
    def create_reservation(
        self,
        user_id: str,
        tour_id: str,
        variant_id: str,
        schedule_id: str,
        participants: Dict[str, int],
        customer_info: Dict[str, str],
        selected_options: List[Dict[str, Any]],
        pricing_result: PricingResult
    ) -> Any:
        """Create tour reservation"""
        pass


class TransferReservationService(ProductReservationService):
    """Interface for transfer reservation service"""
    
    def check_availability(
        self,
        route_id: str,
        vehicle_type: str,
        trip_type: str,
        pickup_date: str,
        pickup_time: str,
        passenger_count: int,
        luggage_count: int
    ) -> bool:
        """Check if transfer is available for booking"""
        pass
    
    def reserve_capacity(
        self,
        route_id: str,
        vehicle_type: str,
        trip_type: str,
        pickup_date: str,
        pickup_time: str,
        passenger_count: int,
        luggage_count: int,
        duration_minutes: int = 30
    ) -> bool:
        """Temporarily reserve transfer capacity"""
        pass
    
    def calculate_pricing(
        self,
        route_id: str,
        vehicle_type: str,
        trip_type: str,
        passenger_count: int,
        luggage_count: int,
        selected_options: List[Dict[str, Any]],
        discount_code: Optional[str] = None
    ) -> PricingResult:
        """Calculate pricing for transfer booking"""
        pass
    
    def create_reservation(
        self,
        user_id: str,
        route_id: str,
        vehicle_type: str,
        trip_type: str,
        pickup_date: str,
        pickup_time: str,
        return_date: Optional[str],
        return_time: Optional[str],
        passenger_count: int,
        luggage_count: int,
        pickup_address: str,
        dropoff_address: str,
        customer_info: Dict[str, str],
        selected_options: List[Dict[str, Any]],
        pricing_result: PricingResult
    ) -> Any:
        """Create transfer reservation"""
        pass


class ProductReservationFactory:
    """Factory for creating product-specific reservation services"""
    
    @staticmethod
    def create_service(product_type: str) -> ProductReservationService:
        """Create a reservation service for the specified product type"""
        if product_type == 'event':
            from .implementations.event_service import EventReservationService
            return EventReservationService()
        elif product_type == 'tour':
            from .implementations.tour_service import TourReservationService
            return TourReservationService()
        elif product_type == 'transfer':
            from .implementations.transfer_service import TransferReservationService
            return TransferReservationService()
        else:
            raise ValueError(f"Unsupported product type: {product_type}")
    
    @staticmethod
    def get_supported_product_types() -> List[str]:
        """Get list of supported product types"""
        return ['event', 'tour', 'transfer'] 