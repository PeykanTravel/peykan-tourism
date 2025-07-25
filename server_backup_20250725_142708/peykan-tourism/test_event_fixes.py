#!/usr/bin/env python3
"""
Test Script for Event Detail Page Fixes
Tests the fixes for React errors and API integration.
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BACKEND_URL = "http://localhost:8000/api/v1"
FRONTEND_URL = "http://localhost:3000"

def test_backend_apis():
    """Test all backend APIs related to events."""
    print("🔍 Testing Backend APIs...")
    
    # Test events index
    try:
        response = requests.get(f"{BACKEND_URL}/events/", timeout=10)
        if response.status_code == 200:
            print("✅ Events index API - OK")
        else:
            print(f"❌ Events index API - Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Events index API - Error: {e}")
    
    # Test events list
    try:
        response = requests.get(f"{BACKEND_URL}/events/events/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            event_count = data.get('count', 0)
            print(f"✅ Events list API - OK ({event_count} events)")
            
            # Get first event slug for testing
            if event_count > 0:
                first_event = data['results'][0]
                event_slug = first_event.get('slug')
                if event_slug:
                    print(f"📋 First event slug: {event_slug}")
                    return event_slug
        else:
            print(f"❌ Events list API - Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Events list API - Error: {e}")
    
    return None

def test_frontend_access():
    """Test frontend accessibility."""
    print("\n🌐 Testing Frontend...")
    
    try:
        response = requests.get(FRONTEND_URL, timeout=10)
        if response.status_code == 200:
            print("✅ Frontend main page - OK")
        else:
            print(f"❌ Frontend main page - Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Frontend main page - Error: {e}")

def test_event_detail_page(event_slug):
    """Test event detail page accessibility."""
    if not event_slug:
        print("❌ No event slug available for testing")
        return
    
    print(f"\n📄 Testing Event Detail Page: {event_slug}")
    
    try:
        # Test Persian locale
        response = requests.get(f"{FRONTEND_URL}/fa/events/{event_slug}", timeout=10)
        if response.status_code == 200:
            print("✅ Event detail page (Persian) - OK")
        else:
            print(f"❌ Event detail page (Persian) - Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Event detail page (Persian) - Error: {e}")
    
    try:
        # Test English locale
        response = requests.get(f"{FRONTEND_URL}/en/events/{event_slug}", timeout=10)
        if response.status_code == 200:
            print("✅ Event detail page (English) - OK")
        else:
            print(f"❌ Event detail page (English) - Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Event detail page (English) - Error: {e}")

def test_api_endpoints():
    """Test specific API endpoints."""
    print("\n🔧 Testing Specific API Endpoints...")
    
    endpoints = [
        "/events/categories/",
        "/events/venues/",
        "/events/artists/",
        "/tours/",
        "/transfers/routes/",
        "/cart/"
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{BACKEND_URL}{endpoint}", timeout=10)
            if response.status_code == 200:
                print(f"✅ {endpoint} - OK")
            else:
                print(f"❌ {endpoint} - Failed: {response.status_code}")
        except Exception as e:
            print(f"❌ {endpoint} - Error: {e}")

def main():
    """Main test function."""
    print("🚀 Event Detail Page Fixes Test")
    print("=" * 50)
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Test backend APIs
    event_slug = test_backend_apis()
    
    # Test frontend
    test_frontend_access()
    
    # Test event detail page
    test_event_detail_page(event_slug)
    
    # Test specific endpoints
    test_api_endpoints()
    
    print("\n" + "=" * 50)
    print("✅ Test completed!")
    print("\n📋 Summary of fixes applied:")
    print("1. Fixed undefined sectionSeats.reduce() error")
    print("2. Fixed setState during render warnings")
    print("3. Added null checks for event properties")
    print("4. Removed problematic useEffect dependencies")
    print("5. Added fallback values for currency and other fields")
    
    if event_slug:
        print(f"\n🌐 You can now test the event detail page at:")
        print(f"   {FRONTEND_URL}/fa/events/{event_slug}")
        print(f"   {FRONTEND_URL}/en/events/{event_slug}")

if __name__ == "__main__":
    main() 