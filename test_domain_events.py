#!/usr/bin/env python
"""
Test script for Domain Events system.
"""

import os
import sys
import django
from datetime import datetime, timedelta
import uuid

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'peykan.settings')
django.setup()

from core.domain_events import (
    domain_event_publisher,
    UserRegisteredEvent,
    OrderCreatedEvent,
    SeatsReservedEvent,
    CartItemAddedEvent
)

def test_domain_events():
    """Test domain events functionality"""
    
    print("🧪 Testing Domain Events System")
    print("=" * 50)
    
    # Test 1: User Registration Event
    print("\n1. Testing User Registration Event:")
    user_event = UserRegisteredEvent(
        aggregate_id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        email="test@example.com",
        username="testuser",
        first_name="Test",
        last_name="User",
        role="customer"
    )
    
    print(f"   Event Type: {user_event.event_type}")
    print(f"   User ID: {user_event.user_id}")
    print(f"   Email: {user_event.email}")
    
    # Publish event
    domain_event_publisher.publish(user_event)
    
    # Test 2: Order Created Event
    print("\n2. Testing Order Created Event:")
    order_event = OrderCreatedEvent(
        aggregate_id=uuid.uuid4(),
        order_id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        order_number="ORD123456",
        total_amount=150.00,
        currency="USD",
        items_count=2
    )
    
    print(f"   Event Type: {order_event.event_type}")
    print(f"   Order Number: {order_event.order_number}")
    print(f"   Total Amount: {order_event.total_amount}")
    
    # Publish event
    domain_event_publisher.publish(order_event)
    
    # Test 3: Seats Reserved Event
    print("\n3. Testing Seats Reserved Event:")
    seat_ids = [uuid.uuid4(), uuid.uuid4(), uuid.uuid4()]
    seats_event = SeatsReservedEvent(
        aggregate_id=uuid.uuid4(),
        event_id=uuid.uuid4(),
        performance_id=uuid.uuid4(),
        seat_ids=seat_ids,
        user_id=uuid.uuid4(),
        reservation_id=uuid.uuid4(),
        expires_at=datetime.now() + timedelta(minutes=15)
    )
    
    print(f"   Event Type: {seats_event.event_type}")
    print(f"   Number of Seats: {len(seats_event.seat_ids)}")
    print(f"   Expires At: {seats_event.expires_at}")
    
    # Publish event
    domain_event_publisher.publish(seats_event)
    
    # Test 4: Cart Item Added Event
    print("\n4. Testing Cart Item Added Event:")
    cart_event = CartItemAddedEvent(
        aggregate_id=uuid.uuid4(),
        cart_id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        item_id=uuid.uuid4(),
        product_type="event",
        product_id=uuid.uuid4(),
        quantity=2,
        unit_price=75.00,
        total_price=150.00,
        currency="USD"
    )
    
    print(f"   Event Type: {cart_event.event_type}")
    print(f"   Product Type: {cart_event.product_type}")
    print(f"   Quantity: {cart_event.quantity}")
    print(f"   Total Price: {cart_event.total_price}")
    
    # Publish event
    domain_event_publisher.publish(cart_event)
    
    print("\n✅ All Domain Events tests completed successfully!")
    print("=" * 50)

def test_event_serialization():
    """Test event serialization"""
    
    print("\n🧪 Testing Event Serialization")
    print("=" * 50)
    
    # Create a test event
    event = UserRegisteredEvent(
        aggregate_id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        email="serialization@test.com",
        username="serialtest",
        first_name="Serial",
        last_name="Test",
        role="customer"
    )
    
    # Test to_dict
    event_dict = event.to_dict()
    print(f"Event as Dictionary: {event_dict}")
    
    # Test to_json
    event_json = event.to_json()
    print(f"Event as JSON: {event_json}")
    
    print("✅ Event serialization tests completed!")

if __name__ == "__main__":
    print("🚀 Starting Domain Events Tests")
    print("=" * 50)
    
    try:
        test_domain_events()
        test_event_serialization()
        
        print("\n🎉 All tests passed successfully!")
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc() 