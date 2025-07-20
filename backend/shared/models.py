"""
Shared models for Peykan Tourism Platform.
"""

from decimal import Decimal
from django.db import models
from django.utils.translation import gettext_lazy as _
from core.models import BaseModel


class CurrencyRate(BaseModel):
    """
    Model for storing currency exchange rates.
    """
    
    from_currency = models.CharField(
        max_length=3, 
        verbose_name=_('From currency')
    )
    to_currency = models.CharField(
        max_length=3, 
        verbose_name=_('To currency')
    )
    rate = models.DecimalField(
        max_digits=15, 
        decimal_places=6,
        verbose_name=_('Exchange rate')
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name=_('Is active')
    )
    
    class Meta:
        verbose_name = _('Currency Rate')
        verbose_name_plural = _('Currency Rates')
        unique_together = ['from_currency', 'to_currency']
        ordering = ['from_currency', 'to_currency']
    
    def __str__(self):
        return f"{self.from_currency} → {self.to_currency}: {self.rate}"


class UserCurrencyPreference(BaseModel):
    """
    Model for storing user currency preferences.
    """
    
    user = models.OneToOneField(
        'users.User',
        on_delete=models.CASCADE,
        related_name='currency_preference',
        verbose_name=_('User')
    )
    currency = models.CharField(
        max_length=3,
        default='USD',
        verbose_name=_('Preferred currency')
    )
    
    class Meta:
        verbose_name = _('User Currency Preference')
        verbose_name_plural = _('User Currency Preferences')
    
    def __str__(self):
        return f"{self.user.username}: {self.currency}"


class CurrencyConfig(BaseModel):
    """
    Model for storing currency configuration.
    """
    
    currency_code = models.CharField(
        max_length=3,
        unique=True,
        verbose_name=_('Currency code')
    )
    currency_name = models.CharField(
        max_length=50,
        verbose_name=_('Currency name')
    )
    symbol = models.CharField(
        max_length=10,
        verbose_name=_('Currency symbol')
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name=_('Is active')
    )
    is_default = models.BooleanField(
        default=False,
        verbose_name=_('Is default')
    )
    decimal_places = models.PositiveIntegerField(
        default=2,
        verbose_name=_('Decimal places')
    )
    thousands_separator = models.CharField(
        max_length=1,
        default=',',
        verbose_name=_('Thousands separator')
    )
    decimal_separator = models.CharField(
        max_length=1,
        default='.',
        verbose_name=_('Decimal separator')
    )
    
    class Meta:
        verbose_name = _('Currency Configuration')
        verbose_name_plural = _('Currency Configurations')
        ordering = ['currency_code']
    
    def __str__(self):
        return f"{self.currency_code} ({self.currency_name})" 