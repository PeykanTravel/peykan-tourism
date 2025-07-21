"""
Transfer services for Peykan Tourism Platform.
"""

from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.db.models import Q, Sum, Count
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
from .models import (
    TransferRoute, TransferRoutePricing, TransferOption,
    TransferBooking
)
from shared.services import CurrencyConverterService


class TransferService:
    """
    Service for transfer-related operations.
    """
    
    @staticmethod
    def get_available_routes(filters: Dict = None) -> List[TransferRoute]:
        """
        Get available transfer routes with optional filters.
        """
        queryset = TransferRoute.objects.filter(is_active=True)
        
        if filters:
            if filters.get('origin'):
                queryset = queryset.filter(origin__icontains=filters['origin'])
            if filters.get('destination'):
                queryset = queryset.filter(destination__icontains=filters['destination'])
            if filters.get('is_popular'):
                queryset = queryset.filter(is_popular=filters['is_popular'])
            if filters.get('is_admin_selected'):
                queryset = queryset.filter(is_admin_selected=filters['is_admin_selected'])
        
        return queryset.select_related().prefetch_related('pricing')
    
    @staticmethod
    def get_route_by_slug(slug: str) -> Optional[TransferRoute]:
        """
        Get transfer route by slug.
        """
        try:
            return TransferRoute.objects.get(slug=slug, is_active=True)
        except TransferRoute.DoesNotExist:
            return None
    
    @staticmethod
    def search_routes(query: str, filters: Dict = None) -> List[TransferRoute]:
        """
        Search transfer routes.
        """
        queryset = TransferRoute.objects.filter(
            is_active=True
        ).filter(
            Q(origin__icontains=query) |
            Q(destination__icontains=query) |
            Q(translations__name__icontains=query)
        ).distinct()
        
        if filters:
            if filters.get('is_popular'):
                queryset = queryset.filter(is_popular=filters['is_popular'])
            if filters.get('is_admin_selected'):
                queryset = queryset.filter(is_admin_selected=filters['is_admin_selected'])
        
        return queryset.select_related().prefetch_related('pricing')
    
    @staticmethod
    def get_popular_routes(limit: int = 10) -> List[TransferRoute]:
        """
        Get popular transfer routes.
        """
        return TransferRoute.objects.filter(
            is_active=True,
            is_popular=True
        ).order_by('-popularity_score', '-booking_count')[:limit]
    
    @staticmethod
    def get_admin_selected_routes() -> List[TransferRoute]:
        """
        Get admin selected transfer routes.
        """
        return TransferRoute.objects.filter(
            is_active=True,
            is_admin_selected=True
        ).order_by('-popularity_score')


