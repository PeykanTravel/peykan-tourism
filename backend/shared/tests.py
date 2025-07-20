"""
Tests for shared app.
"""

from decimal import Decimal
from django.test import TestCase
from .services import CurrencyConverterService


class CurrencyConverterServiceTest(TestCase):
    """Test cases for CurrencyConverterService."""
    
    def test_zero_amount_conversion(self):
        """Test that zero amount returns zero in any currency."""
        # Test USD to EUR
        result = CurrencyConverterService.convert_currency(
            Decimal('0'), 'USD', 'EUR'
        )
        self.assertEqual(result, Decimal('0'))
        
        # Test USD to TRY
        result = CurrencyConverterService.convert_currency(
            Decimal('0'), 'USD', 'TRY'
        )
        self.assertEqual(result, Decimal('0'))
        
        # Test USD to IRR
        result = CurrencyConverterService.convert_currency(
            Decimal('0'), 'USD', 'IRR'
        )
        self.assertEqual(result, Decimal('0'))
    
    def test_negative_amount_conversion(self):
        """Test that negative amounts preserve sign."""
        # Test negative USD to EUR
        result = CurrencyConverterService.convert_currency(
            Decimal('-100'), 'USD', 'EUR'
        )
        self.assertLess(result, 0)
        self.assertEqual(result, Decimal('-85'))
        
        # Test negative USD to TRY
        result = CurrencyConverterService.convert_currency(
            Decimal('-100'), 'USD', 'TRY'
        )
        self.assertLess(result, 0)
        self.assertEqual(result, Decimal('-4550'))
    
    def test_zero_amount_formatting(self):
        """Test that zero amounts format correctly."""
        # Test USD zero
        result = CurrencyConverterService.format_price(Decimal('0'), 'USD')
        self.assertEqual(result, '$0.00')
        
        # Test EUR zero
        result = CurrencyConverterService.format_price(Decimal('0'), 'EUR')
        self.assertEqual(result, '€0.00')
        
        # Test TRY zero
        result = CurrencyConverterService.format_price(Decimal('0'), 'TRY')
        self.assertEqual(result, '₺0.00')
        
        # Test IRR zero
        result = CurrencyConverterService.format_price(Decimal('0'), 'IRR')
        self.assertEqual(result, 'ریال0')
    
    def test_negative_amount_formatting(self):
        """Test that negative amounts format correctly."""
        # Test negative USD
        result = CurrencyConverterService.format_price(Decimal('-100'), 'USD')
        self.assertEqual(result, '-$100.00')
        
        # Test negative EUR
        result = CurrencyConverterService.format_price(Decimal('-50'), 'EUR')
        self.assertEqual(result, '-€50.00')
        
        # Test negative TRY
        result = CurrencyConverterService.format_price(Decimal('-1000'), 'TRY')
        self.assertEqual(result, '-₺1,000.00')
        
        # Test negative IRR
        result = CurrencyConverterService.format_price(Decimal('-50000'), 'IRR')
        self.assertEqual(result, '-ریال50,000')
    
    def test_normal_conversion(self):
        """Test normal currency conversions."""
        # USD to EUR
        result = CurrencyConverterService.convert_currency(
            Decimal('100'), 'USD', 'EUR'
        )
        self.assertEqual(result, Decimal('85'))
        
        # USD to TRY
        result = CurrencyConverterService.convert_currency(
            Decimal('100'), 'USD', 'TRY'
        )
        self.assertEqual(result, Decimal('4550'))
        
        # USD to IRR
        result = CurrencyConverterService.convert_currency(
            Decimal('100'), 'USD', 'IRR'
        )
        self.assertEqual(result, Decimal('92000000'))
    
    def test_same_currency_conversion(self):
        """Test conversion to same currency returns original amount."""
        result = CurrencyConverterService.convert_currency(
            Decimal('100'), 'USD', 'USD'
        )
        self.assertEqual(result, Decimal('100'))
        
        result = CurrencyConverterService.convert_currency(
            Decimal('0'), 'EUR', 'EUR'
        )
        self.assertEqual(result, Decimal('0')) 