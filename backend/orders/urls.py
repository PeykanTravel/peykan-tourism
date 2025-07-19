"""
URL patterns for Orders app.
"""

from django.urls import path
from . import views

app_name = 'orders'

urlpatterns = [
    path('', views.OrderListView.as_view(), name='order_list'),
    path('create/', views.CreateOrderView.as_view(), name='order_create'),
    path('<str:order_number>/', views.OrderDetailView.as_view(), name='order_detail'),
    path('<str:order_number>/cancel/', views.CancelOrderView.as_view(), name='order_cancel'),
    path('<str:order_number>/payment/', views.OrderPaymentView.as_view(), name='order_payment'),
    path('upcoming/', views.UpcomingOrdersView.as_view(), name='upcoming_orders'),
    path('history/', views.OrderHistoryView.as_view(), name='order_history'),
    path('stats/', views.OrderStatsView.as_view(), name='order_stats'),
] 