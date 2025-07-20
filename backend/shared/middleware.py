"""
Middleware for currency and language management.
"""

from django.utils.deprecation import MiddlewareMixin
from .services import CurrencyConverterService, LanguageService


class CurrencyMiddleware(MiddlewareMixin):
    """
    Middleware to handle currency preferences in session.
    """
    
    def process_request(self, request):
        """Process request to set default currency if not set."""
        # Set default currency in session if not exists
        if 'preferred_currency' not in request.session:
            request.session['preferred_currency'] = 'USD'
        
        # Add currency helper to request
        request.get_user_currency = lambda: CurrencyConverterService.get_user_currency(request)
        request.set_user_currency = lambda currency: CurrencyConverterService.set_user_currency(request, currency)
        
        return None


class LanguageMiddleware(MiddlewareMixin):
    """
    Middleware to handle language preferences in session.
    """
    
    def process_request(self, request):
        """Process request to set default language if not set."""
        # Set default language in session if not exists
        if 'preferred_language' not in request.session:
            request.session['preferred_language'] = 'fa'
        
        # Add language helper to request
        request.get_user_language = lambda: LanguageService.get_user_language(request)
        request.set_user_language = lambda language: LanguageService.set_user_language(request, language)
        
        return None 