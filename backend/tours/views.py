"""
DRF Views for Tours app.
"""

from rest_framework import status, generics, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db.models import Q, Avg, Count, Sum
from datetime import date, timedelta

from .models import Tour, TourCategory, TourVariant, TourSchedule, TourOption, TourReview, TourPricing
from .serializers import (
    TourListSerializer, TourDetailSerializer, TourCategorySerializer,
    TourVariantSerializer, TourOptionSerializer, TourScheduleSerializer,
    TourReviewSerializer, TourReviewCreateSerializer, TourSearchSerializer,
    TourBookingSerializer, CheckTourAvailabilitySerializer
)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def test_tours_view(request):
    """Test view to check if tours exist."""
    tours = Tour.objects.all()
    return Response({
        'count': tours.count(),
        'tours': list(tours.values('id', 'slug', 'price', 'currency', 'is_active'))
    })


class TourCategoryListView(generics.ListAPIView):
    """List all tour categories."""
    
    queryset = TourCategory.objects.filter(is_active=True)
    serializer_class = TourCategorySerializer
    permission_classes = [permissions.AllowAny]


class TourListView(generics.ListAPIView):
    """List all tours (no search/filter)."""
    serializer_class = TourListSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Tour.objects.all()  # Remove is_active filter temporarily
    pagination_class = None
    filter_backends = []
    search_fields = []
    ordering_fields = []


class TourDetailView(generics.RetrieveAPIView):
    """Get tour details by slug."""
    
    queryset = Tour.objects.filter(is_active=True).select_related('category')
    serializer_class = TourDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'
    
    def get_object(self):
        slug = self.kwargs.get('slug')
        return get_object_or_404(Tour, slug=slug, is_active=True)


class TourSearchView(APIView):
    """Advanced tour search."""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = TourSearchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        queryset = Tour.objects.filter(is_active=True).select_related('category')
        
        # Apply search filters
        if data.get('query'):
            query = data['query']
            queryset = queryset.filter(
                Q(title__icontains=query) |
                Q(description__icontains=query) |
                Q(short_description__icontains=query) |
                Q(highlights__icontains=query)
            )
        
        if data.get('category'):
            queryset = queryset.filter(category_id=data['category'])
        
        if data.get('min_price'):
            queryset = queryset.filter(base_price__gte=data['min_price'])
        
        if data.get('max_price'):
            queryset = queryset.filter(base_price__lte=data['max_price'])
        
        if data.get('min_duration'):
            queryset = queryset.filter(duration_hours__gte=data['min_duration'])
        
        if data.get('max_duration'):
            queryset = queryset.filter(duration_hours__lte=data['max_duration'])
        
        if data.get('date_from') or data.get('date_to'):
            schedules_filter = Q()
            if data.get('date_from'):
                schedules_filter &= Q(schedules__start_date__gte=data['date_from'])
            if data.get('date_to'):
                schedules_filter &= Q(schedules__end_date__lte=data['date_to'])
            schedules_filter &= Q(schedules__is_available=True)
            queryset = queryset.filter(schedules_filter).distinct()
        
        if data.get('includes_transfer') is not None:
            queryset = queryset.filter(includes_transfer=data['includes_transfer'])
        
        if data.get('includes_guide') is not None:
            queryset = queryset.filter(includes_guide=data['includes_guide'])
        
        if data.get('includes_meal') is not None:
            queryset = queryset.filter(includes_meal=data['includes_meal'])
        
        # Apply sorting
        sort_by = data.get('sort_by', 'created_desc')
        if sort_by == 'price_asc':
            queryset = queryset.order_by('base_price')
        elif sort_by == 'price_desc':
            queryset = queryset.order_by('-base_price')
        elif sort_by == 'duration_asc':
            queryset = queryset.order_by('duration_hours')
        elif sort_by == 'duration_desc':
            queryset = queryset.order_by('-duration_hours')
        elif sort_by == 'rating_desc':
            queryset = queryset.annotate(
                avg_rating=Avg('reviews__rating')
            ).order_by('-avg_rating')
        elif sort_by == 'created_asc':
            queryset = queryset.order_by('created_at')
        else:  # created_desc
            queryset = queryset.order_by('-created_at')
        
        # Paginate results
        from rest_framework.pagination import PageNumberPagination
        paginator = PageNumberPagination()
        paginator.page_size = 20
        page = paginator.paginate_queryset(queryset, request)
        
        serializer = TourListSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class TourScheduleListView(generics.ListAPIView):
    """List schedules for a specific tour."""
    
    serializer_class = TourScheduleSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        tour_slug = self.kwargs.get('tour_slug')
        tour = get_object_or_404(Tour, slug=tour_slug, is_active=True)
        return tour.schedules.filter(is_available=True)


