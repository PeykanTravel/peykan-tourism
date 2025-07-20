"""
Repository implementations for Tours domain.
Infrastructure layer with Django ORM integration.
"""

from typing import List, Optional, Dict, Any
from datetime import date
from django.db.models import Q, Avg, Count
from django.core.paginator import Paginator
from django.shortcuts import get_object_or_404

from ..domain.entities import (
    Tour, TourCategory, TourSchedule, TourOption, TourReview, TourBooking,
    Duration, Money, Capacity, Location, TourType, TransportType, OptionType
)
from ..domain.repositories import (
    TourRepository, TourCategoryRepository, TourScheduleRepository,
    TourOptionRepository, TourReviewRepository, TourBookingRepository,
    SearchCriteria, PaginatedResult, PricingService
)
from ..models import (
    Tour as TourModel, TourCategory as TourCategoryModel,
    TourSchedule as TourScheduleModel, TourOption as TourOptionModel,
    TourReview as TourReviewModel, TourBooking as TourBookingModel
)


class DjangoTourRepository(TourRepository):
    """Django ORM implementation of TourRepository."""
    
    def get_by_id(self, tour_id: str) -> Optional[Tour]:
        try:
            tour_model = TourModel.objects.get(id=tour_id, is_active=True)
            return self._map_to_domain(tour_model)
        except TourModel.DoesNotExist:
            return None
    
    def get_by_slug(self, slug: str) -> Optional[Tour]:
        try:
            tour_model = TourModel.objects.get(slug=slug, is_active=True)
            return self._map_to_domain(tour_model)
        except TourModel.DoesNotExist:
            return None
    
    def get_all(self, active_only: bool = True) -> List[Tour]:
        queryset = TourModel.objects.all()
        if active_only:
            queryset = queryset.filter(is_active=True)
        
        return [self._map_to_domain(tour) for tour in queryset]
    
    def get_featured(self, limit: int = 6) -> List[Tour]:
        tours = TourModel.objects.filter(
            is_active=True, 
            is_featured=True
        ).order_by('-created_at')[:limit]
        
        return [self._map_to_domain(tour) for tour in tours]
    
    def search(self, criteria: SearchCriteria) -> PaginatedResult[Tour]:
        queryset = TourModel.objects.filter(is_active=True)
        
        # Apply search filters
        if criteria.query:
            queryset = queryset.filter(
                Q(title__icontains=criteria.query) |
                Q(description__icontains=criteria.query) |
                Q(short_description__icontains=criteria.query) |
                Q(highlights__icontains=criteria.query)
            )
        
        if criteria.category_id:
            queryset = queryset.filter(category_id=criteria.category_id)
        
        if criteria.min_price:
            queryset = queryset.filter(price__gte=criteria.min_price)
        
        if criteria.max_price:
            queryset = queryset.filter(price__lte=criteria.max_price)
        
        if criteria.min_duration:
            queryset = queryset.filter(duration_hours__gte=criteria.min_duration)
        
        if criteria.max_duration:
            queryset = queryset.filter(duration_hours__lte=criteria.max_duration)
        
        if criteria.tour_type:
            queryset = queryset.filter(tour_type=criteria.tour_type)
        
        if criteria.transport_type:
            queryset = queryset.filter(transport_type=criteria.transport_type)
        
        # Apply sorting
        if criteria.sort_by == 'price_asc':
            queryset = queryset.order_by('price')
        elif criteria.sort_by == 'price_desc':
            queryset = queryset.order_by('-price')
        elif criteria.sort_by == 'duration_asc':
            queryset = queryset.order_by('duration_hours')
        elif criteria.sort_by == 'duration_desc':
            queryset = queryset.order_by('-duration_hours')
        elif criteria.sort_by == 'rating_desc':
            queryset = queryset.annotate(
                avg_rating=Avg('reviews__rating')
            ).order_by('-avg_rating')
        elif criteria.sort_by == 'created_asc':
            queryset = queryset.order_by('created_at')
        else:  # created_desc
            queryset = queryset.order_by('-created_at')
        
        # Paginate
        paginator = Paginator(queryset, criteria.page_size)
        page = paginator.get_page(criteria.page)
        
        tours = [self._map_to_domain(tour) for tour in page.object_list]
        
        return PaginatedResult(
            items=tours,
            total=paginator.count,
            page=criteria.page,
            page_size=criteria.page_size
        )
    
    def save(self, tour: Tour) -> Tour:
        # This would need to be implemented for creating/updating tours
        # For now, we'll just return the tour as-is
        return tour
    
    def delete(self, tour_id: str) -> bool:
        try:
            tour_model = TourModel.objects.get(id=tour_id)
            tour_model.is_active = False
            tour_model.save()
            return True
        except TourModel.DoesNotExist:
            return False
    
    def _map_to_domain(self, tour_model: TourModel) -> Tour:
        """Map Django model to domain entity."""
        from ..domain.entities import TourCategory
        
        # Get category
        category = TourCategory(
            id=str(tour_model.category.id),
            name=tour_model.category.name,
            description=tour_model.category.description,
            icon=tour_model.category.icon,
            color=tour_model.category.color,
            is_active=tour_model.category.is_active
        )
        
        # Create location
        location = Location(
            city=tour_model.city,
            country=tour_model.country
        )
        
        # Create duration
        duration = Duration(tour_model.duration_hours)
        
        # Create price
        price = Money(tour_model.price, tour_model.currency)
        
        # Create tour
        return Tour(
            id=str(tour_model.id),
            slug=tour_model.slug,
            name=tour_model.title,
            description=tour_model.description,
            short_description=tour_model.short_description,
            duration=duration,
            min_participants=tour_model.min_participants,
            max_participants=tour_model.max_participants,
            category=category,
            location=location,
            tour_type=TourType(tour_model.tour_type),
            transport_type=TransportType(tour_model.transport_type),
            price=price,
            highlights=tour_model.highlights.split(',') if tour_model.highlights else [],
            included=tour_model.included.split(',') if tour_model.included else [],
            excluded=tour_model.excluded.split(',') if tour_model.excluded else [],
            meeting_point=tour_model.meeting_point,
            cancellation_policy=tour_model.cancellation_policy,
            pickup_time=tour_model.pickup_time,
            start_time=tour_model.start_time,
            end_time=tour_model.end_time,
            booking_cutoff_hours=tour_model.booking_cutoff_hours,
            cancellation_hours=tour_model.cancellation_hours,
            refund_percentage=tour_model.refund_percentage,
            includes_transfer=tour_model.includes_transfer,
            includes_guide=tour_model.includes_guide,
            includes_meal=tour_model.includes_meal,
            includes_photographer=tour_model.includes_photographer,
            is_active=tour_model.is_active,
            is_featured=tour_model.is_featured,
            is_popular=tour_model.is_popular
        )


