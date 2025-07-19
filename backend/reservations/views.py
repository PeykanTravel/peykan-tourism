"""
API Views for Reservation System
"""

from django.shortcuts import render
from django.db import transaction
from django.utils import timezone
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter

from .models import Reservation, ReservationItem, ReservationHistory
from .serializers import (
    ReservationSerializer, ReservationCreateSerializer, ReservationItemSerializer,
    PricingCalculationSerializer, PricingResponseSerializer,
    AvailabilityCheckSerializer, AvailabilityResponseSerializer,
    ReservationStatusUpdateSerializer
)
from .domain.entities import ProductType, ReservationRequest
from .domain.product_services import ProductReservationFactory
from .domain.product_services import EventBookingData, TourBookingData, TransferBookingData


class ReservationViewSet(viewsets.ModelViewSet):
    """ViewSet for reservation operations."""
    
    serializer_class = ReservationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get reservations for current user."""
        user = self.request.user
        if user.is_staff:
            return Reservation.objects.all()
        return Reservation.objects.filter(user=user)
    
    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action == 'create':
            return ReservationCreateSerializer
        return ReservationSerializer
    
    def perform_create(self, serializer):
        """Create reservation with history tracking."""
        reservation = serializer.save()
        
        # Create history entry
        ReservationHistory.objects.create(
            reservation=reservation,
            from_status='',
            to_status='draft',
            changed_by=self.request.user,
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirm a reservation."""
        reservation = self.get_object()
        
        try:
            reservation.confirm()
            
            # Create history entry
            ReservationHistory.objects.create(
                reservation=reservation,
                from_status='pending',
                to_status='confirmed',
                changed_by=request.user,
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            return Response({
                'message': 'Reservation confirmed successfully',
                'status': reservation.status
            })
            
        except ValueError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a reservation."""
        reservation = self.get_object()
        
        try:
            old_status = reservation.status
            reservation.cancel()
            
            # Create history entry
            ReservationHistory.objects.create(
                reservation=reservation,
                from_status=old_status,
                to_status='cancelled',
                changed_by=request.user,
                reason=request.data.get('reason', ''),
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            return Response({
                'message': 'Reservation cancelled successfully',
                'status': reservation.status
            })
            
        except ValueError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update reservation status."""
        reservation = self.get_object()
        serializer = ReservationStatusUpdateSerializer(
            data=request.data,
            context={'request': request, 'reservation': reservation}
        )
        
        if serializer.is_valid():
            old_status = reservation.status
            reservation.status = serializer.validated_data['status']
            reservation.save()
            
            # Create history entry
            ReservationHistory.objects.create(
                reservation=reservation,
                from_status=old_status,
                to_status=reservation.status,
                changed_by=request.user,
                reason=serializer.validated_data.get('reason', ''),
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            return Response({
                'message': 'Status updated successfully',
                'status': reservation.status
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def calculate_pricing(request):
    """Calculate pricing for reservation."""
    serializer = PricingCalculationSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        data = serializer.validated_data
        product_type = ProductType(data['product_type'])
        
        # Create appropriate service
        service = ProductReservationFactory.create_service(product_type)
        
        # Calculate pricing based on product type
        if product_type == ProductType.EVENT:
            pricing = _calculate_event_pricing(data, service)
        elif product_type == ProductType.TOUR:
            pricing = _calculate_tour_pricing(data, service)
        elif product_type == ProductType.TRANSFER:
            pricing = _calculate_transfer_pricing(data, service)
        else:
            return Response({
                'error': 'Unsupported product type'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Serialize response
        response_serializer = PricingResponseSerializer(pricing)
        return Response(response_serializer.data)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def check_availability(request):
    """Check availability for reservation."""
    serializer = AvailabilityCheckSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        data = serializer.validated_data
        product_type = ProductType(data['product_type'])
        
        # Create appropriate service
        service = ProductReservationFactory.create_service(product_type)
        
        # Check availability
        is_available = service.check_availability(
            product_type,
            str(data['product_id']),
            data['booking_date'],
            data['booking_time'],
            data['quantity']
        )
        
        response_data = {
            'available': is_available,
            'message': 'Available' if is_available else 'Not available'
        }
        
        # Add product-specific details
        if product_type == ProductType.EVENT:
            response_data['details'] = _get_event_availability_details(data, service)
        elif product_type == ProductType.TOUR:
            response_data['details'] = _get_tour_availability_details(data, service)
        elif product_type == ProductType.TRANSFER:
            response_data['details'] = _get_transfer_availability_details(data, service)
        
        response_serializer = AvailabilityResponseSerializer(response_data)
        return Response(response_serializer.data)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def reserve_capacity(request):
    """Reserve capacity temporarily."""
    try:
        product_type = request.data.get('product_type')
        product_id = request.data.get('product_id')
        booking_date = request.data.get('booking_date')
        booking_time = request.data.get('booking_time')
        quantity = request.data.get('quantity', 1)
        
        if not all([product_type, product_id, booking_date, booking_time]):
            return Response({
                'error': 'Missing required fields'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create appropriate service
        service = ProductReservationFactory.create_service(ProductType(product_type))
        
        # Reserve capacity
        success = service.reserve_capacity(
            ProductType(product_type),
            str(product_id),
            booking_date,
            booking_time,
            quantity
        )
        
        if success:
            return Response({
                'message': 'Capacity reserved successfully',
                'expires_at': (timezone.now() + timedelta(minutes=30)).isoformat()
            })
        else:
            return Response({
                'error': 'Failed to reserve capacity'
            }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_reservation(request):
    """Create a new reservation."""
    serializer = ReservationCreateSerializer(
        data=request.data,
        context={'request': request}
    )
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        with transaction.atomic():
            reservation = serializer.save()
            
            # Set expiration time
            reservation.expires_at = timezone.now() + timedelta(minutes=30)
            reservation.save()
            
            response_serializer = ReservationSerializer(reservation)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Helper functions for pricing calculation
def _calculate_event_pricing(data, service):
    """Calculate pricing for event."""
    selected_seats = data.get('selected_seats', [])
    selected_options = data.get('selected_options', [])
    discount_code = data.get('discount_code')
    
    # Convert seat IDs to SeatInfo objects
    from .domain.product_services import SeatInfo
    seat_infos = []
    for seat_id in selected_seats:
        # In a real implementation, you would fetch seat details from database
        seat_infos.append(SeatInfo(
            id=str(seat_id),
            seat_number="1",
            row_number="1",
            section="A",
            price=100.00,
            currency="USD",
            status="available"
        ))
    
    return service.calculate_event_pricing(
        str(data.get('product_id')),
        str(data.get('performance_id')),
        seat_infos,
        selected_options,
        discount_code
    )


def _calculate_tour_pricing(data, service):
    """Calculate pricing for tour."""
    participants = data.get('participants', {})
    selected_options = data.get('selected_options', [])
    discount_code = data.get('discount_code')
    
    return service.calculate_tour_pricing(
        str(data.get('product_id')),
        str(data.get('variant_id')),
        participants,
        selected_options,
        discount_code
    )


def _calculate_transfer_pricing(data, service):
    """Calculate pricing for transfer."""
    selected_options = data.get('selected_options', [])
    discount_code = data.get('discount_code')
    
    return service.calculate_transfer_pricing(
        str(data.get('route_id')),
        data.get('vehicle_type'),
        data.get('trip_type'),
        data.get('pickup_date'),
        data.get('pickup_time'),
        data.get('return_date'),
        data.get('return_time'),
        selected_options,
        discount_code
    )


# Helper functions for availability details
def _get_event_availability_details(data, service):
    """Get event-specific availability details."""
    return {
        'available_seats': len(data.get('selected_seats', [])),
        'performance_id': str(data.get('performance_id'))
    }


def _get_tour_availability_details(data, service):
    """Get tour-specific availability details."""
    return {
        'available_capacity': 50,  # Mock data
        'schedule_id': str(data.get('variant_id'))
    }


def _get_transfer_availability_details(data, service):
    """Get transfer-specific availability details."""
    return {
        'available_vehicles': 5,  # Mock data
        'route_id': str(data.get('route_id'))
    } 