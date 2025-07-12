"""
Transfer services for business logic separation.
"""

from decimal import Decimal, InvalidOperation
from datetime import datetime, timedelta
from django.db.models import Q
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
import logging

from .models import TransferRoute, TransferRoutePricing, TransferOption, TransferBooking

logger = logging.getLogger(__name__)


class TransferPricingService:
    """Service for transfer pricing calculations."""
    
    @staticmethod
    def calculate_price(route, pricing, booking_time, return_time=None, selected_options=None):
        """Calculate transfer price with detailed breakdown using pricing_metadata."""
        try:
            # Use the new pricing_metadata-based calculation
            pricing_result = pricing.calculate_price(
                hour=booking_time.hour,
                is_round_trip=bool(return_time),
                selected_options=selected_options
            )
            
            # Structure the response according to TransferPriceResponseSerializer expectations
            return {
                'price_breakdown': {
                    'base_price': pricing_result['base_price'],
                    'time_surcharge': pricing_result['time_surcharge'],
                    'round_trip_discount': pricing_result['round_trip_discount'],
                    'options_total': pricing_result['options_total'],
                    'subtotal': pricing_result['subtotal'],
                    'final_price': pricing_result['final_price'],
                    'options_breakdown': pricing_result['options_breakdown'],
                    'pricing_type': pricing_result['pricing_type'],
                    'calculation_method': pricing_result['calculation_method']
                },
                'trip_info': {
                    'vehicle_type': pricing.vehicle_type,
                    'is_round_trip': bool(return_time),
                    'booking_time': booking_time.strftime('%H:%M'),
                    'return_time': return_time.strftime('%H:%M') if return_time else None
                },
                'route_info': {
                    'origin': route.origin,
                    'destination': route.destination,
                    'name': route.name or f"{route.origin} → {route.destination}"
                },
                'time_info': {
                    'booking_hour': booking_time.hour,
                    'time_category': TransferPricingService._get_time_category(booking_time.hour),
                    'surcharge_percentage': float(TransferPricingService._get_surcharge_percentage(route, booking_time.hour))
                }
            }
            
        except (InvalidOperation, ValueError) as e:
            logger.error(f"Decimal error in pricing: {e}")
            raise ValidationError('Invalid numeric value in pricing calculation.')
        except Exception as e:
            logger.error(f"Error calculating transfer price: {str(e)}")
            raise ValidationError('Failed to calculate price.')

    @staticmethod
    def _get_time_category(hour):
        """Get time category based on hour."""
        if 7 <= hour <= 9 or 17 <= hour <= 19:
            return 'peak'
        elif 22 <= hour <= 23 or 0 <= hour <= 6:
            return 'midnight'
        else:
            return 'normal'

    @staticmethod
    def _get_surcharge_percentage(route, hour):
        """Get surcharge percentage based on time."""
        if 7 <= hour <= 9 or 17 <= hour <= 19:
            return Decimal(str(route.peak_hour_surcharge))
        elif 22 <= hour <= 23 or 0 <= hour <= 6:
            return Decimal(str(route.midnight_surcharge))
        else:
            return Decimal('0.00')


class TransferRouteService:
    """Service for transfer route operations."""
    
    @staticmethod
    def get_popular_routes(limit=6):
        """Get popular routes for homepage."""
        try:
            routes = TransferRoute.objects.filter(
                is_active=True,
                is_popular=True
            ).prefetch_related('pricing')[:limit]
            
            return routes
        except Exception as e:
            logger.error(f"Error fetching popular routes: {str(e)}")
            return []
    
    @staticmethod
    def get_route_by_id(route_id):
        """Get route by ID."""
        try:
            route = TransferRoute.objects.get(id=route_id, is_active=True)
            return route
        except TransferRoute.DoesNotExist:
            raise ValidationError('Transfer route not found')
        except Exception as e:
            logger.error(f"Error fetching route by ID: {str(e)}")
            raise ValidationError('Failed to fetch route')
    
    @staticmethod
    def search_routes(query=None, origin=None, destination=None, vehicle_type=None):
        """Search routes with filters."""
        try:
            queryset = TransferRoute.objects.filter(is_active=True)
            
            if query:
                queryset = queryset.filter(
                    Q(name__icontains=query) |
                    Q(origin__icontains=query) |
                    Q(destination__icontains=query)
                )
            
            if origin:
                queryset = queryset.filter(origin__icontains=origin)
            
            if destination:
                queryset = queryset.filter(destination__icontains=destination)
            
            if vehicle_type:
                queryset = queryset.filter(pricing__vehicle_type=vehicle_type)
            
            return queryset.distinct()
        except Exception as e:
            logger.error(f"Error searching routes: {str(e)}")
            return TransferRoute.objects.none()


class TransferOptionService:
    """Service for transfer option operations."""
    
    @staticmethod
    def get_available_options_for_route(route):
        """Get available options for a route."""
        try:
            options = TransferOption.objects.filter(
                route=route,
                is_active=True
            )
            return options
        except Exception as e:
            logger.error(f"Error fetching options for route: {str(e)}")
            return []


class TransferBookingService:
    """Service for transfer booking operations."""
    
    @staticmethod
    def create_booking(user, route, pricing, booking_data):
        """Create a new transfer booking."""
        try:
            # Calculate pricing
            price_data = TransferPricingService.calculate_price(
                route=route,
                pricing=pricing,
                booking_time=booking_data['outbound_time'],
                return_time=booking_data.get('return_time'),
                selected_options=booking_data.get('selected_options', [])
            )
            
            # Create booking
            booking = TransferBooking.objects.create(
                user=user,
                route=route,
                pricing=pricing,
                trip_type=booking_data.get('trip_type', 'one_way'),
                outbound_date=booking_data['outbound_date'],
                outbound_time=booking_data['outbound_time'],
                return_date=booking_data.get('return_date'),
                return_time=booking_data.get('return_time'),
                passenger_count=booking_data.get('passenger_count', 1),
                luggage_count=booking_data.get('luggage_count', 0),
                pickup_address=booking_data.get('pickup_address', ''),
                pickup_instructions=booking_data.get('pickup_instructions', ''),
                dropoff_address=booking_data.get('dropoff_address', ''),
                dropoff_instructions=booking_data.get('dropoff_instructions', ''),
                contact_name=booking_data.get('contact_name', ''),
                contact_phone=booking_data.get('contact_phone', ''),
                selected_options=booking_data.get('selected_options', []),
                special_requirements=booking_data.get('special_requirements', ''),
                outbound_price=price_data['price_breakdown']['outbound_price'],
                return_price=price_data['price_breakdown']['return_price'],
                round_trip_discount=price_data['price_breakdown']['round_trip_discount'],
                options_total=price_data['price_breakdown']['options_total'],
                final_price=price_data['price_breakdown']['final_price']
            )
            
            return booking
        except Exception as e:
            logger.error(f"Error creating booking: {str(e)}")
            raise ValidationError('Failed to create booking')
    
    @staticmethod
    def cancel_booking(booking_id, user):
        """Cancel a booking."""
        try:
            booking = TransferBooking.objects.get(id=booking_id, user=user)
            
            if booking.status == 'cancelled':
                raise ValidationError('Booking is already cancelled')
            
            if booking.status == 'completed':
                raise ValidationError('Cannot cancel completed booking')
            
            booking.status = 'cancelled'
            booking.save()
            
            return booking
        except TransferBooking.DoesNotExist:
            raise ValidationError('Booking not found')
        except Exception as e:
            logger.error(f"Error cancelling booking: {str(e)}")
            raise ValidationError('Failed to cancel booking')