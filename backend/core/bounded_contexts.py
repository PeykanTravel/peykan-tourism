"""
Bounded Contexts definition for Peykan Tourism Platform.
Following Domain-Driven Design principles.
"""

from enum import Enum
from typing import List, Dict, Set

class BoundedContext(Enum):
    """Bounded contexts in the system"""
    USER_MANAGEMENT = "user_management"
    PRODUCT_CATALOG = "product_catalog"
    BOOKING = "booking"
    INVENTORY = "inventory"
    PAYMENT = "payment"
    NOTIFICATION = "notification"
    ANALYTICS = "analytics"

# Context Map - defines relationships between bounded contexts
BOUNDED_CONTEXT_MAP = {
    BoundedContext.USER_MANAGEMENT: {
        'apps': ['users'],
        'domain': ['authentication', 'authorization', 'user_profile', 'user_preferences'],
        'aggregates': ['User', 'UserProfile', 'UserSession', 'OTPCode'],
        'description': 'Manages user accounts, authentication, and user profiles',
        'responsibilities': [
            'User registration and authentication',
            'Profile management',
            'Role-based authorization',
            'Session management',
            'OTP and verification'
        ]
    },
    BoundedContext.PRODUCT_CATALOG: {
        'apps': ['tours', 'events', 'transfers'],
        'domain': ['product_management', 'pricing', 'availability', 'categorization'],
        'aggregates': ['Tour', 'Event', 'Transfer', 'ProductCategory'],
        'description': 'Manages product catalog, pricing, and availability',
        'responsibilities': [
            'Product creation and management',
            'Pricing strategies',
            'Availability tracking',
            'Product categorization',
            'Content management'
        ]
    },
    BoundedContext.BOOKING: {
        'apps': ['cart', 'orders'],
        'domain': ['booking_management', 'reservation', 'confirmation', 'cancellation'],
        'aggregates': ['Cart', 'Order', 'Booking', 'Reservation'],
        'description': 'Handles booking process, cart management, and order processing',
        'responsibilities': [
            'Shopping cart management',
            'Booking creation and confirmation',
            'Order processing',
            'Reservation management',
            'Booking cancellation'
        ]
    },
    BoundedContext.INVENTORY: {
        'apps': ['events', 'tours'],
        'domain': ['capacity_management', 'seat_management', 'availability', 'inventory_tracking'],
        'aggregates': ['EventCapacity', 'TourCapacity', 'SeatInventory', 'VenueCapacity'],
        'description': 'Manages inventory, capacity, and availability across all products',
        'responsibilities': [
            'Capacity management',
            'Seat allocation',
            'Availability tracking',
            'Inventory updates',
            'Overbooking prevention'
        ]
    },
    BoundedContext.PAYMENT: {
        'apps': ['payments'],
        'domain': ['payment_processing', 'transaction_management', 'refund_handling'],
        'aggregates': ['Payment', 'Transaction', 'Refund', 'PaymentMethod'],
        'description': 'Handles payment processing, transactions, and refunds',
        'responsibilities': [
            'Payment processing',
            'Transaction management',
            'Refund handling',
            'Payment method management',
            'Financial reporting'
        ]
    },
    BoundedContext.NOTIFICATION: {
        'apps': ['shared'],
        'domain': ['notification_management', 'communication', 'messaging'],
        'aggregates': ['Notification', 'Message', 'EmailTemplate', 'SMSTemplate'],
        'description': 'Manages notifications, emails, and communication',
        'responsibilities': [
            'Email notifications',
            'SMS notifications',
            'Push notifications',
            'Template management',
            'Communication tracking'
        ]
    },
    BoundedContext.ANALYTICS: {
        'apps': ['shared'],
        'domain': ['data_analytics', 'reporting', 'metrics', 'insights'],
        'aggregates': ['Analytics', 'Report', 'Metric', 'Dashboard'],
        'description': 'Provides analytics, reporting, and business insights',
        'responsibilities': [
            'Data collection',
            'Report generation',
            'Metrics calculation',
            'Business insights',
            'Performance monitoring'
        ]
    }
}

