#!/usr/bin/env python
"""
Simple test for DDD implementation.
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'peykan.settings')
django.setup()

def test_bounded_contexts():
    """Test bounded contexts"""
    print("🧪 Testing Bounded Contexts")
    print("=" * 50)
    
    try:
        from core.bounded_contexts import (
            BoundedContext, 
            BOUNDED_CONTEXT_MAP,
            get_context_for_app,
            get_apps_for_context
        )
        
        print("✅ Bounded Contexts imported successfully")
        
        # Test context mapping
        print(f"\n📋 Available Contexts:")
        for context in BoundedContext:
            print(f"   - {context.value}")
        
        # Test app to context mapping
        print(f"\n🔗 App to Context Mapping:")
        test_apps = ['users', 'events', 'cart', 'orders']
        for app in test_apps:
            try:
                context = get_context_for_app(app)
                print(f"   {app} -> {context.value}")
            except ValueError as e:
                print(f"   {app} -> {str(e)}")
        
        # Test context to apps mapping
        print(f"\n📦 Context to Apps Mapping:")
        for context in BoundedContext:
            apps = get_apps_for_context(context)
            print(f"   {context.value} -> {apps}")
        
        print("\n✅ Bounded Contexts test completed!")
        
    except ImportError as e:
        print(f"❌ Import error: {str(e)}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def test_domain_events():
    """Test domain events"""
    print("\n🧪 Testing Domain Events")
    print("=" * 50)
    
    try:
        from core.domain_events import (
            DomainEvent,
            UserRegisteredEvent,
            OrderCreatedEvent,
            domain_event_publisher
        )
        
        print("✅ Domain Events imported successfully")
        
        # Test event creation
        import uuid
        from datetime import datetime
        
        user_event = UserRegisteredEvent(
            aggregate_id=uuid.uuid4(),
            user_id=uuid.uuid4(),
            email="test@example.com",
            username="testuser",
            first_name="Test",
            last_name="User",
            role="customer"
        )
        
        print(f"✅ UserRegisteredEvent created: {user_event.event_type}")
        
        # Test event serialization
        event_dict = user_event.to_dict()
        print(f"✅ Event serialized to dict: {len(event_dict)} fields")
        
        # Test event publisher
        domain_event_publisher.publish(user_event)
        print("✅ Event published successfully")
        
        print("\n✅ Domain Events test completed!")
        
    except ImportError as e:
        print(f"❌ Import error: {str(e)}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def test_repository_pattern():
    """Test repository pattern"""
    print("\n🧪 Testing Repository Pattern")
    print("=" * 50)
    
    try:
        from core.repositories import RepositoryFactory
        
        print("✅ Repository Factory imported successfully")
        
        # Test repository creation
        event_repo = RepositoryFactory.get_event_repository()
        print("✅ Event Repository created")
        
        cart_repo = RepositoryFactory.get_cart_repository()
        print("✅ Cart Repository created")
        
        user_repo = RepositoryFactory.get_user_repository()
        print("✅ User Repository created")
        
        print("\n✅ Repository Pattern test completed!")
        
    except ImportError as e:
        print(f"❌ Import error: {str(e)}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def test_clean_architecture():
    """Test clean architecture layers"""
    print("\n🧪 Testing Clean Architecture Layers")
    print("=" * 50)
    
    try:
        # Test domain layer
        from users.domain.entities import User, UserRole
        print("✅ Domain entities imported")
        
        # Test infrastructure layer
        from users.infrastructure.repositories import DjangoUserRepository
        print("✅ Infrastructure repositories imported")
        
        # Test application layer
        from users.application.use_cases import RegisterUserUseCase
        print("✅ Application use cases imported")
        
        # Test presentation layer
        from users.presentation.controllers import AuthenticationController
        print("✅ Presentation controllers imported")
        
        print("\n✅ Clean Architecture layers test completed!")
        
    except ImportError as e:
        print(f"❌ Import error: {str(e)}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    print("🚀 Starting DDD Implementation Tests")
    print("=" * 60)
    
    test_bounded_contexts()
    test_domain_events()
    test_repository_pattern()
    test_clean_architecture()
    
    print("\n🎉 All DDD tests completed!")
    print("=" * 60) 