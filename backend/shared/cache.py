"""
Cache management utilities for Peykan Tourism Platform.
"""

import json
import logging
from typing import Any, Optional, Dict, List
from django.core.cache import cache
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger(__name__)


class CacheManager:
    """
    Centralized cache management for the application.
    """
    
    # Cache key prefixes
    TOUR_PREFIX = "tour"
    EVENT_PREFIX = "event"
    TRANSFER_PREFIX = "transfer"
    USER_PREFIX = "user"
    CART_PREFIX = "cart"
    ORDER_PREFIX = "order"
    CURRENCY_PREFIX = "currency"
    SEARCH_PREFIX = "search"
    
    # Default TTL values (in seconds)
    DEFAULT_TTL = 3600  # 1 hour
    SHORT_TTL = 300     # 5 minutes
    LONG_TTL = 86400    # 24 hours
    CURRENCY_TTL = 1800 # 30 minutes
    
    @classmethod
    def get_tour_key(cls, tour_id: str, suffix: str = "") -> str:
        """Generate cache key for tour data."""
        return f"{cls.TOUR_PREFIX}:{tour_id}:{suffix}" if suffix else f"{cls.TOUR_PREFIX}:{tour_id}"
    
    @classmethod
    def get_event_key(cls, event_id: str, suffix: str = "") -> str:
        """Generate cache key for event data."""
        return f"{cls.EVENT_PREFIX}:{event_id}:{suffix}" if suffix else f"{cls.EVENT_PREFIX}:{event_id}"
    
    @classmethod
    def get_transfer_key(cls, transfer_id: str, suffix: str = "") -> str:
        """Generate cache key for transfer data."""
        return f"{cls.TRANSFER_PREFIX}:{transfer_id}:{suffix}" if suffix else f"{cls.TRANSFER_PREFIX}:{transfer_id}"
    
    @classmethod
    def get_user_key(cls, user_id: str, suffix: str = "") -> str:
        """Generate cache key for user data."""
        return f"{cls.USER_PREFIX}:{user_id}:{suffix}" if suffix else f"{cls.USER_PREFIX}:{user_id}"
    
    @classmethod
    def get_cart_key(cls, session_id: str) -> str:
        """Generate cache key for cart data."""
        return f"{cls.CART_PREFIX}:{session_id}"
    
    @classmethod
    def get_currency_key(cls, from_currency: str, to_currency: str) -> str:
        """Generate cache key for currency conversion."""
        return f"{cls.CURRENCY_PREFIX}:{from_currency}:{to_currency}"
    
    @classmethod
    def get_search_key(cls, query: str, filters: Dict = None) -> str:
        """Generate cache key for search results."""
        key = f"{cls.SEARCH_PREFIX}:{query}"
        if filters:
            key += f":{hash(json.dumps(filters, sort_keys=True))}"
        return key
    
    @classmethod
    def set(cls, key: str, value: Any, ttl: int = None) -> bool:
        """Set a value in cache with optional TTL."""
        try:
            ttl = ttl or cls.DEFAULT_TTL
            cache.set(key, value, ttl)
            logger.debug(f"Cache set: {key} (TTL: {ttl}s)")
            return True
        except Exception as e:
            logger.error(f"Cache set error for key {key}: {e}")
            return False
    
    @classmethod
    def get(cls, key: str, default: Any = None) -> Any:
        """Get a value from cache."""
        try:
            value = cache.get(key)
            if value is not None:
                logger.debug(f"Cache hit: {key}")
            else:
                logger.debug(f"Cache miss: {key}")
            return value if value is not None else default
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {e}")
            return default
    
    @classmethod
    def delete(cls, key: str) -> bool:
        """Delete a value from cache."""
        try:
            cache.delete(key)
            logger.debug(f"Cache delete: {key}")
            return True
        except Exception as e:
            logger.error(f"Cache delete error for key {key}: {e}")
            return False
    
    @classmethod
    def delete_pattern(cls, pattern: str) -> int:
        """Delete all keys matching a pattern."""
        try:
            # Note: This requires Redis backend
            if hasattr(cache, 'delete_pattern'):
                count = cache.delete_pattern(pattern)
                logger.debug(f"Cache delete pattern: {pattern} ({count} keys)")
                return count
            else:
                logger.warning("Pattern deletion not supported with current cache backend")
                return 0
        except Exception as e:
            logger.error(f"Cache delete pattern error for {pattern}: {e}")
            return 0
    
    @classmethod
    def clear_tour_cache(cls, tour_id: str) -> bool:
        """Clear all cache entries for a specific tour."""
        pattern = f"{cls.TOUR_PREFIX}:{tour_id}:*"
        return cls.delete_pattern(pattern) > 0
    
    @classmethod
    def clear_event_cache(cls, event_id: str) -> bool:
        """Clear all cache entries for a specific event."""
        pattern = f"{cls.EVENT_PREFIX}:{event_id}:*"
        return cls.delete_pattern(pattern) > 0
    
    @classmethod
    def clear_transfer_cache(cls, transfer_id: str) -> bool:
        """Clear all cache entries for a specific transfer."""
        pattern = f"{cls.TRANSFER_PREFIX}:{transfer_id}:*"
        return cls.delete_pattern(pattern) > 0
    
    @classmethod
    def clear_user_cache(cls, user_id: str) -> bool:
        """Clear all cache entries for a specific user."""
        pattern = f"{cls.USER_PREFIX}:{user_id}:*"
        return cls.delete_pattern(pattern) > 0
    
    @classmethod
    def clear_search_cache(cls) -> bool:
        """Clear all search cache entries."""
        pattern = f"{cls.SEARCH_PREFIX}:*"
        return cls.delete_pattern(pattern) > 0
    
    @classmethod
    def get_or_set(cls, key: str, default_func, ttl: int = None) -> Any:
        """Get value from cache or set it using default function."""
        value = cls.get(key)
        if value is None:
            value = default_func()
            cls.set(key, value, ttl)
        return value
    
    @classmethod
    def invalidate_related(cls, model_name: str, instance_id: str) -> None:
        """Invalidate cache for related data when a model is updated."""
        if model_name.lower() == 'tour':
            cls.clear_tour_cache(instance_id)
        elif model_name.lower() == 'event':
            cls.clear_event_cache(instance_id)
        elif model_name.lower() == 'transfer':
            cls.clear_transfer_cache(instance_id)
        elif model_name.lower() == 'user':
            cls.clear_user_cache(instance_id)
        
        # Clear search cache as content has changed
        cls.clear_search_cache()


