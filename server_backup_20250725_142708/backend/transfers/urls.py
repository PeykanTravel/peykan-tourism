"""
URL patterns for Transfers app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TransferRouteViewSet, TransferBookingViewSet, TransferOptionViewSet
)

# Main router
router = DefaultRouter()
router.register(r'routes', TransferRouteViewSet, basename='transfer-route')
router.register(r'bookings', TransferBookingViewSet, basename='transfer-booking')
router.register(r'options', TransferOptionViewSet, basename='transfer-option')

urlpatterns = [
    # Main API routes
    path('', include(router.urls)),
    
    # Additional transfer-specific routes
    path('routes/by-slug/<slug:slug>/', 
         TransferRouteViewSet.as_view({'get': 'by_slug'}), 
         name='transfer-route-detail-by-slug'),
    
    # Public price calculation endpoint
    path('calculate-price/', 
         TransferRouteViewSet.as_view({'post': 'calculate_price_public'}), 
         name='transfer-calculate-price-public'),
] 