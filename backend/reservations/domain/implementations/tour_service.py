"""
Tour-specific reservation service implementation
"""

from decimal import Decimal
from typing import List, Dict, Any, Optional
from django.utils import timezone
from django.db import transaction
from django.core.exceptions import ValidationError

from ..product_services import TourBookingData, PricingResult
from ...models import Reservation, ReservationItem
from tours.models import Tour, TourVariant, TourSchedule, TourPricing, TourDiscount


class TourReservationService:
    """Service for handling tour reservations"""
    
    def check_availability(
        self,
        tour_id: str,
        variant_id: str,
        booking_date: str,
        booking_time: str,
        participants: Dict[str, int]
    ) -> bool:
        """Check if tour is available for booking"""
        try:
            tour = Tour.objects.get(id=tour_id)
            variant = TourVariant.objects.get(id=variant_id, tour=tour)
            
            # Get schedule for the date
            schedule = TourSchedule.objects.filter(
                tour=tour,
                variant=variant,
                date=booking_date,
                start_time=booking_time,
                is_active=True
            ).first()
            
            if not schedule:
                return False
            
            # Calculate total participants
            total_participants = sum(participants.values())
            
            # Check capacity
            return schedule.available_capacity >= total_participants
            
        except (Tour.DoesNotExist, TourVariant.DoesNotExist):
            return False
    
    def reserve_capacity(
        self,
        tour_id: str,
        variant_id: str,
        booking_date: str,
        booking_time: str,
        participants: Dict[str, int],
        duration_minutes: int = 30
    ) -> bool:
        """Temporarily reserve tour capacity"""
        try:
            with transaction.atomic():
                tour = Tour.objects.get(id=tour_id)
                variant = TourVariant.objects.get(id=variant_id, tour=tour)
                
                schedule = TourSchedule.objects.filter(
                    tour=tour,
                    variant=variant,
                    date=booking_date,
                    start_time=booking_time,
                    is_active=True
                ).select_for_update().first()
                
                if not schedule:
                    return False
                
                total_participants = sum(participants.values())
                
                if schedule.available_capacity < total_participants:
                    return False
                
                # Temporarily reduce capacity
                schedule.available_capacity -= total_participants
                schedule.save()
                
                return True
                
        except (Tour.DoesNotExist, TourVariant.DoesNotExist):
            return False
    
    def calculate_tour_pricing(
        self,
        tour_id: str,
        variant_id: str,
        participants: Dict[str, int],
        selected_options: List[Dict[str, Any]],
        discount_code: Optional[str] = None
    ) -> PricingResult:
        """Calculate pricing for tour booking"""
        try:
            tour = Tour.objects.get(id=tour_id)
            variant = TourVariant.objects.get(id=variant_id, tour=tour)
            
            # Calculate base price based on participants
            base_price = Decimal('0.00')
            participant_details = []
            
            for participant_type, count in participants.items():
                if count <= 0:
                    continue
                
                # Get pricing for participant type
                pricing = TourPricing.objects.filter(
                    tour=tour,
                    variant=variant,
                    participant_type=participant_type
                ).first()
                
                if pricing:
                    participant_price = pricing.price * count
                    base_price += participant_price
                    
                    participant_details.append({
                        'type': participant_type,
                        'count': count,
                        'unit_price': float(pricing.price),
                        'total_price': float(participant_price)
                    })
                else:
                    # Default pricing
                    default_price = self._get_default_pricing(participant_type)
                    participant_price = default_price * count
                    base_price += participant_price
                    
                    participant_details.append({
                        'type': participant_type,
                        'count': count,
                        'unit_price': float(default_price),
                        'total_price': float(participant_price)
                    })
            
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
                    tour, variant, subtotal, discount_code
                )
            
            # Calculate tax (10%)
            tax_amount = (subtotal - discount_amount) * Decimal('0.10')
            
            # Calculate total
            total_amount = subtotal - discount_amount + tax_amount
            
            return PricingResult(
                base_price=float(base_price),
                variant_price=0.0,  # Variant price is included in base price
                options_total=float(options_total),
                subtotal=float(subtotal),
                tax_amount=float(tax_amount),
                total_amount=float(total_amount),
                currency='USD',
                discount_amount=float(discount_amount),
                discount_code=discount_code or '',
                breakdown={
                    'participants': participant_details,
                    'options': option_details,
                    'tour_name': tour.title,
                    'variant_name': variant.name,
                    'duration': variant.duration,
                    'max_participants': variant.max_participants
                }
            )
            
        except (Tour.DoesNotExist, TourVariant.DoesNotExist) as e:
            raise ValidationError(f"Tour or variant not found: {str(e)}")
    
    def create_tour_reservation(
        self,
        user_id: str,
        tour_id: str,
        variant_id: str,
        schedule_id: str,
        participants: Dict[str, int],
        customer_info: Dict[str, str],
        selected_options: List[Dict[str, Any]],
        pricing_result: PricingResult
    ) -> Reservation:
        """Create tour reservation"""
        try:
            with transaction.atomic():
                tour = Tour.objects.get(id=tour_id)
                variant = TourVariant.objects.get(id=variant_id, tour=tour)
                schedule = TourSchedule.objects.get(id=schedule_id, tour=tour, variant=variant)
                
                # Calculate total participants
                total_participants = sum(participants.values())
                
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
                    product_type='tour',
                    product_id=tour_id,
                    product_title=tour.title,
                    product_slug=tour.slug,
                    booking_date=schedule.date,
                    booking_time=schedule.start_time,
                    quantity=total_participants,
                    unit_price=Decimal(str(pricing_result.base_price / total_participants)),
                    total_price=Decimal(str(pricing_result.base_price)),
                    currency=pricing_result.currency,
                    variant_id=variant_id,
                    variant_name=variant.name,
                    selected_options=selected_options,
                    options_total=Decimal(str(pricing_result.options_total)),
                    booking_data={
                        'tour_id': str(tour.id),
                        'variant_id': str(variant.id),
                        'schedule_id': str(schedule.id),
                        'participants': participants,
                        'tour_details': {
                            'title': tour.title,
                            'description': tour.description,
                            'duration': variant.duration,
                            'max_participants': variant.max_participants,
                            'meeting_point': schedule.meeting_point,
                            'start_location': schedule.start_location
                        }
                    }
                )
                
                # Update schedule capacity
                schedule.available_capacity -= total_participants
                schedule.save()
                
                return reservation
                
        except (Tour.DoesNotExist, TourVariant.DoesNotExist, TourSchedule.DoesNotExist) as e:
            raise ValidationError(f"Tour, variant, or schedule not found: {str(e)}")
    
    def get_available_schedules(
        self,
        tour_id: str,
        variant_id: str,
        start_date: str,
        end_date: str
    ) -> List[Dict[str, Any]]:
        """Get available schedules for a tour variant"""
        try:
            tour = Tour.objects.get(id=tour_id)
            variant = TourVariant.objects.get(id=variant_id, tour=tour)
            
            schedules = TourSchedule.objects.filter(
                tour=tour,
                variant=variant,
                date__range=[start_date, end_date],
                is_active=True,
                available_capacity__gt=0
            ).order_by('date', 'start_time')
            
            return [
                {
                    'id': str(schedule.id),
                    'date': schedule.date.isoformat(),
                    'start_time': schedule.start_time.isoformat(),
                    'end_time': schedule.end_time.isoformat() if schedule.end_time else None,
                    'available_capacity': schedule.available_capacity,
                    'max_capacity': schedule.max_capacity,
                    'meeting_point': schedule.meeting_point,
                    'start_location': schedule.start_location,
                    'price_per_person': float(schedule.price_per_person) if schedule.price_per_person else 0.0
                }
                for schedule in schedules
            ]
            
        except (Tour.DoesNotExist, TourVariant.DoesNotExist):
            return []
    
    def get_tour_variants(self, tour_id: str) -> List[Dict[str, Any]]:
        """Get available variants for a tour"""
        try:
            tour = Tour.objects.get(id=tour_id)
            variants = TourVariant.objects.filter(tour=tour, is_active=True)
            
            return [
                {
                    'id': str(variant.id),
                    'name': variant.name,
                    'description': variant.description,
                    'duration': variant.duration,
                    'max_participants': variant.max_participants,
                    'min_participants': variant.min_participants,
                    'base_price': float(variant.base_price) if variant.base_price else 0.0,
                    'is_popular': variant.is_popular
                }
                for variant in variants
            ]
            
        except Tour.DoesNotExist:
            return []
    
    def _get_default_pricing(self, participant_type: str) -> Decimal:
        """Get default pricing for participant type"""
        default_prices = {
            'adult': Decimal('100.00'),
            'child': Decimal('50.00'),
            'infant': Decimal('0.00'),
            'senior': Decimal('80.00'),
            'student': Decimal('70.00')
        }
        return default_prices.get(participant_type, Decimal('100.00'))
    
    def _apply_discount(
        self,
        tour: Tour,
        variant: TourVariant,
        subtotal: Decimal,
        discount_code: str
    ) -> Decimal:
        """Apply discount code"""
        try:
            discount = TourDiscount.objects.get(
                code=discount_code,
                tour=tour,
                is_active=True,
                valid_from__lte=timezone.now(),
                valid_until__gte=timezone.now()
            )
            
            if discount.discount_type == 'percentage':
                return subtotal * (discount.discount_value / Decimal('100'))
            else:
                return min(discount.discount_value, subtotal)
                
        except TourDiscount.DoesNotExist:
            return Decimal('0.00') 