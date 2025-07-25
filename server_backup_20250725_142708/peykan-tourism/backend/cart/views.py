"""
DRF Views for Cart app.
"""

from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
import uuid
from decimal import Decimal

from .models import Cart, CartItem, CartService
from .serializers import (
    CartSerializer, CartItemSerializer, AddToCartSerializer,
    UpdateCartItemSerializer, CartItemCreateSerializer
)


class CartView(generics.RetrieveAPIView):
    """Get current user's cart."""
    
    serializer_class = CartSerializer
    permission_classes = [permissions.AllowAny]  # Allow guest access
    
    def get_object(self):
        user = self.request.user if self.request.user.is_authenticated else None
        
        # Get consistent session ID
        session_id = CartService.get_session_id(self.request)
        
        cart = CartService.get_or_create_cart(
            session_id=session_id,
            user=user
        )
        return cart


class AddToCartView(APIView):
    """Add item to cart."""
    
    permission_classes = [permissions.AllowAny]  # Allow guest access
    
    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        user = request.user if request.user.is_authenticated else None
        
        # Get consistent session ID
        session_id = CartService.get_session_id(request)
        
        cart = CartService.get_or_create_cart(
            session_id=session_id,
            user=user
        )

        # Get product instance based on product_type and product_id
        product_type = data['product_type']
        product_id = data['product_id']
        if product_type == 'tour':
            from tours.models import Tour
            product = Tour.objects.get(id=product_id)
        elif product_type == 'event':
            from events.models import Event
            product = Event.objects.get(id=product_id)
        elif product_type == 'transfer':
            from transfers.models import TransferRoute
            product = TransferRoute.objects.get(id=product_id)
        else:
            raise Exception('Invalid product_type')

        # Calculate accurate pricing for tours using age groups
        
        # Handle different product types
        if data['product_type'] == 'transfer':
            # For transfers, use TransferPricingService for accurate pricing
            from transfers.models import TransferRoutePricing
            from transfers.services import TransferPricingService
            from datetime import datetime
            
            # Get booking data
            booking_data = data.get('booking_data', {}) or {}
            vehicle_type = booking_data.get('vehicle_type', 'sedan')
            trip_type = booking_data.get('trip_type', 'one_way')
            
            # Extract time from outbound_datetime if available
            outbound_time_str = booking_data.get('outbound_time')
            if not outbound_time_str and booking_data.get('outbound_datetime'):
                # Extract time from datetime string (format: "2025-07-16 16:34")
                datetime_str = booking_data.get('outbound_datetime')
                if ' ' in datetime_str:
                    outbound_time_str = datetime_str.split(' ')[1]
            
            return_time_str = booking_data.get('return_time')
            if not return_time_str and booking_data.get('return_datetime'):
                # Extract time from datetime string
                datetime_str = booking_data.get('return_datetime')
                if ' ' in datetime_str:
                    return_time_str = datetime_str.split(' ')[1]
            
            # Parse times
            outbound_time = None
            return_time = None
            
            if outbound_time_str:
                try:
                    outbound_time = datetime.strptime(outbound_time_str, '%H:%M').time()
                except:
                    try:
                        outbound_time = datetime.strptime(outbound_time_str, '%H:%M:%S').time()
                    except:
                        # Fallback to current time if parsing fails
                        outbound_time = datetime.now().time()
            
            if return_time_str and trip_type == 'round_trip':
                try:
                    return_time = datetime.strptime(return_time_str, '%H:%M').time()
                except:
                    try:
                        return_time = datetime.strptime(return_time_str, '%H:%M:%S').time()
                    except:
                        return_time = None
            
            # Get pricing
            pricing = TransferRoutePricing.objects.filter(
                route=product,
                vehicle_type=vehicle_type,
                is_active=True
            ).first()
            
            if not pricing:
                unit_price = 0
                total_price_override = 0
            else:
                try:
                    # Use TransferPricingService for accurate calculation
                    price_data = TransferPricingService.calculate_price(
                        route=product,
                        pricing=pricing,
                        booking_time=outbound_time,
                        return_time=return_time,
                        selected_options=data.get('selected_options', [])
                    )
                    
                    unit_price = price_data['price_breakdown']['final_price']
                    total_price_override = price_data['price_breakdown']['final_price']
                    
                except Exception as e:
                    print(f"Transfer pricing calculation error: {e}")
                    unit_price = pricing.base_price
                    total_price_override = pricing.base_price
        else:
            unit_price = product.price  # Tour and Event have price
            total_price_override = None  # For tours, we'll calculate total separately
        
        if data['product_type'] == 'tour' and data.get('variant_id'):
            from tours.models import TourVariant, TourPricing
            variant_id = data['variant_id']
            
            try:
                variant = TourVariant.objects.get(id=variant_id, tour=product)
                
                # Calculate tour pricing based on participants and age groups
                participants = data.get('booking_data', {}).get('participants', {})
                
                if participants:
                    tour_total = 0
                    for age_group, count in participants.items():
                        if count > 0:
                            try:
                                pricing = TourPricing.objects.get(
                                    tour=product, 
                                    variant=variant, 
                                    age_group=age_group
                                )
                                subtotal = pricing.final_price * count
                                tour_total += subtotal
                            except TourPricing.DoesNotExist:
                                # Fallback to variant base_price for missing age groups
                                fallback_subtotal = variant.base_price * count
                                tour_total += fallback_subtotal
                    
                    # Set unit_price and override total_price for tours
                    unit_price = variant.base_price  # Keep for reference
                    total_price_override = tour_total  # Accurate total
                else:
                    # Fallback to variant base_price if no participants data
                    unit_price = variant.base_price
            except TourVariant.DoesNotExist:
                pass
        elif data.get('variant_id'):
            variant_id = data['variant_id']
            if data['product_type'] == 'event':
                from events.models import TicketType
                try:
                    variant = TicketType.objects.get(id=variant_id, event=product)
                    # Check if TicketType has base_price or price_modifier
                    if hasattr(variant, 'base_price'):
                        unit_price = variant.base_price
                    elif hasattr(variant, 'price_modifier'):
                        unit_price += variant.price_modifier
                except TicketType.DoesNotExist:
                    pass
            elif data['product_type'] == 'transfer':
                from transfers.models import TransferRoutePricing
                try:
                    variant = TransferRoutePricing.objects.get(id=variant_id)
                    # Use pricing_metadata-based calculation
                    if hasattr(variant, 'calculate_price'):
                        # Get booking data for price calculation
                        booking_data = data.get('booking_data', {})
                        booking_time = booking_data.get('outbound_time')
                        return_time = booking_data.get('return_time')
                        selected_options = data.get('selected_options', [])
                        
                        if booking_time:
                            from datetime import datetime
                            if isinstance(booking_time, str):
                                booking_time = datetime.strptime(booking_time, '%H:%M').time()
                            
                            if return_time and isinstance(return_time, str):
                                return_time = datetime.strptime(return_time, '%H:%M').time()
                            
                            # Calculate price using pricing_metadata
                            price_result = variant.calculate_price(
                                hour=booking_time.hour,
                                is_round_trip=bool(return_time),
                                selected_options=selected_options
                            )
                            unit_price = price_result['final_price']
                            total_price_override = price_result['final_price']
                        else:
                            unit_price = variant.base_price
                    else:
                        unit_price = variant.base_price
                except TransferRoutePricing.DoesNotExist:
                    pass
        
        # Check if item already exists in cart
        # For transfers, we need to check more fields since each transfer booking is unique
        if data['product_type'] == 'transfer':
            existing_item = cart.items.filter(
                product_type=data['product_type'],
                product_id=data['product_id'],
                variant_id=data.get('variant_id'),
                booking_data__vehicle_type=data.get('booking_data', {}).get('vehicle_type'),
                booking_data__trip_type=data.get('booking_data', {}).get('trip_type'),
                booking_data__outbound_date=data.get('booking_data', {}).get('outbound_date'),
                booking_data__outbound_time=data.get('booking_data', {}).get('outbound_time')
            ).first()
        else:
            existing_item = cart.items.filter(
                product_type=data['product_type'],
                product_id=data['product_id'],
                variant_id=data.get('variant_id')
            ).first()
        
        if existing_item:
            # For transfers, don't update quantity (it's always 1) - just update options
            if data['product_type'] == 'transfer':
                # Extract selected_options from booking_data if not directly available
                selected_options = data.get('selected_options', [])
                if not selected_options and data.get('booking_data', {}).get('selected_options'):
                    selected_options = data['booking_data']['selected_options']
                
                existing_item.selected_options = selected_options
                existing_item.booking_data = data.get('booking_data', {})
                existing_item.save()
                
                return Response({
                    'message': 'Transfer booking updated in cart.',
                    'cart_item': CartItemSerializer(existing_item).data
                })
            else:
                # Update existing item for tours and events
                existing_item.quantity += data['quantity']
                existing_item.selected_options = data.get('selected_options', [])
                existing_item.save()
                
                return Response({
                    'message': 'Item quantity updated in cart.',
                    'cart_item': CartItemSerializer(existing_item).data
                })
        else:
            # Calculate options total
            options_total = 0
            selected_options = data.get('selected_options', [])
            
            # For transfers, if selected_options is empty, try to get from booking_data
            if not selected_options and data.get('booking_data', {}).get('selected_options'):
                selected_options = data['booking_data']['selected_options']
            
            if selected_options:
                for option in selected_options:
                    option_price = option.get('price', 0)
                    option_quantity = option.get('quantity', 1)
                    options_total += float(option_price) * int(option_quantity)
            
            # For transfers, if options don't have prices, calculate them based on option names
            if data['product_type'] == 'transfer' and options_total == 0 and selected_options:
                from decimal import Decimal
                base_price = unit_price if unit_price else 400  # Fallback base price
                
                for option in selected_options:
                    option_name = option.get('option_name', '')
                    option_quantity = option.get('quantity', 1)
                    
                    if option_name == 'meet_greet':
                        option_price = 15.00
                    elif option_name == 'child_seat':
                        option_price = 10.00
                    elif option_name == 'extra_luggage':
                        option_price = 8.00
                    elif option_name == 'priority_booking':
                        option_price = base_price * 0.1  # 10% of base price
                    elif option_name == 'flight_monitoring':
                        option_price = 12.00
                    else:
                        option_price = 0
                    
                    options_total += float(option_price) * int(option_quantity)
            
            # Determine currency based on product type
            if product_type == 'transfer':
                currency = 'USD'  # Default currency for transfers
            else:
                currency = getattr(product, 'currency', 'USD')  # Fallback to USD if no currency field
            
            # For transfers, quantity should always be 1 (it's a complete booking, not multiple units)
            if data['product_type'] == 'transfer':
                quantity = 1
            else:
                quantity = data['quantity']
            
            # Create new item with accurate pricing
            cart_item = CartItem.objects.create(
                cart=cart,
                product_type=data['product_type'],
                product_id=data['product_id'],
                booking_date=data.get('booking_date', timezone.now().date()),
                booking_time=data.get('booking_time', timezone.now().time()),
                variant_id=data.get('variant_id'),
                variant_name=data.get('variant_name', ''),
                quantity=quantity,
                unit_price=unit_price,
                options_total=options_total,
                currency=currency,
                selected_options=selected_options,  # Use the extracted selected_options
                booking_data=data.get('booking_data', {})
            )
            
            # Override total_price for tours and transfers if we calculated it separately
            if total_price_override is not None:
                from decimal import Decimal
                if data['product_type'] == 'transfer':
                    # For transfers, use the calculated total_price_override (which already includes options)
                    cart_item.total_price = total_price_override
                else:
                    # For tours, add options to the calculated total
                    cart_item.total_price = total_price_override + Decimal(str(options_total))
                cart_item.save(skip_price_calculation=True)
            else:
                # If no override, calculate total as unit_price + options_total
                from decimal import Decimal
                cart_item.total_price = Decimal(str(unit_price)) + Decimal(str(options_total))
                cart_item.save(skip_price_calculation=True)
            
            return Response({
                'message': 'Item added to cart successfully.',
                'cart_item': CartItemSerializer(cart_item).data
            }, status=status.HTTP_201_CREATED)


