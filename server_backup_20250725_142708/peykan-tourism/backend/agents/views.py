"""
DRF Views for Agents app.
"""

from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Agent, AgentCommission
from .serializers import AgentSerializer, AgentSummarySerializer

class AgentDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        agent = get_object_or_404(Agent, user=request.user)
        # Use AgentService for summary
        from .models import AgentService
        summary = AgentService.get_agent_summary(agent)
        return Response({'agent': AgentSerializer(agent).data, 'summary': summary})

class AgentOrderListView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        agent = get_object_or_404(Agent, user=request.user)
        from orders.models import Order
        orders = Order.objects.filter(agent=agent).order_by('-created_at')
        from orders.serializers import OrderSerializer
        return Response({'orders': OrderSerializer(orders, many=True).data})

class AgentCommissionListView(generics.ListAPIView):
    serializer_class = AgentSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        agent = get_object_or_404(Agent, user=self.request.user)
        return agent.commissions.all().order_by('-created_at') 