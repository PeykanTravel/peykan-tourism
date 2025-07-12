#!/usr/bin/env python3
"""
Frontend Integration Test Script
Tests the new Event system APIs and frontend integration.
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BACKEND_URL = "http://localhost:8000/api/v1"
FRONTEND_URL = "http://localhost:3000"

def test_backend_apis():
    """Test all backend APIs for the new Event system."""
    print("🔍 Testing Backend APIs...")
    
    # Test events index
    try:
        response = requests.get(f"{BACKEND_URL}/events/", timeout=10)
        if response.status_code == 200:
            print("✅ Events index API - OK")
            data = response.json()
            print(f"   Available endpoints: {list(data.keys())}")
        else:
            print(f"❌ Events index API - Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Events index API - Error: {e}")
    
    # Test events list
    try:
        response = requests.get(f"{BACKEND_URL}/events/events/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Events list API - OK ({data.get('count', 0)} events)")
            if data.get('results'):
                event = data['results'][0]
                print(f"   Sample event: {event.get('title', 'N/A')} (ID: {event.get('id', 'N/A')})")
        else:
            print(f"❌ Events list API - Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Events list API - Error: {e}")
    
    # Test event categories
    try:
        response = requests.get(f"{BACKEND_URL}/events/categories/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Event categories API - OK ({len(data.get('results', []))} categories)")
        else:
            print(f"❌ Event categories API - Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Event categories API - Error: {e}")
    
    # Test venues
    try:
        response = requests.get(f"{BACKEND_URL}/events/venues/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Venues API - OK ({len(data.get('results', []))} venues)")
        else:
            print(f"❌ Venues API - Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Venues API - Error: {e}")

def test_event_detail_apis():
    """Test event detail and related APIs."""
    print("\n🔍 Testing Event Detail APIs...")
    
    # Get first event
    try:
        response = requests.get(f"{BACKEND_URL}/events/events/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('results'):
                event = data['results'][0]
                event_id = event['id']
                event_slug = event.get('slug', '')
                
                print(f"✅ Found event: {event.get('title', 'N/A')} (ID: {event_id})")
                
                # Test event detail by slug
                if event_slug:
                    try:
                        response = requests.get(f"{BACKEND_URL}/events/events/{event_slug}/", timeout=10)
                        if response.status_code == 200:
                            print("✅ Event detail by slug API - OK")
                        else:
                            print(f"❌ Event detail by slug API - Failed: {response.status_code}")
                    except Exception as e:
                        print(f"❌ Event detail by slug API - Error: {e}")
                
                # Test event detail by ID
                try:
                    response = requests.get(f"{BACKEND_URL}/events/events/{event_id}/", timeout=10)
                    if response.status_code == 200:
                        print("✅ Event detail by ID API - OK")
                    else:
                        print(f"❌ Event detail by ID API - Failed: {response.status_code}")
                except Exception as e:
                    print(f"❌ Event detail by ID API - Error: {e}")
                
                # Test event performances
                try:
                    response = requests.get(f"{BACKEND_URL}/events/events/{event_id}/performances/", timeout=10)
                    if response.status_code == 200:
                        data = response.json()
                        print(f"✅ Event performances API - OK ({len(data)} performances)")
                    else:
                        print(f"❌ Event performances API - Failed: {response.status_code}")
                except Exception as e:
                    print(f"❌ Event performances API - Error: {e}")
                
                # Test event pricing
                try:
                    response = requests.get(f"{BACKEND_URL}/events/events/{event_id}/pricing/", timeout=10)
                    if response.status_code == 200:
                        print("✅ Event pricing API - OK")
                    else:
                        print(f"❌ Event pricing API - Failed: {response.status_code}")
                except Exception as e:
                    print(f"❌ Event pricing API - Error: {e}")
                
            else:
                print("❌ No events found to test detail APIs")
        else:
            print(f"❌ Could not fetch events list: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing event detail APIs: {e}")

def test_frontend():
    """Test frontend accessibility."""
    print("\n🔍 Testing Frontend...")
    
    try:
        response = requests.get(FRONTEND_URL, timeout=10)
        if response.status_code == 200:
            print("✅ Frontend main page - OK")
        else:
            print(f"❌ Frontend main page - Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Frontend main page - Error: {e}")
    
    # Test events page
    try:
        response = requests.get(f"{FRONTEND_URL}/fa/events", timeout=10)
        if response.status_code == 200:
            print("✅ Frontend events page - OK")
        else:
            print(f"❌ Frontend events page - Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Frontend events page - Error: {e}")

def test_cart_api():
    """Test cart API."""
    print("\n🔍 Testing Cart API...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/cart/", timeout=10)
        if response.status_code == 200:
            print("✅ Cart API - OK")
        else:
            print(f"❌ Cart API - Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Cart API - Error: {e}")

def main():
    """Run all tests."""
    print("🚀 Frontend Integration Test")
    print("=" * 50)
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Backend: {BACKEND_URL}")
    print(f"Frontend: {FRONTEND_URL}")
    print("=" * 50)
    
    # Test backend APIs
    test_backend_apis()
    
    # Test event detail APIs
    test_event_detail_apis()
    
    # Test frontend
    test_frontend()
    
    # Test cart API
    test_cart_api()
    
    print("\n" + "=" * 50)
    print("✅ Frontend Integration Test Completed!")
    print("=" * 50)

if __name__ == "__main__":
    main() 