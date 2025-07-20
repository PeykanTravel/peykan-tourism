"""
Domain Entities for Tours domain.
Pure business logic without any framework dependencies.
"""

from dataclasses import dataclass
from datetime import date, time
from decimal import Decimal
from typing import List, Optional, Dict, Any
from enum import Enum


class TourType(Enum):
    DAY = "day"
    NIGHT = "night"


class TransportType(Enum):
    BOAT = "boat"
    LAND = "land"
    AIR = "air"


class OptionType(Enum):
    SERVICE = "service"
    EQUIPMENT = "equipment"
    FOOD = "food"
    TRANSPORT = "transport"


# Value Objects
@dataclass(frozen=True)
class Duration:
    """Value object for duration."""
    hours: int
    
    def __post_init__(self):
        if self.hours <= 0:
            raise ValueError("Duration must be positive")
    
    def is_full_day(self) -> bool:
        return self.hours >= 8
    
    def is_half_day(self) -> bool:
        return 4 <= self.hours < 8
    
    def __str__(self) -> str:
        return f"{self.hours} hours"


@dataclass(frozen=True)
class Money:
    """Value object for money."""
    amount: Decimal
    currency: str
    
    def __post_init__(self):
        if self.amount < 0:
            raise ValueError("Amount cannot be negative")
        if not self.currency:
            raise ValueError("Currency cannot be empty")
    
    def add(self, other: 'Money') -> 'Money':
        if self.currency != other.currency:
            raise ValueError("Cannot add different currencies")
        return Money(self.amount + other.amount, self.currency)
    
    def multiply(self, factor: Decimal) -> 'Money':
        return Money(self.amount * factor, self.currency)
    
    def __str__(self) -> str:
        return f"{self.amount} {self.currency}"


@dataclass(frozen=True)
class Capacity:
    """Value object for capacity."""
    current: int
    maximum: int
    
    def __post_init__(self):
        if self.current < 0:
            raise ValueError("Current capacity cannot be negative")
        if self.maximum <= 0:
            raise ValueError("Maximum capacity must be positive")
        if self.current > self.maximum:
            raise ValueError("Current cannot exceed maximum")
    
    @property
    def available(self) -> int:
        return self.maximum - self.current
    
    def is_full(self) -> bool:
        return self.current >= self.maximum
    
    def can_accommodate(self, participants: int) -> bool:
        return self.current + participants <= self.maximum
    
    def add_participants(self, count: int) -> 'Capacity':
        return Capacity(self.current + count, self.maximum)


@dataclass(frozen=True)
class Location:
    """Value object for location."""
    city: str
    country: str
    
    def __post_init__(self):
        if not self.city:
            raise ValueError("City cannot be empty")
        if not self.country:
            raise ValueError("Country cannot be empty")
    
    def __str__(self) -> str:
        return f"{self.city}, {self.country}"


# Domain Entities
@dataclass
class TourCategory:
    """Domain entity for tour category."""
    id: str
    name: str
    description: str
    icon: str
    color: str
    is_active: bool = True
    
    def __post_init__(self):
        if not self.name:
            raise ValueError("Category name cannot be empty")


@dataclass
class Tour:
    """Domain entity for tour."""
    id: str
    slug: str
    name: str
    description: str
    short_description: str
    duration: Duration
    min_participants: int
    max_participants: int
    category: TourCategory
    location: Location
    tour_type: TourType
    transport_type: TransportType
    price: Money
    highlights: List[str]
    included: List[str]
    excluded: List[str]
    meeting_point: str
    cancellation_policy: str
    pickup_time: time
    start_time: time
    end_time: time
    booking_cutoff_hours: int
    cancellation_hours: int
    refund_percentage: int
    includes_transfer: bool
    includes_guide: bool
    includes_meal: bool
    includes_photographer: bool
    is_active: bool = True
    is_featured: bool = False
    is_popular: bool = False
    
    def __post_init__(self):
        if self.min_participants <= 0:
            raise ValueError("Min participants must be positive")
        if self.max_participants <= self.min_participants:
            raise ValueError("Max participants must be greater than min participants")
        if self.booking_cutoff_hours < 0:
            raise ValueError("Booking cutoff hours cannot be negative")
        if not 0 <= self.refund_percentage <= 100:
            raise ValueError("Refund percentage must be between 0 and 100")
    
    # Business Logic Methods
    def can_book(self, participants: int) -> bool:
        """Check if tour can be booked with given number of participants."""
        return (participants >= self.min_participants and 
                participants <= self.max_participants)
    
    def is_day_tour(self) -> bool:
        return self.tour_type == TourType.DAY
    
    def is_night_tour(self) -> bool:
        return self.tour_type == TourType.NIGHT
    
    def is_land_transport(self) -> bool:
        return self.transport_type == TransportType.LAND
    
    def is_boat_transport(self) -> bool:
        return self.transport_type == TransportType.BOAT
    
    def is_air_transport(self) -> bool:
        return self.transport_type == TransportType.AIR
    
    def has_highlight(self, highlight: str) -> bool:
        return highlight in self.highlights
    
    def includes_service(self, service: str) -> bool:
        return service in self.included
    
    def excludes_service(self, service: str) -> bool:
        return service in self.excluded
    
    def calculate_total_price(self, participants: int) -> Money:
        """Calculate total price for given number of participants."""
        if not self.can_book(participants):
            raise ValueError("Cannot book with given number of participants")
        return self.price.multiply(Decimal(participants))


