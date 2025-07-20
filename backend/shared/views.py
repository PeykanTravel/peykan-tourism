"""
DRF Views for Shared app.
"""

from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.core.cache import cache
from decimal import Decimal

from .models import CurrencyRate, UserCurrencyPreference, CurrencyConfig
from .serializers import (
    CurrencyConfigSerializer, CurrencyRateSerializer,
    UserCurrencyPreferenceSerializer, CurrencyConversionSerializer,
    CurrencyConversionResponseSerializer, SupportedCurrenciesSerializer,
    CurrencyFormatSerializer, LanguagePreferenceSerializer, SupportedLanguagesSerializer
)
from .services import CurrencyConverterService, LanguageService


class SupportedCurrenciesView(APIView):
    """Get supported currencies and exchange rates."""
    
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'currency'
    
    def get(self, request):
        """Get all supported currencies with exchange rates."""
        # Get currency configurations
        currencies = CurrencyConfig.objects.filter(is_active=True)
        currency_serializer = CurrencyConfigSerializer(currencies, many=True)
        
        # Get default currency
        default_currency = CurrencyConfig.objects.filter(is_default=True).first()
        default_code = default_currency.currency_code if default_currency else 'USD'
        
        # Get exchange rates
        exchange_rates = CurrencyConverterService.get_exchange_rates()
        
        response_data = {
            'currencies': currency_serializer.data,
            'default_currency': default_code,
            'exchange_rates': exchange_rates
        }
        
        return Response(response_data)


class CurrencyConversionView(APIView):
    """Convert currency amounts."""
    
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'currency'
    
    def post(self, request):
        """Convert amount from one currency to another."""
        serializer = CurrencyConversionSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            
            # Convert currency
            converted_amount = CurrencyConverterService.convert_currency(
                amount=data['amount'],
                from_currency=data['from_currency'],
                to_currency=data['to_currency']
            )
            
            # Get exchange rate
            rates = CurrencyConverterService.get_exchange_rates()
            if data['from_currency'] == 'USD':
                exchange_rate = rates.get(data['to_currency'], 1.0)
            elif data['to_currency'] == 'USD':
                exchange_rate = 1.0 / rates.get(data['from_currency'], 1.0)
            else:
                from_rate = rates.get(data['from_currency'], 1.0)
                to_rate = rates.get(data['to_currency'], 1.0)
                exchange_rate = to_rate / from_rate
            
            # Format converted amount
            formatted_amount = CurrencyConverterService.format_price(
                amount=converted_amount,
                currency=data['to_currency']
            )
            
            response_data = {
                'original_amount': data['amount'],
                'original_currency': data['from_currency'],
                'converted_amount': converted_amount,
                'converted_currency': data['to_currency'],
                'exchange_rate': Decimal(str(exchange_rate)),
                'formatted_amount': formatted_amount
            }
            
            return Response(response_data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserCurrencyPreferenceView(generics.RetrieveUpdateAPIView):
    """Get and update user currency preference."""
    
    serializer_class = UserCurrencyPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        """Get or create user currency preference."""
        user = self.request.user
        preference, created = UserCurrencyPreference.objects.get_or_create(
            user=user,
            defaults={'currency': 'USD'}
        )
        return preference
    
    def update(self, request, *args, **kwargs):
        """Update user currency preference and set in session."""
        response = super().update(request, *args, **kwargs)
        
        # Also set in session for immediate effect
        currency = request.data.get('currency', 'USD')
        CurrencyConverterService.set_user_currency(request, currency)
        
        return response


class CurrencyFormatView(APIView):
    """Format currency amounts."""
    
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'currency'
    
    def post(self, request):
        """Format amount with currency symbol."""
        serializer = CurrencyFormatSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            
            formatted_amount = CurrencyConverterService.format_price(
                amount=data['amount'],
                currency=data['currency'],
                locale=data.get('locale', 'en')
            )
            
            return Response({
                'amount': data['amount'],
                'currency': data['currency'],
                'formatted_amount': formatted_amount
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def currency_rates_view(request):
    """Get current exchange rates."""
    rates = CurrencyConverterService.get_exchange_rates()
    return Response({
        'base_currency': 'USD',
        'rates': rates,
        'timestamp': CurrencyConverterService.get_last_update_time()
    })


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def bulk_currency_conversion_view(request):
    """Convert multiple amounts at once."""
    amounts = request.data.get('amounts', [])
    from_currency = request.data.get('from_currency', 'USD')
    to_currency = request.data.get('to_currency', 'USD')
    
    if not amounts:
        return Response(
            {'error': 'Amounts list is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    converted_amounts = []
    for amount in amounts:
        try:
            converted = CurrencyConverterService.convert_currency(
                amount=Decimal(str(amount)),
                from_currency=from_currency,
                to_currency=to_currency
            )
            formatted = CurrencyConverterService.format_price(
                amount=converted,
                currency=to_currency
            )
            converted_amounts.append({
                'original': amount,
                'converted': float(converted),
                'formatted': formatted
            })
        except Exception as e:
            converted_amounts.append({
                'original': amount,
                'error': str(e)
            })
    
    return Response({
        'from_currency': from_currency,
        'to_currency': to_currency,
        'converted_amounts': converted_amounts
    })


class SupportedLanguagesView(APIView):
    """Get supported languages and current language."""
    
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'language'
    
    def get(self, request):
        """Get all supported languages with current language."""
        response_data = {
            'languages': LanguageService.SUPPORTED_LANGUAGES,
            'default_language': 'fa',
            'current_language': LanguageService.get_user_language(request),
            'rtl_languages': LanguageService.RTL_LANGUAGES
        }
        
        return Response(response_data)


class LanguagePreferenceView(APIView):
    """Get and update user language preference."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get current user language preference."""
        current_language = LanguageService.get_user_language(request)
        return Response({
            'language': current_language,
            'language_name': LanguageService.get_language_name(current_language),
            'direction': LanguageService.get_language_direction(current_language)
        })
    
    def put(self, request):
        """Update user language preference."""
        serializer = LanguagePreferenceSerializer(data=request.data)
        if serializer.is_valid():
            language = serializer.validated_data['language']
            
            try:
                LanguageService.set_user_language(request, language)
                return Response({
                    'message': f'Language set to {LanguageService.get_language_name(language)}',
                    'language': language,
                    'language_name': LanguageService.get_language_name(language),
                    'direction': LanguageService.get_language_direction(language)
                })
            except ValueError as e:
                return Response(
                    {'error': str(e)}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def set_session_language_view(request):
    """Set language preference in session (for guest users)."""
    serializer = LanguagePreferenceSerializer(data=request.data)
    if serializer.is_valid():
        language = serializer.validated_data['language']
        
        try:
            LanguageService.set_user_language(request, language)
            return Response({
                'message': f'Language set to {LanguageService.get_language_name(language)}',
                'language': language,
                'language_name': LanguageService.get_language_name(language),
                'direction': LanguageService.get_language_direction(language)
            })
        except ValueError as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def set_session_currency_view(request):
    """Set currency preference in session (for guest users)."""
    currency = request.data.get('currency', 'USD')
    
    # Validate currency
    supported_currencies = ['USD', 'EUR', 'TRY', 'IRR']
    if currency not in supported_currencies:
        return Response(
            {'error': f'Unsupported currency: {currency}'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Set in session
    CurrencyConverterService.set_user_currency(request, currency)
    
    return Response({
        'message': f'Currency set to {currency}',
        'currency': currency
    }) 