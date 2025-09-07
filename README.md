# HealthMate AI Guardian

An intelligent health management platform with mood-aware medication reminders.

## Tech Stack
- **Frontend**: React + Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: SQLite
- **AI**: HuggingFace sentiment analysis
- **Notifications**: Email (SMTP)

## Features
- User onboarding with caregiver contact
- Medication management with reminders
- Daily mood logging with AI sentiment analysis(Hugging face analyzer
- Adaptive medication reminders based on mood
- Family notifications for missed medications
- Basic vitals tracking (BP, sugar, sleep)

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## API Endpoints
- `GET /` - Health check
- `POST /users` - Create user
- `GET /users/{user_id}` - Get user
- `POST /medications` - Add medication
- `GET /medications/{user_id}` - Get user medications
- `POST /mood-logs` - Log mood
- `POST /vitals` - Log vitals
- `POST /notifications/send` - Send notification