@dataclass
class TourSchedule:
    """Domain entity for tour schedule."""
    id: str
    tour_id: str
    date: date
    start_time: time
    end_time: time
    capacity: Capacity
    price: Money
    is_available: bool
    day_of_week: int
    
    def __post_init__(self):
        if self.day_of_week not in range(7):
            raise ValueError("Day of week must be 0-6")
    
    # Business Logic Methods
    def can_book(self, participants: int) -> bool:
        """Check if schedule can be booked with given number of participants."""
        return self.is_available and self.capacity.can_accommodate(participants)
    
    def calculate_total_price(self, participants: int) -> Money:
        """Calculate total price for given number of participants."""
        return self.price.multiply(Decimal(participants))
    
    def is_in_past(self) -> bool:
        return self.date < date.today()
    
    def is_today(self) -> bool:
        return self.date == date.today()
    
    def is_in_future(self) -> bool:
        return self.date > date.today()
    
    def get_duration(self) -> Duration:
        """Calculate duration from start and end time."""
        start_minutes = self.start_time.hour * 60 + self.start_time.minute
        end_minutes = self.end_time.hour * 60 + self.end_time.minute
        hours = (end_minutes - start_minutes) / 60
        return Duration(int(hours))


@dataclass
class TourOption:
    """Domain entity for tour option."""
    id: str
    tour_id: str
    name: str
    description: str
    price: Money
    option_type: OptionType
    max_quantity: int
    is_available: bool
    price_percentage: Decimal = Decimal('0')
    
    def __post_init__(self):
        if self.max_quantity <= 0:
            raise ValueError("Max quantity must be positive")
        if self.price_percentage < 0:
            raise ValueError("Price percentage cannot be negative")
    
    # Business Logic Methods
    def can_add_to_booking(self, quantity: int) -> bool:
        """Check if option can be added to booking with given quantity."""
        return self.is_available and quantity > 0 and quantity <= self.max_quantity
    
    def calculate_total_price(self, quantity: int) -> Money:
        """Calculate total price for given quantity."""
        if not self.can_add_to_booking(quantity):
            raise ValueError("Invalid quantity for this option")
        return self.price.multiply(Decimal(quantity))
    
    def is_service(self) -> bool:
        return self.option_type == OptionType.SERVICE
    
    def is_equipment(self) -> bool:
        return self.option_type == OptionType.EQUIPMENT
    
    def is_food(self) -> bool:
        return self.option_type == OptionType.FOOD
    
    def is_transport(self) -> bool:
        return self.option_type == OptionType.TRANSPORT


@dataclass
class TourReview:
    """Domain entity for tour review."""
    id: str
    tour_id: str
    user_id: str
    rating: int
    title: str
    comment: str
    is_verified: bool = False
    is_helpful: int = 0
    
    def __post_init__(self):
        if not 1 <= self.rating <= 5:
            raise ValueError("Rating must be between 1 and 5")
        if not self.title:
            raise ValueError("Review title cannot be empty")
        if not self.comment:
            raise ValueError("Review comment cannot be empty")
        if self.is_helpful < 0:
            raise ValueError("Helpful count cannot be negative")
    
    def is_positive(self) -> bool:
        return self.rating >= 4
    
    def is_negative(self) -> bool:
        return self.rating <= 2
    
    def is_neutral(self) -> bool:
        return 3 <= self.rating <= 3


@dataclass
class TourBooking:
    """Domain entity for tour booking."""
    id: str
    tour_id: str
    variant_id: str
    schedule_id: str
    user_id: str
    booking_reference: str
    adult_count: int
    child_count: int
    infant_count: int
    adult_price: Money
    child_price: Money
    infant_price: Money
    selected_options: List[Dict[str, Any]]
    options_total: Money
    special_requirements: str
    status: str = "pending"
    
    def __post_init__(self):
        if self.adult_count < 0 or self.child_count < 0 or self.infant_count < 0:
            raise ValueError("Participant counts cannot be negative")
        if self.adult_count == 0 and self.child_count == 0 and self.infant_count == 0:
            raise ValueError("At least one participant is required")
    
    @property
    def total_participants(self) -> int:
        return self.adult_count + self.child_count + self.infant_count
    
    def calculate_subtotal(self) -> Money:
        """Calculate subtotal for participants."""
        adult_total = self.adult_price.multiply(Decimal(self.adult_count))
        child_total = self.child_price.multiply(Decimal(self.child_count))
        infant_total = self.infant_price.multiply(Decimal(self.infant_count))
        return adult_total.add(child_total).add(infant_total)
    
    def calculate_grand_total(self) -> Money:
        """Calculate grand total including options."""
        subtotal = self.calculate_subtotal()
        return subtotal.add(self.options_total)
    
    def can_cancel(self) -> bool:
        """Check if booking can be cancelled."""
        return self.status in ["pending", "confirmed"]
    
    def is_confirmed(self) -> bool:
        return self.status == "confirmed"
    
    def is_cancelled(self) -> bool:
        return self.status == "cancelled"
    
    def is_completed(self) -> bool:
        return self.status == "completed" 