class UpdateCartItemView(APIView):
    """Update cart item quantity and options."""
    
    permission_classes = [permissions.AllowAny]  # Allow guest access
    
    def put(self, request, item_id):
        """Update cart item with PUT method."""
        return self._update_item(request, item_id)
    
    def patch(self, request, item_id):
        """Update cart item with PATCH method."""
        return self._update_item(request, item_id)
    
    def _update_item(self, request, item_id):
        """Common update logic for both PUT and PATCH."""
        cart_item = get_object_or_404(CartItem, id=item_id, cart__user=request.user)
        
        serializer = UpdateCartItemSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        
        # Update item fields
        if 'selected_options' in data:
            cart_item.selected_options = data['selected_options']
        if 'booking_data' in data:
            cart_item.booking_data = data['booking_data']
        
        # For tours, recalculate pricing and quantity based on participants
        total_price_override = None
        if cart_item.product_type == 'tour':
            from tours.models import Tour, TourVariant, TourPricing
            
            try:
                tour = Tour.objects.get(id=cart_item.product_id)
                variant = TourVariant.objects.get(id=cart_item.variant_id, tour=tour)
                
                # Get updated participants (either from new data or existing)
                participants = cart_item.booking_data.get('participants', {})
                
                if participants:
                    tour_total = 0
                    total_participants = 0
                    
                    for age_group, count in participants.items():
                        if count > 0:
                            total_participants += count
                            try:
                                pricing = TourPricing.objects.get(
                                    tour=tour, 
                                    variant=variant, 
                                    age_group=age_group
                                )
                                # Ensure infant pricing is always 0
                                if age_group == 'infant' or pricing.is_free:
                                    subtotal = Decimal('0.00')
                                else:
                                    subtotal = pricing.final_price * count
                                tour_total += subtotal
                            except TourPricing.DoesNotExist:
                                # Fallback to variant base_price for missing age groups
                                # But ensure infant is always free
                                if age_group == 'infant':
                                    subtotal = Decimal('0.00')
                                else:
                                    subtotal = variant.base_price * count
                                tour_total += subtotal
                    
                    # Update quantity to total participants and override total_price
                    cart_item.quantity = total_participants
                    cart_item.unit_price = variant.base_price
                    total_price_override = tour_total
            except (Tour.DoesNotExist, TourVariant.DoesNotExist):
                pass
        
        # For transfers, recalculate pricing based on updated booking data
        if cart_item.product_type == 'transfer':
            from transfers.models import TransferRoute, TransferRoutePricing
            from decimal import Decimal
            
            try:
                route = TransferRoute.objects.get(id=cart_item.product_id)
                booking_data = cart_item.booking_data
                vehicle_type = booking_data.get('vehicle_type', 'sedan')
                trip_type = booking_data.get('trip_type', 'one_way')
                outbound_time = booking_data.get('outbound_time')
                return_time = booking_data.get('return_time')
                
                # Get base pricing
                pricing = TransferRoutePricing.objects.filter(
                    route=route,
                    vehicle_type=vehicle_type,
                    is_active=True
                ).first()
                
                if pricing:
                    base_price = pricing.base_price
                    
                    # Calculate time surcharges
                    outbound_surcharge = 0
                    return_surcharge = 0
                    
                    if outbound_time:
                        try:
                            if isinstance(outbound_time, str):
                                hour = int(outbound_time.split(':')[0])
                            else:
                                hour = outbound_time.hour
                            outbound_surcharge = route.calculate_time_surcharge(base_price, hour)
                        except:
                            outbound_surcharge = 0
                    
                    if return_time and trip_type == 'round_trip':
                        try:
                            if isinstance(return_time, str):
                                hour = int(return_time.split(':')[0])
                            else:
                                hour = return_time.hour
                            return_surcharge = route.calculate_time_surcharge(base_price, hour)
                        except:
                            return_surcharge = 0
                    
                    # Calculate round trip discount
                    round_trip_discount = 0
                    if trip_type == 'round_trip' and route.round_trip_discount_enabled:
                        total_before_discount = (base_price + outbound_surcharge) + (base_price + return_surcharge)
                        round_trip_discount = total_before_discount * (route.round_trip_discount_percentage / 100)
                    
                    # Calculate final price
                    if trip_type == 'round_trip':
                        total_price = (base_price + outbound_surcharge) + (base_price + return_surcharge) - round_trip_discount
                    else:
                        total_price = base_price + outbound_surcharge
                    
                    cart_item.unit_price = base_price
                    total_price_override = total_price
            except TransferRoute.DoesNotExist:
                pass
        
        # For non-tour products, update quantity directly if provided (but not for transfers)
        if cart_item.product_type not in ['tour', 'transfer'] and 'quantity' in data:
            cart_item.quantity = data['quantity']
        
        # Save with or without price override
        if total_price_override is not None:
            if cart_item.product_type == 'transfer':
                # For transfers, add options to the calculated total
                cart_item.total_price = total_price_override + Decimal(str(cart_item.options_total))
            else:
                # For tours, add options to the calculated total
                cart_item.total_price = total_price_override + Decimal(str(cart_item.options_total))
            cart_item.save(skip_price_calculation=True)
        else:
            cart_item.save()
        
        return Response({
            'message': 'Cart item updated successfully.',
            'cart_item': CartItemSerializer(cart_item).data
        })


