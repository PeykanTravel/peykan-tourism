"""
Repository Pattern implementation for Peykan Tourism Platform.
Following Domain-Driven Design principles.
"""

from abc import ABC, abstractmethod
from typing import Generic, TypeVar, Optional, List, Dict, Any
from django.db import models, transaction
from django.core.exceptions import ObjectDoesNotExist
import uuid

from .domain_events import DomainEvent, domain_event_publisher

T = TypeVar('T')

class Repository(ABC, Generic[T]):
    """Generic repository interface"""
    
    @abstractmethod
    def save(self, aggregate: T) -> T:
        """Save aggregate and publish domain events"""
        pass
    
    @abstractmethod
    def get_by_id(self, aggregate_id: uuid.UUID) -> Optional[T]:
        """Get aggregate by ID"""
        pass
    
    @abstractmethod
    def get_all(self, filters: Optional[Dict[str, Any]] = None) -> List[T]:
        """Get all aggregates with optional filtering"""
        pass
    
    @abstractmethod
    def delete(self, aggregate_id: uuid.UUID) -> bool:
        """Delete aggregate"""
        pass
    
    @abstractmethod
    def exists(self, aggregate_id: uuid.UUID) -> bool:
        """Check if aggregate exists"""
        pass


class EventRepository(Repository):
    """Event repository implementation"""
    
    def __init__(self):
        from events.domain.aggregates import EventAggregate
        from events.models import Event
        self.aggregate_class = EventAggregate
        self.model_class = Event
    
    def save(self, aggregate) -> 'EventAggregate':
        """Save event aggregate and publish domain events"""
        try:
            with transaction.atomic():
                # Save the event
                aggregate.event.save()
                
                # Publish domain events
                for event in aggregate.get_domain_events():
                    domain_event_publisher.publish(event)
                
                return aggregate
                
        except Exception as e:
            print(f"Error saving event aggregate: {str(e)}")
            raise
    
    def get_by_id(self, aggregate_id: uuid.UUID) -> Optional['EventAggregate']:
        """Get event aggregate by ID"""
        try:
            event = self.model_class.objects.select_related(
                'category', 'venue'
            ).prefetch_related(
                'performances__sections__seats',
                'artists',
                'ticket_types',
                'options'
            ).get(id=aggregate_id)
            
            return self.aggregate_class(event)
            
        except ObjectDoesNotExist:
            return None
        except Exception as e:
            print(f"Error getting event aggregate: {str(e)}")
            return None
    
    def get_by_slug(self, slug: str) -> Optional['EventAggregate']:
        """Get event aggregate by slug"""
        try:
            event = self.model_class.objects.select_related(
                'category', 'venue'
            ).prefetch_related(
                'performances__sections__seats',
                'artists',
                'ticket_types',
                'options'
            ).get(slug=slug, is_active=True)
            
            return self.aggregate_class(event)
            
        except ObjectDoesNotExist:
            return None
        except Exception as e:
            print(f"Error getting event aggregate by slug: {str(e)}")
            return None
    
    def get_all(self, filters: Optional[Dict[str, Any]] = None) -> List['EventAggregate']:
        """Get all event aggregates with optional filtering"""
        try:
            queryset = self.model_class.objects.filter(is_active=True).select_related(
                'category', 'venue'
            ).prefetch_related(
                'performances__sections__seats',
                'artists',
                'ticket_types',
                'options'
            )
            
            if filters:
                # Apply filters
                if 'category' in filters:
                    queryset = queryset.filter(category__slug=filters['category'])
                
                if 'venue' in filters:
                    queryset = queryset.filter(venue__slug=filters['venue'])
                
                if 'date_from' in filters:
                    queryset = queryset.filter(performances__date__gte=filters['date_from'])
                
                if 'date_to' in filters:
                    queryset = queryset.filter(performances__date__lte=filters['date_to'])
                
                if 'price_min' in filters:
                    queryset = queryset.filter(price__gte=filters['price_min'])
                
                if 'price_max' in filters:
                    queryset = queryset.filter(price__lte=filters['price_max'])
                
                if 'is_available' in filters:
                    if filters['is_available']:
                        queryset = queryset.filter(performances__is_available=True)
            
            events = list(queryset.distinct())
            return [self.aggregate_class(event) for event in events]
            
        except Exception as e:
            print(f"Error getting event aggregates: {str(e)}")
            return []
    
    def delete(self, aggregate_id: uuid.UUID) -> bool:
        """Delete event aggregate"""
        try:
            event = self.model_class.objects.get(id=aggregate_id)
            event.delete()
            return True
            
        except ObjectDoesNotExist:
            return False
        except Exception as e:
            print(f"Error deleting event aggregate: {str(e)}")
            return False
    
    def exists(self, aggregate_id: uuid.UUID) -> bool:
        """Check if event aggregate exists"""
        return self.model_class.objects.filter(id=aggregate_id, is_active=True).exists()
    
    def get_available_events(self) -> List['EventAggregate']:
        """Get all available events"""
        try:
            events = self.model_class.objects.filter(
                is_active=True
            ).filter(
                performances__is_available=True
            ).select_related(
                'category', 'venue'
            ).prefetch_related(
                'performances__sections__seats'
            ).distinct()
            
            return [self.aggregate_class(event) for event in events]
            
        except Exception as e:
            print(f"Error getting available events: {str(e)}")
            return []


