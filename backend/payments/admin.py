"""
Django Admin configuration for Payments app.
"""

from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django.urls import reverse
from django.db.models import Count, Sum
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """Admin for Payment model."""
    
    list_display = [
        'payment_id', 'order', 'user', 'amount', 'currency', 'payment_method',
        'status', 'is_successful', 'created_at'
    ]
    list_filter = [
        'status', 'payment_method', 'currency', 'is_successful', 'created_at'
    ]
    search_fields = [
        'payment_id', 'order__order_number', 'user__username', 'user__email',
        'transaction_id', 'description'
    ]
    ordering = ['-created_at']
    readonly_fields = [
        'payment_id', 'order', 'user', 'amount', 'currency', 'payment_method',
        'transaction_id', 'description', 'metadata', 'error_message',
        'created_at', 'updated_at'
    ]
    
    fieldsets = (
        (_('Payment Information'), {
            'fields': ('payment_id', 'order', 'user')
        }),
        (_('Payment Details'), {
            'fields': ('amount', 'currency', 'payment_method', 'description')
        }),
        (_('Transaction'), {
            'fields': ('transaction_id', 'status', 'is_successful')
        }),
        (_('Error Information'), {
            'fields': ('error_message',),
            'classes': ('collapse',)
        }),
        (_('Additional Data'), {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
    
    def get_queryset(self, request):
        """Add annotations for better performance."""
        return super().get_queryset(request).select_related('order', 'user') 