#!/usr/bin/env python
"""
Simple test script to create user and test login
"""
import os
import sys
import django

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend'))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'peykan.settings')
django.setup()

from django.contrib.auth.hashers import make_password, check_password
from users.models import User
from users.presentation.controllers import AuthenticationController
import requests

def create_test_user():
    """Create a test user with known password"""
    print("=== Creating Test User ===")
    
    # Delete existing user if exists
    try:
        existing_user = User.objects.get(username='apitest')
        existing_user.delete()
        print("✅ Deleted existing user")
    except User.DoesNotExist:
        pass
    
    # Create new user
    user = User.objects.create_user(
        username='apitest',
        email='apitest@test.com',
        password='123456',
        role='customer'
    )
    
    print(f"✅ Created user: {user.username}")
    print(f"   - Email: {user.email}")
    print(f"   - Role: {user.role}")
    
    # Test password
    password_check = check_password('123456', user.password)
    print(f"   - Password check: {password_check}")
    
    return user

def test_login_api():
    """Test login API endpoint"""
    print("\n=== Testing Login API ===")
    
    backend_url = "http://localhost:8000"
    
    login_data = {
        "username": "apitest",
        "password": "123456"
    }
    
    try:
        response = requests.post(f"{backend_url}/api/v1/auth/login/", json=login_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Login successful!")
            return True
        else:
            print("❌ Login failed")
            return False
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False

if __name__ == "__main__":
    user = create_test_user()
    test_login_api() 