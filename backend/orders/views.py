"""
DRF Views for Orders app.
"""

from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Order, OrderItem, OrderService
from .serializers import OrderSerializer, CreateOrderSerializer

class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        return Order.objects.filter(user=user).order_by('-created_at')

class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'order_number'
    def get_queryset(self):
        user = self.request.user
        return Order.objects.filter(user=user)

class CreateOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Create order from current user's cart."""
        from cart.models import CartService
        
        # Get user's cart with consistent session ID
        session_id = CartService.get_session_id(request)
        cart = CartService.get_or_create_cart(session_id=session_id, user=request.user)
        
        if not cart.items.exists():
            return Response(
                {'error': 'Cart is empty.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Use OrderService to create order with transaction safety
            order = OrderService.create_order_from_cart(
                cart=cart,
                user=request.user,
                payment_data=request.data.get('payment_data'),
                agent=request.data.get('agent_id')
            )
            
            return Response({
                'message': 'Order created successfully.',
                'order_number': order.order_number,
                'order': OrderSerializer(order).data
            }, status=status.HTTP_201_CREATED)
            
        except ValueError as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': 'Failed to create order.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CancelOrderView(APIView):
    """Cancel an order."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, order_number):
        """Cancel an order if it's still cancellable."""
        try:
            order = Order.objects.get(
                order_number=order_number,
                user=request.user
            )
            
            if order.status in ['completed', 'cancelled']:
                return Response(
                    {'error': 'Order cannot be cancelled.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Use OrderService to cancel order
            OrderService.cancel_order(order)
            
            return Response({
                'message': 'Order cancelled successfully.',
                'order': OrderSerializer(order).data
            })
            
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found.'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class OrderPaymentView(APIView):
    """Handle order payment."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, order_number):
        """Process payment for an order."""
        try:
            order = Order.objects.get(
                order_number=order_number,
                user=request.user
            )
            
            if order.payment_status == 'paid':
                return Response(
                    {'error': 'Order is already paid.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Process payment using OrderService
            payment_result = OrderService.process_payment(
                order=order,
                payment_data=request.data
            )
            
            return Response({
                'message': 'Payment processed successfully.',
                'payment_status': order.payment_status,
                'order': OrderSerializer(order).data
            })
            
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found.'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class UpcomingOrdersView(generics.ListAPIView):
    """Get upcoming orders for the user."""
    
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        from django.utils import timezone
        today = timezone.now().date()
        
        return Order.objects.filter(
            user=self.request.user,
            items__schedule_date__gte=today
        ).distinct().order_by('items__schedule_date')


class OrderHistoryView(generics.ListAPIView):
    """Get order history for the user."""
    
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        from django.utils import timezone
        today = timezone.now().date()
        
        return Order.objects.filter(
            user=self.request.user
        ).filter(
            models.Q(items__schedule_date__lt=today) |
            models.Q(status__in=['completed', 'cancelled'])
        ).distinct().order_by('-created_at')


class OrderStatsView(APIView):
    """Get order statistics for the user."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get order statistics."""
        from django.db.models import Count, Sum
        from django.utils import timezone
        from datetime import timedelta
        
        user = request.user
        today = timezone.now().date()
        thirty_days_ago = today - timedelta(days=30)
        
        # Total orders
        total_orders = Order.objects.filter(user=user).count()
        
        # Recent orders (last 30 days)
        recent_orders = Order.objects.filter(
            user=user,
            created_at__date__gte=thirty_days_ago
        ).count()
        
        # Total spent
        total_spent = Order.objects.filter(
            user=user,
            payment_status='paid'
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        
        # Orders by status
        status_counts = Order.objects.filter(user=user).values('status').annotate(
            count=Count('id')
        )
        
        # Upcoming orders
        upcoming_orders = Order.objects.filter(
            user=user,
            items__schedule_date__gte=today
        ).distinct().count()
        
        return Response({
            'total_orders': total_orders,
            'recent_orders': recent_orders,
            'total_spent': total_spent,
            'upcoming_orders': upcoming_orders,
            'status_breakdown': list(status_counts)
        }) 