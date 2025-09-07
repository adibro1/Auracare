#!/usr/bin/env python3
"""
Test user creation endpoint
"""

import requests
import json

def test_user_creation():
    print("🧪 Testing User Creation Endpoint...")
    print("=" * 50)
    
    # Test data
    user_data = {
        "name": "Aditya Tomar",
        "age": 20,
        "caregiver_email": "adi1110888@gmail.com"
    }
    
    try:
        # Test the endpoint
        response = requests.post(
            "http://localhost:8000/users",
            json=user_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ SUCCESS! User created successfully!")
            print(f"Response: {response.json()}")
            return True
        else:
            print(f"❌ FAILED! Status: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Cannot connect to backend server")
        print("Make sure the backend is running on http://localhost:8000")
        return False
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

if __name__ == "__main__":
    test_user_creation()
