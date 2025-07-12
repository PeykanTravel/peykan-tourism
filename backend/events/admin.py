"""
Django Admin configuration for Events app.
"""

from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django.urls import reverse
from django.db.models import Count, Sum, Avg
from parler.admin import TranslatableAdmin
from .models import (
    EventCategory, Venue, Artist, Event, TicketType, EventPerformance, Seat,
    EventOption, EventReview, EventBooking, EventSection, SectionTicketType,
    EventDiscount, EventFee, EventPricingRule
)


class TicketTypeInline(admin.TabularInline):
    """Inline admin for TicketType."""
    
    model = TicketType
    extra = 1
    fields = ['name', 'description', 'ticket_type', 'capacity', 'price_modifier', 'is_active']


class EventPerformanceInline(admin.TabularInline):
    """Inline admin for EventPerformance."""
    
    model = EventPerformance
    extra = 1
    fields = ['date', 'is_special', 'is_available']


class EventOptionInline(admin.TabularInline):
    """Inline admin for EventOption."""
    
    model = EventOption
    extra = 1
    fields = ['name', 'description', 'price', 'option_type', 'is_active']


class EventDiscountInline(admin.TabularInline):
    """Inline admin for EventDiscount."""
    
    model = EventDiscount
    extra = 1
    fields = ['code', 'name', 'discount_type', 'discount_value', 'is_active']


class EventFeeInline(admin.TabularInline):
    """Inline admin for EventFee."""
    
    model = EventFee
    extra = 1
    fields = ['name', 'fee_type', 'calculation_type', 'fee_value', 'is_active']


@admin.register(EventCategory)
class EventCategoryAdmin(TranslatableAdmin):
    """Admin for EventCategory model."""
    
    list_display = ['name', 'icon', 'color', 'event_count', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'description']
    ordering = ['name']
    
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
    
    def event_count(self, obj):
        """Get number of events in this category."""
        return obj.events.count()
    event_count.short_description = _('Event Count')


@admin.register(Venue)
class VenueAdmin(TranslatableAdmin):
    """Admin for Venue model."""
    
    list_display = [
        'name', 'city', 'country', 'total_capacity', 'event_count', 'is_active'
    ]
    list_filter = ['country', 'city', 'is_active']
    search_fields = ['name', 'description', 'address', 'city', 'country']
    ordering = ['name']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('name', 'description', 'slug')
        }),
        (_('Location'), {
            'fields': ('city', 'country', 'address', 'coordinates')
        }),
        (_('Details'), {
            'fields': ('image', 'website', 'total_capacity', 'facilities')
        }),
        (_('Status'), {
            'fields': ('is_active',)
        }),
    )
    
    def event_count(self, obj):
        """Get number of events at this venue."""
        return obj.events.count()
    event_count.short_description = _('Event Count')


@admin.register(Artist)
class ArtistAdmin(TranslatableAdmin):
    """Admin for Artist model."""
    
    list_display = ['name', 'event_count', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'bio']
    ordering = ['name']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('name', 'bio', 'slug')
        }),
        (_('Details'), {
            'fields': ('image', 'website', 'social_media')
        }),
        (_('Status'), {
            'fields': ('is_active',)
        }),
    )
    
    def event_count(self, obj):
        """Get number of events for this artist."""
        return obj.events.count()
    event_count.short_description = _('Event Count')


