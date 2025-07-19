"""
Health check utilities for Peykan Tourism Platform.
"""

import time
from django.core.cache import cache
from django.db import connection
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import requests


class HealthChecker:
    """
    Comprehensive health checker for the application.
    """
    
    @staticmethod
    def check_database():
        """Check database connectivity and performance."""
        try:
            start_time = time.time()
            
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                result = cursor.fetchone()
                
            response_time = time.time() - start_time
            
            return {
                'status': 'healthy' if result[0] == 1 else 'unhealthy',
                'response_time': round(response_time * 1000, 2),  # ms
                'timestamp': timezone.now().isoformat()
            }
        except Exception as e:
            return {
                'status': 'unhealthy',
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }
    
    @staticmethod
    def check_cache():
        """Check cache connectivity and performance."""
        try:
            start_time = time.time()
            
            # Test cache write
            test_key = f"health_check_{int(time.time())}"
            cache.set(test_key, 'test_value', 60)
            
            # Test cache read
            test_value = cache.get(test_key)
            
            # Clean up
            cache.delete(test_key)
            
            response_time = time.time() - start_time
            
            return {
                'status': 'healthy' if test_value == 'test_value' else 'unhealthy',
                'response_time': round(response_time * 1000, 2),  # ms
                'timestamp': timezone.now().isoformat()
            }
        except Exception as e:
            return {
                'status': 'unhealthy',
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }
    
    @staticmethod
    def check_external_apis():
        """Check external API connectivity."""
        apis = {
            'exchange_rate': 'https://api.exchangerate-api.com/v4/latest/USD',
            'payment_gateway': settings.PAYMENT_GATEWAY,
        }
        
        results = {}
        
        for name, url in apis.items():
            try:
                if name == 'exchange_rate':
                    start_time = time.time()
                    response = requests.get(url, timeout=5)
                    response_time = time.time() - start_time
                    
                    results[name] = {
                        'status': 'healthy' if response.status_code == 200 else 'unhealthy',
                        'response_time': round(response_time * 1000, 2),
                        'status_code': response.status_code
                    }
                else:
                    # Mock check for payment gateway
                    results[name] = {
                        'status': 'healthy',
                        'response_time': 0,
                        'note': 'Mock payment gateway'
                    }
                    
            except Exception as e:
                results[name] = {
                    'status': 'unhealthy',
                    'error': str(e)
                }
        
        return results
    
    @staticmethod
    def check_system_resources():
        """Check system resource usage."""
        try:
            import psutil
            
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            return {
                'cpu_usage': round(cpu_percent, 2),
                'memory_usage': round(memory.percent, 2),
                'memory_available': round(memory.available / (1024**3), 2),  # GB
                'disk_usage': round(disk.percent, 2),
                'disk_free': round(disk.free / (1024**3), 2),  # GB
                'timestamp': timezone.now().isoformat()
            }
        except ImportError:
            return {
                'status': 'psutil not available',
                'timestamp': timezone.now().isoformat()
            }
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }
    
    @staticmethod
    def check_application_status():
        """Check application-specific health indicators."""
        try:
            from users.models import User
            from tours.models import Tour
            from events.models import Event
            from transfers.models import TransferRoute
            
            # Check model counts
            user_count = User.objects.count()
            tour_count = Tour.objects.filter(is_active=True).count()
            event_count = Event.objects.filter(is_active=True).count()
            transfer_count = TransferRoute.objects.filter(is_active=True).count()
            
            # Check recent activity
            recent_users = User.objects.filter(
                date_joined__gte=timezone.now() - timedelta(days=1)
            ).count()
            
            return {
                'total_users': user_count,
                'active_tours': tour_count,
                'active_events': event_count,
                'active_transfers': transfer_count,
                'recent_users': recent_users,
                'timestamp': timezone.now().isoformat()
            }
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }
    
    @classmethod
    def comprehensive_check(cls):
        """Perform comprehensive health check."""
        start_time = time.time()
        
        results = {
            'database': cls.check_database(),
            'cache': cls.check_cache(),
            'external_apis': cls.check_external_apis(),
            'system_resources': cls.check_system_resources(),
            'application_status': cls.check_application_status(),
        }
        
        # Determine overall status
        overall_status = 'healthy'
        for component, result in results.items():
            if isinstance(result, dict) and result.get('status') == 'unhealthy':
                overall_status = 'unhealthy'
                break
        
        total_time = time.time() - start_time
        
        return {
            'status': overall_status,
            'components': results,
            'total_response_time': round(total_time * 1000, 2),
            'timestamp': timezone.now().isoformat(),
            'version': getattr(settings, 'VERSION', '1.0.0'),
            'environment': 'production' if not settings.DEBUG else 'development'
        }


def health_check_view(request):
    """Health check view for monitoring."""
    from django.http import JsonResponse
    
    # Check if detailed health check is requested
    detailed = request.GET.get('detailed', 'false').lower() == 'true'
    
    if detailed:
        health_data = HealthChecker.comprehensive_check()
    else:
        # Basic health check
        db_status = HealthChecker.check_database()
        cache_status = HealthChecker.check_cache()
        
        health_data = {
            'status': 'healthy' if (
                db_status.get('status') == 'healthy' and 
                cache_status.get('status') == 'healthy'
            ) else 'unhealthy',
            'database': db_status.get('status'),
            'cache': cache_status.get('status'),
            'timestamp': timezone.now().isoformat(),
            'version': getattr(settings, 'VERSION', '1.0.0')
        }
    
    status_code = 200 if health_data['status'] == 'healthy' else 503
    
    return JsonResponse(health_data, status=status_code) 