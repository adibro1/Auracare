#!/usr/bin/env python3
"""
Test script to debug backend connection issues
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

print("🔍 Testing Backend Connection...")
print("=" * 50)

# Check environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

print(f"SUPABASE_URL: {SUPABASE_URL}")
print(f"SUPABASE_KEY: {SUPABASE_KEY[:20]}..." if SUPABASE_KEY else "SUPABASE_KEY: None")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Environment variables not set!")
    sys.exit(1)

# Test Supabase connection
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✅ Supabase client created successfully!")
    
    # Test database connection
    result = supabase.table("users").select("*").limit(1).execute()
    print(f"✅ Database connection successful! Found {len(result.data)} users")
    
    # Test user creation
    test_user = {
        "name": "Test User",
        "age": 25,
        "caregiver_email": "test@example.com",
        "created_at": "2024-01-01T00:00:00Z"
    }
    
    result = supabase.table("users").insert(test_user).execute()
    if result.data:
        print("✅ User creation test successful!")
        print(f"Created user: {result.data[0]}")
    else:
        print("❌ User creation test failed!")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
