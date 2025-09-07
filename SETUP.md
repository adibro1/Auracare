# HealthMate AI Guardian - Setup Guide

## Quick Start (Windows)

### Prerequisites
- Python 3.8+ installed
- Node.js 16+ installed
- Git (optional)

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Copy environment file and configure email settings
copy env.example .env
# Edit .env file with your email credentials

# Run the backend server
python run.py
```

### 2. Frontend Setup
```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install Node.js dependencies
npm install

# Start the React development server
npm start
```

### 3. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Alternative: Use Batch Files (Windows)
1. Double-click `start_backend.bat` to start the backend
2. Double-click `start_frontend.bat` to start the frontend

## Email Configuration
To enable email notifications, update the `.env` file in the backend directory:

```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

For Gmail, you'll need to:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in the .env file

## Features Overview

### ✅ Completed Features
- User onboarding with caregiver contact
- Medication management with reminder times
- AI-powered mood analysis using HuggingFace
- Adaptive medication reminders based on mood
- Family notifications for negative moods
- Basic vitals tracking (BP, sugar, sleep)
- Modern React UI with Tailwind CSS
- FastAPI backend with SQLite database

### 🎯 Demo Flow
1. **Onboarding**: Create user account with caregiver email
2. **Add Medications**: Add medications with reminder times
3. **Log Mood**: Enter daily mood text for AI analysis
4. **Track Vitals**: Log blood pressure, sugar, sleep
5. **Dashboard**: View comprehensive health overview
6. **Notifications**: Caregivers get alerts for negative moods

## Tech Stack
- **Frontend**: React 18 + Tailwind CSS
- **Backend**: FastAPI + SQLAlchemy
- **Database**: SQLite
- **AI**: HuggingFace Transformers (sentiment analysis)
- **Notifications**: SMTP email

## API Endpoints
- `GET /` - Health check
- `POST /users` - Create user
- `GET /users/{user_id}` - Get user
- `POST /medications` - Add medication
- `GET /medications/{user_id}` - Get user medications
- `POST /mood-logs` - Log mood with AI analysis
- `POST /vitals` - Log vitals
- `GET /vitals/{user_id}` - Get user vitals
- `GET /dashboard/{user_id}` - Get dashboard data
- `POST /notifications/send` - Send notification

## Troubleshooting

### Backend Issues
- Ensure Python 3.8+ is installed
- Check if port 8000 is available
- Verify email credentials in .env file

### Frontend Issues
- Ensure Node.js 16+ is installed
- Check if port 3000 is available
- Clear browser cache if needed

### Database Issues
- SQLite database is created automatically
- Database file: `backend/healthmate.db`
- Delete the file to reset the database

## Hackathon Notes
- Ready for 48-hour demo
- Clean, minimal codebase
- Easy to extend with new features
- Mobile-responsive design
- AI integration working out of the box
