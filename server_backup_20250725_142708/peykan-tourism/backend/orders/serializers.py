"""
DRF Serializers for Orders app.
"""

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product_type', 'product_id', 'product_title', 'product_slug',
            'variant_id', 'variant_name', 'quantity', 'unit_price', 'total_price',
            'currency', 'selected_options', 'booking_date', 'booking_time',
        ]
        read_only_fields = ['id']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user', 'agent', 'status', 'payment_status',
            'total_amount', 'currency', 'created_at', 'updated_at', 'items',
            'customer_name', 'customer_email', 'customer_phone',
            'special_requests', 'notes',
        ]
        read_only_fields = ['id', 'order_number', 'created_at', 'updated_at', 'items']

class CreateOrderSerializer(serializers.Serializer):
    cart_id = serializers.UUIDField()
    special_requests = serializers.CharField(required=False, allow_blank=True)
    agent_id = serializers.UUIDField(required=False)
    def validate(self, attrs):
        # Validate cart exists and is not empty
        from cart.models import Cart
        try:
            cart = Cart.objects.get(id=attrs['cart_id'])
        except Cart.DoesNotExist:
            raise serializers.ValidationError(_('Cart not found.'))
        if not cart.items.exists():
            raise serializers.ValidationError(_('Cart is empty.'))
        attrs['cart'] = cart
        return attrs 