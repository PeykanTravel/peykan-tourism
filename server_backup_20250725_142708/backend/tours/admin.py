"""
Django Admin configuration for Tours app.
"""

from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django.urls import reverse
from django.db.models import Count, Sum, Avg
from parler.admin import TranslatableAdmin
from .models import (
    TourCategory, Tour, TourVariant, TourSchedule, TourItinerary, 
    TourPricing, TourOption, TourReview, TourBooking
)


class TourVariantInline(admin.TabularInline):
    """Inline admin for TourVariant."""
    
    model = TourVariant
    extra = 1
    fields = ['name', 'description', 'base_price', 'capacity', 'is_active']


class TourScheduleInline(admin.TabularInline):
    """Inline admin for TourSchedule."""
    
    model = TourSchedule
    extra = 1
    fields = ['start_date', 'day_of_week', 'is_available', 'max_capacity']


class TourItineraryInline(admin.TabularInline):
    """Inline admin for TourItinerary."""
    
    model = TourItinerary
    extra = 1
    fields = ['order', 'title', 'duration_minutes', 'location']


class TourPricingInline(admin.TabularInline):
    """Inline admin for TourPricing."""
    
    model = TourPricing
    extra = 1
    fields = ['variant', 'age_group', 'factor', 'is_free']


class TourOptionInline(admin.TabularInline):
    """Inline admin for TourOption."""
    
    model = TourOption
    extra = 1
    fields = ['name', 'description', 'price', 'price_percentage', 'option_type', 'is_active']


@admin.register(TourCategory)
class TourCategoryAdmin(TranslatableAdmin):
    """Admin for TourCategory model."""
    
    list_display = ['name', 'icon', 'color', 'tour_count', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'description']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('name', 'description', 'slug')
        }),
        (_('Styling'), {
            'fields': ('icon', 'color')
        }),
        (_('Status'), {
            'fields': ('is_active',)
        }),
    )
    
    def tour_count(self, obj):
        """Get number of tours in this category."""
        return obj.tours.count()
    tour_count.short_description = _('Tour Count')


@admin.register(Tour)
class TourAdmin(TranslatableAdmin):
    """Admin for Tour model."""
    
    list_display = [
        'title', 'category', 'tour_type', 'transport_type', 'duration_hours',
        'price', 'is_featured', 'is_popular', 'is_active', 'booking_count'
    ]
    list_filter = [
        'category', 'tour_type', 'transport_type', 'is_featured', 
        'is_popular', 'is_active', 'includes_transfer', 'includes_guide',
        'includes_meal', 'created_at'
    ]
    search_fields = [
        'title', 'description', 'city', 'country', 'category__name'
    ]
    ordering = ['-created_at']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    inlines = [
        TourVariantInline, TourScheduleInline, TourItineraryInline,
        TourPricingInline, TourOptionInline
    ]
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('id', 'title', 'description', 'short_description', 'slug')
        }),
        (_('Category & Type'), {
            'fields': ('category', 'tour_type', 'transport_type')
        }),
        (_('Location'), {
            'fields': ('city', 'country', 'image')
        }),
        (_('Pricing'), {
            'fields': ('price', 'currency')
        }),
        (_('Timing'), {
            'fields': ('duration_hours', 'pickup_time', 'start_time', 'end_time')
        }),
        (_('Capacity & Booking'), {
            'fields': ('min_participants', 'max_participants', 'booking_cutoff_hours')
        }),
        (_('Cancellation Policy'), {
            'fields': ('cancellation_hours', 'refund_percentage')
        }),
        (_('Services Included'), {
            'fields': ('includes_transfer', 'includes_guide', 'includes_meal', 'includes_photographer')
        }),
        (_('Content'), {
            'fields': ('highlights', 'rules', 'required_items', 'gallery')
        }),
        (_('Status'), {
            'fields': ('is_featured', 'is_popular', 'is_active')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def booking_count(self, obj):
        """Get number of bookings for this tour."""
        return obj.bookings.count()
    booking_count.short_description = _('Bookings')
    
    def get_queryset(self, request):
        """Add annotations for better performance."""
        return super().get_queryset(request).select_related('category').prefetch_related('bookings')


@admin.register(TourVariant)
class TourVariantAdmin(admin.ModelAdmin):
    """Admin for TourVariant model."""
    
    list_display = [
        'name', 'tour', 'base_price', 'capacity', 'is_active', 'booking_count'
    ]
    list_filter = [
        'tour__category', 'is_active', 'includes_transfer', 'includes_guide',
        'includes_meal', 'includes_photographer'
    ]
    search_fields = [
        'name', 'description', 'tour__title'
    ]
    ordering = ['tour', 'name']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('tour', 'name', 'description')
        }),
        (_('Pricing & Capacity'), {
            'fields': ('base_price', 'capacity')
        }),
        (_('Services Included'), {
            'fields': ('includes_transfer', 'includes_guide', 'includes_meal', 'includes_photographer')
        }),
        (_('Extended Services'), {
            'fields': ('extended_hours', 'private_transfer', 'expert_guide', 'special_meal')
        }),
        (_('Status'), {
            'fields': ('is_active',)
        }),
    )
    
    def booking_count(self, obj):
        """Get number of bookings for this variant."""
        return obj.bookings.count()
    booking_count.short_description = _('Bookings')
    
    def get_queryset(self, request):
        """Add annotations for better performance."""
        return super().get_queryset(request).select_related('tour').prefetch_related('bookings')


