"""
URL patterns for Payments app.
"""

from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    path('', views.PaymentListView.as_view(), name='payment_list'),
    path('create/', views.CreatePaymentView.as_view(), name='payment_create'),
    path('<str:payment_id>/', views.PaymentDetailView.as_view(), name='payment_detail'),
    path('<str:payment_id>/process/', views.ProcessPaymentView.as_view(), name='payment_process'),
    path('<str:payment_id>/refund/', views.RefundPaymentView.as_view(), name='payment_refund'),
    path('webhook/', views.PaymentWebhookView.as_view(), name='payment_webhook'),
    path('methods/', views.PaymentMethodsView.as_view(), name='payment_methods'),
    path('status/<str:payment_id>/', views.PaymentStatusView.as_view(), name='payment_status'),
] 