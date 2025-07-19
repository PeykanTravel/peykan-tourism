"""
Cache service for reservation system
"""

from django.core.cache import cache
from django.conf import settings
from typing import Any, Optional, List, Dict
import json
import hashlib


class ReservationCacheService:
    """Service for caching reservation-related data"""
    
    # Cache keys
    AVAILABILITY_KEY = "reservation:availability:{product_type}:{product_id}"
    PRICING_KEY = "reservation:pricing:{product_type}:{hash}"
    SEATS_KEY = "reservation:seats:{performance_id}"
    SCHEDULES_KEY = "reservation:schedules:{tour_id}:{variant_id}"
    ROUTES_KEY = "reservation:routes:{from_location}:{to_location}"
    
    # Cache timeouts (in seconds)
    AVAILABILITY_TIMEOUT = 300  # 5 minutes
    PRICING_TIMEOUT = 600       # 10 minutes
    SEATS_TIMEOUT = 300         # 5 minutes
    SCHEDULES_TIMEOUT = 1800    # 30 minutes
    ROUTES_TIMEOUT = 3600       # 1 hour
    
    @classmethod
    def get_availability_key(cls, product_type: str, product_id: str, **kwargs) -> str:
        """Generate cache key for availability data"""
        key_parts = [product_type, product_id]
        for k, v in sorted(kwargs.items()):
            key_parts.append(f"{k}:{v}")
        return f"reservation:availability:{':'.join(key_parts)}"
    
    @classmethod
    def get_pricing_key(cls, product_type: str, data: Dict[str, Any]) -> str:
        """Generate cache key for pricing data"""
        # Create a hash of the pricing data
        data_str = json.dumps(data, sort_keys=True)
        data_hash = hashlib.md5(data_str.encode()).hexdigest()
        return f"reservation:pricing:{product_type}:{data_hash}"
    
    @classmethod
    def cache_availability(
        cls,
        product_type: str,
        product_id: str,
        available: bool,
        details: Dict[str, Any],
        **kwargs
    ) -> None:
        """Cache availability data"""
        key = cls.get_availability_key(product_type, product_id, **kwargs)
        cache_data = {
            'available': available,
            'details': details,
            'timestamp': cache.time()
        }
        cache.set(key, cache_data, cls.AVAILABILITY_TIMEOUT)
    
    @classmethod
    def get_cached_availability(
        cls,
        product_type: str,
        product_id: str,
        **kwargs
    ) -> Optional[Dict[str, Any]]:
        """Get cached availability data"""
        key = cls.get_availability_key(product_type, product_id, **kwargs)
        return cache.get(key)
    
    @classmethod
    def cache_pricing(
        cls,
        product_type: str,
        data: Dict[str, Any],
        result: Dict[str, Any]
    ) -> None:
        """Cache pricing calculation result"""
        key = cls.get_pricing_key(product_type, data)
        cache_data = {
            'result': result,
            'timestamp': cache.time()
        }
        cache.set(key, cache_data, cls.PRICING_TIMEOUT)
    
    @classmethod
    def get_cached_pricing(
        cls,
        product_type: str,
        data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Get cached pricing data"""
        key = cls.get_pricing_key(product_type, data)
        cached = cache.get(key)
        if cached:
            return cached['result']
        return None
    
    @classmethod
    def cache_seats(
        cls,
        performance_id: str,
        seats: List[Dict[str, Any]]
    ) -> None:
        """Cache available seats for a performance"""
        key = f"reservation:seats:{performance_id}"
        cache.set(key, seats, cls.SEATS_TIMEOUT)
    
    @classmethod
    def get_cached_seats(cls, performance_id: str) -> Optional[List[Dict[str, Any]]]:
        """Get cached seats data"""
        key = f"reservation:seats:{performance_id}"
        return cache.get(key)
    
    @classmethod
    def cache_schedules(
        cls,
        tour_id: str,
        variant_id: str,
        start_date: str,
        end_date: str,
        schedules: List[Dict[str, Any]]
    ) -> None:
        """Cache tour schedules"""
        key = f"reservation:schedules:{tour_id}:{variant_id}:{start_date}:{end_date}"
        cache.set(key, schedules, cls.SCHEDULES_TIMEOUT)
    
    @classmethod
    def get_cached_schedules(
        cls,
        tour_id: str,
        variant_id: str,
        start_date: str,
        end_date: str
    ) -> Optional[List[Dict[str, Any]]]:
        """Get cached schedules data"""
        key = f"reservation:schedules:{tour_id}:{variant_id}:{start_date}:{end_date}"
        return cache.get(key)
    
    @classmethod
    def cache_routes(
        cls,
        from_location: str,
        to_location: str,
        routes: List[Dict[str, Any]]
    ) -> None:
        """Cache transfer routes"""
        key = f"reservation:routes:{from_location}:{to_location}"
        cache.set(key, routes, cls.ROUTES_TIMEOUT)
    
    @classmethod
    def get_cached_routes(
        cls,
        from_location: str,
        to_location: str
    ) -> Optional[List[Dict[str, Any]]]:
        """Get cached routes data"""
        key = f"reservation:routes:{from_location}:{to_location}"
        return cache.get(key)
    
    @classmethod
    def invalidate_availability(cls, product_type: str, product_id: str, **kwargs) -> None:
        """Invalidate availability cache"""
        key = cls.get_availability_key(product_type, product_id, **kwargs)
        cache.delete(key)
    
    @classmethod
    def invalidate_pricing(cls, product_type: str, data: Dict[str, Any]) -> None:
        """Invalidate pricing cache"""
        key = cls.get_pricing_key(product_type, data)
        cache.delete(key)
    
    @classmethod
    def invalidate_seats(cls, performance_id: str) -> None:
        """Invalidate seats cache"""
        key = f"reservation:seats:{performance_id}"
        cache.delete(key)
    
    @classmethod
    def invalidate_schedules(cls, tour_id: str, variant_id: str) -> None:
        """Invalidate schedules cache for a tour variant"""
        # Delete all schedule keys for this tour variant
        pattern = f"reservation:schedules:{tour_id}:{variant_id}:*"
        # Note: This is a simplified approach. In production, you might want to use
        # a more sophisticated cache invalidation strategy
        pass
    
    @classmethod
    def invalidate_routes(cls, from_location: str, to_location: str) -> None:
        """Invalidate routes cache"""
        key = f"reservation:routes:{from_location}:{to_location}"
        cache.delete(key)
    
    @classmethod
    def clear_all_reservation_cache(cls) -> None:
        """Clear all reservation-related cache"""
        # This is a simplified approach. In production, you might want to use
        # cache versioning or more sophisticated invalidation
        pass
    
    @classmethod
    def get_cache_stats(cls) -> Dict[str, Any]:
        """Get cache statistics"""
        # This would depend on your cache backend
        # For Redis, you might want to use redis-cli info
        return {
            'cache_backend': getattr(settings, 'CACHES', {}).get('default', {}).get('BACKEND'),
            'timeout_settings': {
                'availability': cls.AVAILABILITY_TIMEOUT,
                'pricing': cls.PRICING_TIMEOUT,
                'seats': cls.SEATS_TIMEOUT,
                'schedules': cls.SCHEDULES_TIMEOUT,
                'routes': cls.ROUTES_TIMEOUT
            }
        } 