"""
DRF Views for Events app.
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db.models import Q, Avg, Count, Min, Max
from django.utils.translation import gettext_lazy as _
from .models import (
    Event, EventCategory, Venue, Artist, TicketType, 
    EventPerformance, Seat, EventOption, EventReview,
    EventSection, SectionTicketType, EventDiscount, EventFee, EventPricingRule
)
from .serializers import (
    EventListSerializer, EventDetailSerializer, EventSearchSerializer,
    EventCategorySerializer, VenueSerializer, ArtistSerializer,
    EventReviewSerializer, EventReviewCreateSerializer, EventBookingSerializer,
    EventSectionSerializer, SectionTicketTypeSerializer,
    EventPricingCalculatorSerializer, EventDiscountSerializer, EventFeeSerializer,
    EventPricingRuleSerializer
)
from decimal import Decimal
from django.core.exceptions import ValidationError
from django.http import Http404
from datetime import datetime, timedelta
import json
from rest_framework.decorators import api_view


class EventCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for EventCategory model."""
    
    queryset = EventCategory.objects.filter(is_active=True)
    serializer_class = EventCategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['translations__name', 'translations__description']
    ordering_fields = ['translations__name', 'created_at']
    ordering = ['translations__name']


class VenueViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Venue model."""
    
    queryset = Venue.objects.all()
    serializer_class = VenueSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['translations__name', 'translations__description', 'translations__address', 'city', 'country']
    ordering_fields = ['translations__name', 'city', 'total_capacity']
    filterset_fields = ['city', 'country']
    ordering = ['translations__name']


class ArtistViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Artist model."""
    
    queryset = Artist.objects.all()
    serializer_class = ArtistSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['translations__name', 'translations__bio']
    ordering_fields = ['translations__name', 'created_at']
    ordering = ['translations__name']


class EventSectionViewSet(viewsets.ModelViewSet):
    """ViewSet for EventSection management."""
    
    queryset = EventSection.objects.all()
    serializer_class = EventSectionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        """Filter sections by performance."""
        queryset = super().get_queryset()
        performance_id = self.request.query_params.get('performance_id')
        if performance_id:
            queryset = queryset.filter(performance_id=performance_id)
        return queryset.select_related('performance')


class SectionTicketTypeViewSet(viewsets.ModelViewSet):
    """ViewSet for SectionTicketType management."""
    
    queryset = SectionTicketType.objects.all()
    serializer_class = SectionTicketTypeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        """Filter by section."""
        queryset = super().get_queryset()
        section_id = self.request.query_params.get('section_id')
        if section_id:
            queryset = queryset.filter(section_id=section_id)
        return queryset.select_related('section', 'ticket_type')


