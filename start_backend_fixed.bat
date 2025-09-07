@echo off
echo Starting HealthMate AI Guardian Backend...
echo.

REM Set environment variables
set SUPABASE_URL=https://sciwetsmdswbmhjnqguw.supabase.co
set SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaXdldHNtZHN3Ym1oam5xZ3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNjc4MTUsImV4cCI6MjA3Mjc0MzgxNX0.SmvlYNa2M1VfNqlJ_o_OS2lenq2SvMLKerd7NFW5kWk

echo Environment variables set:
echo SUPABASE_URL=%SUPABASE_URL%
echo SUPABASE_KEY=%SUPABASE_KEY%
echo.

echo Starting backend server...
python backend/run.py

pause
