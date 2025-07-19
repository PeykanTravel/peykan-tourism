"""
Shared utilities for Peykan Tourism Platform.
"""

import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from django.http import Http404
from django.utils.translation import gettext_lazy as _

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler for DRF.
    Provides consistent error responses across the API.
    """
    # Call DRF's default exception handler first
    response = exception_handler(exc, context)
    
    if response is not None:
        # Customize the error response format
        error_data = {
            'success': False,
            'error': {
                'type': exc.__class__.__name__,
                'message': str(exc),
                'code': getattr(exc, 'default_code', 'error'),
            },
            'timestamp': context['request'].META.get('HTTP_X_REQUEST_ID', ''),
        }
        
        # Add validation errors if available
        if hasattr(exc, 'detail'):
            if isinstance(exc.detail, dict):
                error_data['error']['fields'] = exc.detail
            elif isinstance(exc.detail, list):
                error_data['error']['messages'] = exc.detail
        
        response.data = error_data
        
        # Log the error
        logger.error(
            f"API Error: {exc.__class__.__name__} - {str(exc)}",
            extra={
                'request_id': context['request'].META.get('HTTP_X_REQUEST_ID'),
                'user': getattr(context['request'], 'user', None),
                'view': context['view'].__class__.__name__,
                'method': context['request'].method,
                'url': context['request'].path,
            }
        )
    
    return response


def validate_currency(currency_code):
    """
    Validate currency code.
    """
    from peykan.settings import SUPPORTED_CURRENCIES
    
    if currency_code not in SUPPORTED_CURRENCIES:
        raise ValidationError(_(f'Currency {currency_code} is not supported.'))
    
    return currency_code


def validate_language(language_code):
    """
    Validate language code.
    """
    from peykan.settings import LANGUAGES
    
    supported_languages = [lang[0] for lang in LANGUAGES]
    if language_code not in supported_languages:
        raise ValidationError(_(f'Language {language_code} is not supported.'))
    
    return language_code


def format_price(amount, currency='USD', locale='en'):
    """
    Format price with currency symbol.
    """
    try:
        from babel.numbers import format_currency
        return format_currency(amount, currency, locale=locale)
    except ImportError:
        # Fallback formatting
        currency_symbols = {
            'USD': '$',
            'EUR': '€',
            'TRY': '₺',
            'IRR': 'ریال',
        }
        symbol = currency_symbols.get(currency, currency)
        return f"{symbol} {amount:,.2f}"


def generate_unique_reference(prefix='', length=8):
    """
    Generate unique reference number.
    """
    import uuid
    import string
    import random
    
    # Generate a unique string
    unique_id = str(uuid.uuid4()).replace('-', '')[:length]
    
    # Add random characters if needed
    if len(unique_id) < length:
        chars = string.ascii_uppercase + string.digits
        unique_id += ''.join(random.choice(chars) for _ in range(length - len(unique_id)))
    
    return f"{prefix}{unique_id.upper()}"


def sanitize_filename(filename):
    """
    Sanitize filename for safe storage.
    """
    import re
    import unicodedata
    
    # Remove accents and normalize
    filename = unicodedata.normalize('NFKD', filename)
    filename = ''.join(c for c in filename if not unicodedata.combining(c))
    
    # Replace spaces and special characters
    filename = re.sub(r'[^\w\-_\.]', '_', filename)
    
    # Remove multiple underscores
    filename = re.sub(r'_+', '_', filename)
    
    return filename


def get_client_ip(request):
    """
    Get client IP address from request.
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def is_ajax_request(request):
    """
    Check if request is AJAX.
    """
    return request.headers.get('X-Requested-With') == 'XMLHttpRequest' or \
           request.content_type == 'application/json'


def paginate_queryset(queryset, page_size=20, page_number=1):
    """
    Simple pagination utility.
    """
    from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
    
    paginator = Paginator(queryset, page_size)
    
    try:
        page = paginator.page(page_number)
    except PageNotAnInteger:
        page = paginator.page(1)
    except EmptyPage:
        page = paginator.page(paginator.num_pages)
    
    return {
        'results': page.object_list,
        'count': paginator.count,
        'next': page.has_next(),
        'previous': page.has_previous(),
        'num_pages': paginator.num_pages,
        'current_page': page.number,
    } 