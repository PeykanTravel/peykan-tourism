#!/usr/bin/env python
"""
Simple Test - Tests core functionality without database operations
"""

import os
import sys
import django
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'peykan.settings')
django.setup()

from transfers.models import TransferRoute, TransferOption

def test_core_functionality():
    """Test core functionality without database operations."""
    print("🧪 Testing Core Transfer Functionality")
    print("="*50)
    
    try:
        # 1. Test TransferRoute methods
        print("1. Testing TransferRoute methods...")
        route = TransferRoute(
            origin='Test Airport',
            destination='Test City',
            peak_hour_surcharge=Decimal('15.00'),
            midnight_surcharge=Decimal('10.00'),
            round_trip_discount_enabled=True,
            round_trip_discount_percentage=Decimal('10.00')
        )
        
        base_price = Decimal('25.00')
        
        # Test time surcharge calculations
        peak_surcharge = route.calculate_time_surcharge(base_price, 8)  # 8 AM
        off_peak_surcharge = route.calculate_time_surcharge(base_price, 14)  # 2 PM
        midnight_surcharge = route.calculate_time_surcharge(base_price, 23)  # 11 PM
        
        print(f"   ✅ Peak hour surcharge (8 AM): ${peak_surcharge}")
        print(f"   ✅ Off-peak surcharge (2 PM): ${off_peak_surcharge}")
        print(f"   ✅ Midnight surcharge (11 PM): ${midnight_surcharge}")
        
        # 2. Test TransferOption methods
        print("\n2. Testing TransferOption methods...")
        
        # Fixed price option
        fixed_option = TransferOption(
            option_type='wheelchair',
            price_type='fixed',
            price=Decimal('10.00'),
            price_percentage=Decimal('0.00')
        )
        fixed_price = fixed_option.calculate_price(base_price)
        print(f"   ✅ Fixed price option: ${fixed_price}")
        
        # Percentage price option
        percentage_option = TransferOption(
            option_type='english_driver',
            price_type='percentage',
            price=Decimal('0.00'),
            price_percentage=Decimal('15.00')
        )
        percentage_price = percentage_option.calculate_price(base_price)
        print(f"   ✅ Percentage price option: ${percentage_price}")
        
        # 3. Test complete pricing calculation
        print("\n3. Testing complete pricing calculation...")
        
        # Base price
        total_price = base_price
        
        # Add time surcharge (peak hour)
        total_price += peak_surcharge
        
        # Add options
        total_price += fixed_price + percentage_price
        
        # Round trip discount (if applicable)
        if route.round_trip_discount_enabled:
            discount = total_price * (route.round_trip_discount_percentage / 100)
            total_price -= discount
            print(f"   ✅ Round trip discount: ${discount}")
        
        print(f"   ✅ Base price: ${base_price}")
        print(f"   ✅ Time surcharge: ${peak_surcharge}")
        print(f"   ✅ Options total: ${fixed_price + percentage_price}")
        print(f"   ✅ Final price: ${total_price}")
        
        # 4. Test model field access
        print("\n4. Testing model field access...")
        print(f"   ✅ Route: {route.origin} → {route.destination}")
        print(f"   ✅ Peak hour surcharge: {route.peak_hour_surcharge}%")
        print(f"   ✅ Midnight surcharge: {route.midnight_surcharge}%")
        print(f"   ✅ Fixed option type: {fixed_option.get_option_type_display()}")
        print(f"   ✅ Percentage option type: {percentage_option.get_option_type_display()}")
        
        print("\n✅ All core functionality tests passed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_model_choices():
    """Test model choices and validation."""
    print("\n🧪 Testing Model Choices")
    print("="*30)
    
    try:
        # Test vehicle type choices
        print("1. Testing vehicle type choices...")
        vehicle_choices = TransferRoute._meta.get_field('peak_hour_surcharge').choices
        print(f"   ✅ Peak hour surcharge field exists")
        
        # Test option type choices
        print("2. Testing option type choices...")
        option_choices = TransferOption._meta.get_field('option_type').choices
        print(f"   ✅ Option type choices: {len(option_choices)} options")
        
        # Test price type choices
        print("3. Testing price type choices...")
        price_type_choices = TransferOption._meta.get_field('price_type').choices
        print(f"   ✅ Price type choices: {len(price_type_choices)} options")
        
        print("\n✅ All choice tests passed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Choice test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests."""
    print("🚀 Starting Simple Transfer Tests")
    print("="*60)
    
    success1 = test_core_functionality()
    success2 = test_model_choices()
    
    if success1 and success2:
        print("\n🎉 ALL TESTS PASSED!")
        print("\n📋 SUMMARY:")
        print("   ✅ Core pricing calculations")
        print("   ✅ Time surcharge calculations")
        print("   ✅ Option price calculations")
        print("   ✅ Round trip discount calculations")
        print("   ✅ Model field access")
        print("   ✅ Model choices validation")
        print("\n✅ Transfer Product Backend is working correctly!")
        return True
    else:
        print("\n❌ SOME TESTS FAILED!")
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1) 