# Context relationships - defines how contexts interact
CONTEXT_RELATIONSHIPS = {
    BoundedContext.USER_MANAGEMENT: {
        'upstream': [],
        'downstream': [BoundedContext.BOOKING, BoundedContext.PAYMENT],
        'conformist': [],
        'anticorruption': []
    },
    BoundedContext.PRODUCT_CATALOG: {
        'upstream': [],
        'downstream': [BoundedContext.BOOKING, BoundedContext.INVENTORY],
        'conformist': [],
        'anticorruption': []
    },
    BoundedContext.BOOKING: {
        'upstream': [BoundedContext.USER_MANAGEMENT, BoundedContext.PRODUCT_CATALOG],
        'downstream': [BoundedContext.PAYMENT, BoundedContext.NOTIFICATION],
        'conformist': [],
        'anticorruption': []
    },
    BoundedContext.INVENTORY: {
        'upstream': [BoundedContext.PRODUCT_CATALOG],
        'downstream': [BoundedContext.BOOKING],
        'conformist': [],
        'anticorruption': []
    },
    BoundedContext.PAYMENT: {
        'upstream': [BoundedContext.USER_MANAGEMENT, BoundedContext.BOOKING],
        'downstream': [BoundedContext.NOTIFICATION, BoundedContext.ANALYTICS],
        'conformist': [],
        'anticorruption': []
    },
    BoundedContext.NOTIFICATION: {
        'upstream': [BoundedContext.BOOKING, BoundedContext.PAYMENT],
        'downstream': [],
        'conformist': [],
        'anticorruption': []
    },
    BoundedContext.ANALYTICS: {
        'upstream': [BoundedContext.PAYMENT, BoundedContext.BOOKING],
        'downstream': [],
        'conformist': [],
        'anticorruption': []
    }
}

# Shared Kernel - common concepts shared across contexts
SHARED_KERNEL = {
    'entities': [
        'UUID',
        'Timestamp',
        'Currency',
        'Language',
        'Country',
        'City'
    ],
    'value_objects': [
        'Email',
        'PhoneNumber',
        'Money',
        'DateRange',
        'Address'
    ],
    'specifications': [
        'IsActive',
        'IsValid',
        'IsAvailable'
    ]
}

# Ubiquitous Language - common terms used across the system
UBIQUITOUS_LANGUAGE = {
    'user_management': {
        'User': 'A person who can register and use the system',
        'Guest': 'A user without registration',
        'Customer': 'A registered user who can make bookings',
        'Agent': 'A user who can make bookings on behalf of customers',
        'Admin': 'A user with administrative privileges',
        'Authentication': 'Process of verifying user identity',
        'Authorization': 'Process of determining user permissions',
        'Session': 'Temporary user login state'
    },
    'product_catalog': {
        'Product': 'Any bookable item (tour, event, transfer)',
        'Tour': 'A guided trip or excursion',
        'Event': 'A performance or gathering',
        'Transfer': 'Transportation service',
        'Variant': 'Different version of a product',
        'Schedule': 'When a product is available',
        'Pricing': 'Cost structure for a product'
    },
    'booking': {
        'Booking': 'A confirmed reservation',
        'Cart': 'Temporary storage for items before booking',
        'Order': 'A completed booking with payment',
        'Reservation': 'A temporary hold on inventory',
        'Confirmation': 'Verification that booking is successful',
        'Cancellation': 'Process of canceling a booking'
    },
    'inventory': {
        'Capacity': 'Maximum number of available spots',
        'Availability': 'Current number of available spots',
        'Seat': 'Individual spot in an event',
        'Section': 'Group of seats in an event',
        'Overbooking': 'Booking more than available capacity',
        'Inventory': 'Track of available resources'
    },
    'payment': {
        'Payment': 'Financial transaction for a booking',
        'Transaction': 'Record of money movement',
        'Refund': 'Return of money to customer',
        'PaymentMethod': 'Way to pay (credit card, bank transfer, etc.)',
        'Invoice': 'Document requesting payment'
    }
}

def get_context_for_app(app_name: str) -> BoundedContext:
    """Get bounded context for a Django app"""
    for context, config in BOUNDED_CONTEXT_MAP.items():
        if app_name in config['apps']:
            return context
    raise ValueError(f"No bounded context found for app: {app_name}")

def get_apps_for_context(context: BoundedContext) -> List[str]:
    """Get Django apps for a bounded context"""
    return BOUNDED_CONTEXT_MAP[context]['apps']

def get_aggregates_for_context(context: BoundedContext) -> List[str]:
    """Get aggregates for a bounded context"""
    return BOUNDED_CONTEXT_MAP[context]['aggregates']

def get_upstream_contexts(context: BoundedContext) -> List[BoundedContext]:
    """Get upstream contexts for a bounded context"""
    return CONTEXT_RELATIONSHIPS[context]['upstream']

def get_downstream_contexts(context: BoundedContext) -> List[BoundedContext]:
    """Get downstream contexts for a bounded context"""
    return CONTEXT_RELATIONSHIPS[context]['downstream'] 