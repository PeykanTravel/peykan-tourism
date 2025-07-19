"""
Views for transfers app.
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from decimal import Decimal

from .models import TransferRoute, TransferRoutePricing, TransferOption, TransferBooking
from .serializers import (
    TransferRouteSerializer, TransferRouteDetailSerializer,
    TransferBookingSerializer, TransferBookingCreateSerializer,
    TransferSearchSerializer, TransferPriceCalculationSerializer,
    TransferPriceResponseSerializer, PopularRouteSerializer,
    TransferOptionSerializer
)
from .services import TransferPricingService


class TransferOptionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for transfer options.
    """
    queryset = TransferOption.objects.filter(is_active=True)
    serializer_class = TransferOptionSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['option_type']
    search_fields = ['name', 'description']
    ordering = ['option_type', 'name']


class TransferRouteViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for transfer routes.
    """
    queryset = TransferRoute.objects.filter(is_active=True).prefetch_related('pricing')
    serializer_class = TransferRouteSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['origin', 'destination', 'is_popular']
    search_fields = ['origin', 'destination']
    ordering_fields = ['origin', 'destination', 'created_at']
    ordering = ['origin']
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return TransferRouteDetailSerializer
        elif self.action == 'popular':
            return PopularRouteSerializer
        return TransferRouteSerializer
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get popular transfer routes."""
        popular_routes = self.queryset.filter(is_popular=True)[:6]
        serializer = self.get_serializer(popular_routes, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def available_routes(self, request):
        """Get all available transfer routes."""
        routes = self.get_queryset()
        serializer = self.get_serializer(routes, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def search(self, request):
        """Search transfer routes."""
        search_serializer = TransferSearchSerializer(data=request.data)
        if search_serializer.is_valid():
            data = search_serializer.validated_data
            queryset = self.get_queryset()
            
            # Apply filters
            if data.get('query'):
                queryset = queryset.filter(
                    Q(origin__icontains=data['query']) |
                    Q(destination__icontains=data['query'])
                )
            
            if data.get('origin'):
                queryset = queryset.filter(origin__icontains=data['origin'])
            
            if data.get('destination'):
                queryset = queryset.filter(destination__icontains=data['destination'])
            
            if data.get('vehicle_type'):
                queryset = queryset.filter(pricing__vehicle_type=data['vehicle_type'])
            
            if data.get('min_price'):
                queryset = queryset.filter(pricing__base_price__gte=data['min_price'])
            
            if data.get('max_price'):
                queryset = queryset.filter(pricing__base_price__lte=data['max_price'])
            
            # Apply sorting
            sort_by = data.get('sort_by', 'origin')
            if sort_by == 'price_asc':
                queryset = queryset.order_by('pricing__base_price')
            elif sort_by == 'price_desc':
                queryset = queryset.order_by('-pricing__base_price')
            elif sort_by == 'origin':
                queryset = queryset.order_by('origin')
            
            # Paginate results
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        
        return Response(search_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], url_path='by-slug/(?P<slug>[^/.]+)')
    def by_slug(self, request, slug=None):
        """Get transfer route by slug."""
        try:
            route = TransferRoute.objects.get(slug=slug, is_active=True)
            serializer = self.get_serializer(route)
            return Response(serializer.data)
        except TransferRoute.DoesNotExist:
            return Response(
                {'error': 'Transfer route not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def calculate_price(self, request, pk=None):
        """Calculate transfer price."""
        route = self.get_object()
        
        # Add route to request data
        data = request.data.copy()
        data['route_id'] = str(route.id)
        
        calculation_serializer = TransferPriceCalculationSerializer(data=data)
        if calculation_serializer.is_valid():
            validated_data = calculation_serializer.validated_data
            
            # Use the service to calculate price
            try:
                price_data = TransferPricingService.calculate_transfer_price(
                    route=validated_data['route'],
                    vehicle_type=validated_data['pricing'].vehicle_type,
                    trip_type='one_way',  # Default, can be enhanced
                    outbound_time=validated_data['booking_time'].strftime('%H:%M'),
                    return_time=validated_data.get('return_time').strftime('%H:%M') if validated_data.get('return_time') else None,
                    selected_options=validated_data.get('selected_options', [])
                )
                
                response_serializer = TransferPriceResponseSerializer(data=price_data)
                if response_serializer.is_valid():
                    return Response(response_serializer.data)
                else:
                    return Response(
                        {'error': 'Price calculation failed'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
            except Exception as e:
                return Response(
                    {'error': str(e)}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(calculation_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def calculate_price_public(self, request):
        """Public endpoint for transfer price calculation."""
        calculation_serializer = TransferPriceCalculationSerializer(data=request.data)
        if calculation_serializer.is_valid():
            validated_data = calculation_serializer.validated_data
            
            # Use the service to calculate price
            try:
                price_data = TransferPricingService.calculate_transfer_price(
                    route=validated_data['route'],
                    vehicle_type=validated_data['pricing'].vehicle_type,
                    trip_type='one_way',  # Default, can be enhanced
                    outbound_time=validated_data['booking_time'].strftime('%H:%M'),
                    return_time=validated_data.get('return_time').strftime('%H:%M') if validated_data.get('return_time') else None,
                    selected_options=validated_data.get('selected_options', [])
                )
                
                response_serializer = TransferPriceResponseSerializer(data=price_data)
                if response_serializer.is_valid():
                    return Response(response_serializer.data)
                else:
                    return Response(
                        {'error': 'Price calculation failed'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
            except Exception as e:
                return Response(
                    {'error': str(e)}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(calculation_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TransferBookingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for transfer bookings.
    """
    serializer_class = TransferBookingSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'trip_type']
    ordering_fields = ['created_at', 'outbound_date']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter bookings by user."""
        return TransferBooking.objects.filter(user=self.request.user).select_related('route', 'pricing')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TransferBookingCreateSerializer
        return TransferBookingSerializer
    
    def perform_create(self, serializer):
        """Create booking with user."""
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a booking."""
        booking = self.get_object()
        
        if booking.status == 'cancelled':
            return Response(
                {'error': 'Booking is already cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if booking.status == 'completed':
            return Response(
                {'error': 'Cannot cancel completed booking'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.status = 'cancelled'
        booking.save()
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming bookings."""
        from datetime import date
        today = date.today()
        
        upcoming_bookings = self.get_queryset().filter(
            outbound_date__gte=today,
            status__in=['pending', 'confirmed']
        )
        
        serializer = self.get_serializer(upcoming_bookings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def history(self, request):
        """Get booking history."""
        from datetime import date
        today = date.today()
        
        history_bookings = self.get_queryset().filter(
            Q(outbound_date__lt=today) | Q(status__in=['cancelled', 'completed'])
        )
        
        serializer = self.get_serializer(history_bookings, many=True)
        return Response(serializer.data) 