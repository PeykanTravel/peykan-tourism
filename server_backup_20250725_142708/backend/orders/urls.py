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
] 