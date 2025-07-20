"""
Use Cases for Tours domain.
Application layer business logic.
"""

from typing import List, Optional, Dict, Any
from datetime import date
from ..domain.entities import Tour, TourCategory, TourSchedule, TourOption, TourReview, TourBooking
from ..domain.repositories import (
    TourRepository, TourCategoryRepository, TourScheduleRepository,
    TourOptionRepository, TourReviewRepository, TourBookingRepository,
    SearchCriteria, PaginatedResult, PricingService
)


class GetTourDetailsUseCase:
    """Use case for getting tour details."""
    
    def __init__(self, tour_repository: TourRepository):
        self._tour_repository = tour_repository
    
    def execute(self, slug: str) -> Tour:
        """Execute the use case."""
        if not slug:
            raise ValueError("Tour slug is required")
        
        tour = self._tour_repository.get_by_slug(slug)
        if not tour:
            raise ValueError(f"Tour with slug {slug} not found")
        
        if not tour.is_active:
            raise ValueError("Tour is not active")
        
        return tour


class SearchToursUseCase:
    """Use case for searching tours."""
    
    def __init__(self, tour_repository: TourRepository):
        self._tour_repository = tour_repository
    
    def execute(self, criteria: SearchCriteria) -> PaginatedResult[Tour]:
        """Execute the use case."""
        return self._tour_repository.search(criteria)


class GetFeaturedToursUseCase:
    """Use case for getting featured tours."""
    
    def __init__(self, tour_repository: TourRepository):
        self._tour_repository = tour_repository
    
    def execute(self, limit: int = 6) -> List[Tour]:
        """Execute the use case."""
        if limit <= 0:
            raise ValueError("Limit must be positive")
        
        return self._tour_repository.get_featured(limit)


class GetTourSchedulesUseCase:
    """Use case for getting tour schedules."""
    
    def __init__(self, tour_repository: TourRepository, schedule_repository: TourScheduleRepository):
        self._tour_repository = tour_repository
        self._schedule_repository = schedule_repository
    
    def execute(self, tour_slug: str, available_only: bool = True) -> List[TourSchedule]:
        """Execute the use case."""
        if not tour_slug:
            raise ValueError("Tour slug is required")
        
        tour = self._tour_repository.get_by_slug(tour_slug)
        if not tour:
            raise ValueError(f"Tour with slug {tour_slug} not found")
        
        return self._schedule_repository.get_by_tour_id(tour.id, available_only)


class GetTourOptionsUseCase:
    """Use case for getting tour options."""
    
    def __init__(self, tour_repository: TourRepository, option_repository: TourOptionRepository):
        self._tour_repository = tour_repository
        self._option_repository = option_repository
    
    def execute(self, tour_slug: str, available_only: bool = True) -> List[TourOption]:
        """Execute the use case."""
        if not tour_slug:
            raise ValueError("Tour slug is required")
        
        tour = self._tour_repository.get_by_slug(tour_slug)
        if not tour:
            raise ValueError(f"Tour with slug {tour_slug} not found")
        
        return self._option_repository.get_by_tour_id(tour.id, available_only)


class GetTourReviewsUseCase:
    """Use case for getting tour reviews."""
    
    def __init__(self, tour_repository: TourRepository, review_repository: TourReviewRepository):
        self._tour_repository = tour_repository
        self._review_repository = review_repository
    
    def execute(self, tour_slug: str, verified_only: bool = True, 
                page: int = 1, page_size: int = 10) -> PaginatedResult[TourReview]:
        """Execute the use case."""
        if not tour_slug:
            raise ValueError("Tour slug is required")
        
        tour = self._tour_repository.get_by_slug(tour_slug)
        if not tour:
            raise ValueError(f"Tour with slug {tour_slug} not found")
        
        return self._review_repository.get_by_tour_id(tour.id, verified_only, page, page_size)


class CreateTourReviewUseCase:
    """Use case for creating tour review."""
    
    def __init__(self, tour_repository: TourRepository, review_repository: TourReviewRepository):
        self._tour_repository = tour_repository
        self._review_repository = review_repository
    
    def execute(self, tour_slug: str, user_id: str, rating: int, 
                title: str, comment: str) -> TourReview:
        """Execute the use case."""
        if not tour_slug:
            raise ValueError("Tour slug is required")
        if not user_id:
            raise ValueError("User ID is required")
        if not 1 <= rating <= 5:
            raise ValueError("Rating must be between 1 and 5")
        if not title:
            raise ValueError("Review title is required")
        if not comment:
            raise ValueError("Review comment is required")
        
        tour = self._tour_repository.get_by_slug(tour_slug)
        if not tour:
            raise ValueError(f"Tour with slug {tour_slug} not found")
        
        # Check if user already reviewed this tour
        existing_review = self._review_repository.get_user_review_for_tour(user_id, tour.id)
        if existing_review:
            raise ValueError("User has already reviewed this tour")
        
        review = TourReview(
            id="",  # Will be set by repository
            tour_id=tour.id,
            user_id=user_id,
            rating=rating,
            title=title,
            comment=comment
        )
        
        return self._review_repository.save(review)