class CartRepository(Repository):
    """Cart repository implementation"""
    
    def __init__(self):
        from cart.domain.aggregates import CartAggregate
        from cart.models import Cart
        self.aggregate_class = CartAggregate
        self.model_class = Cart
    
    def save(self, aggregate) -> 'CartAggregate':
        """Save cart aggregate and publish domain events"""
        try:
            with transaction.atomic():
                # Save the cart
                aggregate.cart.save()
                
                # Publish domain events
                for event in aggregate.get_domain_events():
                    domain_event_publisher.publish(event)
                
                return aggregate
                
        except Exception as e:
            print(f"Error saving cart aggregate: {str(e)}")
            raise
    
    def get_by_id(self, aggregate_id: uuid.UUID) -> Optional['CartAggregate']:
        """Get cart aggregate by ID"""
        try:
            cart = self.model_class.objects.select_related('user').prefetch_related(
                'items'
            ).get(id=aggregate_id)
            
            return self.aggregate_class(cart)
            
        except ObjectDoesNotExist:
            return None
        except Exception as e:
            print(f"Error getting cart aggregate: {str(e)}")
            return None
    
    def get_by_user(self, user_id: uuid.UUID) -> Optional['CartAggregate']:
        """Get cart aggregate by user ID"""
        try:
            cart = self.model_class.objects.select_related('user').prefetch_related(
                'items'
            ).get(user_id=user_id)
            
            return self.aggregate_class(cart)
            
        except ObjectDoesNotExist:
            return None
        except Exception as e:
            print(f"Error getting cart aggregate by user: {str(e)}")
            return None
    
    def get_or_create_by_user(self, user_id: uuid.UUID) -> 'CartAggregate':
        """Get or create cart aggregate for user"""
        try:
            cart, created = self.model_class.objects.get_or_create(
                user_id=user_id,
                defaults={'session_key': None}
            )
            
            return self.aggregate_class(cart)
            
        except Exception as e:
            print(f"Error getting or creating cart aggregate: {str(e)}")
            raise
    
    def get_all(self, filters: Optional[Dict[str, Any]] = None) -> List['CartAggregate']:
        """Get all cart aggregates with optional filtering"""
        try:
            queryset = self.model_class.objects.select_related('user').prefetch_related('items')
            
            if filters:
                # Apply filters
                if 'user_id' in filters:
                    queryset = queryset.filter(user_id=filters['user_id'])
                
                if 'has_items' in filters:
                    if filters['has_items']:
                        queryset = queryset.filter(items__isnull=False)
                    else:
                        queryset = queryset.filter(items__isnull=True)
            
            carts = list(queryset.distinct())
            return [self.aggregate_class(cart) for cart in carts]
            
        except Exception as e:
            print(f"Error getting cart aggregates: {str(e)}")
            return []
    
    def delete(self, aggregate_id: uuid.UUID) -> bool:
        """Delete cart aggregate"""
        try:
            cart = self.model_class.objects.get(id=aggregate_id)
            cart.delete()
            return True
            
        except ObjectDoesNotExist:
            return False
        except Exception as e:
            print(f"Error deleting cart aggregate: {str(e)}")
            return False
    
    def exists(self, aggregate_id: uuid.UUID) -> bool:
        """Check if cart aggregate exists"""
        return self.model_class.objects.filter(id=aggregate_id).exists()


