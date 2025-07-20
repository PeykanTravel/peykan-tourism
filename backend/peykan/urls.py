"""
URL configuration for Peykan Tourism Ecommerce Platform.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

from .health_checks import health_check_view

def simple_health_check(request):
    """Simple health check endpoint for Docker."""
    return JsonResponse({
        'status': 'healthy',
        'message': 'Peykan Tourism API is running',
        'version': '1.0.0'
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Health check endpoints
    path('api/v1/health/', health_check_view, name='health_check'),
    path('health/', simple_health_check, name='health_check_alt'),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # API v1
    path('api/v1/', include([
        path('auth/', include('users.urls')),
        path('shared/', include('shared.urls')),
        path('tours/', include('tours.urls')),
        path('events/', include('events.urls')),
        path('transfers/', include('transfers.urls')),
        path('cart/', include('cart.urls')),
        path('orders/', include('orders.urls')),
        path('payments/', include('payments.urls')),
        path('agents/', include('agents.urls')),
        path('reservations/', include('reservations.urls')),
    ])),
]

# Debug toolbar (development only)
if settings.DEBUG:
    import debug_toolbar
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns
    
    # Serve media files in development
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) 