class CacheDecorator:
    """
    Decorator for caching function results.
    """
    
    def __init__(self, key_prefix: str, ttl: int = None, key_func=None):
        self.key_prefix = key_prefix
        self.ttl = ttl or CacheManager.DEFAULT_TTL
        self.key_func = key_func
    
    def __call__(self, func):
        def wrapper(*args, **kwargs):
            # Generate cache key
            if self.key_func:
                cache_key = self.key_func(*args, **kwargs)
            else:
                # Default key generation
                key_parts = [self.key_prefix]
                key_parts.extend([str(arg) for arg in args])
                key_parts.extend([f"{k}:{v}" for k, v in sorted(kwargs.items())])
                cache_key = ":".join(key_parts)
            
            # Try to get from cache
            result = CacheManager.get(cache_key)
            if result is not None:
                return result
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            CacheManager.set(cache_key, result, self.ttl)
            return result
        
        return wrapper


# Utility functions for common caching patterns
def cache_tour_detail(ttl: int = None):
    """Decorator for caching tour detail data."""
    def key_func(tour_id, *args, **kwargs):
        return CacheManager.get_tour_key(tour_id, "detail")
    
    return CacheDecorator("tour_detail", ttl, key_func)


def cache_event_detail(ttl: int = None):
    """Decorator for caching event detail data."""
    def key_func(event_id, *args, **kwargs):
        return CacheManager.get_event_key(event_id, "detail")
    
    return CacheDecorator("event_detail", ttl, key_func)


def cache_transfer_detail(ttl: int = None):
    """Decorator for caching transfer detail data."""
    def key_func(transfer_id, *args, **kwargs):
        return CacheManager.get_transfer_key(transfer_id, "detail")
    
    return CacheDecorator("transfer_detail", ttl, key_func)


def cache_search_results(ttl: int = None):
    """Decorator for caching search results."""
    def key_func(query, filters=None, *args, **kwargs):
        return CacheManager.get_search_key(query, filters)
    
    return CacheDecorator("search", ttl, key_func) 