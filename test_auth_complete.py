#!/usr/bin/env python
"""
Comprehensive test for all authentication endpoints
"""
import requests
import json
import time

# Test configuration
BACKEND_URL = "http://localhost:8000"
API_BASE = f"{BACKEND_URL}/api/v1/auth"

def test_user_registration():
    """Test user registration endpoint"""
    print("=== Testing User Registration ===")
    
    # Delete existing user first
    try:
        import os
        import sys
        import django
        
        sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend'))
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'peykan.settings')
        django.setup()
        
        from users.models import User
        try:
            existing_user = User.objects.get(username='testauth')
            existing_user.delete()
            print("✅ Deleted existing user")
        except User.DoesNotExist:
            pass
    except Exception as e:
        print(f"Warning: Could not delete existing user: {e}")
    
    register_data = {
        "username": "testauth",
        "email": "testauth@test.com",
        "password": "testpass123",
        "password_confirm": "testpass123",
        "first_name": "Test",
        "last_name": "Auth",
        "role": "customer"
    }
    
    try:
        response = requests.post(f"{API_BASE}/register/", json=register_data)
        print(f"✅ Registration: {response.status_code}")
        
        if response.status_code in [200, 201]:
            data = response.json()
            print(f"   User created: {data.get('user', {}).get('username')}")
            return True
        else:
            print(f"   Registration failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Registration failed: {e}")
        return False

def test_user_login():
    """Test user login endpoint"""
    print("\n=== Testing User Login ===")
    
    login_data = {
        "username": "testauth",
        "password": "testpass123"
    }
    
    try:
        response = requests.post(f"{API_BASE}/login/", json=login_data)
        print(f"✅ Login: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Login successful for: {data.get('user', {}).get('username')}")
            return data.get('tokens', {}).get('access'), data.get('user', {})
        else:
            print(f"   Login failed: {response.text}")
            return None, None
            
    except Exception as e:
        print(f"❌ Login failed: {e}")
        return None, None

def test_user_profile(token):
    """Test user profile endpoint"""
    print("\n=== Testing User Profile ===")
    
    if not token:
        print("❌ No token provided")
        return False
    
    headers = {'Authorization': f'Bearer {token}'}
    
    try:
        response = requests.get(f"{API_BASE}/profile/", headers=headers)
        print(f"✅ Profile access: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Profile for: {data.get('username')}")
            return True
        else:
            print(f"   Profile access failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Profile access failed: {e}")
        return False

def test_change_password(token):
    """Test change password endpoint"""
    print("\n=== Testing Change Password ===")
    
    if not token:
        print("❌ No token provided")
        return False
    
    headers = {'Authorization': f'Bearer {token}'}
    change_data = {
        "current_password": "testpass123",
        "new_password": "newpass123",
        "new_password_confirm": "newpass123"
    }
    
    try:
        response = requests.post(f"{API_BASE}/change-password/", json=change_data, headers=headers)
        print(f"✅ Change password: {response.status_code}")
        
        if response.status_code == 200:
            print("   Password changed successfully")
            return True
        else:
            print(f"   Change password failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Change password failed: {e}")
        return False

def test_forgot_password():
    """Test forgot password endpoint"""
    print("\n=== Testing Forgot Password ===")
    
    forgot_data = {
        "email": "testauth@test.com"
    }
    
    try:
        response = requests.post(f"{API_BASE}/forgot-password/", json=forgot_data)
        print(f"✅ Forgot password: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Forgot password email sent to: {data.get('email')}")
            return True
        else:
            print(f"   Forgot password failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Forgot password failed: {e}")
        return False

def test_otp_request():
    """Test OTP request endpoint"""
    print("\n=== Testing OTP Request ===")
    
    otp_data = {
        "email": "testauth@test.com",
        "otp_type": "email"
    }
    
    try:
        response = requests.post(f"{API_BASE}/otp/request/", json=otp_data)
        print(f"✅ OTP request: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   OTP requested for: {data.get('target')}")
            return True
        else:
            print(f"   OTP request failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ OTP request failed: {e}")
        return False

def test_token_refresh():
    """Test JWT token refresh"""
    print("\n=== Testing Token Refresh ===")
    
    # First get a refresh token
    login_data = {
        "username": "testauth",
        "password": "newpass123"  # Using new password
    }
    
    try:
        login_response = requests.post(f"{API_BASE}/login/", json=login_data)
        
        if login_response.status_code == 200:
            tokens = login_response.json().get('tokens', {})
            refresh_token = tokens.get('refresh')
            
            if refresh_token:
                refresh_data = {
                    "refresh": refresh_token
                }
                
                response = requests.post(f"{API_BASE}/token/refresh/", json=refresh_data)
                print(f"✅ Token refresh: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"   New access token received")
                    return True
                else:
                    print(f"   Token refresh failed: {response.text}")
                    return False
            else:
                print("❌ No refresh token received")
                return False
        else:
            print(f"❌ Login failed for token refresh test: {login_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Token refresh failed: {e}")
        return False

def test_logout(token):
    """Test logout endpoint"""
    print("\n=== Testing Logout ===")
    
    if not token:
        print("❌ No token provided")
        return False
    
    headers = {'Authorization': f'Bearer {token}'}
    
    try:
        response = requests.post(f"{API_BASE}/logout/", headers=headers)
        print(f"✅ Logout: {response.status_code}")
        
        if response.status_code == 200:
            print("   Logout successful")
            return True
        else:
            print(f"   Logout failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Logout failed: {e}")
        return False

def main():
    """Run all authentication tests"""
    print("🔐 Running Complete Authentication Tests")
    print("=" * 60)
    
    results = []
    
    # Test user registration
    results.append(test_user_registration())
    
    # Test user login
    token, user = test_user_login()
    results.append(token is not None)
    
    # Test user profile
    results.append(test_user_profile(token))
    
    # Test change password
    results.append(test_change_password(token))
    
    # Test forgot password
    results.append(test_forgot_password())
    
    # Test OTP request
    results.append(test_otp_request())
    
    # Test token refresh
    results.append(test_token_refresh())
    
    # Test logout
    results.append(test_logout(token))
    
    print("\n" + "=" * 60)
    print("📊 Authentication Test Results Summary")
    print("=" * 60)
    
    test_names = [
        "User Registration",
        "User Login",
        "User Profile",
        "Change Password",
        "Forgot Password",
        "OTP Request",
        "Token Refresh",
        "User Logout"
    ]
    
    for i, (test_name, result) in enumerate(zip(test_names, results)):
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{i+1}. {test_name}: {status}")
    
    passed = sum(results)
    total = len(results)
    
    print(f"\n🎯 Total: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All authentication tests passed!")
    else:
        print("⚠️  Some authentication tests failed.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1) 