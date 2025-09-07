#!/usr/bin/env python3
"""
HealthMate AI Guardian - Backend Server
Run this file to start the FastAPI server with Supabase
"""

import uvicorn
from main_supabase import app

if __name__ == "__main__":
    print("🏥 Starting HealthMate AI Guardian Backend with Supabase...")
    print("📊 API Documentation: http://localhost:8000/docs")
    print("🔗 API Base URL: http://localhost:8000")
    print("💊 HealthMate AI Guardian is ready!")
    print("🗄️  Using Supabase as database")
    
    uvicorn.run(
        "main_supabase:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