@admin.register(Event)
class EventAdmin(TranslatableAdmin):
    """Admin for Event model."""
    
    list_display = [
        'title', 'category', 'venue', 'style', 'price', 'is_featured', 
        'is_popular', 'is_active', 'booking_count'
    ]
    list_filter = [
        'category', 'venue', 'style', 'is_featured', 'is_popular', 
        'is_active', 'created_at'
    ]
    search_fields = [
        'title', 'description', 'category__name', 'venue__name'
    ]
    ordering = ['-created_at']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    inlines = [
        TicketTypeInline, EventPerformanceInline, EventOptionInline,
        EventDiscountInline, EventFeeInline
    ]
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('id', 'title', 'description', 'short_description', 'slug')
        }),
        (_('Category & Venue'), {
            'fields': ('category', 'venue', 'artists')
        }),
        (_('Event Details'), {
            'fields': ('style', 'age_restriction')
        }),
        (_('Location'), {
            'fields': ('city', 'country', 'image')
        }),
        (_('Pricing'), {
            'fields': ('price', 'currency')
        }),
        (_('Timing'), {
            'fields': ('door_open_time', 'start_time', 'end_time')
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
        """Get number of bookings for this event."""
        return obj.bookings.count()
    booking_count.short_description = _('Bookings')
    
    def get_queryset(self, request):
        """Add annotations for better performance."""
        return super().get_queryset(request).select_related('category', 'venue').prefetch_related('bookings')


@admin.register(TicketType)
class TicketTypeAdmin(admin.ModelAdmin):
    """Admin for TicketType model."""
    
    list_display = [
        'name', 'event', 'ticket_type', 'capacity', 'price_modifier', 
        'is_active', 'booking_count'
    ]
    list_filter = [
        'event__category', 'ticket_type', 'is_active'
    ]
    search_fields = [
        'name', 'description', 'event__title'
    ]
    ordering = ['event', 'name']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('event', 'name', 'description', 'ticket_type')
        }),
        (_('Pricing & Capacity'), {
            'fields': ('capacity', 'price_modifier')
        }),
        (_('Benefits'), {
            'fields': ('benefits',)
        }),
        (_('Restrictions'), {
            'fields': ('age_min', 'age_max')
        }),
        (_('Status'), {
            'fields': ('is_active',)
        }),
    )
    
    def booking_count(self, obj):
        """Get number of bookings for this ticket type."""
        return obj.seats.filter(status='sold').count()
    booking_count.short_description = _('Bookings')
    
    def get_queryset(self, request):
        """Add annotations for better performance."""
        return super().get_queryset(request).select_related('event')


@admin.register(EventPerformance)
class EventPerformanceAdmin(admin.ModelAdmin):
    """Admin for EventPerformance model."""
    
    list_display = [
        'event', 'date', 'is_special', 'is_available', 'total_capacity', 
        'booking_count'
    ]
    list_filter = [
        'event__category', 'is_special', 'is_available', 'date'
    ]
    search_fields = [
        'event__title', 'event__venue__name'
    ]
    ordering = ['event', 'date']
    
    fieldsets = (
        (_('Performance Information'), {
            'fields': ('event', 'date', 'is_special')
        }),
        (_('Capacity'), {
            'fields': ('ticket_capacities',)
        }),
        (_('Status'), {
            'fields': ('is_available',)
        }),
    )
    
    def total_capacity(self, obj):
        """Get total capacity for this performance."""
        total = 0
        for capacity in obj.ticket_capacities.values():
            total += capacity
        return total
    total_capacity.short_description = _('Total Capacity')
    
    def booking_count(self, obj):
        """Get number of bookings for this performance."""
        return obj.bookings.count()
    booking_count.short_description = _('Bookings')
    
    def get_queryset(self, request):
        """Add annotations for better performance."""
        return super().get_queryset(request).select_related('event').prefetch_related('bookings')


@admin.register(Seat)
class SeatAdmin(admin.ModelAdmin):
    """Admin for Seat model."""
    
    list_display = [
        'performance', 'seat_number', 'row_number', 'section', 'ticket_type',
        'price', 'status', 'is_wheelchair_accessible'
    ]
    list_filter = [
        'performance__event__category', 'status', 'is_wheelchair_accessible',
        'is_premium', 'section'
    ]
    search_fields = [
        'performance__event__title', 'seat_number', 'row_number', 'section'
    ]
    ordering = ['performance', 'section', 'row_number', 'seat_number']
    
    fieldsets = (
        (_('Seat Information'), {
            'fields': ('performance', 'ticket_type', 'seat_number', 'row_number', 'section')
        }),
        (_('Pricing'), {
            'fields': ('price', 'currency')
        }),
        (_('Status'), {
            'fields': ('status',)
        }),
        (_('Features'), {
            'fields': ('is_wheelchair_accessible', 'is_premium')
        }),
    )
    
    def get_queryset(self, request):
        """Add annotations for better performance."""
        return super().get_queryset(request).select_related('performance__event', 'ticket_type')


