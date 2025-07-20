"""
DRF Serializers for Shared app.
"""

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import CurrencyRate, UserCurrencyPreference, CurrencyConfig


class CurrencyConfigSerializer(serializers.ModelSerializer):
    """Serializer for CurrencyConfig model."""
    
    class Meta:
        model = CurrencyConfig
        fields = [
            'currency_code', 'currency_name', 'symbol', 
            'is_active', 'is_default', 'decimal_places',
            'thousands_separator', 'decimal_separator'
        ]


class CurrencyRateSerializer(serializers.ModelSerializer):
    """Serializer for CurrencyRate model."""
    
    class Meta:
        model = CurrencyRate
        fields = ['from_currency', 'to_currency', 'rate', 'is_active']


class UserCurrencyPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for UserCurrencyPreference model."""
    
    class Meta:
        model = UserCurrencyPreference
        fields = ['currency']
    
    def create(self, validated_data):
        """Create or update user currency preference."""
        user = self.context['request'].user
        preference, created = UserCurrencyPreference.objects.get_or_create(
            user=user,
            defaults=validated_data
        )
        if not created:
            preference.currency = validated_data['currency']
            preference.save()
        return preference


class CurrencyConversionSerializer(serializers.Serializer):
    """Serializer for currency conversion requests."""
    
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    from_currency = serializers.CharField(max_length=3)
    to_currency = serializers.CharField(max_length=3)
    
    def validate(self, data):
        """Validate currency codes."""
        supported_currencies = ['USD', 'EUR', 'TRY', 'IRR']
        
        if data['from_currency'] not in supported_currencies:
            raise serializers.ValidationError(
                f"Unsupported from_currency: {data['from_currency']}"
            )
        
        if data['to_currency'] not in supported_currencies:
            raise serializers.ValidationError(
                f"Unsupported to_currency: {data['to_currency']}"
            )
        
        return data


class CurrencyConversionResponseSerializer(serializers.Serializer):
    """Serializer for currency conversion responses."""
    
    original_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    original_currency = serializers.CharField(max_length=3)
    converted_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    converted_currency = serializers.CharField(max_length=3)
    exchange_rate = serializers.DecimalField(max_digits=10, decimal_places=6)
    formatted_amount = serializers.CharField()


class SupportedCurrenciesSerializer(serializers.Serializer):
    """Serializer for supported currencies response."""
    
    currencies = CurrencyConfigSerializer(many=True)
    default_currency = serializers.CharField(max_length=3)
    exchange_rates = serializers.DictField()


class CurrencyFormatSerializer(serializers.Serializer):
    """Serializer for currency formatting requests."""
    
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    currency = serializers.CharField(max_length=3)
    locale = serializers.CharField(max_length=5, required=False, default='en')


class LanguagePreferenceSerializer(serializers.Serializer):
    """Serializer for language preference requests."""
    
    language = serializers.CharField(max_length=2)
    
    def validate_language(self, value):
        """Validate language code."""
        supported_languages = ['fa', 'en', 'tr']
        if value not in supported_languages:
            raise serializers.ValidationError(
                f"Unsupported language: {value}. Supported languages: {supported_languages}"
            )
        return value


class SupportedLanguagesSerializer(serializers.Serializer):
    """Serializer for supported languages response."""
    
    languages = serializers.ListField(child=serializers.CharField())
    default_language = serializers.CharField(max_length=2)
    current_language = serializers.CharField(max_length=2)
    rtl_languages = serializers.ListField(child=serializers.CharField()) 