class UserRepository(Repository):
    """User repository implementation"""
    
    def __init__(self):
        from users.domain.aggregates import UserAggregate
        from users.models import User
        self.aggregate_class = UserAggregate
        self.model_class = User
    
    def save(self, aggregate) -> 'UserAggregate':
        """Save user aggregate and publish domain events"""
        try:
            with transaction.atomic():
                # Save the user
                aggregate.user.save()
                
                # Publish domain events
                for event in aggregate.get_domain_events():
                    domain_event_publisher.publish(event)
                
                return aggregate
                
        except Exception as e:
            print(f"Error saving user aggregate: {str(e)}")
            raise
    
    def get_by_id(self, aggregate_id: uuid.UUID) -> Optional['UserAggregate']:
        """Get user aggregate by ID"""
        try:
            user = self.model_class.objects.select_related('profile').get(id=aggregate_id)
            return self.aggregate_class(user)
            
        except ObjectDoesNotExist:
            return None
        except Exception as e:
            print(f"Error getting user aggregate: {str(e)}")
            return None
    
    def get_by_email(self, email: str) -> Optional['UserAggregate']:
        """Get user aggregate by email"""
        try:
            user = self.model_class.objects.select_related('profile').get(email=email)
            return self.aggregate_class(user)
            
        except ObjectDoesNotExist:
            return None
        except Exception as e:
            print(f"Error getting user aggregate by email: {str(e)}")
            return None
    
    def get_by_username(self, username: str) -> Optional['UserAggregate']:
        """Get user aggregate by username"""
        try:
            user = self.model_class.objects.select_related('profile').get(username=username)
            return self.aggregate_class(user)
            
        except ObjectDoesNotExist:
            return None
        except Exception as e:
            print(f"Error getting user aggregate by username: {str(e)}")
            return None
    
    def get_all(self, filters: Optional[Dict[str, Any]] = None) -> List['UserAggregate']:
        """Get all user aggregates with optional filtering"""
        try:
            queryset = self.model_class.objects.select_related('profile')
            
            if filters:
                # Apply filters
                if 'role' in filters:
                    queryset = queryset.filter(role=filters['role'])
                
                if 'is_active' in filters:
                    queryset = queryset.filter(is_active=filters['is_active'])
                
                if 'is_email_verified' in filters:
                    queryset = queryset.filter(is_email_verified=filters['is_email_verified'])
            
            users = list(queryset)
            return [self.aggregate_class(user) for user in users]
            
        except Exception as e:
            print(f"Error getting user aggregates: {str(e)}")
            return []
    
    def delete(self, aggregate_id: uuid.UUID) -> bool:
        """Delete user aggregate"""
        try:
            user = self.model_class.objects.get(id=aggregate_id)
            user.delete()
            return True
            
        except ObjectDoesNotExist:
            return False
        except Exception as e:
            print(f"Error deleting user aggregate: {str(e)}")
            return False
    
    def exists(self, aggregate_id: uuid.UUID) -> bool:
        """Check if user aggregate exists"""
        return self.model_class.objects.filter(id=aggregate_id).exists()
    
    def exists_by_email(self, email: str) -> bool:
        """Check if user exists by email"""
        return self.model_class.objects.filter(email=email).exists()
    
    def exists_by_username(self, username: str) -> bool:
        """Check if user exists by username"""
        return self.model_class.objects.filter(username=username).exists()


# Repository Factory
class RepositoryFactory:
    """Factory for creating repository instances"""
    
    _repositories = {}
    
    @classmethod
    def get_event_repository(cls) -> EventRepository:
        """Get event repository instance"""
        if 'event' not in cls._repositories:
            cls._repositories['event'] = EventRepository()
        return cls._repositories['event']
    
    @classmethod
    def get_cart_repository(cls) -> CartRepository:
        """Get cart repository instance"""
        if 'cart' not in cls._repositories:
            cls._repositories['cart'] = CartRepository()
        return cls._repositories['cart']
    
    @classmethod
    def get_user_repository(cls) -> UserRepository:
        """Get user repository instance"""
        if 'user' not in cls._repositories:
            cls._repositories['user'] = UserRepository()
        return cls._repositories['user']
    
    @classmethod
    def clear_cache(cls):
        """Clear repository cache"""
        cls._repositories.clear() 