@admin.register(EventOption)
class EventOptionAdmin(admin.ModelAdmin):
    """Admin for EventOption model."""
    
    list_display = [
        'name', 'event', 'option_type', 'price', 'is_active'
    ]
    list_filter = [
        'event__category', 'option_type', 'is_active', 'is_available'
    ]
    search_fields = [
        'name', 'description', 'event__title'
    ]
    ordering = ['event', 'name']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('event', 'name', 'description', 'option_type')
        }),
        (_('Pricing'), {
            'fields': ('price', 'currency')
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
        return super().get_queryset(request).select_related('event')


@admin.register(EventReview)
class EventReviewAdmin(admin.ModelAdmin):
    """Admin for EventReview model."""
    
    list_display = [
        'event', 'user', 'rating', 'title', 'is_verified', 'created_at'
    ]
    list_filter = [
        'event__category', 'rating', 'is_verified', 'created_at'
    ]
    search_fields = [
        'event__title', 'user__username', 'user__email', 'title', 'comment'
    ]
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (_('Review Information'), {
            'fields': ('event', 'user', 'rating', 'title', 'comment')
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
        return super().get_queryset(request).select_related('event', 'user')


@admin.register(EventBooking)
class EventBookingAdmin(admin.ModelAdmin):
    """Admin for EventBooking model."""
    
    list_display = [
        'booking_reference', 'event', 'performance', 'user', 'total_tickets',
        'final_price', 'status', 'created_at'
    ]
    list_filter = [
        'event__category', 'status', 'booking_date', 'created_at'
    ]
    search_fields = [
        'booking_reference', 'event__title', 'user__username', 'user__email'
    ]
    ordering = ['-created_at']
    readonly_fields = [
        'booking_reference', 'created_at', 'updated_at'
    ]
    
    fieldsets = (
        (_('Booking Information'), {
            'fields': ('booking_reference', 'event', 'performance', 'user')
        }),
        (_('Booking Details'), {
            'fields': ('booking_date', 'booking_time')
        }),
        (_('Seat Selection'), {
            'fields': ('selected_seats',)
        }),
        (_('Ticket Breakdown'), {
            'fields': ('ticket_breakdown',)
        }),
        (_('Options'), {
            'fields': ('selected_options', 'options_total')
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
    
    def total_tickets(self, obj):
        """Get total number of tickets."""
        return obj.total_tickets
    total_tickets.short_description = _('Total Tickets')
    
    def final_price(self, obj):
        """Get final price."""
        return f"${obj.final_price:.2f}"
    final_price.short_description = _('Final Price')
    
    def get_queryset(self, request):
        """Add annotations for better performance."""
        return super().get_queryset(request).select_related('event', 'performance', 'user')


@admin.register(EventSection)
class EventSectionAdmin(admin.ModelAdmin):
    """Admin for EventSection model."""
    
    list_display = [
        'performance', 'name', 'total_capacity', 'available_capacity',
        'occupancy_rate', 'is_premium'
    ]
    list_filter = [
        'performance__event__category', 'is_wheelchair_accessible', 'is_premium'
    ]
    search_fields = [
        'performance__event__title', 'name', 'description'
    ]
    ordering = ['performance', 'name']
    
    fieldsets = (
        (_('Section Information'), {
            'fields': ('performance', 'name', 'description')
        }),
        (_('Capacity Management'), {
            'fields': ('total_capacity', 'available_capacity', 'reserved_capacity', 'sold_capacity')
        }),
        (_('Pricing'), {
            'fields': ('base_price', 'currency')
        }),
        (_('Features'), {
            'fields': ('is_wheelchair_accessible', 'is_premium')
        }),
    )
    
    def occupancy_rate(self, obj):
        """Get occupancy rate percentage."""
        if obj.total_capacity > 0:
            rate = ((obj.total_capacity - obj.available_capacity) / obj.total_capacity) * 100
            return f"{rate:.1f}%"
        return "0%"
    occupancy_rate.short_description = _('Occupancy Rate')
    
    def get_queryset(self, request):
        """Add annotations for better performance."""
        return super().get_queryset(request).select_related('performance__event')


@admin.register(SectionTicketType)
class SectionTicketTypeAdmin(admin.ModelAdmin):
    """Admin for SectionTicketType model."""
    
    list_display = [
        'section', 'ticket_type', 'allocated_capacity', 'available_capacity',
        'final_price', 'is_active'
    ]
    list_filter = [
        'section__performance__event__category', 'is_active'
    ]
    search_fields = [
        'section__performance__event__title', 'section__name', 'ticket_type__name'
    ]
    ordering = ['section', 'ticket_type']
    
    fieldsets = (
        (_('Allocation Information'), {
            'fields': ('section', 'ticket_type')
        }),
        (_('Capacity Management'), {
            'fields': ('allocated_capacity', 'available_capacity', 'reserved_capacity', 'sold_capacity')
        }),
        (_('Pricing'), {
            'fields': ('price_modifier',)
        }),
        (_('Status'), {
            'fields': ('is_active',)
        }),
    )
    
    def final_price(self, obj):
        """Calculate final price."""
        base_price = obj.section.base_price
        modifier = obj.price_modifier
        final = base_price + modifier
        return f"${final:.2f}"
    final_price.short_description = _('Final Price')
    
    def get_queryset(self, request):
        """Add annotations for better performance."""
        return super().get_queryset(request).select_related('section__performance__event', 'ticket_type')


@admin.register(EventDiscount)
class EventDiscountAdmin(admin.ModelAdmin):
    """Admin for EventDiscount model."""
    
    list_display = [
        'event', 'code', 'name', 'discount_type', 'discount_value',
        'is_valid', 'is_active', 'current_uses'
    ]
    list_filter = [
        'event__category', 'discount_type', 'is_active', 'valid_from', 'valid_until'
    ]
    search_fields = [
        'event__title', 'code', 'name', 'description'
    ]
    ordering = ['event', 'code']
    
    fieldsets = (
        (_('Discount Information'), {
            'fields': ('event', 'code', 'name', 'description')
        }),
        (_('Discount Details'), {
            'fields': ('discount_type', 'discount_value')
        }),
        (_('Conditions'), {
            'fields': ('min_amount', 'max_discount')
        }),
        (_('Usage Limits'), {
            'fields': ('max_uses', 'current_uses')
        }),
        (_('Validity'), {
            'fields': ('valid_from', 'valid_until')
        }),
        (_('Status'), {
            'fields': ('is_active',)
        }),
    )
    
    def is_valid(self, obj):
        """Check if discount is currently valid."""
        return obj.is_valid()
    is_valid.boolean = True
    is_valid.short_description = _('Valid')
    
    def get_queryset(self, request):
        """Add annotations for better performance."""
        return super().get_queryset(request).select_related('event')


@admin.register(EventFee)
class EventFeeAdmin(admin.ModelAdmin):
    """Admin for EventFee model."""
    
    list_display = [
        'event', 'name', 'fee_type', 'calculation_type', 'fee_value',
        'is_mandatory', 'is_active'
    ]
    list_filter = [
        'event__category', 'fee_type', 'calculation_type', 'is_mandatory', 'is_active'
    ]
    search_fields = [
        'event__title', 'name', 'description'
    ]
    ordering = ['event', 'fee_type', 'name']
    
    fieldsets = (
        (_('Fee Information'), {
            'fields': ('event', 'name', 'description')
        }),
        (_('Fee Details'), {
            'fields': ('fee_type', 'calculation_type', 'fee_value')
        }),
        (_('Conditions'), {
            'fields': ('min_amount', 'max_fee')
        }),
        (_('Status'), {
            'fields': ('is_mandatory', 'is_active')
        }),
    )
    
    def get_queryset(self, request):
        """Add annotations for better performance."""
        return super().get_queryset(request).select_related('event')


@admin.register(EventPricingRule)
class EventPricingRuleAdmin(admin.ModelAdmin):
    """Admin for EventPricingRule model."""
    
    list_display = [
        'event', 'name', 'rule_type', 'adjustment_type', 'adjustment_value',
        'priority', 'is_active'
    ]
    list_filter = [
        'event__category', 'rule_type', 'adjustment_type', 'is_active'
    ]
    search_fields = [
        'event__title', 'name', 'description'
    ]
    ordering = ['event', '-priority', 'name']
    
    fieldsets = (
        (_('Rule Information'), {
            'fields': ('event', 'name', 'description')
        }),
        (_('Rule Details'), {
            'fields': ('rule_type', 'adjustment_type', 'adjustment_value')
        }),
        (_('Conditions'), {
            'fields': ('conditions',)
        }),
        (_('Priority'), {
            'fields': ('priority',)
        }),
        (_('Status'), {
            'fields': ('is_active',)
        }),
    )
    
    def get_queryset(self, request):
        """Add annotations for better performance."""
        return super().get_queryset(request).select_related('event') 