"""
Django management command to setup initial currency data.
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from shared.models import CurrencyConfig, CurrencyRate


class Command(BaseCommand):
    help = 'Setup initial currency configurations and exchange rates'

    def handle(self, *args, **options):
        """Setup initial currency data."""
        self.stdout.write('Setting up currency configurations...')
        
        with transaction.atomic():
            # Create currency configurations
            currencies_data = [
                {
                    'currency_code': 'USD',
                    'currency_name': 'US Dollar',
                    'symbol': '$',
                    'is_default': True,
                    'decimal_places': 2,
                    'thousands_separator': ',',
                    'decimal_separator': '.',
                },
                {
                    'currency_code': 'EUR',
                    'currency_name': 'Euro',
                    'symbol': '€',
                    'is_default': False,
                    'decimal_places': 2,
                    'thousands_separator': '.',
                    'decimal_separator': ',',
                },
                {
                    'currency_code': 'TRY',
                    'currency_name': 'Turkish Lira',
                    'symbol': '₺',
                    'is_default': False,
                    'decimal_places': 2,
                    'thousands_separator': '.',
                    'decimal_separator': ',',
                },
                {
                    'currency_code': 'IRR',
                    'currency_name': 'Iranian Rial',
                    'symbol': 'ریال',
                    'is_default': False,
                    'decimal_places': 0,
                    'thousands_separator': ',',
                    'decimal_separator': '.',
                },
            ]
            
            for currency_data in currencies_data:
                currency, created = CurrencyConfig.objects.get_or_create(
                    currency_code=currency_data['currency_code'],
                    defaults=currency_data
                )
                if created:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Created currency: {currency.currency_code}'
                        )
                    )
                else:
                    self.stdout.write(
                        f'Currency already exists: {currency.currency_code}'
                    )
            
            # Create exchange rates (USD as base currency)
            exchange_rates_data = [
                {'from_currency': 'USD', 'to_currency': 'USD', 'rate': 1.000000},
                {'from_currency': 'USD', 'to_currency': 'EUR', 'rate': 0.850000},
                {'from_currency': 'USD', 'to_currency': 'TRY', 'rate': 45.500000},
                {'from_currency': 'USD', 'to_currency': 'IRR', 'rate': 920000.000000},
                {'from_currency': 'EUR', 'to_currency': 'USD', 'rate': 1.176471},
                {'from_currency': 'EUR', 'to_currency': 'EUR', 'rate': 1.000000},
                {'from_currency': 'EUR', 'to_currency': 'TRY', 'rate': 53.529412},
                {'from_currency': 'EUR', 'to_currency': 'IRR', 'rate': 1082353.000000},
                {'from_currency': 'TRY', 'to_currency': 'USD', 'rate': 0.021978},
                {'from_currency': 'TRY', 'to_currency': 'EUR', 'rate': 0.018681},
                {'from_currency': 'TRY', 'to_currency': 'TRY', 'rate': 1.000000},
                {'from_currency': 'TRY', 'to_currency': 'IRR', 'rate': 20219.780220},
                {'from_currency': 'IRR', 'to_currency': 'USD', 'rate': 0.000001},
                {'from_currency': 'IRR', 'to_currency': 'EUR', 'rate': 0.000001},
                {'from_currency': 'IRR', 'to_currency': 'TRY', 'rate': 0.000049},
                {'from_currency': 'IRR', 'to_currency': 'IRR', 'rate': 1.000000},
            ]
            
            for rate_data in exchange_rates_data:
                rate, created = CurrencyRate.objects.get_or_create(
                    from_currency=rate_data['from_currency'],
                    to_currency=rate_data['to_currency'],
                    defaults={'rate': rate_data['rate']}
                )
                if created:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Created rate: {rate.from_currency} → {rate.to_currency}'
                        )
                    )
                else:
                    self.stdout.write(
                        f'Rate already exists: {rate.from_currency} → {rate.to_currency}'
                    )
        
        self.stdout.write(
            self.style.SUCCESS('Currency setup completed successfully!')
        ) 