class RemoveFromCartView(APIView):
    """Remove item from cart."""
    
    permission_classes = [permissions.AllowAny]  # Allow guest access
    
    def delete(self, request, item_id):
        cart_item = get_object_or_404(CartItem, id=item_id, cart__user=request.user)
        cart_item.delete()
        
        return Response({
            'message': 'Item removed from cart successfully.'
        })


class ClearCartView(APIView):
    """Clear all items from cart."""
    
    permission_classes = [permissions.AllowAny]  # Allow guest access
    
    def delete(self, request):
        user = request.user
        
        # Get consistent session ID
        session_id = CartService.get_session_id(request)
        
        cart = CartService.get_or_create_cart(
            session_id=session_id,
            user=user
        )
        cart.items.all().delete()
        return Response({
            'message': 'Cart cleared successfully.'
        })


class AddEventSeatsToCartView(APIView):
    """Add event seats to cart."""
    
    permission_classes = [permissions.AllowAny]  # Allow guest access
    
    def post(self, request):
        # Validate required fields
        required_fields = ['event_id', 'performance_id', 'ticket_type_id', 'seats']
        for field in required_fields:
            if field not in request.data:
                return Response({
                    'message': f'Missing required field: {field}'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            event_id = request.data['event_id']
            performance_id = request.data['performance_id']
            ticket_type_id = request.data['ticket_type_id']
            seats = request.data['seats']
            selected_options = request.data.get('selected_options', [])
            special_requests = request.data.get('special_requests', '')
            
            # Validate seats
            if not seats or not isinstance(seats, list):
                return Response({
                    'message': 'Seats must be a non-empty list'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get or create cart using CartService
            user = request.user
            session_id = CartService.get_session_id(request)
            cart = CartService.get_or_create_cart(session_id=session_id, user=user)
            
            # Use the service to add seats with proper merging logic
            from .services import EventCartService
            cart_item, is_new_item = EventCartService.add_event_seats_to_cart(
                cart=cart,
                event_id=event_id,
                performance_id=performance_id,
                ticket_type_id=ticket_type_id,
                seats=seats,
                selected_options=selected_options,
                special_requests=special_requests
            )
            
            if is_new_item:
                return Response({
                    'message': 'Event seats added to cart successfully.',
                    'cart_item': CartItemSerializer(cart_item).data
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'message': 'Seats merged with existing cart item.',
                    'cart_item': CartItemSerializer(cart_item).data
                }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'message': f'Error adding seats to cart: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CartSummaryView(APIView):
    """Get cart summary for checkout."""
    
    permission_classes = [permissions.AllowAny]  # Allow guest access
    
    def get(self, request):
        user = request.user
        
        # Get consistent session ID
        session_id = CartService.get_session_id(request)
        
        cart = CartService.get_or_create_cart(
            session_id=session_id,
            user=user
        )
        
        # Calculate totals using correct pricing logic
        total_items = sum(item.quantity for item in cart.items.all())
        
        # Use CartSerializer methods for consistency
        cart_serializer = CartSerializer(cart)
        subtotal = cart_serializer.get_subtotal(cart)
        total_price = cart_serializer.get_total_price(cart)
        
        # Get currency (use first item's currency or default)
        currency = 'USD'
        if cart.items.exists():
            currency = cart.items.first().currency
        
        return Response({
            'total_items': total_items,
            'subtotal': float(subtotal),
            'total_price': float(total_price),
            'currency': currency,
            'items': CartItemSerializer(cart.items.all(), many=True).data
        })


@api_view(['POST'])
@permission_classes([permissions.AllowAny])  # Allow guest access
def merge_cart_view(request):
    """Merge session cart with user cart."""
    
    session_key = request.data.get('session_key')
    if not session_key:
        return Response({
            'error': 'Session key is required.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user = request.user
    
    # Get user cart using CartService
    
    # Get consistent session ID
    session_id = CartService.get_session_id(request)
    
    user_cart = CartService.get_or_create_cart(
        session_id=session_id,
        user=user
    )
    
    # Get session cart
    try:
        session_cart = Cart.objects.get(session_key=session_key, user__isnull=True)
    except Cart.DoesNotExist:
        return Response({
            'message': 'No session cart found to merge.'
        })
    
    # Merge items
    merged_items = 0
    for session_item in session_cart.items.all():
        # Check if item already exists in user cart
        existing_item = user_cart.items.filter(
            product_type=session_item.product_type,
            product_id=session_item.product_id,
            variant_id=session_item.variant_id
        ).first()
        
        if existing_item:
            # Update quantity
            existing_item.quantity += session_item.quantity
            existing_item.save()
        else:
            # Create new item
            session_item.cart = user_cart
            session_item.save()
        
        merged_items += 1
    
    # Delete session cart
    session_cart.delete()
    
    return Response({
        'message': f'Successfully merged {merged_items} items from session cart.',
        'cart': CartSerializer(user_cart).data
    })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])  # Allow guest access
def cart_count_view(request):
    """Get cart item count for navbar."""
    
    user = request.user
    
    # Get consistent session ID
    session_id = CartService.get_session_id(request)
    
    cart = CartService.get_or_create_cart(
        session_id=session_id,
        user=user
    )
    count = sum(item.quantity for item in cart.items.all())
    
    return Response({
        'count': count
    }) 