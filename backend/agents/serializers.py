"""
DRF Serializers for Agents app.
"""

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import Agent, AgentCommission, AgentCustomer

class AgentCommissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentCommission
        fields = [
            'id', 'order', 'commission_amount', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class AgentSerializer(serializers.ModelSerializer):
    commissions = AgentCommissionSerializer(many=True, read_only=True)
    class Meta:
        model = Agent
        fields = [
            'id', 'user', 'agency_name', 'agency_code', 'status',
            'created_at', 'updated_at', 'commissions'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'commissions']

class AgentSummarySerializer(serializers.Serializer):
    total_orders = serializers.IntegerField()
    total_commissions = serializers.DecimalField(max_digits=10, decimal_places=2)
    recent_orders = serializers.ListField()
    recent_commissions = serializers.ListField()


class AgentCustomerSerializer(serializers.ModelSerializer):
    """Serializer for agent customers."""
    
    class Meta:
        model = AgentCustomer
        fields = [
            'id', 'agent', 'customer', 'customer_name', 'customer_email',
            'customer_phone', 'relationship_notes', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class AgentCustomerCreateSerializer(serializers.Serializer):
    """Serializer for creating agent customers."""
    
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    password = serializers.CharField(max_length=128, required=False, write_only=True)
    relationship_notes = serializers.CharField(required=False, allow_blank=True)


class AgentOrderCreateSerializer(serializers.Serializer):
    """Serializer for creating orders for customers."""
    
    customer_id = serializers.UUIDField()
    items = serializers.ListField(
        child=serializers.DictField(),
        help_text="List of cart items to add to order"
    )
    payment_data = serializers.DictField(required=False)
    special_requirements = serializers.CharField(required=False, allow_blank=True)


class AgentProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating agent profile."""
    
    class Meta:
        model = Agent
        fields = [
            'company_name', 'license_number', 'email', 'phone',
            'address', 'website'
        ]


class AgentStatsSerializer(serializers.Serializer):
    """Serializer for agent statistics."""
    
    total_orders = serializers.IntegerField()
    recent_orders = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_customers = serializers.IntegerField()
    total_commission = serializers.DecimalField(max_digits=10, decimal_places=2)
    commission_rate = serializers.DecimalField(max_digits=5, decimal_places=2) 