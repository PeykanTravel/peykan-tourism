"""
Repository interfaces for Tours domain.
Abstract interfaces without implementation details.
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from datetime import date
from .entities import Tour, TourCategory, TourSchedule, TourOption, TourReview, TourBooking


class SearchCriteria:
    """Value object for search criteria."""
    
    def __init__(self, 
                 query: Optional[str] = None,
                 category_id: Optional[str] = None,
                 min_price: Optional[float] = None,
                 max_price: Optional[float] = None,
                 min_duration: Optional[int] = None,
                 max_duration: Optional[int] = None,
                 date_from: Optional[date] = None,
                 date_to: Optional[date] = None,
                 includes_transfer: Optional[bool] = None,
                 includes_guide: Optional[bool] = None,
                 includes_meal: Optional[bool] = None,
                 tour_type: Optional[str] = None,
                 transport_type: Optional[str] = None,
                 sort_by: str = "created_desc",
                 page: int = 1,
                 page_size: int = 20):
        self.query = query
        self.category_id = category_id
        self.min_price = min_price
        self.max_price = max_price
        self.min_duration = min_duration
        self.max_duration = max_duration
        self.date_from = date_from
        self.date_to = date_to
        self.includes_transfer = includes_transfer
        self.includes_guide = includes_guide
        self.includes_meal = includes_meal
        self.tour_type = tour_type
        self.transport_type = transport_type
        self.sort_by = sort_by
        self.page = page
        self.page_size = page_size


class PaginatedResult:
    """Value object for paginated results."""
    
    def __init__(self, items: List[Any], total: int, page: int, page_size: int):
        self.items = items
        self.total = total
        self.page = page
        self.page_size = page_size
        self.total_pages = (total + page_size - 1) // page_size
        self.has_next = page < self.total_pages
        self.has_previous = page > 1


class TourRepository(ABC):
    """Repository interface for Tour entity."""
    
    @abstractmethod
    def get_by_id(self, tour_id: str) -> Optional[Tour]:
        """Get tour by ID."""
        pass
    
    @abstractmethod
    def get_by_slug(self, slug: str) -> Optional[Tour]:
        """Get tour by slug."""
        pass
    
    @abstractmethod
    def get_all(self, active_only: bool = True) -> List[Tour]:
        """Get all tours."""
        pass
    
    @abstractmethod
    def get_featured(self, limit: int = 6) -> List[Tour]:
        """Get featured tours."""
        pass
    
    @abstractmethod
    def search(self, criteria: SearchCriteria) -> PaginatedResult[Tour]:
        """Search tours with criteria."""
        pass
    
    @abstractmethod
    def save(self, tour: Tour) -> Tour:
        """Save tour."""
        pass
    
    @abstractmethod
    def delete(self, tour_id: str) -> bool:
        """Delete tour."""
        pass


class TourCategoryRepository(ABC):
    """Repository interface for TourCategory entity."""
    
    @abstractmethod
    def get_by_id(self, category_id: str) -> Optional[TourCategory]:
        """Get category by ID."""
        pass
    
    @abstractmethod
    def get_by_slug(self, slug: str) -> Optional[TourCategory]:
        """Get category by slug."""
        pass
    
    @abstractmethod
    def get_all(self, active_only: bool = True) -> List[TourCategory]:
        """Get all categories."""
        pass
    
    @abstractmethod
    def save(self, category: TourCategory) -> TourCategory:
        """Save category."""
        pass
    
    @abstractmethod
    def delete(self, category_id: str) -> bool:
        """Delete category."""
        pass


class TourScheduleRepository(ABC):
    """Repository interface for TourSchedule entity."""
    
    @abstractmethod
    def get_by_id(self, schedule_id: str) -> Optional[TourSchedule]:
        """Get schedule by ID."""
        pass
    
    @abstractmethod
    def get_by_tour_id(self, tour_id: str, available_only: bool = True) -> List[TourSchedule]:
        """Get schedules for a tour."""
        pass
    
    @abstractmethod
    def get_by_date_range(self, tour_id: str, start_date: date, end_date: date) -> List[TourSchedule]:
        """Get schedules in date range."""
        pass
    
    @abstractmethod
    def get_availability_calendar(self, tour_id: str, start_date: date, end_date: date) -> Dict[str, Any]:
        """Get availability calendar for a tour."""
        pass
    
    @abstractmethod
    def save(self, schedule: TourSchedule) -> TourSchedule:
        """Save schedule."""
        pass
    
    @abstractmethod
    def update_capacity(self, schedule_id: str, new_capacity: int) -> bool:
        """Update schedule capacity."""
        pass
    
    @abstractmethod
    def book_capacity(self, schedule_id: str, participants: int) -> bool:
        """Book capacity for a schedule."""
        pass
    
    @abstractmethod
    def release_capacity(self, schedule_id: str, participants: int) -> bool:
        """Release capacity for a schedule."""
        pass


class TourOptionRepository(ABC):
    """Repository interface for TourOption entity."""
    
    @abstractmethod
    def get_by_id(self, option_id: str) -> Optional[TourOption]:
        """Get option by ID."""
        pass
    
    @abstractmethod
    def get_by_tour_id(self, tour_id: str, available_only: bool = True) -> List[TourOption]:
        """Get options for a tour."""
        pass
    
    @abstractmethod
    def get_by_type(self, tour_id: str, option_type: str) -> List[TourOption]:
        """Get options by type for a tour."""
        pass
    
    @abstractmethod
    def save(self, option: TourOption) -> TourOption:
        """Save option."""
        pass
    
    @abstractmethod
    def delete(self, option_id: str) -> bool:
        """Delete option."""
        pass


class TourReviewRepository(ABC):
    """Repository interface for TourReview entity."""
    
    @abstractmethod
    def get_by_id(self, review_id: str) -> Optional[TourReview]:
        """Get review by ID."""
        pass
    
    @abstractmethod
    def get_by_tour_id(self, tour_id: str, verified_only: bool = True, 
                      page: int = 1, page_size: int = 10) -> PaginatedResult[TourReview]:
        """Get reviews for a tour."""
        pass
    
    @abstractmethod
    def get_by_user_id(self, user_id: str) -> List[TourReview]:
        """Get reviews by user."""
        pass
    
    @abstractmethod
    def get_user_review_for_tour(self, user_id: str, tour_id: str) -> Optional[TourReview]:
        """Get user's review for a specific tour."""
        pass
    
    @abstractmethod
    def save(self, review: TourReview) -> TourReview:
        """Save review."""
        pass
    
    @abstractmethod
    def delete(self, review_id: str) -> bool:
        """Delete review."""
        pass
    
    @abstractmethod
    def get_tour_stats(self, tour_id: str) -> Dict[str, Any]:
        """Get tour review statistics."""
        pass


