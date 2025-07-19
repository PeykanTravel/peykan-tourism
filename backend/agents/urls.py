"""
URL patterns for Agents app.
"""

from django.urls import path
from . import views

app_name = 'agents'

urlpatterns = [
    path('dashboard/', views.AgentDashboardView.as_view(), name='dashboard'),
    path('orders/', views.AgentOrderListView.as_view(), name='order_list'),
    path('commissions/', views.AgentCommissionListView.as_view(), name='commission_list'),
    path('customers/', views.AgentCustomerListView.as_view(), name='customer_list'),
    path('customers/create/', views.AgentCustomerCreateView.as_view(), name='customer_create'),
    path('customers/<uuid:customer_id>/', views.AgentCustomerDetailView.as_view(), name='customer_detail'),
    path('orders/create/', views.AgentOrderCreateView.as_view(), name='order_create'),
    path('orders/<str:order_number>/', views.AgentOrderDetailView.as_view(), name='order_detail'),
    path('profile/', views.AgentProfileView.as_view(), name='profile'),
    path('profile/update/', views.AgentProfileUpdateView.as_view(), name='profile_update'),
    path('stats/', views.AgentStatsView.as_view(), name='stats'),
] 