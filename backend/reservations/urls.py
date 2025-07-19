"""
URL patterns for Reservation System
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'reservations'

# Create router for ViewSet
router = DefaultRouter()
router.register(r'reservations', views.ReservationViewSet, basename='reservation')

urlpatterns = [
    # Include ViewSet URLs
    path('', include(router.urls)),
    
    # Pricing calculation
    path('calculate-pricing/', views.calculate_pricing, name='calculate-pricing'),
    
    # Availability checking
    path('check-availability/', views.check_availability, name='check-availability'),
    
    # Capacity reservation
    path('reserve-capacity/', views.reserve_capacity, name='reserve-capacity'),
    
    # Reservation creation
    path('create-reservation/', views.create_reservation, name='create-reservation'),
] 