class EventCapacityViewSet(viewsets.ViewSet):
    """ViewSet for capacity management operations."""
    
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        """Get capacity summary for an event."""
        try:
            event = Event.objects.get(pk=pk)
            performances = event.performances.all()
            
            summary = {
                'event': {
                    'id': event.id,
                    'title': event.title,
                    'total_performances': performances.count()
                },
                'performances': []
            }
            
            for performance in performances:
                from events.capacity_manager import CapacityManager
                performance_summary = CapacityManager.get_capacity_summary(performance)
                summary['performances'].append(performance_summary)
            
            return Response(summary)
            
        except Event.DoesNotExist:
            return Response(
                {'error': 'Event not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def reserve_seats(self, request, pk=None):
        """Reserve seats for a performance."""
        try:
            performance = EventPerformance.objects.get(pk=pk)
            
            # Validate request data
            ticket_type_id = request.data.get('ticket_type_id')
            section_name = request.data.get('section_name')
            count = request.data.get('count', 1)
            
            if not all([ticket_type_id, section_name, count]):
                return Response(
                    {'error': 'Missing required fields: ticket_type_id, section_name, count'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Reserve seats
            from events.capacity_manager import CapacityManager
            success, result = CapacityManager.reserve_seats(
                performance, ticket_type_id, section_name, count
            )
            
            if success:
                return Response({
                    'message': f'Successfully reserved {count} seats',
                    'section_ticket': SectionTicketTypeSerializer(result).data
                })
            else:
                return Response(
                    {'error': result}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except EventPerformance.DoesNotExist:
            return Response(
                {'error': 'Performance not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def available_seats(self, request, pk=None):
        """Get available seats for a performance."""
        try:
            performance = EventPerformance.objects.get(pk=pk)
            
            # Get filters
            ticket_type_id = request.query_params.get('ticket_type_id')
            section_name = request.query_params.get('section_name')
            
            # Get available seats
            from events.capacity_manager import CapacityManager
            available_seats = CapacityManager.get_available_seats(
                performance, ticket_type_id, section_name
            )
            
            return Response({
                'performance_id': performance.id,
                'available_seats': SectionTicketTypeSerializer(available_seats, many=True).data
            })
            
        except EventPerformance.DoesNotExist:
            return Response(
                {'error': 'Performance not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class EventViewSet(viewsets.ModelViewSet):
    """ViewSet for Event model."""
    
    serializer_class = EventDetailSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filterset_fields = ['category', 'venue', 'is_active']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'date', 'price']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return EventListSerializer
        return EventDetailSerializer
    
    def get_queryset(self):
        """Get queryset with proper filtering."""
        queryset = Event.objects.filter(is_active=True).select_related(
            'category', 'venue'
        ).prefetch_related(
            'artists', 'ticket_types', 'options', 'performances__sections__ticket_types'
        )
        
        # Apply filters
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__slug=category)
        
        venue = self.request.query_params.get('venue')
        if venue:
            queryset = queryset.filter(venue__slug=venue)
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def capacity_info(self, request, pk=None):
        """Get detailed capacity information for an event."""
        try:
            event = self.get_object()
            performances = event.performances.all()
            
            capacity_info = {
                'event_id': event.id,
                'event_title': event.title,
                'performances': []
            }
            
            for performance in performances:
                performance_info = {
                    'id': performance.id,
                    'date': performance.date,
                    'start_time': performance.start_time,
                    'end_time': performance.end_time,
                    'is_available': performance.is_available,
                    'sections': []
                }
                
                for section in performance.sections.all():
                    section_info = {
                        'name': section.name,
                        'description': section.description,
                        'total_capacity': section.total_capacity,
                        'available_capacity': section.available_capacity,
                        'reserved_capacity': section.reserved_capacity,
                        'sold_capacity': section.sold_capacity,
                        'is_premium': section.is_premium,
                        'is_wheelchair_accessible': section.is_wheelchair_accessible,
                        'ticket_types': []
                    }
                    
                    for stt in section.ticket_types.all():
                        ticket_info = {
                            'id': stt.ticket_type.id,
                            'name': stt.ticket_type.name,
                            'description': stt.ticket_type.description,
                            'allocated_capacity': stt.allocated_capacity,
                            'available_capacity': stt.available_capacity,
                            'reserved_capacity': stt.reserved_capacity,
                            'sold_capacity': stt.sold_capacity,
                            'price_modifier': stt.price_modifier,
                            'final_price': stt.final_price
                        }
                        section_info['ticket_types'].append(ticket_info)
                    
                    performance_info['sections'].append(section_info)
                
                capacity_info['performances'].append(performance_info)
            
            return Response(capacity_info)
            
        except Event.DoesNotExist:
            return Response(
                {'error': 'Event not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search events with advanced filters."""
        queryset = self.get_queryset()
        
        # Search query
        query = request.query_params.get('q')
        if query:
            queryset = queryset.filter(
                Q(title__icontains=query) |
                Q(description__icontains=query) |
                Q(venue__name__icontains=query) |
                Q(artists__name__icontains=query)
            ).distinct()
        
        # Date filters
        date_from = request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(performances__date__gte=date_from)
        
        date_to = request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(performances__date__lte=date_to)
        
        # Price filters
        min_price = request.query_params.get('min_price')
        if min_price:
            queryset = queryset.filter(performances__sections__base_price__gte=min_price)
        
        max_price = request.query_params.get('max_price')
        if max_price:
            queryset = queryset.filter(performances__sections__base_price__lte=max_price)
        
        # Style filter
        style = request.query_params.get('style')
        if style:
            queryset = queryset.filter(style=style)
        
        # Pagination
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def performances(self, request, pk=None):
        """Get all performances for an event."""
        try:
            event = self.get_object()
            performances = event.performances.all().order_by('date', 'start_time')
            
            serializer = EventDetailSerializer(performances, many=True)
            return Response(serializer.data)
            
        except Event.DoesNotExist:
            return Response(
                {'error': 'Event not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'], url_path='performances/(?P<performance_id>[^/.]+)/seats')
    def performance_seats(self, request, performance_id=None):
        """Get available seats for a specific performance."""
        try:
            performance = EventPerformance.objects.get(id=performance_id)
            
            # Get filters
            section_name = request.query_params.get('section')
            ticket_type_id = request.query_params.get('ticket_type_id')
            
            # Get sections and their ticket types
            sections_data = []
            
            for section in performance.sections.all():
                if section_name and section.name != section_name:
                    continue
                
                section_data = {
                    'name': section.name,
                    'description': section.description,
                    'total_capacity': section.total_capacity,
                    'available_capacity': section.available_capacity,
                    'is_premium': section.is_premium,
                    'is_wheelchair_accessible': section.is_wheelchair_accessible,
                    'ticket_types': []
                }
                
                for stt in section.ticket_types.all():
                    if ticket_type_id and str(stt.ticket_type.id) != ticket_type_id:
                        continue
                    
                    ticket_data = {
                        'id': stt.ticket_type.id,
                        'name': stt.ticket_type.name,
                        'description': stt.ticket_type.description,
                        'allocated_capacity': stt.allocated_capacity,
                        'available_capacity': stt.available_capacity,
                        'price_modifier': stt.price_modifier,
                        'final_price': stt.final_price,
                        'benefits': stt.ticket_type.benefits
                    }
                    section_data['ticket_types'].append(ticket_data)
                
                if section_data['ticket_types']:
                    sections_data.append(section_data)
            
            return Response({
                'performance_id': performance.id,
                'performance_date': performance.date,
                'performance_time': performance.start_time,
                'sections': sections_data
            })
            
        except EventPerformance.DoesNotExist:
            return Response(
                {'error': 'Performance not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def reviews(self, request, pk=None):
        """Get reviews for an event."""
        try:
            event = self.get_object()
            reviews = event.reviews.all().order_by('-created_at')
            
            # Pagination
            page = self.paginate_queryset(reviews)
            if page is not None:
                serializer = EventReviewSerializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = EventReviewSerializer(reviews, many=True)
            return Response(serializer.data)
            
        except Event.DoesNotExist:
            return Response(
                {'error': 'Event not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_review(self, request, pk=None):
        """Add a review to an event."""
        try:
            event = self.get_object()
            serializer = EventReviewCreateSerializer(data=request.data)
            
            if serializer.is_valid():
                serializer.save(event=event, user=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Event.DoesNotExist:
            return Response(
                {'error': 'Event not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def book(self, request, pk=None):
        """Book an event."""
        try:
            event = self.get_object()
            serializer = EventBookingSerializer(data=request.data)
            
            if serializer.is_valid():
                booking = serializer.save(event=event, user=request.user)
                return Response({
                    'message': 'Booking created successfully',
                    'booking_id': booking.id,
                    'booking_reference': booking.booking_reference
                }, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Event.DoesNotExist:
            return Response(
                {'error': 'Event not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def calculate_pricing(self, request, pk=None):
        """Calculate pricing for event booking."""
        try:
            event = self.get_object()
            
            # Validate request data
            serializer = EventPricingCalculatorSerializer(data=request.data, context={'event': event})
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            # Get validated data
            data = serializer.validated_data
            performance_id = data.get('performance_id')
            ticket_type_id = data.get('ticket_type_id')
            section_name = data.get('section_name')
            quantity = data.get('quantity', 1)
            selected_options = data.get('selected_options', [])
            discount_code = data.get('discount_code', '')
            
            # Get performance
            try:
                performance = event.performances.get(id=performance_id)
            except EventPerformance.DoesNotExist:
                return Response(
                    {'error': 'Performance not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Calculate pricing using the pricing service
            from events.pricing_service import EventPriceCalculator
            
            calculator = EventPriceCalculator(event, performance)
            pricing_result = calculator.calculate_ticket_price(
                section_name=section_name,
                ticket_type_id=ticket_type_id,
                quantity=quantity,
                selected_options=selected_options,
                discount_code=discount_code
            )
            
            return Response(pricing_result)
            
        except Exception as e:
            return Response(
                {'error': f'Pricing calculation failed: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get_object(self):
        """Get event by slug or ID."""
        lookup_value = self.kwargs.get('pk')
        
        # Try to get by slug first
        try:
            return Event.objects.get(slug=lookup_value, is_active=True)
        except Event.DoesNotExist:
            pass
        
        # If not found by slug, try by ID
        try:
            return Event.objects.get(id=lookup_value, is_active=True)
        except Event.DoesNotExist:
            pass
        
        # If still not found, raise 404
        raise Http404("Event not found")




class EventReviewViewSet(viewsets.ModelViewSet):
    """ViewSet for EventReview model."""
    
    serializer_class = EventReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['rating', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        event_id = self.kwargs.get('event_pk')
        return EventReview.objects.filter(event_id=event_id)
    
    def perform_create(self, serializer):
        event_id = self.kwargs.get('event_pk')
        serializer.save(event_id=event_id, user=self.request.user)


class EventPricingViewSet(viewsets.ViewSet):
    """ViewSet for event pricing calculations."""
    
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    @action(detail=True, methods=['post'])
    def calculate_price(self, request, pk=None):
        """Calculate price for event tickets with options and discounts."""
        try:
            event = Event.objects.get(pk=pk)
            
            # Validate request data
            serializer = EventPricingCalculatorSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            data = serializer.validated_data
            performance_id = data.get('performance_id')
            section_name = data.get('section_name')
            ticket_type_id = data.get('ticket_type_id')
            quantity = data.get('quantity', 1)
            selected_options = data.get('selected_options', [])
            discount_code = data.get('discount_code')
            is_group_booking = data.get('is_group_booking', False)
            apply_fees = data.get('apply_fees', True)
            apply_taxes = data.get('apply_taxes', True)
            
            # Get performance
            try:
                performance = event.performances.get(id=performance_id)
            except EventPerformance.DoesNotExist:
                return Response(
                    {'error': 'Performance not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Calculate price using pricing service
            from events.pricing_service import EventPriceCalculator
            calculator = EventPriceCalculator(event, performance)
            
            try:
                pricing_result = calculator.calculate_ticket_price(
                    section_name=section_name,
                    ticket_type_id=str(ticket_type_id),
                    quantity=quantity,
                    selected_options=selected_options,
                    discount_code=discount_code,
                    is_group_booking=is_group_booking,
                    apply_fees=apply_fees,
                    apply_taxes=apply_taxes
                )
                
                return Response(pricing_result)
                
            except ValidationError as e:
                return Response(
                    {'error': str(e)}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Event.DoesNotExist:
            return Response(
                {'error': 'Event not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def pricing_info(self, request, pk=None):
        """Get pricing information for an event."""
        try:
            event = Event.objects.get(pk=pk)
            
            pricing_info = {
                'event_id': event.id,
                'event_title': event.title,
                'performances': []
            }
            
            for performance in event.performances.all():
                performance_info = {
                    'id': performance.id,
                    'date': performance.date,
                    'start_time': performance.start_time,
                    'end_time': performance.end_time,
                    'is_available': performance.is_available,
                    'sections': []
                }
                
                for section in performance.sections.all():
                    section_info = {
                        'name': section.name,
                        'description': section.description,
                        'base_price': section.base_price,
                        'total_capacity': section.total_capacity,
                        'available_capacity': section.available_capacity,
                        'is_premium': section.is_premium,
                        'is_wheelchair_accessible': section.is_wheelchair_accessible,
                        'ticket_types': []
                    }
                    
                    for stt in section.ticket_types.all():
                        ticket_info = {
                            'id': stt.ticket_type.id,
                            'name': stt.ticket_type.name,
                            'description': stt.ticket_type.description,
                            'price_modifier': stt.price_modifier,
                            'final_price': stt.final_price,
                            'allocated_capacity': stt.allocated_capacity,
                            'available_capacity': stt.available_capacity,
                            'benefits': stt.ticket_type.benefits
                        }
                        section_info['ticket_types'].append(ticket_info)
                    
                    performance_info['sections'].append(section_info)
                
                pricing_info['performances'].append(performance_info)
            
            return Response(pricing_info)
            
        except Event.DoesNotExist:
            return Response(
                {'error': 'Event not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class EventDiscountViewSet(viewsets.ModelViewSet):
    """ViewSet for EventDiscount management."""
    
    queryset = EventDiscount.objects.all()
    serializer_class = EventDiscountSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['code', 'name', 'description']
    ordering_fields = ['created_at', 'valid_from', 'valid_until']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter active discounts."""
        queryset = super().get_queryset()
        event_id = self.request.query_params.get('event_id')
        if event_id:
            queryset = queryset.filter(event_id=event_id, is_active=True)
        return queryset.filter(is_active=True)
    
    @action(detail=True, methods=['post'])
    def validate_code(self, request, pk=None):
        """Validate a discount code."""
        try:
            discount = self.get_object()
            
            if not discount.is_valid():
                return Response(
                    {'error': 'Discount code is not valid'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            amount = Decimal(request.data.get('amount', '0'))
            discount_amount = discount.calculate_discount(amount)
            
            return Response({
                'discount_id': discount.id,
                'discount_name': discount.name,
                'discount_type': discount.discount_type,
                'discount_value': discount.discount_value,
                'calculated_discount': discount_amount,
                'is_valid': True
            })
            
        except EventDiscount.DoesNotExist:
            return Response(
                {'error': 'Discount code not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class EventFeeViewSet(viewsets.ModelViewSet):
    """ViewSet for EventFee management."""
    
    queryset = EventFee.objects.all()
    serializer_class = EventFeeSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['fee_type', 'created_at']
    ordering = ['fee_type', 'name']
    
    def get_queryset(self):
        """Filter active fees."""
        queryset = super().get_queryset()
        event_id = self.request.query_params.get('event_id')
        if event_id:
            queryset = queryset.filter(event_id=event_id, is_active=True)
        return queryset.filter(is_active=True)


class EventPricingRuleViewSet(viewsets.ModelViewSet):
    """ViewSet for EventPricingRule management."""
    
    queryset = EventPricingRule.objects.all()
    serializer_class = EventPricingRuleSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['priority', 'created_at']
    ordering = ['-priority', 'name']
    
    def get_queryset(self):
        """Filter active rules."""
        queryset = super().get_queryset()
        event_id = self.request.query_params.get('event_id')
        if event_id:
            queryset = queryset.filter(event_id=event_id, is_active=True)
        return queryset.filter(is_active=True)
    
    @action(detail=True, methods=['post'])
    def test_rule(self, request, pk=None):
        """Test a pricing rule."""
        try:
            rule = self.get_object()
            base_price = Decimal(request.data.get('base_price', '0'))
            
            adjustment = rule.calculate_adjustment(base_price)
            
            return Response({
                'rule_id': rule.id,
                'rule_name': rule.name,
                'base_price': base_price,
                'adjustment': adjustment,
                'final_price': base_price + adjustment
            })
            
        except EventPricingRule.DoesNotExist:
            return Response(
                {'error': 'Pricing rule not found'}, 
                status=status.HTTP_404_NOT_FOUND
            ) 


@api_view(['GET'])
def event_filters(request):
    from .models import EventCategory, Venue
    
    # Get categories with translated fields
    categories = []
    for category in EventCategory.objects.filter(is_active=True):
        categories.append({
            'id': category.id,
            'name': category.name,
            'description': category.description,
            'icon': category.icon,
            'color': category.color,
        })
    
    # Get venues with translated fields
    venues = []
    for venue in Venue.objects.all():
        venues.append({
            'id': venue.id,
            'name': venue.name,
            'city': venue.city,
            'country': venue.country,
            'image': venue.image.url if venue.image else None,
        })
    
    styles = [
        {'value': 'music', 'label': 'Music'},
        {'value': 'sports', 'label': 'Sports'},
        {'value': 'theater', 'label': 'Theater'},
        {'value': 'festival', 'label': 'Festival'},
        {'value': 'conference', 'label': 'Conference'},
        {'value': 'exhibition', 'label': 'Exhibition'},
    ]
    
    return Response({
        'categories': categories,
        'venues': venues,
        'styles': styles,
    }) 