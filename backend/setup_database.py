#!/usr/bin/env python3
"""
HealthMate AI Guardian - Database Setup Script
This script automatically creates all tables and sample data in Supabase
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

def setup_database():
    """Set up the complete database schema and sample data"""
    
    print("🏥 HealthMate AI Guardian - Database Setup")
    print("=" * 50)
    
    # Initialize Supabase client
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Connected to Supabase successfully!")
    except Exception as e:
        print(f"❌ Failed to connect to Supabase: {e}")
        return False
    
    # SQL commands to create tables
    create_tables_sql = """
    -- Create users table
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        age INTEGER NOT NULL,
        caregiver_email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create medications table
    CREATE TABLE IF NOT EXISTS medications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        dosage VARCHAR(255) NOT NULL,
        reminder_times TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create mood_logs table
    CREATE TABLE IF NOT EXISTS mood_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        mood_text TEXT NOT NULL,
        sentiment_score FLOAT NOT NULL,
        sentiment_label VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create vitals table
    CREATE TABLE IF NOT EXISTS vitals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        blood_pressure_systolic INTEGER,
        blood_pressure_diastolic INTEGER,
        blood_sugar FLOAT,
        sleep_hours FLOAT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    """
    
    # SQL commands for indexes and RLS
    setup_security_sql = """
    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id);
    CREATE INDEX IF NOT EXISTS idx_mood_logs_user_id ON mood_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_mood_logs_created_at ON mood_logs(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_vitals_user_id ON vitals(user_id);
    CREATE INDEX IF NOT EXISTS idx_vitals_created_at ON vitals(created_at DESC);

    -- Enable Row Level Security (RLS)
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
    ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
    ALTER TABLE vitals ENABLE ROW LEVEL SECURITY;

    -- Create policies for public access (for hackathon demo)
    DROP POLICY IF EXISTS "Allow all operations on users" ON users;
    DROP POLICY IF EXISTS "Allow all operations on medications" ON medications;
    DROP POLICY IF EXISTS "Allow all operations on mood_logs" ON mood_logs;
    DROP POLICY IF EXISTS "Allow all operations on vitals" ON vitals;
    
    CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
    CREATE POLICY "Allow all operations on medications" ON medications FOR ALL USING (true);
    CREATE POLICY "Allow all operations on mood_logs" ON mood_logs FOR ALL USING (true);
    CREATE POLICY "Allow all operations on vitals" ON vitals FOR ALL USING (true);
    """
    
    try:
        # Execute table creation
        print("📊 Creating database tables...")
        result = supabase.rpc('exec_sql', {'sql': create_tables_sql}).execute()
        print("✅ Tables created successfully!")
        
        # Execute security setup
        print("🔐 Setting up security policies...")
        result = supabase.rpc('exec_sql', {'sql': setup_security_sql}).execute()
        print("✅ Security policies configured!")
        
    except Exception as e:
        print(f"⚠️  Note: Some operations may have failed: {e}")
        print("This is normal if tables already exist.")
    
    # Insert sample data
    print("📝 Inserting sample data...")
    
    try:
        # Insert sample users
        users_data = [
            {"name": "John Doe", "age": 65, "caregiver_email": "caregiver@example.com"},
            {"name": "Jane Smith", "age": 58, "caregiver_email": "family@example.com"}
        ]
        
        users_result = supabase.table("users").insert(users_data).execute()
        print(f"✅ Inserted {len(users_result.data)} users")
        
        # Insert sample medications
        medications_data = [
            {"user_id": 1, "name": "Metformin", "dosage": "500mg twice daily", "reminder_times": '["08:00", "20:00"]'},
            {"user_id": 1, "name": "Lisinopril", "dosage": "10mg once daily", "reminder_times": '["09:00"]'},
            {"user_id": 2, "name": "Atorvastatin", "dosage": "20mg once daily", "reminder_times": '["19:00"]'}
        ]
        
        meds_result = supabase.table("medications").insert(medications_data).execute()
        print(f"✅ Inserted {len(meds_result.data)} medications")
        
        # Insert sample mood logs
        mood_data = [
            {"user_id": 1, "mood_text": "Feeling great today! Had a good walk in the morning.", "sentiment_score": 0.95, "sentiment_label": "positive"},
            {"user_id": 2, "mood_text": "Feeling a bit tired but overall okay.", "sentiment_score": 0.65, "sentiment_label": "neutral"}
        ]
        
        mood_result = supabase.table("mood_logs").insert(mood_data).execute()
        print(f"✅ Inserted {len(mood_result.data)} mood logs")
        
        # Insert sample vitals
        vitals_data = [
            {"user_id": 1, "blood_pressure_systolic": 120, "blood_pressure_diastolic": 80, "blood_sugar": 95.5, "sleep_hours": 7.5},
            {"user_id": 2, "blood_pressure_systolic": 135, "blood_pressure_diastolic": 85, "blood_sugar": 110.2, "sleep_hours": 6.0}
        ]
        
        vitals_result = supabase.table("vitals").insert(vitals_data).execute()
        print(f"✅ Inserted {len(vitals_result.data)} vitals records")
        
    except Exception as e:
        print(f"⚠️  Sample data insertion failed: {e}")
        print("This might be because data already exists.")
    
    # Verify setup
    print("\n🔍 Verifying database setup...")
    
    try:
        # Test each table
        tables_to_test = ["users", "medications", "mood_logs", "vitals"]
        
        for table in tables_to_test:
            result = supabase.table(table).select("*").limit(1).execute()
            print(f"✅ {table}: {len(result.data)} records found")
            
    except Exception as e:
        print(f"❌ Verification failed: {e}")
        return False
    
    print("\n🎉 Database setup completed successfully!")
    print("=" * 50)
    print("Your HealthMate AI Guardian database is ready!")
    print("You can now start the backend server.")
    
    return True

if __name__ == "__main__":
    setup_database()
