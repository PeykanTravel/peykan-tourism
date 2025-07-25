"""
DRF Serializers for Agents app.
"""

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import Agent, AgentCommission

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