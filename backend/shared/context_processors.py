"""
Context processors for shared app.
"""

from .services import CurrencyConverterService, LanguageService


def currency_context(request):
    """
    Add currency information to template context.
    """
    return {
        'user_currency': CurrencyConverterService.get_user_currency(request),
        'supported_currencies': ['USD', 'EUR', 'TRY', 'IRR'],
        'currency_symbols': {
            'USD': '$',
            'EUR': '€',
            'TRY': '₺',
            'IRR': 'ریال',
        }
    }


def language_context(request):
    """
    Add language information to template context.
    """
    return {
        'user_language': LanguageService.get_user_language(request),
        'supported_languages': ['fa', 'en', 'tr'],
        'language_names': {
            'fa': 'Persian',
            'en': 'English',
            'tr': 'Turkish',
        },
        'rtl_languages': ['fa'],
        'is_rtl': LanguageService.is_rtl(LanguageService.get_user_language(request)),
        'text_direction': LanguageService.get_language_direction(LanguageService.get_user_language(request))
    } 