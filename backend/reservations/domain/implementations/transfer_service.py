"""
Transfer-specific reservation service implementation
"""

from decimal import Decimal
from typing import List, Dict, Any, Optional
from django.utils import timezone
from django.db import transaction
from django.core.exceptions import ValidationError

from ..product_services import TransferBookingData, PricingResult
from ...models import Reservation, ReservationItem
from transfers.models import TransferRoute, TransferPricing, TransferDiscount, TransferVehicle


class TransferReservationService:
    """Service for handling transfer reservations"""
    
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
        try:
            route = TransferRoute.objects.get(id=route_id)
            
            # Check if vehicle type is available for this route
            pricing = TransferPricing.objects.filter(
                route=route,
                vehicle_type=vehicle_type,
                trip_type=trip_type,
                is_active=True
            ).first()
            
            if not pricing:
                return False
            
            # Check capacity based on vehicle type
            vehicle = TransferVehicle.objects.filter(
                vehicle_type=vehicle_type,
                is_active=True
            ).first()
            
            if not vehicle or vehicle.max_passengers < passenger_count:
                return False
            
            # Check if luggage capacity is sufficient
            if vehicle.max_luggage < luggage_count:
                return False
            
            return True
            
        except TransferRoute.DoesNotExist:
            return False
    
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
        try:
            with transaction.atomic():
                route = TransferRoute.objects.get(id=route_id)
                
                # Check pricing availability
                pricing = TransferPricing.objects.filter(
                    route=route,
                    vehicle_type=vehicle_type,
                    trip_type=trip_type,
                    is_active=True
                ).select_for_update().first()
                
                if not pricing:
                    return False
                
                # Check vehicle capacity
                vehicle = TransferVehicle.objects.filter(
                    vehicle_type=vehicle_type,
                    is_active=True
                ).first()
                
                if not vehicle or vehicle.max_passengers < passenger_count:
                    return False
                
                if vehicle.max_luggage < luggage_count:
                    return False
                
                # For transfers, we don't need to reserve specific capacity
                # as vehicles are assigned dynamically
                return True
                
        except TransferRoute.DoesNotExist:
            return False
    
    def calculate_transfer_pricing(
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
        try:
            route = TransferRoute.objects.get(id=route_id)
            
            # Get pricing for the route and vehicle type
            pricing = TransferPricing.objects.filter(
                route=route,
                vehicle_type=vehicle_type,
                trip_type=trip_type,
                is_active=True
            ).first()
            
            if not pricing:
                raise ValidationError(f"No pricing found for route {route_id} with vehicle type {vehicle_type}")
            
            # Calculate base price
            base_price = pricing.base_price
            
            # Add passenger surcharge if applicable
            if passenger_count > pricing.included_passengers:
                extra_passengers = passenger_count - pricing.included_passengers
                base_price += extra_passengers * pricing.passenger_surcharge
            
            # Add luggage surcharge if applicable
            if luggage_count > pricing.included_luggage:
                extra_luggage = luggage_count - pricing.included_luggage
                base_price += extra_luggage * pricing.luggage_surcharge
            
            # Calculate options total
            options_total = Decimal('0.00')
            option_details = []
            
            for option in selected_options:
                option_price = Decimal(str(option.get('price', 0)))
                quantity = int(option.get('quantity', 1))
                options_total += option_price * quantity
                
                option_details.append({
                    'id': option.get('id'),
                    'name': option.get('name'),
                    'price': float(option_price),
                    'quantity': quantity
                })
            
            # Calculate subtotal
            subtotal = base_price + options_total
            
            # Apply discount if provided
            discount_amount = Decimal('0.00')
            if discount_code:
                discount_amount = self._apply_discount(
                    route, subtotal, discount_code
                )
            
            # Calculate tax (10%)
            tax_amount = (subtotal - discount_amount) * Decimal('0.10')
            
            # Calculate total
            total_amount = subtotal - discount_amount + tax_amount
            
            return PricingResult(
                base_price=float(base_price),
                variant_price=0.0,  # Transfers don't have variants
                options_total=float(options_total),
                subtotal=float(subtotal),
                tax_amount=float(tax_amount),
                total_amount=float(total_amount),
                currency='USD',
                discount_amount=float(discount_amount),
                discount_code=discount_code or '',
                breakdown={
                    'route_details': {
                        'from_location': route.from_location,
                        'to_location': route.to_location,
                        'distance': float(route.distance) if route.distance else 0.0,
                        'estimated_duration': route.estimated_duration
                    },
                    'vehicle_details': {
                        'type': vehicle_type,
                        'max_passengers': pricing.included_passengers,
                        'max_luggage': pricing.included_luggage
                    },
                    'trip_details': {
                        'type': trip_type,
                        'passenger_count': passenger_count,
                        'luggage_count': luggage_count
                    },
                    'options': option_details
                }
            )
            
        except TransferRoute.DoesNotExist as e:
            raise ValidationError(f"Transfer route not found: {str(e)}")
    
    def create_transfer_reservation(
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
    ) -> Reservation:
        """Create transfer reservation"""
        try:
            with transaction.atomic():
                route = TransferRoute.objects.get(id=route_id)
                
                # Create reservation
                reservation = Reservation.objects.create(
                    user_id=user_id,
                    customer_name=customer_info['name'],
                    customer_email=customer_info['email'],
                    customer_phone=customer_info['phone'],
                    subtotal=Decimal(str(pricing_result.subtotal)),
                    tax_amount=Decimal(str(pricing_result.tax_amount)),
                    total_amount=Decimal(str(pricing_result.total_amount)),
                    currency=pricing_result.currency,
                    discount_amount=Decimal(str(pricing_result.discount_amount)),
                    discount_code=pricing_result.discount_code,
                    special_requirements=customer_info.get('special_requirements', ''),
                    status='draft'
                )
                
                # Create reservation item
                reservation_item = ReservationItem.objects.create(
                    reservation=reservation,
                    product_type='transfer',
                    product_id=route_id,
                    product_title=f"Transfer: {route.from_location} to {route.to_location}",
                    product_slug=route.slug,
                    booking_date=pickup_date,
                    booking_time=pickup_time,
                    quantity=passenger_count,
                    unit_price=Decimal(str(pricing_result.base_price / passenger_count)),
                    total_price=Decimal(str(pricing_result.base_price)),
                    currency=pricing_result.currency,
                    selected_options=selected_options,
                    options_total=Decimal(str(pricing_result.options_total)),
                    booking_data={
                        'route_id': str(route.id),
                        'vehicle_type': vehicle_type,
                        'trip_type': trip_type,
                        'pickup_date': pickup_date,
                        'pickup_time': pickup_time,
                        'return_date': return_date,
                        'return_time': return_time,
                        'passenger_count': passenger_count,
                        'luggage_count': luggage_count,
                        'pickup_address': pickup_address,
                        'dropoff_address': dropoff_address,
                        'route_details': {
                            'from_location': route.from_location,
                            'to_location': route.to_location,
                            'distance': float(route.distance) if route.distance else 0.0,
                            'estimated_duration': route.estimated_duration
                        }
                    }
                )
                
                return reservation
                
        except TransferRoute.DoesNotExist as e:
            raise ValidationError(f"Transfer route not found: {str(e)}")
    
    def get_available_routes(
        self,
        from_location: str,
        to_location: str
    ) -> List[Dict[str, Any]]:
        """Get available transfer routes"""
        try:
            routes = TransferRoute.objects.filter(
                from_location__icontains=from_location,
                to_location__icontains=to_location,
                is_active=True
            )
            
            return [
                {
                    'id': str(route.id),
                    'from_location': route.from_location,
                    'to_location': route.to_location,
                    'distance': float(route.distance) if route.distance else 0.0,
                    'estimated_duration': route.estimated_duration,
                    'base_price': float(route.base_price) if route.base_price else 0.0,
                    'is_popular': route.is_popular
                }
                for route in routes
            ]
            
        except Exception:
            return []
    
    def get_available_vehicles(
        self,
        route_id: str,
        trip_type: str
    ) -> List[Dict[str, Any]]:
        """Get available vehicles for a route"""
        try:
            route = TransferRoute.objects.get(id=route_id)
            
            # Get pricing for different vehicle types
            pricing_options = TransferPricing.objects.filter(
                route=route,
                trip_type=trip_type,
                is_active=True
            ).select_related('vehicle_type')
            
            vehicles = []
            for pricing in pricing_options:
                vehicle = TransferVehicle.objects.filter(
                    vehicle_type=pricing.vehicle_type,
                    is_active=True
                ).first()
                
                if vehicle:
                    vehicles.append({
                        'type': pricing.vehicle_type,
                        'name': vehicle.name,
                        'max_passengers': vehicle.max_passengers,
                        'max_luggage': vehicle.max_luggage,
                        'base_price': float(pricing.base_price),
                        'passenger_surcharge': float(pricing.passenger_surcharge),
                        'luggage_surcharge': float(pricing.luggage_surcharge),
                        'included_passengers': pricing.included_passengers,
                        'included_luggage': pricing.included_luggage,
                        'description': vehicle.description
                    })
            
            return vehicles
            
        except TransferRoute.DoesNotExist:
            return []
    
    def _apply_discount(
        self,
        route: TransferRoute,
        subtotal: Decimal,
        discount_code: str
    ) -> Decimal:
        """Apply discount code"""
        try:
            discount = TransferDiscount.objects.get(
                code=discount_code,
                route=route,
                is_active=True,
                valid_from__lte=timezone.now(),
                valid_until__gte=timezone.now()
            )
            
            if discount.discount_type == 'percentage':
                return subtotal * (discount.discount_value / Decimal('100'))
            else:
                return min(discount.discount_value, subtotal)
                
        except TransferDiscount.DoesNotExist:
            return Decimal('0.00') 