class CalculateTourPricingUseCase:
    """Use case for calculating tour pricing."""
    
    def __init__(self, tour_repository: TourRepository, 
                 schedule_repository: TourScheduleRepository,
                 option_repository: TourOptionRepository,
                 pricing_service: PricingService):
        self._tour_repository = tour_repository
        self._schedule_repository = schedule_repository
        self._option_repository = option_repository
        self._pricing_service = pricing_service
    
    def execute(self, tour_slug: str, variant_id: str, schedule_id: str,
                participants: Dict[str, int], selected_options: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Execute the use case."""
        if not tour_slug:
            raise ValueError("Tour slug is required")
        if not variant_id:
            raise ValueError("Variant ID is required")
        if not schedule_id:
            raise ValueError("Schedule ID is required")
        if not participants:
            raise ValueError("Participants are required")
        
        tour = self._tour_repository.get_by_slug(tour_slug)
        if not tour:
            raise ValueError(f"Tour with slug {tour_slug} not found")
        
        schedule = self._schedule_repository.get_by_id(schedule_id)
        if not schedule:
            raise ValueError(f"Schedule with ID {schedule_id} not found")
        
        if schedule.tour_id != tour.id:
            raise ValueError("Schedule does not belong to the specified tour")
        
        total_participants = sum(participants.values())
        if not tour.can_book(total_participants):
            raise ValueError(f"Cannot book tour with {total_participants} participants")
        
        if not schedule.can_book(total_participants):
            raise ValueError(f"Schedule cannot accommodate {total_participants} participants")
        
        return self._pricing_service.calculate_tour_pricing(
            tour.id, variant_id, schedule_id, participants, selected_options
        )


class BookTourUseCase:
    """Use case for booking a tour."""
    
    def __init__(self, tour_repository: TourRepository,
                 schedule_repository: TourScheduleRepository,
                 booking_repository: TourBookingRepository,
                 pricing_service: PricingService):
        self._tour_repository = tour_repository
        self._schedule_repository = schedule_repository
        self._booking_repository = booking_repository
        self._pricing_service = pricing_service
    
    def execute(self, tour_slug: str, variant_id: str, schedule_id: str,
                user_id: str, participants: Dict[str, int], 
                selected_options: List[Dict[str, Any]], 
                special_requirements: str = "") -> TourBooking:
        """Execute the use case."""
        if not tour_slug:
            raise ValueError("Tour slug is required")
        if not variant_id:
            raise ValueError("Variant ID is required")
        if not schedule_id:
            raise ValueError("Schedule ID is required")
        if not user_id:
            raise ValueError("User ID is required")
        if not participants:
            raise ValueError("Participants are required")
        
        tour = self._tour_repository.get_by_slug(tour_slug)
        if not tour:
            raise ValueError(f"Tour with slug {tour_slug} not found")
        
        schedule = self._schedule_repository.get_by_id(schedule_id)
        if not schedule:
            raise ValueError(f"Schedule with ID {schedule_id} not found")
        
        if schedule.tour_id != tour.id:
            raise ValueError("Schedule does not belong to the specified tour")
        
        total_participants = sum(participants.values())
        if not tour.can_book(total_participants):
            raise ValueError(f"Cannot book tour with {total_participants} participants")
        
        if not schedule.can_book(total_participants):
            raise ValueError(f"Schedule cannot accommodate {total_participants} participants")
        
        # Calculate pricing
        pricing_result = self._pricing_service.calculate_tour_pricing(
            tour.id, variant_id, schedule_id, participants, selected_options
        )
        
        # Create booking
        booking = TourBooking(
            id="",  # Will be set by repository
            tour_id=tour.id,
            variant_id=variant_id,
            schedule_id=schedule_id,
            user_id=user_id,
            booking_reference=self._booking_repository.generate_booking_reference(),
            adult_count=participants.get('adult', 0),
            child_count=participants.get('child', 0),
            infant_count=participants.get('infant', 0),
            adult_price=pricing_result['adult_price'],
            child_price=pricing_result['child_price'],
            infant_price=pricing_result['infant_price'],
            selected_options=selected_options,
            options_total=pricing_result['options_total'],
            special_requirements=special_requirements
        )
        
        # Save booking
        saved_booking = self._booking_repository.save(booking)
        
        # Update schedule capacity
        self._schedule_repository.book_capacity(schedule_id, total_participants)
        
        return saved_booking


class GetTourCategoriesUseCase:
    """Use case for getting tour categories."""
    
    def __init__(self, category_repository: TourCategoryRepository):
        self._category_repository = category_repository
    
    def execute(self, active_only: bool = True) -> List[TourCategory]:
        """Execute the use case."""
        return self._category_repository.get_all(active_only)


class GetTourAvailabilityUseCase:
    """Use case for getting tour availability."""
    
    def __init__(self, tour_repository: TourRepository, schedule_repository: TourScheduleRepository):
        self._tour_repository = tour_repository
        self._schedule_repository = schedule_repository
    
    def execute(self, tour_slug: str, start_date: date, end_date: date) -> Dict[str, Any]:
        """Execute the use case."""
        if not tour_slug:
            raise ValueError("Tour slug is required")
        if start_date >= end_date:
            raise ValueError("Start date must be before end date")
        
        tour = self._tour_repository.get_by_slug(tour_slug)
        if not tour:
            raise ValueError(f"Tour with slug {tour_slug} not found")
        
        return self._schedule_repository.get_availability_calendar(tour.id, start_date, end_date) 