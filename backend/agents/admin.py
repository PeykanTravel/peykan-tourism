"""
Django Admin configuration for Agents app.
"""

from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django.urls import reverse
from django.db.models import Count, Sum, Avg
from .models import Agent, AgentProfile


class AgentProfileInline(admin.StackedInline):
    """Inline admin for AgentProfile."""
    
    model = AgentProfile
    extra = 1
    fields = [
        'company_name', 'license_number', 'business_address', 'business_phone',
        'business_email', 'website', 'commission_rate', 'min_commission',
        'max_commission', 'is_verified', 'total_orders', 'total_revenue'
    ]


@admin.register(Agent)
class AgentAdmin(admin.ModelAdmin):
    """Admin for Agent model."""
    
    list_display = [
        'user', 'company_name', 'license_number', 'is_active', 'is_verified',
        'total_orders', 'total_revenue', 'commission_rate', 'created_at'
    ]
    list_filter = [
        'is_active', 'is_verified', 'created_at'
    ]
    search_fields = [
        'user__username', 'user__email', 'company_name', 'license_number',
        'email', 'phone'
    ]
    ordering = ['-created_at']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    inlines = [AgentProfileInline]
    
    fieldsets = (
        (_('Agent Information'), {
            'fields': ('id', 'user', 'company_name', 'license_number')
        }),
        (_('Contact Information'), {
            'fields': ('email', 'phone', 'address', 'website')
        }),
        (_('Status'), {
            'fields': ('is_active', 'is_verified')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def total_orders(self, obj):
        """Get total number of orders for this agent."""
        return obj.user.agent_orders.count()
    total_orders.short_description = _('Total Orders')
    
    def total_revenue(self, obj):
        """Get total revenue for this agent."""
        total = obj.user.agent_orders.aggregate(
            total=Sum('total_amount')
        )['total'] or 0
        return f"${total:.2f}"
    total_revenue.short_description = _('Total Revenue')
    
    def commission_rate(self, obj):
        """Get commission rate."""
        return f"{obj.user.commission_rate}%"
    commission_rate.short_description = _('Commission Rate')
    
    def get_queryset(self, request):
        """Add annotations for better performance."""
        return super().get_queryset(request).select_related('user')


@admin.register(AgentProfile)
class AgentProfileAdmin(admin.ModelAdmin):
    """Admin for AgentProfile model."""
    
    list_display = [
        'user', 'company_name', 'license_number', 'commission_rate',
        'is_verified', 'total_orders', 'total_revenue', 'created_at'
    ]
    list_filter = [
        'is_verified', 'is_active', 'created_at'
    ]
    search_fields = [
        'user__username', 'user__email', 'company_name', 'license_number',
        'business_email', 'business_phone'
    ]
    ordering = ['-created_at']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        (_('Agent Information'), {
            'fields': ('id', 'user')
        }),
        (_('Company Details'), {
            'fields': ('company_name', 'license_number')
        }),
        (_('Business Contact'), {
            'fields': ('business_address', 'business_phone', 'business_email', 'website')
        }),
        (_('Commission Settings'), {
            'fields': ('commission_rate', 'min_commission', 'max_commission')
        }),
        (_('Performance Metrics'), {
            'fields': ('total_orders', 'total_revenue'),
            'classes': ('collapse',)
        }),
        (_('Status'), {
            'fields': ('is_active', 'is_verified')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def total_orders(self, obj):
        """Get total number of orders for this agent."""
        return obj.total_orders
    total_orders.short_description = _('Total Orders')
    
    def total_revenue(self, obj):
        """Get total revenue for this agent."""
        return f"${obj.total_revenue:.2f}"
    total_revenue.short_description = _('Total Revenue')
    
    def get_queryset(self, request):
        """Add annotations for better performance."""
        return super().get_queryset(request).select_related('user') 