class DjangoTourCategoryRepository(TourCategoryRepository):
    """Django ORM implementation of TourCategoryRepository."""
    
    def get_by_id(self, category_id: str) -> Optional[TourCategory]:
        try:
            category_model = TourCategoryModel.objects.get(id=category_id, is_active=True)
            return self._map_to_domain(category_model)
        except TourCategoryModel.DoesNotExist:
            return None
    
    def get_by_slug(self, slug: str) -> Optional[TourCategory]:
        try:
            category_model = TourCategoryModel.objects.get(slug=slug, is_active=True)
            return self._map_to_domain(category_model)
        except TourCategoryModel.DoesNotExist:
            return None
    
    def get_all(self, active_only: bool = True) -> List[TourCategory]:
        queryset = TourCategoryModel.objects.all()
        if active_only:
            queryset = queryset.filter(is_active=True)
        
        return [self._map_to_domain(category) for category in queryset]
    
    def save(self, category: TourCategory) -> TourCategory:
        # Implementation for saving category
        return category
    
    def delete(self, category_id: str) -> bool:
        try:
            category_model = TourCategoryModel.objects.get(id=category_id)
            category_model.is_active = False
            category_model.save()
            return True
        except TourCategoryModel.DoesNotExist:
            return False
    
    def _map_to_domain(self, category_model: TourCategoryModel) -> TourCategory:
        """Map Django model to domain entity."""
        return TourCategory(
            id=str(category_model.id),
            name=category_model.name,
            description=category_model.description,
            icon=category_model.icon,
            color=category_model.color,
            is_active=category_model.is_active
        )


