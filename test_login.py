import requests
import json

# Test backend API
backend_url = "http://localhost:8000"

# Test login endpoint
def test_login():
    print("Testing login endpoint...")
    
    # Use the test user credentials
    login_data = {
        "username": "apitest",
        "password": "123456"
    }
    
    response = requests.post(f"{backend_url}/api/v1/auth/login/", json=login_data)
    
    print(f"Login response status: {response.status_code}")
    print(f"Login response headers: {response.headers}")
    
    if response.status_code == 200:
        print("✅ Login successful!")
        data = response.json()
        print(f"Response data: {json.dumps(data, indent=2)}")
        
        # Test with the token
        token = data.get('access_token')
        if token:
            print(f"Access token: {token}")
            test_profile_with_token(token)
    else:
        print("❌ Login failed!")
        print(f"Error: {response.text}")

def test_profile_with_token(token):
    print("\nTesting profile endpoint with token...")
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    response = requests.get(f"{backend_url}/api/v1/auth/profile/", headers=headers)
    
    print(f"Profile response status: {response.status_code}")
    
    if response.status_code == 200:
        print("✅ Profile access successful!")
        data = response.json()
        print(f"Profile data: {json.dumps(data, indent=2)}")
    else:
        print("❌ Profile access failed!")
        print(f"Error: {response.text}")

if __name__ == "__main__":
    test_login() 