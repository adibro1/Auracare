#!/usr/bin/env python3
"""
HealthMate AI Guardian - Setup Test Script
This script tests if all components are working properly
"""

import sys
import os
import subprocess
import requests
import time
import json

def test_backend_import():
    """Test if backend can be imported"""
    print("🔍 Testing backend import...")
    try:
        sys.path.append('backend')
        from main_supabase import app
        print("✅ Backend imports successfully")
        return True
    except Exception as e:
        print(f"❌ Backend import failed: {e}")
        return False

def test_frontend_dependencies():
    """Test if frontend dependencies are installed"""
    print("🔍 Testing frontend dependencies...")
    try:
        # Check if package.json exists
        if not os.path.exists('frontend/package.json'):
            print("❌ Frontend package.json not found")
            return False
        
        # Check if node_modules exists
        if os.path.exists('frontend/node_modules'):
            print("✅ Frontend dependencies installed")
            return True
        else:
            print("⚠️  Frontend node_modules not found - run 'npm install' in frontend folder")
            return False
    except Exception as e:
        print(f"❌ Frontend test failed: {e}")
        return False

def test_backend_server():
    """Test if backend server can start"""
    print("🔍 Testing backend server startup...")
    try:
        # Start server in background
        process = subprocess.Popen([sys.executable, 'backend/run.py'], 
                                 stdout=subprocess.PIPE, 
                                 stderr=subprocess.PIPE)
        
        # Wait a bit for server to start
        time.sleep(3)
        
        # Test health endpoint
        try:
            response = requests.get('http://localhost:8000/', timeout=5)
            if response.status_code == 200:
                print("✅ Backend server is running")
                process.terminate()
                return True
            else:
                print(f"❌ Backend server returned status {response.status_code}")
                process.terminate()
                return False
        except requests.exceptions.RequestException:
            print("❌ Backend server not responding")
            process.terminate()
            return False
            
    except Exception as e:
        print(f"❌ Backend server test failed: {e}")
        return False

def test_supabase_connection():
    """Test Supabase connection"""
    print("🔍 Testing Supabase connection...")
    try:
        from backend.main_supabase import supabase
        if supabase is None:
            print("⚠️  Supabase not configured (using dummy credentials)")
            print("   Please set SUPABASE_URL and SUPABASE_KEY in backend/.env")
            return False
        else:
            print("✅ Supabase connection configured")
            return True
    except Exception as e:
        print(f"❌ Supabase test failed: {e}")
        return False

def test_ai_model():
    """Test AI sentiment analysis model"""
    print("🔍 Testing AI sentiment analysis...")
    try:
        from transformers import pipeline
        sentiment_pipeline = pipeline("sentiment-analysis", 
                                    model="cardiffnlp/twitter-roberta-base-sentiment-latest")
        
        # Test with sample text
        result = sentiment_pipeline("I feel great today!")
        print("✅ AI sentiment analysis working")
        print(f"   Sample result: {result}")
        return True
    except Exception as e:
        print(f"❌ AI model test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🏥 HealthMate AI Guardian - Setup Test")
    print("=" * 50)
    
    tests = [
        ("Backend Import", test_backend_import),
        ("Frontend Dependencies", test_frontend_dependencies),
        ("AI Model", test_ai_model),
        ("Supabase Connection", test_supabase_connection),
        ("Backend Server", test_backend_server),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        result = test_func()
        results.append((test_name, result))
    
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print("=" * 50)
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nPassed: {passed}/{len(results)} tests")
    
    if passed == len(results):
        print("\n🎉 All tests passed! Your setup is ready for the hackathon!")
    else:
        print("\n⚠️  Some tests failed. Please check the issues above.")
        print("\nNext steps:")
        print("1. Set up Supabase project and configure .env file")
        print("2. Run: cd backend && python run.py")
        print("3. Run: cd frontend && npm start")
        print("4. Open http://localhost:3000")

if __name__ == "__main__":
    main()
