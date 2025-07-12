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
] 