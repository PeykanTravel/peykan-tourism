#!/usr/bin/env python
"""
Comprehensive Architecture Test for Peykan Tourism Platform
Tests based on Clean Architecture principles and system design
"""

import os
import sys
import django
import requests
import json
from decimal import Decimal
from datetime import datetime, timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'peykan.settings')
django.setup()

from django.contrib.auth import authenticate
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from users.models import User
from tours.models import Tour, TourVariant, TourSchedule
from events.models import Event, EventPerformance, EventSection
from transfers.models import TransferRoute, TransferRoutePricing
from cart.models import Cart, CartItem
from orders.models import Order, OrderItem

class ArchitectureTestSuite:
    """Comprehensive test suite based on Clean Architecture principles."""
    
    def __init__(self):
        self.base_url = "http://localhost:8000/api/v1"
        self.frontend_url = "http://localhost:3000"
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name, success, details=""):
        """Log test results."""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details,
            'timestamp': datetime.now().isoformat()
        })
    
    def test_backend_architecture(self):
        """Test Backend Clean Architecture implementation."""
        print("\n🏗️ Testing Backend Architecture")
        print("=" * 50)
        
        # Test 1: Domain Layer - Business Entities
        print("\n1. Testing Domain Layer (Business Entities)")
        try:
            # Test User entity
            user = User.objects.first()
            if user and hasattr(user, 'role') and hasattr(user, 'is_agent'):
                self.log_test("User Entity", True, f"User {user.username} has proper domain methods")
            else:
                self.log_test("User Entity", False, "User entity missing domain methods")
            
            # Test Tour entity
            tour = Tour.objects.first()
            if tour and hasattr(tour, 'slug') and hasattr(tour, 'is_active'):
                self.log_test("Tour Entity", True, f"Tour {tour.title} has proper domain structure")
            else:
                self.log_test("Tour Entity", False, "Tour entity missing domain structure")
                
        except Exception as e:
            self.log_test("Domain Layer", False, f"Error: {e}")
        
        # Test 2: Infrastructure Layer - Repository Pattern
        print("\n2. Testing Infrastructure Layer (Repository Pattern)")
        try:
            # Check if repository interfaces exist
            from users.domain.repositories import UserRepository
            from users.infrastructure.repositories import DjangoUserRepository
            
            if UserRepository and DjangoUserRepository:
                self.log_test("Repository Pattern", True, "Repository interfaces and implementations exist")
            else:
                self.log_test("Repository Pattern", False, "Repository pattern not implemented")
                
        except ImportError:
            self.log_test("Repository Pattern", False, "Repository interfaces not found")
        
        # Test 3: Application Layer - Use Cases
        print("\n3. Testing Application Layer (Use Cases)")
        try:
            from users.application.use_cases import RegisterUserUseCase, LoginUserUseCase
            from users.domain.use_cases import RegisterUserUseCase as DomainUseCase
            
            if RegisterUserUseCase and LoginUserUseCase:
                self.log_test("Use Cases", True, "Application use cases implemented")
            else:
                self.log_test("Use Cases", False, "Use cases not implemented")
                
        except ImportError:
            self.log_test("Use Cases", False, "Use cases not found")
        
        # Test 4: Presentation Layer - API Controllers
        print("\n4. Testing Presentation Layer (API Controllers)")
        try:
            from users.presentation.controllers import RegisterView, LoginView
            
            if RegisterView and LoginView:
                self.log_test("API Controllers", True, "Presentation layer controllers exist")
            else:
                self.log_test("API Controllers", False, "API controllers not found")
                
        except ImportError:
            self.log_test("API Controllers", False, "Presentation layer not found")
    
    def test_frontend_architecture(self):
        """Test Frontend Clean Architecture implementation."""
        print("\n🎨 Testing Frontend Architecture")
        print("=" * 50)
        
        # Test 1: Domain Layer
        print("\n1. Testing Frontend Domain Layer")
        try:
            # Check domain entities
            domain_files = [
                'frontend/lib/domain/entities/User.ts',
                'frontend/lib/domain/entities/Product.ts',
                'frontend/lib/domain/entities/Cart.ts'
            ]
            
            existing_files = 0
            for file_path in domain_files:
                if os.path.exists(file_path):
                    existing_files += 1
            
            if existing_files >= 2:
                self.log_test("Frontend Domain Entities", True, f"{existing_files}/3 domain entities exist")
            else:
                self.log_test("Frontend Domain Entities", False, f"Only {existing_files}/3 domain entities found")
                
        except Exception as e:
            self.log_test("Frontend Domain Layer", False, f"Error: {e}")
        
        # Test 2: Infrastructure Layer
        print("\n2. Testing Frontend Infrastructure Layer")
        try:
            # Check API client
            if os.path.exists('frontend/lib/infrastructure/api/client.ts'):
                self.log_test("API Client", True, "Unified API client exists")
            else:
                self.log_test("API Client", False, "API client not found")
            
            # Check repositories
            repo_files = [
                'frontend/lib/infrastructure/repositories/CartRepositoryImpl.ts',
                'frontend/lib/infrastructure/repositories/ProductRepositoryImpl.ts'
            ]
            
            existing_repos = sum(1 for f in repo_files if os.path.exists(f))
            if existing_repos >= 1:
                self.log_test("Repository Implementations", True, f"{existing_repos}/2 repositories exist")
            else:
                self.log_test("Repository Implementations", False, "Repository implementations not found")
                
        except Exception as e:
            self.log_test("Frontend Infrastructure", False, f"Error: {e}")
        
        # Test 3: Application Layer
        print("\n3. Testing Frontend Application Layer")
        try:
            # Check services
            service_files = [
                'frontend/lib/application/services/AuthService.ts',
                'frontend/lib/application/services/CartService.ts',
                'frontend/lib/application/services/ProductService.ts'
            ]
            
            existing_services = sum(1 for f in service_files if os.path.exists(f))
            if existing_services >= 2:
                self.log_test("Application Services", True, f"{existing_services}/3 services exist")
            else:
                self.log_test("Application Services", False, f"Only {existing_services}/3 services found")
            
            # Check hooks
            if os.path.exists('frontend/lib/application/hooks/useAuthService.ts'):
                self.log_test("Custom Hooks", True, "Application hooks exist")
            else:
                self.log_test("Custom Hooks", False, "Application hooks not found")
                
        except Exception as e:
            self.log_test("Frontend Application", False, f"Error: {e}")
        
        # Test 4: Presentation Layer
        print("\n4. Testing Frontend Presentation Layer")
        try:
            # Check UI components
            ui_files = [
                'frontend/components/ui/Button/Button.tsx',
                'frontend/components/ui/Card/Card.tsx',
                'frontend/components/ui/Input/Input.tsx'
            ]
            
            existing_ui = sum(1 for f in ui_files if os.path.exists(f))
            if existing_ui >= 2:
                self.log_test("UI Components", True, f"{existing_ui}/3 UI components exist")
            else:
                self.log_test("UI Components", False, f"Only {existing_ui}/3 UI components found")
            
            # Check pages
            if os.path.exists('frontend/app/[locale]/tours/page.tsx'):
                self.log_test("Pages", True, "App router pages exist")
            else:
                self.log_test("Pages", False, "App router pages not found")
                
        except Exception as e:
            self.log_test("Frontend Presentation", False, f"Error: {e}")
    
    def test_api_endpoints(self):
        """Test API endpoints functionality."""
        print("\n🔌 Testing API Endpoints")
        print("=" * 50)
        
        # Test 1: Authentication endpoints
        print("\n1. Testing Authentication Endpoints")
        try:
            # Test registration endpoint
            reg_response = self.session.get(f"{self.base_url}/auth/register/")
            if reg_response.status_code in [200, 405]:  # 405 = Method Not Allowed (GET not allowed)
                self.log_test("Registration Endpoint", True, "Registration endpoint accessible")
            else:
                self.log_test("Registration Endpoint", False, f"Status: {reg_response.status_code}")
            
            # Test login endpoint
            login_response = self.session.get(f"{self.base_url}/auth/login/")
            if login_response.status_code in [200, 405]:
                self.log_test("Login Endpoint", True, "Login endpoint accessible")
            else:
                self.log_test("Login Endpoint", False, f"Status: {login_response.status_code}")
                
        except Exception as e:
            self.log_test("Auth Endpoints", False, f"Error: {e}")
        
        # Test 2: Product endpoints
        print("\n2. Testing Product Endpoints")
        try:
            # Test tours endpoint
            tours_response = self.session.get(f"{self.base_url}/tours/")
            if tours_response.status_code == 200:
                tours_data = tours_response.json()
                self.log_test("Tours Endpoint", True, f"Found {tours_data.get('count', 0)} tours")
            else:
                self.log_test("Tours Endpoint", False, f"Status: {tours_response.status_code}")
            
            # Test events endpoint
            events_response = self.session.get(f"{self.base_url}/events/")
            if events_response.status_code == 200:
                events_data = events_response.json()
                self.log_test("Events Endpoint", True, f"Found {events_data.get('count', 0)} events")
            else:
                self.log_test("Events Endpoint", False, f"Status: {events_response.status_code}")
            
            # Test transfers endpoint
            transfers_response = self.session.get(f"{self.base_url}/transfers/")
            if transfers_response.status_code == 200:
                transfers_data = transfers_response.json()
                self.log_test("Transfers Endpoint", True, f"Found {transfers_data.get('count', 0)} transfers")
            else:
                self.log_test("Transfers Endpoint", False, f"Status: {transfers_response.status_code}")
                
        except Exception as e:
            self.log_test("Product Endpoints", False, f"Error: {e}")
        
        # Test 3: Cart endpoints
        print("\n3. Testing Cart Endpoints")
        try:
            cart_response = self.session.get(f"{self.base_url}/cart/")
            if cart_response.status_code in [200, 401]:  # 401 = Unauthorized (expected for cart)
                self.log_test("Cart Endpoint", True, "Cart endpoint accessible")
            else:
                self.log_test("Cart Endpoint", False, f"Status: {cart_response.status_code}")
                
        except Exception as e:
            self.log_test("Cart Endpoints", False, f"Error: {e}")
    
    def test_database_integrity(self):
        """Test database models and relationships."""
        print("\n🗄️ Testing Database Integrity")
        print("=" * 50)
        
        # Test 1: Model relationships
        print("\n1. Testing Model Relationships")
        try:
            # Test User-Order relationship
            user = User.objects.first()
            if user:
                orders = user.orders.all()
                self.log_test("User-Order Relationship", True, f"User has {orders.count()} orders")
            else:
                self.log_test("User-Order Relationship", False, "No users found")
            
            # Test Tour-Variant relationship
            tour = Tour.objects.first()
            if tour:
                variants = tour.variants.all()
                self.log_test("Tour-Variant Relationship", True, f"Tour has {variants.count()} variants")
            else:
                self.log_test("Tour-Variant Relationship", False, "No tours found")
                
        except Exception as e:
            self.log_test("Model Relationships", False, f"Error: {e}")
        
        # Test 2: Data consistency
        print("\n2. Testing Data Consistency")
        try:
            # Check for orphaned records
            orphaned_cart_items = CartItem.objects.filter(cart__isnull=True)
            if orphaned_cart_items.count() == 0:
                self.log_test("Cart Item Consistency", True, "No orphaned cart items")
            else:
                self.log_test("Cart Item Consistency", False, f"Found {orphaned_cart_items.count()} orphaned items")
            
            # Check for invalid prices
            invalid_prices = Tour.objects.filter(price__lte=0)
            if invalid_prices.count() == 0:
                self.log_test("Price Consistency", True, "All tours have valid prices")
            else:
                self.log_test("Price Consistency", False, f"Found {invalid_prices.count()} tours with invalid prices")
                
        except Exception as e:
            self.log_test("Data Consistency", False, f"Error: {e}")
    
    def test_frontend_functionality(self):
        """Test frontend functionality and connectivity."""
        print("\n🌐 Testing Frontend Functionality")
        print("=" * 50)
        
        # Test 1: Frontend accessibility
        print("\n1. Testing Frontend Accessibility")
        try:
            # Test if frontend is running
            frontend_response = self.session.get(self.frontend_url, timeout=5)
            if frontend_response.status_code == 200:
                self.log_test("Frontend Server", True, "Frontend server is running")
            else:
                self.log_test("Frontend Server", False, f"Status: {frontend_response.status_code}")
                
        except requests.exceptions.ConnectionError:
            self.log_test("Frontend Server", False, "Frontend server not accessible")
        except Exception as e:
            self.log_test("Frontend Server", False, f"Error: {e}")
        
        # Test 2: API connectivity from frontend
        print("\n2. Testing API Connectivity")
        try:
            # Test if frontend can reach backend
            api_response = self.session.get(f"{self.frontend_url}/api/v1/health/", timeout=5)
            if api_response.status_code == 200:
                self.log_test("API Connectivity", True, "Frontend can reach backend API")
            else:
                self.log_test("API Connectivity", False, f"Status: {api_response.status_code}")
                
        except requests.exceptions.ConnectionError:
            self.log_test("API Connectivity", False, "Cannot reach backend API")
        except Exception as e:
            self.log_test("API Connectivity", False, f"Error: {e}")
    
    def test_security_measures(self):
        """Test security implementations."""
        print("\n🔒 Testing Security Measures")
        print("=" * 50)
        
        # Test 1: Authentication
        print("\n1. Testing Authentication")
        try:
            # Test protected endpoint without auth
            protected_response = self.session.get(f"{self.base_url}/cart/")
            if protected_response.status_code == 401:
                self.log_test("Authentication Required", True, "Protected endpoints require authentication")
            else:
                self.log_test("Authentication Required", False, f"Status: {protected_response.status_code}")
                
        except Exception as e:
            self.log_test("Authentication", False, f"Error: {e}")
        
        # Test 2: CORS configuration
        print("\n2. Testing CORS Configuration")
        try:
            # Test CORS headers
            cors_response = self.session.options(f"{self.base_url}/tours/")
            if 'Access-Control-Allow-Origin' in cors_response.headers:
                self.log_test("CORS Headers", True, "CORS headers present")
            else:
                self.log_test("CORS Headers", False, "CORS headers missing")
                
        except Exception as e:
            self.log_test("CORS Configuration", False, f"Error: {e}")
    
    def run_all_tests(self):
        """Run all architecture tests."""
        print("🚀 Starting Comprehensive Architecture Test")
        print("=" * 60)
        print("Testing based on Clean Architecture principles")
        print("=" * 60)
        
        # Run all test suites
        self.test_backend_architecture()
        self.test_frontend_architecture()
        self.test_api_endpoints()
        self.test_database_integrity()
        self.test_frontend_functionality()
        self.test_security_measures()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary."""
        print("\n" + "=" * 60)
        print("📊 ARCHITECTURE TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"\nResults: {passed}/{total} tests passed")
        
        # Group results by category
        categories = {}
        for result in self.test_results:
            category = result['test'].split()[0]
            if category not in categories:
                categories[category] = []
            categories[category].append(result)
        
        for category, results in categories.items():
            category_passed = sum(1 for r in results if r['success'])
            category_total = len(results)
            print(f"\n{category}: {category_passed}/{category_total}")
            
            for result in results:
                status = "✅" if result['success'] else "❌"
                print(f"  {status} {result['test']}")
        
        print("\n" + "=" * 60)
        if passed == total:
            print("🎉 All architecture tests passed!")
            print("✅ System follows Clean Architecture principles")
            print("✅ Backend and frontend are properly structured")
            print("✅ API endpoints are functional")
            print("✅ Security measures are in place")
        else:
            print("⚠️  Some architecture tests failed")
            print("🔧 Review the failed tests above")
            print("📚 Consider implementing missing Clean Architecture layers")
        
        return passed == total

def main():
    """Main function."""
    tester = ArchitectureTestSuite()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code) 