class DjangoTourScheduleRepository(TourScheduleRepository):
    """Django ORM implementation of TourScheduleRepository."""
    
    def get_by_id(self, schedule_id: str) -> Optional[TourSchedule]:
        try:
            schedule_model = TourScheduleModel.objects.get(id=schedule_id)
            return self._map_to_domain(schedule_model)
        except TourScheduleModel.DoesNotExist:
            return None
    
    def get_by_tour_id(self, tour_id: str, available_only: bool = True) -> List[TourSchedule]:
        queryset = TourScheduleModel.objects.filter(tour_id=tour_id)
        if available_only:
            queryset = queryset.filter(is_available=True)
        
        return [self._map_to_domain(schedule) for schedule in queryset]
    
    def get_by_date_range(self, tour_id: str, start_date: date, end_date: date) -> List[TourSchedule]:
        schedules = TourScheduleModel.objects.filter(
            tour_id=tour_id,
            start_date__gte=start_date,
            end_date__lte=end_date
        )
        
        return [self._map_to_domain(schedule) for schedule in schedules]
    
    def get_availability_calendar(self, tour_id: str, start_date: date, end_date: date) -> Dict[str, Any]:
        # Implementation for availability calendar
        return {
            'tour_id': tour_id,
            'calendar_data': []
        }
    
    def save(self, schedule: TourSchedule) -> TourSchedule:
        # Implementation for saving schedule
        return schedule
    
    def update_capacity(self, schedule_id: str, new_capacity: int) -> bool:
        try:
            schedule_model = TourScheduleModel.objects.get(id=schedule_id)
            schedule_model.current_capacity = new_capacity
            schedule_model.save()
            return True
        except TourScheduleModel.DoesNotExist:
            return False
    
    def book_capacity(self, schedule_id: str, participants: int) -> bool:
        try:
            schedule_model = TourScheduleModel.objects.get(id=schedule_id)
            if schedule_model.can_book(participants):
                schedule_model.book_capacity(participants)
                return True
            return False
        except TourScheduleModel.DoesNotExist:
            return False
    
    def release_capacity(self, schedule_id: str, participants: int) -> bool:
        try:
            schedule_model = TourScheduleModel.objects.get(id=schedule_id)
            return schedule_model.release_capacity(participants)
        except TourScheduleModel.DoesNotExist:
            return False
    
    def _map_to_domain(self, schedule_model: TourScheduleModel) -> TourSchedule:
        """Map Django model to domain entity."""
        # Create capacity
        capacity = Capacity(
            current=schedule_model.current_capacity,
            maximum=schedule_model.max_capacity
        )
        
        # Create price (assuming base price from tour)
        price = Money(schedule_model.tour.price, schedule_model.tour.currency)
        
        return TourSchedule(
            id=str(schedule_model.id),
            tour_id=str(schedule_model.tour.id),
            date=schedule_model.start_date,
            start_time=schedule_model.start_time,
            end_time=schedule_model.end_time,
            capacity=capacity,
            price=price,
            is_available=schedule_model.is_available,
            day_of_week=schedule_model.day_of_week
        )


