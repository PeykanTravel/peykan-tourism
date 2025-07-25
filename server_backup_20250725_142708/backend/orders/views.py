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