@admin.register(TourSchedule)
class TourScheduleAdmin(admin.ModelAdmin):
    """Admin for TourSchedule model."""
    
    list_display = [
        'tour', 'start_date', 'day_of_week', 'is_available', 
        'max_capacity', 'booking_count'
    ]
    list_filter = [
        'tour__category', 'is_available', 'start_date', 'day_of_week'
    ]
    search_fields = [
        'tour__title', 'tour__city'
    ]
    ordering = ['tour', 'start_date']
    
    fieldsets = (
        (_('Schedule Information'), {
            'fields': ('tour', 'start_date', 'day_of_week')
        }),
        (_('Capacity'), {
            'fields': ('max_capacity', 'variant_capacities_raw')
        }),
        (_('Status'), {
            'fields': ('is_available',)
        }),
    )
    
    def booking_count(self, obj):
        """Get number of bookings for this schedule."""
        return obj.bookings.count()
    booking_count.short_description = _('Bookings')
    
    def get_queryset(self, request):
        """Add annotations for better performance."""
        return super().get_queryset(request).select_related('tour').prefetch_related('bookings')


@admin.register(TourItinerary)
class TourItineraryAdmin(TranslatableAdmin):
    """Admin for TourItinerary model."""
    
    list_display = [
        'tour', 'order', 'title', 'duration_minutes', 'location'
    ]
    list_filter = [
        'tour__category', 'tour__tour_type'
    ]
    search_fields = [
        'title', 'description', 'location', 'tour__title'
    ]
    ordering = ['tour', 'order']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('tour', 'order', 'title', 'description')
        }),
        (_('Details'), {
            'fields': ('duration_minutes', 'location', 'image', 'coordinates')
        }),
    )
    
    def get_queryset(self, request):
        """Add annotations for better performance."""
        return super().get_queryset(request).select_related('tour')


@admin.register(TourPricing)
class TourPricingAdmin(admin.ModelAdmin):
    """Admin for TourPricing model."""
    
    list_display = [
        'tour', 'variant', 'age_group', 'factor', 'is_free', 'final_price'
    ]
    list_filter = [
        'tour__category', 'age_group', 'is_free', 'requires_services'
    ]
    search_fields = [
        'tour__title', 'variant__name'
    ]
    ordering = ['tour', 'variant', 'age_group']
    
    fieldsets = (
        (_('Pricing Information'), {
            'fields': ('tour', 'variant', 'age_group')
        }),
        (_('Pricing Details'), {
            'fields': ('factor', 'is_free', 'requires_services')
        }),
    )
    
    def final_price(self, obj):
        """Calculate final price."""
        if obj.is_free:
            return "Free"
        return f"${obj.final_price:.2f}"
    final_price.short_description = _('Final Price')
    
    def get_queryset(self, request):
        """Add annotations for better performance."""
        return super().get_queryset(request).select_related('tour', 'variant')


@admin.register(TourOption)
class TourOptionAdmin(admin.ModelAdmin):
    """Admin for TourOption model."""
    
    list_display = [
        'name', 'tour', 'option_type', 'price', 'price_percentage', 'is_active'
    ]
    list_filter = [
        'tour__category', 'option_type', 'is_active', 'is_available'
    ]
    search_fields = [
        'name', 'description', 'tour__title'
    ]
    ordering = ['tour', 'name']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('tour', 'name', 'description', 'option_type')
        }),
        (_('Pricing'), {
            'fields': ('price', 'price_percentage', 'currency')
        }),
        (_('Availability'), {
            'fields': ('is_available', 'max_quantity')
        }),
        (_('Status'), {
            'fields': ('is_active',)
        }),
    )
    
    def get_queryset(self, request):
        """Add annotations for better performance."""
        return super().get_queryset(request).select_related('tour')


@admin.register(TourReview)
class TourReviewAdmin(admin.ModelAdmin):
    """Admin for TourReview model."""
    
    list_display = [
        'tour', 'user', 'rating', 'title', 'is_verified', 'created_at'
    ]
    list_filter = [
        'tour__category', 'rating', 'is_verified', 'created_at'
    ]
    search_fields = [
        'tour__title', 'user__username', 'user__email', 'title', 'comment'
    ]
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (_('Review Information'), {
            'fields': ('tour', 'user', 'rating', 'title', 'comment')
        }),
        (_('Metadata'), {
            'fields': ('is_verified', 'is_helpful')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Add annotations for better performance."""
        return super().get_queryset(request).select_related('tour', 'user')


@admin.register(TourBooking)
class TourBookingAdmin(admin.ModelAdmin):
    """Admin for TourBooking model."""
    
    list_display = [
        'booking_reference', 'tour', 'variant', 'user', 'total_participants',
        'final_price', 'status', 'created_at'
    ]
    list_filter = [
        'tour__category', 'status', 'booking_date', 'created_at'
    ]
    search_fields = [
        'booking_reference', 'tour__title', 'user__username', 'user__email'
    ]
    ordering = ['-created_at']
    readonly_fields = [
        'booking_reference', 'created_at', 'updated_at'
    ]
    
    fieldsets = (
        (_('Booking Information'), {
            'fields': ('booking_reference', 'tour', 'variant', 'schedule', 'user')
        }),
        (_('Booking Details'), {
            'fields': ('booking_date', 'booking_time')
        }),
        (_('Participants'), {
            'fields': ('adult_count', 'child_count', 'infant_count')
        }),
        (_('Pricing'), {
            'fields': ('adult_price', 'child_price', 'infant_price', 'options_total', 'final_price')
        }),
        (_('Options'), {
            'fields': ('selected_options',)
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
    
    def total_participants(self, obj):
        """Get total number of participants."""
        return obj.total_participants
    total_participants.short_description = _('Total Participants')
    
    def final_price(self, obj):
        """Get final price."""
        return f"${obj.final_price:.2f}"
    final_price.short_description = _('Final Price')
    
    def get_queryset(self, request):
        """Add annotations for better performance."""
        return super().get_queryset(request).select_related('tour', 'variant', 'schedule', 'user') 