class TourBookingRepository(ABC):
    """Repository interface for TourBooking entity."""
    
    @abstractmethod
    def get_by_id(self, booking_id: str) -> Optional[TourBooking]:
        """Get booking by ID."""
        pass
    
    @abstractmethod
    def get_by_reference(self, booking_reference: str) -> Optional[TourBooking]:
        """Get booking by reference."""
        pass
    
    @abstractmethod
    def get_by_user_id(self, user_id: str, page: int = 1, page_size: int = 10) -> PaginatedResult[TourBooking]:
        """Get bookings by user."""
        pass
    
    @abstractmethod
    def get_by_tour_id(self, tour_id: str, page: int = 1, page_size: int = 10) -> PaginatedResult[TourBooking]:
        """Get bookings for a tour."""
        pass
    
    @abstractmethod
    def get_by_schedule_id(self, schedule_id: str) -> List[TourBooking]:
        """Get bookings for a schedule."""
        pass
    
    @abstractmethod
    def save(self, booking: TourBooking) -> TourBooking:
        """Save booking."""
        pass
    
    @abstractmethod
    def update_status(self, booking_id: str, status: str) -> bool:
        """Update booking status."""
        pass
    
    @abstractmethod
    def cancel(self, booking_id: str) -> bool:
        """Cancel booking."""
        pass
    
    @abstractmethod
    def generate_booking_reference(self) -> str:
        """Generate unique booking reference."""
        pass


class PricingService(ABC):
    """Service interface for pricing calculations."""
    
    @abstractmethod
    def calculate_tour_pricing(self, tour_id: str, variant_id: str, schedule_id: str,
                              participants: Dict[str, int], selected_options: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate pricing for tour booking."""
        pass
    
    @abstractmethod
    def calculate_option_pricing(self, option_id: str, quantity: int, base_price: float) -> Dict[str, Any]:
        """Calculate pricing for tour option."""
        pass 