#!/usr/bin/env python
"""
Comprehensive test for products flow (tours, events, transfers)
"""
import requests
import json

# Test configuration
BACKEND_URL = "http://localhost:8000"
API_BASE = f"{BACKEND_URL}/api/v1"

def get_auth_token():
    """Get authentication token"""
    login_data = {
        "username": "apitest",
        "password": "123456"
    }
    
    try:
        response = requests.post(f"{API_BASE}/auth/login/", json=login_data)
        if response.status_code == 200:
            return response.json().get('tokens', {}).get('access')
        else:
            print(f"Login failed: {response.text}")
            return None
    except Exception as e:
        print(f"Login error: {e}")
        return None

def test_tours_endpoints():
    """Test tours endpoints"""
    print("=== Testing Tours Endpoints ===")
    
    results = []
    
    # Test tours list
    try:
        response = requests.get(f"{API_BASE}/tours/")
        print(f"✅ Tours list: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            results.append(True)
            print(f"   Found {len(data.get('results', []))} tours")
        else:
            results.append(False)
            print(f"   Tours list failed: {response.text}")
    except Exception as e:
        results.append(False)
        print(f"❌ Tours list error: {e}")
    
    # Test tour categories
    try:
        response = requests.get(f"{API_BASE}/tours/categories/")
        print(f"✅ Tour categories: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            results.append(True)
            print(f"   Found {len(data.get('results', []))} categories")
        else:
            results.append(False)
            print(f"   Tour categories failed: {response.text}")
    except Exception as e:
        results.append(False)
        print(f"❌ Tour categories error: {e}")
    
    return results

def test_events_endpoints():
    """Test events endpoints"""
    print("\n=== Testing Events Endpoints ===")
    
    results = []
    
    # Test events list
    try:
        response = requests.get(f"{API_BASE}/events/")
        print(f"✅ Events list: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            results.append(True)
            print(f"   Found {len(data.get('results', []))} events")
        else:
            results.append(False)
            print(f"   Events list failed: {response.text}")
    except Exception as e:
        results.append(False)
        print(f"❌ Events list error: {e}")
    
    # Test event categories
    try:
        response = requests.get(f"{API_BASE}/events/categories/")
        print(f"✅ Event categories: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            results.append(True)
            print(f"   Found {len(data.get('results', []))} categories")
        else:
            results.append(False)
            print(f"   Event categories failed: {response.text}")
    except Exception as e:
        results.append(False)
        print(f"❌ Event categories error: {e}")
    
    return results

def test_transfers_endpoints():
    """Test transfers endpoints"""
    print("\n=== Testing Transfers Endpoints ===")
    
    results = []
    
    # Test transfers list
    try:
        response = requests.get(f"{API_BASE}/transfers/")
        print(f"✅ Transfers list: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            results.append(True)
            print(f"   Found {len(data.get('results', []))} transfers")
        else:
            results.append(False)
            print(f"   Transfers list failed: {response.text}")
    except Exception as e:
        results.append(False)
        print(f"❌ Transfers list error: {e}")
    
    # Test transfer routes
    try:
        response = requests.get(f"{API_BASE}/transfers/routes/")
        print(f"✅ Transfer routes: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            results.append(True)
            print(f"   Found {len(data.get('results', []))} routes")
        else:
            results.append(False)
            print(f"   Transfer routes failed: {response.text}")
    except Exception as e:
        results.append(False)
        print(f"❌ Transfer routes error: {e}")
    
    return results

def test_cart_endpoints():
    """Test cart endpoints"""
    print("\n=== Testing Cart Endpoints ===")
    
    token = get_auth_token()
    if not token:
        print("❌ No auth token for cart tests")
        return [False, False, False]
    
    headers = {'Authorization': f'Bearer {token}'}
    results = []
    
    # Test cart list
    try:
        response = requests.get(f"{API_BASE}/cart/", headers=headers)
        print(f"✅ Cart list: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            results.append(True)
            print(f"   Cart has {len(data.get('results', []))} items")
        else:
            results.append(False)
            print(f"   Cart list failed: {response.text}")
    except Exception as e:
        results.append(False)
        print(f"❌ Cart list error: {e}")
    
    # Test add to cart (if we have products)
    try:
        # First get a tour to add to cart
        tours_response = requests.get(f"{API_BASE}/tours/")
        if tours_response.status_code == 200:
            tours_data = tours_response.json()
            tours = tours_data.get('results', [])
            
            if tours:
                tour_id = tours[0]['id']
                cart_data = {
                    "product_type": "tour",
                    "product_id": tour_id,
                    "quantity": 1
                }
                
                response = requests.post(f"{API_BASE}/cart/", json=cart_data, headers=headers)
                print(f"✅ Add to cart: {response.status_code}")
                
                if response.status_code in [200, 201]:
                    results.append(True)
                    print("   Item added to cart successfully")
                else:
                    results.append(False)
                    print(f"   Add to cart failed: {response.text}")
            else:
                results.append(False)
                print("   No tours available to add to cart")
        else:
            results.append(False)
            print("   Could not get tours for cart test")
    except Exception as e:
        results.append(False)
        print(f"❌ Add to cart error: {e}")
    
    # Test cart summary
    try:
        response = requests.get(f"{API_BASE}/cart/summary/", headers=headers)
        print(f"✅ Cart summary: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            results.append(True)
            print(f"   Cart total: {data.get('total_amount', 0)}")
        else:
            results.append(False)
            print(f"   Cart summary failed: {response.text}")
    except Exception as e:
        results.append(False)
        print(f"❌ Cart summary error: {e}")
    
    return results

def test_orders_endpoints():
    """Test orders endpoints"""
    print("\n=== Testing Orders Endpoints ===")
    
    token = get_auth_token()
    if not token:
        print("❌ No auth token for orders tests")
        return [False]
    
    headers = {'Authorization': f'Bearer {token}'}
    results = []
    
    # Test orders list
    try:
        response = requests.get(f"{API_BASE}/orders/", headers=headers)
        print(f"✅ Orders list: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            results.append(True)
            print(f"   Found {len(data.get('results', []))} orders")
        else:
            results.append(False)
            print(f"   Orders list failed: {response.text}")
    except Exception as e:
        results.append(False)
        print(f"❌ Orders list error: {e}")
    
    return results

def main():
    """Run all products flow tests"""
    print("🛍️  Running Complete Products Flow Tests")
    print("=" * 60)
    
    all_results = []
    
    # Test products
    tours_results = test_tours_endpoints()
    events_results = test_events_endpoints()
    transfers_results = test_transfers_endpoints()
    cart_results = test_cart_endpoints()
    orders_results = test_orders_endpoints()
    
    all_results.extend(tours_results)
    all_results.extend(events_results)
    all_results.extend(transfers_results)
    all_results.extend(cart_results)
    all_results.extend(orders_results)
    
    print("\n" + "=" * 60)
    print("📊 Products Flow Test Results Summary")
    print("=" * 60)
    
    test_names = [
        "Tours List",
        "Tour Categories",
        "Events List", 
        "Event Categories",
        "Transfers List",
        "Transfer Routes",
        "Cart List",
        "Add to Cart",
        "Cart Summary",
        "Orders List"
    ]
    
    for i, (test_name, result) in enumerate(zip(test_names, all_results)):
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{i+1}. {test_name}: {status}")
    
    passed = sum(all_results)
    total = len(all_results)
    
    print(f"\n🎯 Total: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All products flow tests passed!")
    else:
        print("⚠️  Some products flow tests failed.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1) 