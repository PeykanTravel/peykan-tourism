#!/usr/bin/env python
"""
Check user authentication and credentials
"""
import os
import sys
import django

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend'))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'peykan.settings')
django.setup()

from django.contrib.auth.hashers import check_password
from users.models import User
from users.presentation.controllers import AuthenticationController

def check_user_credentials():
    """Check user credentials and authentication"""
    print("=== Checking User Authentication ===")
    
    # Check if user exists
    try:
        user = User.objects.get(username='shahab')
        print(f"✅ User found: {user.username}")
        print(f"   - Email: {user.email}")
        print(f"   - Role: {user.role}")
        print(f"   - Active: {user.is_active}")
        print(f"   - Staff: {user.is_staff}")
        print(f"   - Superuser: {user.is_superuser}")
    except User.DoesNotExist:
        print("❌ User 'shahab' not found")
        return False
    
    # Test password verification
    password = "123456"
    password_check = check_password(password, user.password)
    print(f"   - Password check: {password_check}")
    
    # Try with 123456 password
    password_check_2 = check_password("123456", user.password)
    print(f"   - Password check (123456): {password_check_2}")
    
    # Try with 123 password
    password_check_3 = check_password("123", user.password)
    print(f"   - Password check (123): {password_check_3}")
    
    # Test authentication controller
    print("\n=== Testing Authentication Controller ===")
    try:
        controller = AuthenticationController()
        result = controller.login_use_case.execute(
            username='shahab',
            password=password
        )
        print(f"✅ Login use case result: {result}")
    except Exception as e:
        print(f"❌ Login use case failed: {e}")
        import traceback
        traceback.print_exc()
    
    # List all users
    print("\n=== All Users ===")
    users = User.objects.all()
    for user in users:
        print(f"- {user.username} (Role: {user.role}, Email: {user.email})")

if __name__ == "__main__":
    check_user_credentials() 