class DjangoTourOptionRepository(TourOptionRepository):
    """Django ORM implementation of TourOptionRepository."""
    
    def get_by_id(self, option_id: str) -> Optional[TourOption]:
        try:
            option_model = TourOptionModel.objects.get(id=option_id)
            return self._map_to_domain(option_model)
        except TourOptionModel.DoesNotExist:
            return None
    
    def get_by_tour_id(self, tour_id: str, available_only: bool = True) -> List[TourOption]:
        queryset = TourOptionModel.objects.filter(tour_id=tour_id)
        if available_only:
            queryset = queryset.filter(is_available=True)
        
        return [self._map_to_domain(option) for option in queryset]
    
    def get_by_type(self, tour_id: str, option_type: str) -> List[TourOption]:
        options = TourOptionModel.objects.filter(
            tour_id=tour_id,
            option_type=option_type,
            is_available=True
        )
        
        return [self._map_to_domain(option) for option in options]
    
    def save(self, option: TourOption) -> TourOption:
        # Implementation for saving option
        return option
    
    def delete(self, option_id: str) -> bool:
        try:
            option_model = TourOptionModel.objects.get(id=option_id)
            option_model.is_active = False
            option_model.save()
            return True
        except TourOptionModel.DoesNotExist:
            return False
    
    def _map_to_domain(self, option_model: TourOptionModel) -> TourOption:
        """Map Django model to domain entity."""
        # Create price
        price = Money(option_model.price, option_model.currency)
        
        return TourOption(
            id=str(option_model.id),
            tour_id=str(option_model.tour.id),
            name=option_model.name,
            description=option_model.description,
            price=price,
            option_type=OptionType(option_model.option_type),
            max_quantity=option_model.max_quantity,
            is_available=option_model.is_available,
            price_percentage=option_model.price_percentage
        )


class DjangoTourReviewRepository(TourReviewRepository):
    """Django ORM implementation of TourReviewRepository."""
    
    def get_by_id(self, review_id: str) -> Optional[TourReview]:
        try:
            review_model = TourReviewModel.objects.get(id=review_id)
            return self._map_to_domain(review_model)
        except TourReviewModel.DoesNotExist:
            return None
    
    def get_by_tour_id(self, tour_id: str, verified_only: bool = True, 
                      page: int = 1, page_size: int = 10) -> PaginatedResult[TourReview]:
        queryset = TourReviewModel.objects.filter(tour_id=tour_id)
        if verified_only:
            queryset = queryset.filter(is_verified=True)
        
        queryset = queryset.order_by('-created_at')
        
        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)
        
        reviews = [self._map_to_domain(review) for review in page_obj.object_list]
        
        return PaginatedResult(
            items=reviews,
            total=paginator.count,
            page=page,
            page_size=page_size
        )
    
    def get_by_user_id(self, user_id: str) -> List[TourReview]:
        reviews = TourReviewModel.objects.filter(user_id=user_id)
        return [self._map_to_domain(review) for review in reviews]
    
    def get_user_review_for_tour(self, user_id: str, tour_id: str) -> Optional[TourReview]:
        try:
            review_model = TourReviewModel.objects.get(user_id=user_id, tour_id=tour_id)
            return self._map_to_domain(review_model)
        except TourReviewModel.DoesNotExist:
            return None
    
    def save(self, review: TourReview) -> TourReview:
        # Implementation for saving review
        return review
    
    def delete(self, review_id: str) -> bool:
        try:
            review_model = TourReviewModel.objects.get(id=review_id)
            review_model.delete()
            return True
        except TourReviewModel.DoesNotExist:
            return False
    
    def get_tour_stats(self, tour_id: str) -> Dict[str, Any]:
        reviews = TourReviewModel.objects.filter(tour_id=tour_id, is_verified=True)
        
        avg_rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 0
        review_count = reviews.count()
        
        return {
            'average_rating': round(avg_rating, 2),
            'review_count': review_count,
            'total_schedules': 0,  # Would need to be calculated
            'upcoming_schedules': 0  # Would need to be calculated
        }
    
    def _map_to_domain(self, review_model: TourReviewModel) -> TourReview:
        """Map Django model to domain entity."""
        return TourReview(
            id=str(review_model.id),
            tour_id=str(review_model.tour.id),
            user_id=str(review_model.user.id),
            rating=review_model.rating,
            title=review_model.title,
            comment=review_model.comment,
            is_verified=review_model.is_verified,
            is_helpful=review_model.is_helpful
        )


