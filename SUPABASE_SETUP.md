# HealthMate AI Guardian - Supabase Setup Guide

## 🚀 Quick Setup with Supabase

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Choose a region close to you
4. Wait for the project to be ready (2-3 minutes)

### 2. Get Your Supabase Credentials

1. Go to **Settings** → **API**
2. Copy your **Project URL** and **anon public** key
3. Example:
   ```
   Project URL: https://your-project-id.supabase.co
   anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 3. Setup Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of `backend/supabase_schema.sql`
3. Click **Run** to create all tables and sample data

### 4. Configure Environment Variables

1. Copy `backend/env.example` to `backend/.env`
2. Update with your Supabase credentials:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-key-here

# Email Configuration (Optional)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### 5. Start the Application

#### Backend (Terminal 1):
```bash
cd backend
python run.py
```

#### Frontend (Terminal 2):
```bash
cd frontend
npm start
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🗄️ Database Schema

The application uses these tables:

- **users** - User profiles and caregiver info
- **medications** - Medication management
- **mood_logs** - AI-analyzed mood entries
- **vitals** - Health metrics tracking

## 🔧 Troubleshooting

### Backend Issues
- **"Database not available"**: Check your Supabase credentials in `.env`
- **"Invalid API key"**: Verify your SUPABASE_KEY is correct
- **Connection timeout**: Check your internet connection

### Frontend Issues
- **"Network Error"**: Make sure backend is running on port 8000
- **CORS errors**: Backend CORS is configured for localhost:3000

### Supabase Issues
- **Table not found**: Run the SQL schema script
- **Permission denied**: Check RLS policies in Supabase dashboard

## 📊 Testing the API

You can test the API using the interactive docs at http://localhost:8000/docs

### Sample API Calls:

1. **Create User**:
   ```json
   POST /users
   {
     "name": "John Doe",
     "age": 65,
     "caregiver_email": "caregiver@example.com"
   }
   ```

2. **Add Medication**:
   ```json
   POST /medications
   {
     "user_id": 1,
     "name": "Metformin",
     "dosage": "500mg twice daily",
     "reminder_times": ["08:00", "20:00"]
   }
   ```

3. **Log Mood**:
   ```json
   POST /mood-logs
   {
     "user_id": 1,
     "mood_text": "Feeling great today!"
   }
   ```

## 🎯 Features Working

✅ **User Management** - Create and manage user profiles  
✅ **Medication Tracking** - Add medications with reminder times  
✅ **AI Mood Analysis** - HuggingFace sentiment analysis  
✅ **Vitals Logging** - Track BP, sugar, sleep  
✅ **Dashboard** - Comprehensive health overview  
✅ **Email Notifications** - Caregiver alerts  
✅ **Responsive UI** - Works on all devices  

## 🚀 Ready for Demo!

Your HealthMate AI Guardian is now ready for your hackathon demo with Supabase as the database!
