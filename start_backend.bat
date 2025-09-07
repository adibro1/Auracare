@echo off
echo Starting HealthMate AI Guardian Backend...
cd backend
python -m pip install -r requirements.txt
python run.py
pause