class DjangoTourBookingRepository(TourBookingRepository):
    """Django ORM implementation of TourBookingRepository."""
    
    def get_by_id(self, booking_id: str) -> Optional[TourBooking]:
        try:
            booking_model = TourBookingModel.objects.get(id=booking_id)
            return self._map_to_domain(booking_model)
        except TourBookingModel.DoesNotExist:
            return None
    
    def get_by_reference(self, booking_reference: str) -> Optional[TourBooking]:
        try:
            booking_model = TourBookingModel.objects.get(booking_reference=booking_reference)
            return self._map_to_domain(booking_model)
        except TourBookingModel.DoesNotExist:
            return None
    
    def get_by_user_id(self, user_id: str, page: int = 1, page_size: int = 10) -> PaginatedResult[TourBooking]:
        queryset = TourBookingModel.objects.filter(user_id=user_id).order_by('-created_at')
        
        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)
        
        bookings = [self._map_to_domain(booking) for booking in page_obj.object_list]
        
        return PaginatedResult(
            items=bookings,
            total=paginator.count,
            page=page,
            page_size=page_size
        )
    
    def get_by_tour_id(self, tour_id: str, page: int = 1, page_size: int = 10) -> PaginatedResult[TourBooking]:
        queryset = TourBookingModel.objects.filter(tour_id=tour_id).order_by('-created_at')
        
        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)
        
        bookings = [self._map_to_domain(booking) for booking in page_obj.object_list]
        
        return PaginatedResult(
            items=bookings,
            total=paginator.count,
            page=page,
            page_size=page_size
        )
    
    def get_by_schedule_id(self, schedule_id: str) -> List[TourBooking]:
        bookings = TourBookingModel.objects.filter(schedule_id=schedule_id)
        return [self._map_to_domain(booking) for booking in bookings]
    
    def save(self, booking: TourBooking) -> TourBooking:
        # Implementation for saving booking
        return booking
    
    def update_status(self, booking_id: str, status: str) -> bool:
        try:
            booking_model = TourBookingModel.objects.get(id=booking_id)
            booking_model.status = status
            booking_model.save()
            return True
        except TourBookingModel.DoesNotExist:
            return False
    
    def cancel(self, booking_id: str) -> bool:
        return self.update_status(booking_id, 'cancelled')
    
    def generate_booking_reference(self) -> str:
        import uuid
        return f"TOUR-{uuid.uuid4().hex[:8].upper()}"
    
    def _map_to_domain(self, booking_model: TourBookingModel) -> TourBooking:
        """Map Django model to domain entity."""
        # Create money objects
        adult_price = Money(booking_model.adult_price, booking_model.currency)
        child_price = Money(booking_model.child_price, booking_model.currency)
        infant_price = Money(booking_model.infant_price, booking_model.currency)
        options_total = Money(booking_model.options_total, booking_model.currency)
        
        return TourBooking(
            id=str(booking_model.id),
            tour_id=str(booking_model.tour.id),
            variant_id=str(booking_model.variant.id),
            schedule_id=str(booking_model.schedule.id),
            user_id=str(booking_model.user.id),
            booking_reference=booking_model.booking_reference,
            adult_count=booking_model.adult_count,
            child_count=booking_model.child_count,
            infant_count=booking_model.infant_count,
            adult_price=adult_price,
            child_price=child_price,
            infant_price=infant_price,
            selected_options=booking_model.selected_options,
            options_total=options_total,
            special_requirements=booking_model.special_requirements,
            status=booking_model.status
        ) 