class TourReviewListView(generics.ListAPIView):
    """List reviews for a specific tour."""
    
    serializer_class = TourReviewSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        tour_slug = self.kwargs.get('tour_slug')
        tour = get_object_or_404(Tour, slug=tour_slug, is_active=True)
        return tour.reviews.filter(is_verified=True).order_by('-created_at')


class TourReviewCreateView(generics.CreateAPIView):
    """Create a review for a tour."""
    
    serializer_class = TourReviewCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        tour_slug = self.kwargs.get('tour_slug')
        context['tour'] = get_object_or_404(Tour, slug=tour_slug, is_active=True)
        return context


class TourBookingView(APIView):
    """Book a tour."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = TourBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        tour = data['tour']
        schedule = data['schedule']
        quantity = data['quantity']
        
        # Calculate total price
        base_price = tour.base_price
        variant_price_modifier = 0
        
        if data.get('variant_id'):
            try:
                variant = tour.variants.get(id=data['variant_id'])
                variant_price_modifier = variant.price_modifier
            except TourVariant.DoesNotExist:
                return Response({
                    'error': 'Invalid variant selected.'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        unit_price = base_price + variant_price_modifier
        total_price = unit_price * quantity
        
        # Add options price
        options_total = 0
        selected_options = data.get('selected_options', [])
        for option_data in selected_options:
            try:
                option = tour.options.get(id=option_data['option_id'])
                option_quantity = option_data.get('quantity', 1)
                options_total += option.price * option_quantity
            except TourOption.DoesNotExist:
                return Response({
                    'error': f'Invalid option: {option_data.get("option_id")}'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        total_price += options_total
        
        # Create booking response (this would typically create a cart item or order)
        booking_data = {
            'tour': {
                'id': str(tour.id),
                'title': tour.title,
                'slug': tour.slug,
            },
            'schedule': {
                'id': str(schedule.id),
                'start_date': schedule.start_date,
                'start_time': schedule.start_time,
            },
            'variant_id': data.get('variant_id'),
            'quantity': quantity,
            'unit_price': float(unit_price),
            'options_total': float(options_total),
            'total_price': float(total_price),
            'currency': tour.currency,
            'selected_options': selected_options,
            'special_requests': data.get('special_requests', ''),
        }
        
        return Response({
            'message': 'Tour booking request created successfully.',
            'booking': booking_data
        }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def tour_availability_view(request, tour_slug):
    """Check tour availability for specific dates."""
    
    tour = get_object_or_404(Tour, slug=tour_slug, is_active=True)
    date_from = request.query_params.get('date_from')
    date_to = request.query_params.get('date_to')
    
    if not date_from or not date_to:
        return Response({
            'error': 'Both date_from and date_to parameters are required.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        from datetime import datetime
        date_from = datetime.strptime(date_from, '%Y-%m-%d').date()
        date_to = datetime.strptime(date_to, '%Y-%m-%d').date()
    except ValueError:
        return Response({
            'error': 'Invalid date format. Use YYYY-MM-DD.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    schedules = tour.schedules.filter(
        start_date__gte=date_from,
        end_date__lte=date_to,
        is_available=True
    )
    
    availability_data = []
    for schedule in schedules:
        availability_data.append({
            'date': schedule.start_date,
            'start_time': schedule.start_time,
            'end_time': schedule.end_time,
            'available_capacity': schedule.available_capacity,
            'is_full': schedule.is_full,
        })
    
    return Response({
        'tour': {
            'id': str(tour.id),
            'title': tour.title,
            'slug': tour.slug,
        },
        'availability': availability_data
    })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def tour_stats_view(request, tour_slug):
    """Get tour statistics."""
    
    tour = get_object_or_404(Tour, slug=tour_slug, is_active=True)
    
    # Calculate statistics
    reviews = tour.reviews.all()
    total_reviews = reviews.count()
    average_rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 0
    
    rating_distribution = {}
    for i in range(1, 6):
        rating_distribution[i] = reviews.filter(rating=i).count()
    
    # Recent bookings (mock data for now)
    recent_bookings = 0  # This would come from actual booking data
    
    stats = {
        'total_reviews': total_reviews,
        'average_rating': round(average_rating, 1),
        'rating_distribution': rating_distribution,
        'recent_bookings': recent_bookings,
        'is_popular': total_reviews > 10 and average_rating >= 4.0,
    }
    
    return Response(stats)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def tour_schedules_view(request, tour_id):
    """Get available schedules for a tour with variant capacity information."""
    try:
        tour = Tour.objects.get(id=tour_id, is_active=True)
    except Tour.DoesNotExist:
        return Response(
            {'error': 'Tour not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get future schedules
    from django.utils import timezone
    today = timezone.now().date()
    
    schedules = tour.schedules.filter(
        start_date__gte=today,
        is_available=True
    ).order_by('start_date')
    
    schedule_data = []
    for schedule in schedules:
        # Get variant capacity information
        variants_info = []
        for variant in tour.variants.filter(is_active=True):
            variant_capacity = schedule.variant_capacities.get(str(variant.id), variant.capacity)
            
            # Calculate booked capacity for this variant on this schedule
            from cart.models import CartItem
            from orders.models import OrderItem
            
            # Count items in carts (temporary reservations)
            cart_bookings = CartItem.objects.filter(
                product_type='tour',
                product_id=tour.id,
                variant_id=variant.id,
                booking_date=schedule.start_date
            ).aggregate(
                total=Sum('quantity')
            )['total'] or 0
            
            # Count confirmed orders
            order_bookings = OrderItem.objects.filter(
                product_type='tour',
                product_id=tour.id,
                variant_id=variant.id,
                booking_date=schedule.start_date,
                order__status__in=['confirmed', 'paid', 'completed']
            ).aggregate(
                total=Sum('quantity')
            )['total'] or 0
            
            booked_capacity = cart_bookings + order_bookings
            available_capacity = max(0, variant_capacity - booked_capacity)
            
            variants_info.append({
                'id': str(variant.id),
                'name': variant.name,
                'description': variant.description,
                'base_price': float(variant.base_price),
                'total_capacity': variant_capacity,
                'booked_capacity': booked_capacity,
                'available_capacity': available_capacity,
                'is_available': available_capacity > 0,
                'includes_transfer': variant.includes_transfer,
                'includes_guide': variant.includes_guide,
                'includes_meal': variant.includes_meal,
                'includes_photographer': variant.includes_photographer,
            })
        
        schedule_data.append({
            'id': str(schedule.id),
            'start_date': schedule.start_date.isoformat(),
            'end_date': schedule.end_date.isoformat(),
            'start_time': schedule.start_time.isoformat(),
            'end_time': schedule.end_time.isoformat(),
            'day_of_week': schedule.day_of_week,
            'max_capacity': schedule.max_capacity,
            'current_capacity': schedule.current_capacity,
            'available_capacity': schedule.available_capacity,
            'is_available': schedule.is_available and schedule.available_capacity > 0,
            'variants': variants_info
        })
    
    return Response({
        'tour': {
            'id': str(tour.id),
            'title': tour.title,
            'slug': tour.slug,
            'duration_hours': tour.duration_hours,
            'min_participants': tour.min_participants,
            'max_participants': tour.max_participants,
            'booking_cutoff_hours': tour.booking_cutoff_hours,
            'currency': tour.currency,
        },
        'schedules': schedule_data
    })


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def check_tour_availability_view(request):
    """Check availability for specific tour variant and date before adding to cart."""
    serializer_class = CheckTourAvailabilitySerializer
    
    serializer = serializer_class(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    tour_id = serializer.validated_data['tour_id']
    variant_id = serializer.validated_data['variant_id']
    schedule_id = serializer.validated_data['schedule_id']
    participants = serializer.validated_data['participants']
    
    try:
        tour = Tour.objects.get(id=tour_id, is_active=True)
        variant = tour.variants.get(id=variant_id, is_active=True)
        schedule = tour.schedules.get(id=schedule_id, is_available=True)
    except (Tour.DoesNotExist, TourVariant.DoesNotExist, TourSchedule.DoesNotExist):
        return Response(
            {'error': 'Tour, variant, or schedule not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if booking date is valid
    from django.utils import timezone
    today = timezone.now().date()
    cutoff_time = timezone.now() + timedelta(hours=tour.booking_cutoff_hours)
    
    if schedule.start_date < today:
        return Response(
            {'error': 'Cannot book tours in the past'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if timezone.now() + timedelta(hours=tour.booking_cutoff_hours) > timezone.datetime.combine(schedule.start_date, schedule.start_time):
        return Response(
            {'error': f'Booking cutoff time passed. Must book at least {tour.booking_cutoff_hours} hours in advance'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Calculate total participants requested
    total_participants = participants['adult'] + participants['child'] + participants['infant']
    
    # Check variant capacity
    variant_capacity = schedule.variant_capacities.get(str(variant.id), variant.capacity)
    
    # Calculate current bookings
    from cart.models import CartItem
    from orders.models import OrderItem
    
    cart_bookings = CartItem.objects.filter(
        product_type='tour',
        product_id=tour.id,
        variant_id=variant.id,
        booking_date=schedule.start_date
    ).aggregate(
        total=Sum('quantity')
    )['total'] or 0
    
    order_bookings = OrderItem.objects.filter(
        product_type='tour',
        product_id=tour.id,
        variant_id=variant.id,
        booking_date=schedule.start_date,
        order__status__in=['confirmed', 'paid', 'completed']
    ).aggregate(
        total=Sum('quantity')
    )['total'] or 0
    
    booked_capacity = cart_bookings + order_bookings
    available_capacity = max(0, variant_capacity - booked_capacity)
    
    # Check if requested participants fit
    if total_participants > available_capacity:
        return Response({
            'available': False,
            'error': f'Not enough capacity. Requested: {total_participants}, Available: {available_capacity}',
            'variant_capacity': variant_capacity,
            'booked_capacity': booked_capacity,
            'available_capacity': available_capacity
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Calculate pricing for each age group
    pricing_info = {}
    for age_group in ['adult', 'child', 'infant']:
        try:
            pricing = tour.pricing.get(variant=variant, age_group=age_group)
            final_price = variant.base_price * pricing.factor
            pricing_info[age_group] = {
                'base_price': float(variant.base_price),
                'factor': float(pricing.factor),
                'final_price': float(final_price),
                'is_free': pricing.is_free,
                'count': participants[age_group],
                'total': float(final_price * participants[age_group]) if not pricing.is_free else 0.0
            }
        except TourPricing.DoesNotExist:
            # Default pricing if not found
            pricing_info[age_group] = {
                'base_price': float(variant.base_price),
                'factor': 1.0,
                'final_price': float(variant.base_price),
                'is_free': False,
                'count': participants[age_group],
                'total': float(variant.base_price * participants[age_group])
            }
    
    subtotal = sum(p['total'] for p in pricing_info.values())
    
    return Response({
        'available': True,
        'tour': {
            'id': str(tour.id),
            'title': tour.title,
            'currency': tour.currency
        },
        'variant': {
            'id': str(variant.id),
            'name': variant.name,
            'base_price': float(variant.base_price)
        },
        'schedule': {
            'id': str(schedule.id),
            'start_date': schedule.start_date.isoformat(),
            'start_time': schedule.start_time.isoformat()
        },
        'capacity': {
            'variant_capacity': variant_capacity,
            'booked_capacity': booked_capacity,
            'available_capacity': available_capacity,
            'requested_participants': total_participants
        },
        'pricing': pricing_info,
        'subtotal': subtotal
    }) 