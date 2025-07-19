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


class AgentCustomerListView(generics.ListAPIView):
    """List all customers created by the agent."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        agent = get_object_or_404(Agent, user=request.user)
        from .models import AgentCustomer
        
        customers = AgentCustomer.objects.filter(agent=agent, is_active=True)
        
        return Response({
            'customers': [
                {
                    'id': str(customer.customer.id),
                    'name': customer.customer_name,
                    'email': customer.customer_email,
                    'phone': customer.customer_phone,
                    'created_at': customer.created_at,
                    'total_orders': customer.customer.orders.count(),
                }
                for customer in customers
            ]
        })


class AgentCustomerCreateView(APIView):
    """Create a new customer for the agent."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        agent = get_object_or_404(Agent, user=request.user)
        
        # Validate required fields
        required_fields = ['email', 'first_name', 'last_name']
        for field in required_fields:
            if field not in request.data:
                return Response(
                    {'error': f'Missing required field: {field}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        try:
            from .models import AgentService
            user, agent_customer = AgentService.create_customer(agent, request.data)
            
            return Response({
                'message': 'Customer created successfully',
                'customer': {
                    'id': str(user.id),
                    'name': f"{user.first_name} {user.last_name}",
                    'email': user.email,
                    'phone': user.phone_number,
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class AgentCustomerDetailView(APIView):
    """Get customer details and orders."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, customer_id):
        agent = get_object_or_404(Agent, user=request.user)
        from .models import AgentCustomer
        
        try:
            agent_customer = AgentCustomer.objects.get(
                agent=agent,
                customer_id=customer_id,
                is_active=True
            )
            
            # Get customer orders
            from orders.models import Order
            orders = Order.objects.filter(
                user=agent_customer.customer,
                agent=agent
            ).order_by('-created_at')
            
            from orders.serializers import OrderSerializer
            
            return Response({
                'customer': {
                    'id': str(agent_customer.customer.id),
                    'name': agent_customer.customer_name,
                    'email': agent_customer.customer_email,
                    'phone': agent_customer.customer_phone,
                    'created_at': agent_customer.created_at,
                    'relationship_notes': agent_customer.relationship_notes,
                },
                'orders': OrderSerializer(orders, many=True).data,
                'total_orders': orders.count(),
            })
            
        except AgentCustomer.DoesNotExist:
            return Response(
                {'error': 'Customer not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class AgentOrderCreateView(APIView):
    """Create an order for a customer."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        agent = get_object_or_404(Agent, user=request.user)
        
        # Validate required fields
        required_fields = ['customer_id', 'items']
        for field in required_fields:
            if field not in request.data:
                return Response(
                    {'error': f'Missing required field: {field}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        try:
            from .models import AgentCustomer
            agent_customer = AgentCustomer.objects.get(
                agent=agent,
                customer_id=request.data['customer_id'],
                is_active=True
            )
            
            from .models import AgentService
            order = AgentService.create_order_for_customer(
                agent=agent,
                customer=agent_customer.customer,
                order_data=request.data
            )
            
            from orders.serializers import OrderSerializer
            
            return Response({
                'message': 'Order created successfully',
                'order': OrderSerializer(order).data
            }, status=status.HTTP_201_CREATED)
            
        except AgentCustomer.DoesNotExist:
            return Response(
                {'error': 'Customer not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class AgentOrderDetailView(APIView):
    """Get order details."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, order_number):
        agent = get_object_or_404(Agent, user=request.user)
        
        try:
            from orders.models import Order
            order = Order.objects.get(
                order_number=order_number,
                agent=agent
            )
            
            from orders.serializers import OrderSerializer
            
            return Response({
                'order': OrderSerializer(order).data
            })
            
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class AgentProfileView(APIView):
    """Get agent profile."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        agent = get_object_or_404(Agent, user=request.user)
        
        return Response({
            'agent': AgentSerializer(agent).data
        })


class AgentProfileUpdateView(APIView):
    """Update agent profile."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def put(self, request):
        agent = get_object_or_404(Agent, user=request.user)
        
        # Update agent fields
        updateable_fields = [
            'company_name', 'license_number', 'email', 'phone', 
            'address', 'website'
        ]
        
        for field in updateable_fields:
            if field in request.data:
                setattr(agent, field, request.data[field])
        
        agent.save()
        
        return Response({
            'message': 'Profile updated successfully',
            'agent': AgentSerializer(agent).data
        })


class AgentStatsView(APIView):
    """Get agent statistics."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        agent = get_object_or_404(Agent, user=request.user)
        
        from django.db.models import Count, Sum
        from django.utils import timezone
        from datetime import timedelta
        
        # Date ranges
        today = timezone.now().date()
        thirty_days_ago = today - timedelta(days=30)
        
        # Get orders
        from orders.models import Order
        orders = Order.objects.filter(agent=agent)
        
        # Calculate stats
        total_orders = orders.count()
        recent_orders = orders.filter(created_at__date__gte=thirty_days_ago).count()
        total_revenue = orders.filter(payment_status='paid').aggregate(
            total=Sum('total_amount')
        )['total'] or 0
        
        # Get customers
        from .models import AgentCustomer
        total_customers = AgentCustomer.objects.filter(agent=agent, is_active=True).count()
        
        # Get commissions
        total_commission = agent.commissions.aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        return Response({
            'total_orders': total_orders,
            'recent_orders': recent_orders,
            'total_revenue': total_revenue,
            'total_customers': total_customers,
            'total_commission': total_commission,
            'commission_rate': agent.commission_rate,
        }) 