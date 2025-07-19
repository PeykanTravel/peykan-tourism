#!/usr/bin/env python
"""
Simple API Test for Peykan Tourism Platform
Tests basic API endpoints functionality
"""

import requests
import json
import time

class SimpleAPITest:
    """Simple API test suite."""
    
    def __init__(self):
        self.base_url = "http://localhost:8000/api/v1"
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
            'details': details
        })
    
    def test_health_endpoint(self):
        """Test health check endpoint."""
        print("\n🏥 Testing Health Endpoint")
        print("-" * 30)
        
        try:
            response = self.session.get(f"{self.base_url}/health/", timeout=5)
            if response.status_code == 200:
                self.log_test("Health Endpoint", True, "Server is healthy")
            else:
                self.log_test("Health Endpoint", False, f"Status: {response.status_code}")
        except requests.exceptions.ConnectionError:
            self.log_test("Health Endpoint", False, "Cannot connect to server")
        except Exception as e:
            self.log_test("Health Endpoint", False, f"Error: {e}")
    
    def test_auth_endpoints(self):
        """Test authentication endpoints."""
        print("\n🔐 Testing Authentication Endpoints")
        print("-" * 30)
        
        # Test registration endpoint
        try:
            response = self.session.get(f"{self.base_url}/auth/register/", timeout=5)
            if response.status_code in [200, 405]:  # 405 = Method Not Allowed (GET not allowed)
                self.log_test("Registration Endpoint", True, "Registration endpoint accessible")
            else:
                self.log_test("Registration Endpoint", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Registration Endpoint", False, f"Error: {e}")
        
        # Test login endpoint
        try:
            response = self.session.get(f"{self.base_url}/auth/login/", timeout=5)
            if response.status_code in [200, 405]:
                self.log_test("Login Endpoint", True, "Login endpoint accessible")
            else:
                self.log_test("Login Endpoint", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Login Endpoint", False, f"Error: {e}")
    
    def test_product_endpoints(self):
        """Test product endpoints."""
        print("\n🎯 Testing Product Endpoints")
        print("-" * 30)
        
        endpoints = [
            ("Tours", "/tours/"),
            ("Events", "/events/"),
            ("Transfers", "/transfers/")
        ]
        
        for name, endpoint in endpoints:
            try:
                response = self.session.get(f"{self.base_url}{endpoint}", timeout=5)
                if response.status_code == 200:
                    data = response.json()
                    count = data.get('count', 0)
                    self.log_test(f"{name} Endpoint", True, f"Found {count} {name.lower()}")
                else:
                    self.log_test(f"{name} Endpoint", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test(f"{name} Endpoint", False, f"Error: {e}")
    
    def test_cart_endpoint(self):
        """Test cart endpoint."""
        print("\n🛒 Testing Cart Endpoint")
        print("-" * 30)
        
        try:
            response = self.session.get(f"{self.base_url}/cart/", timeout=5)
            if response.status_code in [200, 401]:  # 401 = Unauthorized (expected)
                self.log_test("Cart Endpoint", True, "Cart endpoint accessible")
            else:
                self.log_test("Cart Endpoint", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Cart Endpoint", False, f"Error: {e}")
    
    def test_frontend_connectivity(self):
        """Test frontend connectivity."""
        print("\n🌐 Testing Frontend Connectivity")
        print("-" * 30)
        
        try:
            response = self.session.get("http://localhost:3000", timeout=5)
            if response.status_code == 200:
                self.log_test("Frontend Server", True, "Frontend server is running")
            else:
                self.log_test("Frontend Server", False, f"Status: {response.status_code}")
        except requests.exceptions.ConnectionError:
            self.log_test("Frontend Server", False, "Frontend server not accessible")
        except Exception as e:
            self.log_test("Frontend Server", False, f"Error: {e}")
    
    def run_all_tests(self):
        """Run all tests."""
        print("🚀 Starting Simple API Test")
        print("=" * 50)
        
        # Wait a bit for servers to start
        print("⏳ Waiting for servers to start...")
        time.sleep(3)
        
        # Run tests
        self.test_health_endpoint()
        self.test_auth_endpoints()
        self.test_product_endpoints()
        self.test_cart_endpoint()
        self.test_frontend_connectivity()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary."""
        print("\n" + "=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        for result in self.test_results:
            status = "✅" if result['success'] else "❌"
            print(f"{status} {result['test']}")
        
        print(f"\nResults: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! System is working correctly.")
        else:
            print("⚠️  Some tests failed. Please check the issues above.")
        
        return passed == total

def main():
    """Main function."""
    tester = SimpleAPITest()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    exit_code = main()
    exit(exit_code) 