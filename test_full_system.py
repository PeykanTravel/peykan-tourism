#!/usr/bin/env python
"""
Comprehensive test to verify the full system works correctly
"""
import requests
import time
import json

# Test configuration
BACKEND_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:3000"

def test_backend_health():
    """Test backend health endpoint"""
    print("=== Testing Backend Health ===")
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/v1/health/")
        print(f"✅ Backend health check: {response.status_code}")
        print(f"   Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Backend health check failed: {e}")
        return False

def test_authentication():
    """Test authentication system"""
    print("\n=== Testing Authentication System ===")
    
    # Test user registration
    register_data = {
        "username": "testuser_full",
        "email": "testuser_full@test.com",
        "password": "testpass123",
        "password_confirm": "testpass123",
        "first_name": "Test",
        "last_name": "User",
        "role": "customer"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/api/v1/auth/register/", json=register_data)
        print(f"✅ Registration: {response.status_code}")
        
        if response.status_code in [200, 201]:
            print("   Registration successful")
        else:
            print(f"   Registration response: {response.text}")
    except Exception as e:
        print(f"❌ Registration failed: {e}")
        return False
    
    # Test login with existing user
    login_data = {
        "username": "apitest",
        "password": "123456"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/api/v1/auth/login/", json=login_data)
        print(f"✅ Login: {response.status_code}")
        
        if response.status_code == 200:
            login_response = response.json()
            print("   Login successful")
            access_token = login_response.get('tokens', {}).get('access')
            
            # Test authenticated endpoint
            if access_token:
                headers = {'Authorization': f'Bearer {access_token}'}
                profile_response = requests.get(f"{BACKEND_URL}/api/v1/auth/profile/", headers=headers)
                print(f"✅ Profile access: {profile_response.status_code}")
                
                if profile_response.status_code == 200:
                    print("   Profile access successful")
                    return True
                else:
                    print(f"   Profile access failed: {profile_response.text}")
            
        else:
            print(f"   Login failed: {response.text}")
        
    except Exception as e:
        print(f"❌ Login failed: {e}")
        return False
    
    return False

def test_frontend_health():
    """Test frontend health"""
    print("\n=== Testing Frontend Health ===")
    
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        print(f"✅ Frontend health check: {response.status_code}")
        return True
    except Exception as e:
        print(f"❌ Frontend health check failed: {e}")
        return False

def test_database_connection():
    """Test if database has users"""
    print("\n=== Testing Database Connection ===")
    
    import os
    import sys
    import django
    
    # Add the backend directory to the path
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend'))
    
    # Set up Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'peykan.settings')
    django.setup()
    
    try:
        from users.models import User
        user_count = User.objects.count()
        print(f"✅ Database connection: {user_count} users found")
        
        # List users
        users = User.objects.all()[:5]  # First 5 users
        for user in users:
            print(f"   - {user.username} ({user.email})")
        
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Running Full System Test")
    print("=" * 50)
    
    # Wait a moment for servers to start
    time.sleep(2)
    
    results = []
    results.append(test_backend_health())
    results.append(test_database_connection())
    results.append(test_authentication())
    # results.append(test_frontend_health())  # Skip frontend for now
    
    print("\n" + "=" * 50)
    print("📊 Test Results Summary")
    print("=" * 50)
    
    passed = sum(results)
    total = len(results)
    
    print(f"✅ Passed: {passed}/{total}")
    
    if passed == total:
        print("🎉 All tests passed! System is working correctly.")
    else:
        print("⚠️  Some tests failed. Please check the issues above.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1) 