"""
DRF Views for Payments app.
"""

from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Payment, PaymentTransaction
from .serializers import PaymentSerializer, CreatePaymentSerializer

class PaymentListView(generics.ListAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        return Payment.objects.filter(user=user).order_by('-created_at')

class PaymentDetailView(generics.RetrieveAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'payment_id'
    def get_queryset(self):
        user = self.request.user
        return Payment.objects.filter(user=user)

class CreatePaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        serializer = CreatePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.validated_data['order']
        user = request.user
        # Create payment
        payment = Payment.objects.create(
            order=order,
            user=user,
            amount=order.total_amount,
            currency=order.currency,
            status='pending',
            payment_method=serializer.validated_data['payment_method'],
        )
        return Response({'message': 'Payment initiated.', 'payment': PaymentSerializer(payment).data}, status=status.HTTP_201_CREATED)


class ProcessPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, payment_id):
        payment = get_object_or_404(Payment, payment_id=payment_id, user=request.user)
        # Process payment logic here
        payment.status = 'completed'
        payment.save()
        return Response({'message': 'Payment processed successfully.'})


class RefundPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, payment_id):
        payment = get_object_or_404(Payment, payment_id=payment_id, user=request.user)
        # Refund logic here
        payment.status = 'refunded'
        payment.save()
        return Response({'message': 'Payment refunded successfully.'})


class PaymentWebhookView(APIView):
    permission_classes = []  # No authentication for webhooks
    def post(self, request):
        # Webhook processing logic here
        return Response({'message': 'Webhook received.'})


class PaymentMethodsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        # Return available payment methods
        methods = [
            {'id': 'credit_card', 'name': 'Credit Card'},
            {'id': 'bank_transfer', 'name': 'Bank Transfer'},
            {'id': 'paypal', 'name': 'PayPal'},
        ]
        return Response({'methods': methods})


class PaymentStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, payment_id):
        payment = get_object_or_404(Payment, payment_id=payment_id, user=request.user)
        return Response({'status': payment.status}) 