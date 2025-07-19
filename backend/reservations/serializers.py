"""
Serializers for Reservation System
"""

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import Reservation, ReservationItem, ReservationHistory


class ReservationItemSerializer(serializers.ModelSerializer):
    """Serializer for reservation items."""
    
    class Meta:
        model = ReservationItem
        fields = [
            'id', 'product_type', 'product_id', 'product_title', 'product_slug',
            'booking_date', 'booking_time', 'variant_id', 'variant_name',
            'quantity', 'unit_price', 'total_price', 'currency',
            'selected_options', 'options_total', 'booking_data'
        ]
        read_only_fields = ['id', 'total_price']


class ReservationHistorySerializer(serializers.ModelSerializer):
    """Serializer for reservation history."""
    
    changed_by_name = serializers.CharField(source='changed_by.get_full_name', read_only=True)
    
    class Meta:
        model = ReservationHistory
        fields = [
            'id', 'from_status', 'to_status', 'changed_by', 'changed_by_name',
            'reason', 'ip_address', 'user_agent', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ReservationSerializer(serializers.ModelSerializer):
    """Main serializer for reservations."""
    
    items = ReservationItemSerializer(many=True, read_only=True)
    history = ReservationHistorySerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    
    class Meta:
        model = Reservation
        fields = [
            'id', 'reservation_number', 'user', 'agent', 'status', 'status_display',
            'payment_status', 'payment_status_display', 'customer_name', 'customer_email',
            'customer_phone', 'subtotal', 'tax_amount', 'total_amount', 'currency',
            'discount_code', 'discount_amount', 'special_requirements', 'expires_at',
            'is_expired', 'can_be_confirmed', 'items', 'history', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'reservation_number', 'is_expired', 'can_be_confirmed',
            'created_at', 'updated_at'
        ]


class ReservationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating reservations."""
    
    items = ReservationItemSerializer(many=True)
    
    class Meta:
        model = Reservation
        fields = [
            'customer_name', 'customer_email', 'customer_phone',
            'special_requirements', 'items'
        ]
    
    def validate_items(self, value):
        """Validate reservation items."""
        if not value:
            raise serializers.ValidationError(_("At least one item is required."))
        
        for item in value:
            if item.get('quantity', 0) <= 0:
                raise serializers.ValidationError(_("Quantity must be greater than 0."))
        
        return value
    
    def create(self, validated_data):
        """Create reservation with items."""
        items_data = validated_data.pop('items')
        
        # Calculate totals
        subtotal = sum(item['total_price'] for item in items_data)
        tax_amount = subtotal * 0.1  # 10% tax
        total_amount = subtotal + tax_amount
        
        # Create reservation
        reservation = Reservation.objects.create(
            user=self.context['request'].user,
            subtotal=subtotal,
            tax_amount=tax_amount,
            total_amount=total_amount,
            currency=items_data[0]['currency'] if items_data else 'USD',
            **validated_data
        )
        
        # Create items
        for item_data in items_data:
            ReservationItem.objects.create(reservation=reservation, **item_data)
        
        return reservation


class PricingCalculationSerializer(serializers.Serializer):
    """Serializer for pricing calculation requests."""
    
    product_type = serializers.ChoiceField(choices=[
        ('tour', 'Tour'),
        ('event', 'Event'),
        ('transfer', 'Transfer')
    ])
    product_id = serializers.UUIDField()
    booking_date = serializers.DateField()
    booking_time = serializers.TimeField()
    quantity = serializers.IntegerField(min_value=1, default=1)
    variant_id = serializers.UUIDField(required=False, allow_null=True)
    selected_options = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        default=list
    )
    discount_code = serializers.CharField(required=False, allow_blank=True)
    
    # Event-specific fields
    performance_id = serializers.UUIDField(required=False)
    selected_seats = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        default=list
    )
    
    # Tour-specific fields
    participants = serializers.DictField(required=False, default=dict)
    
    # Transfer-specific fields
    route_id = serializers.UUIDField(required=False)
    vehicle_type = serializers.CharField(required=False)
    trip_type = serializers.ChoiceField(
        choices=[('one_way', 'One Way'), ('round_trip', 'Round Trip')],
        required=False
    )
    pickup_date = serializers.DateField(required=False)
    pickup_time = serializers.TimeField(required=False)
    return_date = serializers.DateField(required=False)
    return_time = serializers.TimeField(required=False)
    
    def validate(self, attrs):
        """Validate request based on product type."""
        product_type = attrs.get('product_type')
        
        if product_type == 'event':
            if not attrs.get('performance_id'):
                raise serializers.ValidationError(_("performance_id is required for events."))
            if not attrs.get('selected_seats'):
                raise serializers.ValidationError(_("selected_seats is required for events."))
        
        elif product_type == 'tour':
            if not attrs.get('participants'):
                raise serializers.ValidationError(_("participants is required for tours."))
        
        elif product_type == 'transfer':
            if not attrs.get('route_id'):
                raise serializers.ValidationError(_("route_id is required for transfers."))
            if not attrs.get('vehicle_type'):
                raise serializers.ValidationError(_("vehicle_type is required for transfers."))
            if not attrs.get('trip_type'):
                raise serializers.ValidationError(_("trip_type is required for transfers."))
        
        return attrs


class PricingResponseSerializer(serializers.Serializer):
    """Serializer for pricing calculation responses."""
    
    base_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    variant_price = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)
    options_total = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    currency = serializers.CharField()
    discount_amount = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_code = serializers.CharField(allow_blank=True, default='')
    
    # Breakdown details
    breakdown = serializers.DictField(required=False)
    
    # Product-specific details
    product_details = serializers.DictField(required=False)


class AvailabilityCheckSerializer(serializers.Serializer):
    """Serializer for availability check requests."""
    
    product_type = serializers.ChoiceField(choices=[
        ('tour', 'Tour'),
        ('event', 'Event'),
        ('transfer', 'Transfer')
    ])
    product_id = serializers.UUIDField()
    booking_date = serializers.DateField()
    booking_time = serializers.TimeField()
    quantity = serializers.IntegerField(min_value=1, default=1)
    
    # Product-specific fields
    variant_id = serializers.UUIDField(required=False, allow_null=True)
    performance_id = serializers.UUIDField(required=False)
    route_id = serializers.UUIDField(required=False)
    vehicle_type = serializers.CharField(required=False)


class AvailabilityResponseSerializer(serializers.Serializer):
    """Serializer for availability check responses."""
    
    available = serializers.BooleanField()
    available_quantity = serializers.IntegerField(required=False)
    message = serializers.CharField(required=False)
    
    # Product-specific availability details
    details = serializers.DictField(required=False)


class ReservationStatusUpdateSerializer(serializers.Serializer):
    """Serializer for updating reservation status."""
    
    status = serializers.ChoiceField(choices=[
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed')
    ])
    reason = serializers.CharField(required=False, allow_blank=True)
    
    def validate_status(self, value):
        """Validate status transition."""
        request = self.context.get('request')
        if not request:
            return value
        
        reservation = self.context.get('reservation')
        if not reservation:
            return value
        
        # Check if status transition is valid
        valid_transitions = {
            'draft': ['pending'],
            'pending': ['confirmed', 'cancelled'],
            'confirmed': ['completed', 'cancelled'],
            'completed': [],
            'cancelled': []
        }
        
        current_status = reservation.status
        if value not in valid_transitions.get(current_status, []):
            raise serializers.ValidationError(
                f"Cannot transition from {current_status} to {value}"
            )
        
        return value 