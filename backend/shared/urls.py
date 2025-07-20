"""
URL patterns for Shared app.
"""

from django.urls import path
from .views import (
    SupportedCurrenciesView, CurrencyConversionView, UserCurrencyPreferenceView,
    CurrencyFormatView, currency_rates_view, bulk_currency_conversion_view,
    set_session_currency_view, SupportedLanguagesView, LanguagePreferenceView,
    set_session_language_view
)

app_name = 'shared'

urlpatterns = [
    # Currency API endpoints
    path('currency/supported/', 
         SupportedCurrenciesView.as_view(), 
         name='supported-currencies'),
    
    path('currency/convert/', 
         CurrencyConversionView.as_view(), 
         name='currency-convert'),
    
    path('currency/format/', 
         CurrencyFormatView.as_view(), 
         name='currency-format'),
    
    path('currency/rates/', 
         currency_rates_view, 
         name='currency-rates'),
    
    path('currency/bulk-convert/', 
         bulk_currency_conversion_view, 
         name='bulk-currency-convert'),
    
    # User currency preference (authenticated users only)
    path('currency/preference/', 
         UserCurrencyPreferenceView.as_view(), 
         name='user-currency-preference'),
    
    # Session currency (for guest users)
    path('currency/session/', 
         set_session_currency_view, 
         name='session-currency'),
    
    # Language API endpoints
    path('language/supported/', 
         SupportedLanguagesView.as_view(), 
         name='supported-languages'),
    
    path('language/preference/', 
         LanguagePreferenceView.as_view(), 
         name='user-language-preference'),
    
    # Session language (for guest users)
    path('language/session/', 
         set_session_language_view, 
         name='session-language'),
] 