"""
Admin configuration for Shared app.
"""

from django.contrib import admin
from .models import CurrencyRate, UserCurrencyPreference, CurrencyConfig


@admin.register(CurrencyRate)
class CurrencyRateAdmin(admin.ModelAdmin):
    """Admin configuration for CurrencyRate model."""
    
    list_display = ['from_currency', 'to_currency', 'rate', 'is_active', 'created_at']
    list_filter = ['from_currency', 'to_currency', 'is_active', 'created_at']
    search_fields = ['from_currency', 'to_currency']
    ordering = ['from_currency', 'to_currency']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Currency Information', {
            'fields': ('from_currency', 'to_currency', 'rate')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(UserCurrencyPreference)
class UserCurrencyPreferenceAdmin(admin.ModelAdmin):
    """Admin configuration for UserCurrencyPreference model."""
    
    list_display = ['user', 'currency', 'created_at']
    list_filter = ['currency', 'created_at']
    search_fields = ['user__username', 'user__email', 'currency']
    ordering = ['user__username']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'currency')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CurrencyConfig)
class CurrencyConfigAdmin(admin.ModelAdmin):
    """Admin configuration for CurrencyConfig model."""
    
    list_display = ['currency_code', 'currency_name', 'symbol', 'is_active', 'is_default']
    list_filter = ['is_active', 'is_default', 'decimal_places']
    search_fields = ['currency_code', 'currency_name']
    ordering = ['currency_code']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Currency Information', {
            'fields': ('currency_code', 'currency_name', 'symbol')
        }),
        ('Configuration', {
            'fields': ('decimal_places', 'thousands_separator', 'decimal_separator')
        }),
        ('Status', {
            'fields': ('is_active', 'is_default')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        """Ensure only one default currency exists."""
        if obj.is_default:
            # Set all other currencies to non-default
            CurrencyConfig.objects.exclude(id=obj.id).update(is_default=False)
        super().save_model(request, obj, form, change) 