#!/usr/bin/env python
"""
Test the updated transfer pricing API.
"""

import requests
import json

def test_pricing_api():
    """Test the pricing API with different scenarios."""
    
    base_url = "http://localhost:8000/api/v1/transfers/routes/calculate_price_public/"
    
    # Test 1: Basic pricing (Tehran to Mashhad, sedan)
    print("=== Test 1: Basic Pricing ===")
    data1 = {
        "origin": "Tehran Imam Khomeini International Airport",
        "destination": "Mashhad International Airport", 
        "vehicle_type": "sedan"
    }
    
    response1 = requests.post(base_url, json=data1)
    print(f"Status: {response1.status_code}")
    if response1.status_code == 200:
        result1 = response1.json()
        print(f"Base Price: ${result1.get('base_price', 0)}")
        print(f"Final Price: ${result1.get('final_price', 0)}")
        print(f"Route Found: {result1.get('route_found', False)}")
    else:
        print(f"Error: {response1.text}")
    
    print("\n" + "="*50 + "\n")
    
    # Test 2: With time surcharge (peak hour)
    print("=== Test 2: With Peak Hour Surcharge ===")
    data2 = {
        "origin": "Tehran Imam Khomeini International Airport",
        "destination": "Mashhad International Airport",
        "vehicle_type": "sedan",
        "outbound_time": "08:30"  # Peak hour
    }
    
    response2 = requests.post(base_url, json=data2)
    print(f"Status: {response2.status_code}")
    if response2.status_code == 200:
        result2 = response2.json()
        print(f"Base Price: ${result2.get('base_price', 0)}")
        print(f"Outbound Surcharge: ${result2.get('outbound_surcharge', 0)}")
        print(f"Final Price: ${result2.get('final_price', 0)}")
    else:
        print(f"Error: {response2.text}")
    
    print("\n" + "="*50 + "\n")
    
    # Test 3: Round trip with options
    print("=== Test 3: Round Trip with Options ===")
    data3 = {
        "origin": "Tehran Imam Khomeini International Airport",
        "destination": "Mashhad International Airport",
        "vehicle_type": "sedan",
        "trip_type": "round_trip",
        "outbound_time": "14:30",
        "return_time": "10:00",
        "selected_options": ["meet_greet", "child_seat", "priority_booking"]
    }
    
    response3 = requests.post(base_url, json=data3)
    print(f"Status: {response3.status_code}")
    if response3.status_code == 200:
        result3 = response3.json()
        print(f"Base Price: ${result3.get('base_price', 0)}")
        print(f"Outbound Surcharge: ${result3.get('outbound_surcharge', 0)}")
        print(f"Return Surcharge: ${result3.get('return_surcharge', 0)}")
        print(f"Round Trip Discount: ${result3.get('round_trip_discount', 0)}")
        print(f"Options Total: ${result3.get('options_total', 0)}")
        print(f"Final Price: ${result3.get('final_price', 0)}")
        
        # Verify calculation
        base = result3.get('base_price', 0)
        outbound_surcharge = result3.get('outbound_surcharge', 0)
        return_surcharge = result3.get('return_surcharge', 0)
        discount = result3.get('round_trip_discount', 0)
        options = result3.get('options_total', 0)
        final = result3.get('final_price', 0)
        
        calculated = (base + outbound_surcharge + base + return_surcharge) - discount + options
        print(f"Manual Calculation: ${calculated}")
        print(f"Matches API: {abs(calculated - final) < 0.01}")
        
    else:
        print(f"Error: {response3.text}")

if __name__ == '__main__':
    test_pricing_api() 