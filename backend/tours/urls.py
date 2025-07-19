"""
URL patterns for Tours app.
"""

from django.urls import path
from . import views

app_name = 'tours'

urlpatterns = [
    # Test view
    path('test/', views.test_tours_view, name='test_tours'),
    
    # Categories
    path('categories/', views.TourCategoryListView.as_view(), name='category_list'),
    
    # Tours
    path('', views.TourListView.as_view(), name='tour_list'),
    path('tours/', views.TourListView.as_view(), name='tour_list_alt'),  # Alternative endpoint
    path('featured/', views.FeaturedToursView.as_view(), name='featured_tours'),  # Featured tours for home page
    path('search/', views.TourSearchView.as_view(), name='tour_search'),
    path('<slug:slug>/', views.TourDetailView.as_view(), name='tour_detail'),
    path('<slug:slug>/availability/', views.tour_availability_view, name='tour_availability'),
    path('<slug:slug>/stats/', views.tour_stats_view, name='tour_stats'),
    
    # New booking flow endpoints
    path('<uuid:tour_id>/schedules/', views.tour_schedules_view, name='tour_schedules'),
    path('check-availability/', views.check_tour_availability_view, name='check_availability'),
    
    # Schedules
    path('<slug:tour_slug>/schedules/', views.TourScheduleListView.as_view(), name='schedule_list'),
    
    # Reviews
    path('<slug:tour_slug>/reviews/', views.TourReviewListView.as_view(), name='review_list'),
    path('<slug:tour_slug>/reviews/create/', views.TourReviewCreateView.as_view(), name='review_create'),
    
    # Booking
    path('booking/', views.TourBookingView.as_view(), name='tour_booking'),
] 