class TransferPricingService:
    """
    Service for transfer pricing calculations.
    """
    
    @staticmethod
    def calculate_transfer_price(
        route: TransferRoute,
        vehicle_type: str,
        trip_type: str = 'one_way',
        outbound_date: str = None,
        outbound_time: str = None,
        return_date: str = None,
        return_time: str = None,
        selected_options: List[Dict] = None,
        user_currency: str = 'USD'
    ) -> Dict[str, Any]:
        """
        Calculate total price for transfer booking.
        """
        # Get pricing for vehicle type
        try:
            pricing = TransferRoutePricing.objects.get(
                route=route,
                vehicle_type=vehicle_type,
                is_active=True
            )
        except TransferRoutePricing.DoesNotExist:
            raise ValidationError(f"No pricing available for {vehicle_type} on this route")
        
        # Calculate outbound price
        outbound_hour = TransferPricingService._get_hour_from_time(outbound_time)
        outbound_price = TransferPricingService._calculate_leg_price(
            pricing, route, outbound_hour
        )
        
        # Calculate return price (if round trip)
        return_price = Decimal('0.00')
        if trip_type == 'round_trip' and return_date and return_time:
            return_hour = TransferPricingService._get_hour_from_time(return_time)
            return_price = TransferPricingService._calculate_leg_price(
                pricing, route, return_hour
            )
        
        # Calculate options total
        options_total = TransferPricingService._calculate_options_total(
            selected_options or [], outbound_price + return_price
        )
        
        # Calculate round trip discount
        round_trip_discount = Decimal('0.00')
        if trip_type == 'round_trip' and route.round_trip_discount_enabled:
            base_total = outbound_price + return_price
            round_trip_discount = base_total * (route.round_trip_discount_percentage / 100)
        
        # Calculate final price
        final_price = outbound_price + return_price + options_total - round_trip_discount
        
        # Convert currency if needed
        if user_currency != 'USD':  # Assuming USD is base currency
            final_price = CurrencyConverterService.convert_currency(
                final_price, 'USD', user_currency
            )
            outbound_price = CurrencyConverterService.convert_currency(
                outbound_price, 'USD', user_currency
            )
            return_price = CurrencyConverterService.convert_currency(
                return_price, 'USD', user_currency
            )
            options_total = CurrencyConverterService.convert_currency(
                options_total, 'USD', user_currency
            )
            round_trip_discount = CurrencyConverterService.convert_currency(
                round_trip_discount, 'USD', user_currency
            )
        
        # Return the structure expected by TransferPriceResponseSerializer
        return {
            'price_breakdown': {
                'base_price': float(pricing.base_price),
                'outbound_price': float(outbound_price),
                'outbound_surcharge': float(outbound_price - pricing.base_price),
                'return_price': float(return_price),
                'return_surcharge': float(return_price - pricing.base_price) if return_price > 0 else 0,
                'options_total': float(options_total),
                'round_trip_discount': float(round_trip_discount),
                'final_price': float(final_price)
            },
            'trip_info': {
                'vehicle_type': vehicle_type,
                'is_round_trip': trip_type == 'round_trip',
                'booking_time': outbound_time,
                'return_time': return_time
            },
            'route_info': {
                'origin': route.origin,
                'destination': route.destination,
                'name': route.name or f"{route.origin} → {route.destination}"
            },
            'time_info': {
                'booking_hour': outbound_hour,
                'time_category': TransferPricingService._get_time_category(outbound_hour),
                'surcharge_percentage': TransferPricingService._get_surcharge_percentage(route, outbound_hour)
            }
        }
    
    @staticmethod
    def _get_hour_from_time(time_str: str) -> int:
        """
        Extract hour from time string.
        """
        if not time_str:
            return 12  # Default to noon
        
        try:
            time_obj = datetime.strptime(time_str, '%H:%M').time()
            return time_obj.hour
        except ValueError:
            return 12
    
    @staticmethod
    def _calculate_leg_price(pricing: TransferRoutePricing, route: TransferRoute, hour: int) -> Decimal:
        """
        Calculate price for one leg of the journey.
        """
        base_price = pricing.base_price
        
        # Add time-based surcharges
        time_surcharge = route.calculate_time_surcharge(base_price, hour)
        
        return base_price + time_surcharge
    
    @staticmethod
    def _calculate_options_total(selected_options: List[Dict], base_price: Decimal) -> Decimal:
        """
        Calculate total for selected options.
        """
        total = Decimal('0.00')
        
        for option_data in selected_options:
            try:
                option = TransferOption.objects.get(
                    id=option_data['option_id'],
                    is_active=True
                )
                quantity = option_data.get('quantity', 1)
                
                if option.price_type == 'fixed':
                    total += option.price * quantity
                else:  # percentage
                    total += (base_price * option.price_percentage / 100) * quantity
                    
            except TransferOption.DoesNotExist:
                continue
        
        return total
    
    @staticmethod
    def _get_time_category(hour: int) -> str:
        """Get time category for the given hour."""
        if 7 <= hour <= 9 or 17 <= hour <= 19:
            return 'peak_hours'
        elif 22 <= hour <= 23 or 0 <= hour <= 6:
            return 'midnight_hours'
        else:
            return 'normal_hours'
    
    @staticmethod
    def _get_surcharge_percentage(route: TransferRoute, hour: int) -> float:
        """Get surcharge percentage for the given hour."""
        if 7 <= hour <= 9 or 17 <= hour <= 19:
            return float(route.peak_hour_surcharge or 0)
        elif 22 <= hour <= 23 or 0 <= hour <= 6:
            return float(route.midnight_surcharge or 0)
        else:
            return 0.0


