"""
Django Admin configuration for Transfers app.
"""

from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from parler.admin import TranslatableAdmin
from .models import (
    TransferRoute, TransferRoutePricing, TransferOption, TransferBooking
)


class TransferRoutePricingInline(admin.TabularInline):
    """Inline admin for TransferRoutePricing."""
    
    model = TransferRoutePricing
    extra = 1
    fields = ['vehicle_type', 'base_price', 'max_passengers', 'max_luggage', 'is_active']


@admin.register(TransferRoute)
class TransferRouteAdmin(TranslatableAdmin):
    """Admin for TransferRoute model."""
    
    list_display = ['origin', 'destination', 'round_trip_discount_enabled', 'is_active']
    list_filter = ['is_active', 'round_trip_discount_enabled']
    search_fields = ['origin', 'destination', 'name']
    ordering = ['origin', 'destination']
    
    inlines = [TransferRoutePricingInline]
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('name', 'description', 'origin', 'destination')
        }),
        (_('Time-based Pricing'), {
            'fields': ('peak_hour_surcharge', 'midnight_surcharge')
        }),
        (_('Round Trip Settings'), {
            'fields': ('round_trip_discount_enabled', 'round_trip_discount_percentage')
        }),
        (_('Status'), {
            'fields': ('is_active',)
        }),
    )


@admin.register(TransferRoutePricing)
class TransferRoutePricingAdmin(admin.ModelAdmin):
    """Admin for TransferRoutePricing model."""
    
    list_display = ['route', 'vehicle_type', 'base_price', 'max_passengers', 'max_luggage', 'is_active']
    list_filter = ['vehicle_type', 'is_active', 'route']
    search_fields = ['route__origin', 'route__destination']
    ordering = ['route', 'vehicle_type']
    
    fieldsets = (
        (_('Route & Vehicle'), {
            'fields': ('route', 'vehicle_type')
        }),
        (_('Pricing'), {
            'fields': ('base_price',)
        }),
        (_('Capacity'), {
            'fields': ('max_passengers', 'max_luggage')
        }),
        (_('Status'), {
            'fields': ('is_active',)
        }),
    )


@admin.register(TransferOption)
class TransferOptionAdmin(TranslatableAdmin):
    """Admin for TransferOption model."""
    
    list_display = ['name', 'option_type', 'price_type', 'price', 'price_percentage', 'is_active']
    list_filter = ['option_type', 'price_type', 'is_active']
    search_fields = ['name', 'description']
    ordering = ['option_type']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('name', 'description', 'option_type')
        }),
        (_('Pricing'), {
            'fields': ('price_type', 'price', 'price_percentage')
        }),
        (_('Restrictions'), {
            'fields': ('max_quantity',)
        }),
        (_('Status'), {
            'fields': ('is_active',)
        }),
    )


@admin.register(TransferBooking)
class TransferBookingAdmin(admin.ModelAdmin):
    """Admin for TransferBooking model."""
    
    list_display = ['booking_reference', 'route', 'pricing', 'trip_type', 'passenger_count', 'final_price', 'status', 'created_at']
    list_filter = ['trip_type', 'status', 'outbound_date', 'created_at']
    search_fields = ['booking_reference', 'contact_name', 'contact_phone']
    ordering = ['-created_at']
    readonly_fields = ['booking_reference', 'created_at', 'updated_at']
    
    fieldsets = (
        (_('Booking Information'), {
            'fields': ('booking_reference', 'route', 'pricing', 'trip_type', 'user')
        }),
        (_('Trip Details'), {
            'fields': ('outbound_date', 'outbound_time', 'outbound_price', 'return_date', 'return_time', 'return_price')
        }),
        (_('Passenger Information'), {
            'fields': ('passenger_count', 'luggage_count')
        }),
        (_('Pickup Details'), {
            'fields': ('pickup_address', 'pickup_instructions')
        }),
        (_('Drop-off Details'), {
            'fields': ('dropoff_address', 'dropoff_instructions')
        }),
        (_('Contact Information'), {
            'fields': ('contact_name', 'contact_phone')
        }),
        (_('Pricing'), {
            'fields': ('round_trip_discount', 'options_total', 'final_price', 'selected_options')
        }),
        (_('Special Requirements'), {
            'fields': ('special_requirements',)
        }),
        (_('Status'), {
            'fields': ('status',)
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )





# Customize admin site
admin.site.site_header = _('Peykan Tourism Admin')
admin.site.site_title = _('Peykan Tourism')
admin.site.index_title = _('Transfer Management') 