class TransferBookingService:
    """
    Service for transfer booking operations.
    """
    
    @staticmethod
    @transaction.atomic
    def create_transfer_booking(
        user,
        route: TransferRoute,
        vehicle_type: str,
        trip_type: str,
        outbound_date: str,
        outbound_time: str,
        passenger_count: int,
        luggage_count: int,
        pickup_address: str,
        dropoff_address: str,
        contact_name: str,
        contact_phone: str,
        return_date: str = None,
        return_time: str = None,
        selected_options: List[Dict] = None,
        pickup_instructions: str = '',
        dropoff_instructions: str = '',
        special_requirements: str = ''
    ) -> TransferBooking:
        """
        Create a new transfer booking.
        """
        # Get pricing
        try:
            pricing = TransferRoutePricing.objects.get(
                route=route,
                vehicle_type=vehicle_type,
                is_active=True
            )
        except TransferRoutePricing.DoesNotExist:
            raise ValidationError(f"No pricing available for {vehicle_type} on this route")
        
        # Validate capacity
        TransferBookingService._validate_capacity(
            pricing, passenger_count, luggage_count
        )
        
        # Calculate pricing
        pricing_data = TransferPricingService.calculate_transfer_price(
            route=route,
            vehicle_type=vehicle_type,
            trip_type=trip_type,
            outbound_date=outbound_date,
            outbound_time=outbound_time,
            return_date=return_date,
            return_time=return_time,
            selected_options=selected_options,
            user_currency=user.preferred_currency
        )
        
        # Generate booking reference
        booking_reference = TransferBookingService._generate_booking_reference()
        
        # Create booking
        booking = TransferBooking.objects.create(
            route=route,
            pricing=pricing,
            user=user,
            booking_reference=booking_reference,
            trip_type=trip_type,
            outbound_date=outbound_date,
            outbound_time=outbound_time,
            outbound_price=pricing_data['outbound_price'],
            return_date=return_date,
            return_time=return_time,
            return_price=pricing_data['return_price'],
            passenger_count=passenger_count,
            luggage_count=luggage_count,
            pickup_address=pickup_address,
            pickup_instructions=pickup_instructions,
            dropoff_address=dropoff_address,
            dropoff_instructions=dropoff_instructions,
            contact_name=contact_name,
            contact_phone=contact_phone,
            round_trip_discount=pricing_data['round_trip_discount'],
            options_total=pricing_data['options_total'],
            final_price=pricing_data['final_price'],
            selected_options=selected_options or [],
            special_requirements=special_requirements
        )
        
        # Update route statistics
        TransferBookingService._update_route_statistics(route)
        
        return booking
    
    @staticmethod
    def _validate_capacity(pricing: TransferRoutePricing, passenger_count: int, luggage_count: int) -> None:
        """
        Validate that the vehicle can accommodate passengers and luggage.
        """
        if passenger_count > pricing.max_passengers:
            raise ValidationError(
                f"Vehicle can only accommodate {pricing.max_passengers} passengers, "
                f"but {passenger_count} were requested."
            )
        
        if luggage_count > pricing.max_luggage:
            raise ValidationError(
                f"Vehicle can only accommodate {pricing.max_luggage} pieces of luggage, "
                f"but {luggage_count} were requested."
            )
    
    @staticmethod
    def _generate_booking_reference() -> str:
        """
        Generate unique booking reference.
        """
        import random
        import string
        
        # Generate a unique reference
        while True:
            reference = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
            if not TransferBooking.objects.filter(booking_reference=reference).exists():
                return reference
    
    @staticmethod
    def _update_route_statistics(route: TransferRoute) -> None:
        """
        Update route booking statistics.
        """
        route.booking_count += 1
        route.popularity_score += 1
        route.save()


class TransferSearchService:
    """
    Service for transfer search and filtering.
    """
    
    @staticmethod
    def search_transfers(
        origin: str = None,
        destination: str = None,
        date: str = None,
        passengers: int = None,
        luggage: int = None,
        vehicle_type: str = None,
        is_popular: bool = None,
        is_admin_selected: bool = None
    ) -> List[TransferRoute]:
        """
        Search transfer routes with various filters.
        """
        queryset = TransferRoute.objects.filter(is_active=True)
        
        # Text search
        if origin:
            queryset = queryset.filter(origin__icontains=origin)
        if destination:
            queryset = queryset.filter(destination__icontains=destination)
        
        # Filter by popularity
        if is_popular is not None:
            queryset = queryset.filter(is_popular=is_popular)
        if is_admin_selected is not None:
            queryset = queryset.filter(is_admin_selected=is_admin_selected)
        
        # Filter by vehicle availability
        if vehicle_type:
            queryset = queryset.filter(pricing__vehicle_type=vehicle_type, pricing__is_active=True)
        
        # Filter by capacity
        if passengers or luggage:
            queryset = queryset.filter(
                pricing__is_active=True
            )
            if passengers:
                queryset = queryset.filter(pricing__max_passengers__gte=passengers)
            if luggage:
                queryset = queryset.filter(pricing__max_luggage__gte=luggage)
        
        return queryset.select_related().prefetch_related('pricing').distinct()
    
    @staticmethod
    def get_recommended_routes(
        origin: str = None,
        destination: str = None,
        limit: int = 5
    ) -> List[TransferRoute]:
        """
        Get recommended transfer routes based on popularity and relevance.
        """
        queryset = TransferRoute.objects.filter(is_active=True)
        
        if origin:
            queryset = queryset.filter(origin__icontains=origin)
        if destination:
            queryset = queryset.filter(destination__icontains=destination)
        
        # Order by popularity and relevance
        queryset = queryset.order_by(
            '-is_admin_selected',
            '-is_popular',
            '-popularity_score',
            '-booking_count'
        )
        
        return queryset[:limit]


class TransferOptionService:
    """
    Service for transfer options management.
    """
    
    @staticmethod
    def get_available_options() -> List[TransferOption]:
        """
        Get all available transfer options.
        """
        return TransferOption.objects.filter(is_active=True).order_by('option_type')
    
    @staticmethod
    def get_options_by_type(option_type: str) -> List[TransferOption]:
        """
        Get options by type.
        """
        return TransferOption.objects.filter(
            option_type=option_type,
            is_active=True
        )
    
    @staticmethod
    def calculate_option_price(option_id: str, base_price: Decimal, quantity: int = 1) -> Decimal:
        """
        Calculate price for a specific option.
        """
        try:
            option = TransferOption.objects.get(id=option_id, is_active=True)
            
            if option.price_type == 'fixed':
                return option.price * quantity
            else:  # percentage
                return (base_price * option.price_percentage / 100) * quantity
                
        except TransferOption.DoesNotExist:
            return Decimal('0.00')