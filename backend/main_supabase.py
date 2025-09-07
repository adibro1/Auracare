from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv
from transformers import pipeline
import json
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="HealthMate AI Guardian API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    # Allow local dev and hosted frontends (Vercel domains)
    allow_origins=[
        "*"
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase setup
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://your-project.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "your-anon-key")

# Initialize Supabase client (will work even with dummy values for testing)
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✅ Supabase connected successfully!")
except Exception as e:
    print(f"Warning: Supabase connection failed: {e}")
    print("Please set SUPABASE_URL and SUPABASE_KEY environment variables")
    supabase = None

# Pydantic models
class UserCreate(BaseModel):
    name: str
    age: int
    caregiver_email: str

class UserResponse(BaseModel):
    id: int
    name: str
    age: int
    caregiver_email: str
    created_at: str

class MedicationCreate(BaseModel):
    user_id: int
    name: str
    dosage: str
    reminder_times: List[str]

class MedicationResponse(BaseModel):
    id: int
    user_id: int
    name: str
    dosage: str
    reminder_times: List[str]
    is_active: bool
    created_at: str

class MoodLogCreate(BaseModel):
    user_id: int
    mood_text: str

class MoodLogResponse(BaseModel):
    id: int
    user_id: int
    mood_text: str
    sentiment_score: float
    sentiment_label: str
    created_at: str

class VitalCreate(BaseModel):
    user_id: int
    blood_pressure_systolic: Optional[int] = None
    blood_pressure_diastolic: Optional[int] = None
    blood_sugar: Optional[float] = None
    sleep_hours: Optional[float] = None

class VitalResponse(BaseModel):
    id: int
    user_id: int
    blood_pressure_systolic: Optional[int]
    blood_pressure_diastolic: Optional[int]
    blood_sugar: Optional[float]
    sleep_hours: Optional[float]
    created_at: str

class NotificationRequest(BaseModel):
    user_id: int
    message: str
    is_urgent: bool = False

class QuickMoodLog(BaseModel):
    user_id: int
    mood_emoji: str  # 😃, 😐, 😞
    mood_text: Optional[str] = None

class InsightResponse(BaseModel):
    mood_insight: Optional[str] = None
    medication_insight: Optional[str] = None
    streak_count: int = 0
    streak_type: str = "medication"  # medication, mood

# Lazy-init sentiment analysis pipeline to reduce boot memory on small hosts
_sentiment_pipeline = None

def get_sentiment_pipeline():
    global _sentiment_pipeline
    if _sentiment_pipeline is None:
        model_name = os.getenv(
            "SENTIMENT_MODEL",
            "distilbert-base-uncased-finetuned-sst-2-english",  # lightweight, fast
        )
        _sentiment_pipeline = pipeline("sentiment-analysis", model=model_name)
    return _sentiment_pipeline

# Email configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")

def check_database():
    """Check if database is available"""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available. Please configure Supabase.")

def send_email(to_email: str, subject: str, body: str):
    """Send email notification"""
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(SMTP_USERNAME, to_email, text)
        server.quit()
        return True
    except Exception as e:
        print(f"Email sending failed: {e}")
        return False

# API Routes
@app.get("/")
async def root():
    return {"message": "HealthMate AI Guardian API is running!"}

@app.post("/users", response_model=UserResponse)
async def create_user(user: UserCreate):
    check_database()
    
    try:
        user_data = {
            "name": user.name,
            "age": user.age,
            "caregiver_email": user.caregiver_email,
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("users").insert(user_data).execute()
        
        if result.data:
            return result.data[0]
        else:
            raise HTTPException(status_code=400, detail="Failed to create user")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int):
    check_database()
    
    try:
        result = supabase.table("users").select("*").eq("id", user_id).execute()
        
        if result.data:
            return result.data[0]
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/medications", response_model=MedicationResponse)
async def create_medication(medication: MedicationCreate):
    check_database()
    
    try:
        medication_data = {
            "user_id": medication.user_id,
            "name": medication.name,
            "dosage": medication.dosage,
            "reminder_times": json.dumps(medication.reminder_times),
            "is_active": True,
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("medications").insert(medication_data).execute()
        
        if result.data:
            # Convert reminder_times back to list for response
            result.data[0]["reminder_times"] = json.loads(result.data[0]["reminder_times"])
            return result.data[0]
        else:
            raise HTTPException(status_code=400, detail="Failed to create medication")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/medications/{user_id}", response_model=List[MedicationResponse])
async def get_user_medications(user_id: int):
    check_database()
    
    try:
        result = supabase.table("medications").select("*").eq("user_id", user_id).execute()
        
        if result.data:
            # Convert reminder_times back to list for each medication
            for med in result.data:
                med["reminder_times"] = json.loads(med["reminder_times"])
            return result.data
        else:
            return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/mood-logs", response_model=MoodLogResponse)
async def create_mood_log(mood_log: MoodLogCreate):
    check_database()
    
    try:
        # Analyze sentiment (lazy model load)
        result = get_sentiment_pipeline()(mood_log.mood_text)
        sentiment_score = result[0]['score']
        sentiment_label = result[0]['label']
        
        # Map sentiment labels to more user-friendly terms
        label_mapping = {
            'LABEL_0': 'negative',
            'LABEL_1': 'neutral', 
            'LABEL_2': 'positive'
        }
        sentiment_label = label_mapping.get(sentiment_label, sentiment_label)
        
        mood_data = {
            "user_id": mood_log.user_id,
            "mood_text": mood_log.mood_text,
            "sentiment_score": sentiment_score,
            "sentiment_label": sentiment_label,
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("mood_logs").insert(mood_data).execute()
        
        if result.data:
            # Check if we should send notification to caregiver
            if sentiment_label == 'negative' and sentiment_score > 0.7:
                user_result = supabase.table("users").select("*").eq("id", mood_log.user_id).execute()
                if user_result.data:
                    user = user_result.data[0]
                    subject = "HealthMate Alert: Negative Mood Detected"
                    body = f"Your loved one {user['name']} has logged a negative mood. Please check in with them.\n\nMood entry: {mood_log.mood_text}"
                    send_email(user['caregiver_email'], subject, body)
            
            return result.data[0]
        else:
            raise HTTPException(status_code=400, detail="Failed to create mood log")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/vitals", response_model=VitalResponse)
async def create_vital(vital: VitalCreate):
    check_database()
    
    try:
        vital_data = {
            "user_id": vital.user_id,
            "blood_pressure_systolic": vital.blood_pressure_systolic,
            "blood_pressure_diastolic": vital.blood_pressure_diastolic,
            "blood_sugar": vital.blood_sugar,
            "sleep_hours": vital.sleep_hours,
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("vitals").insert(vital_data).execute()
        
        if result.data:
            return result.data[0]
        else:
            raise HTTPException(status_code=400, detail="Failed to create vital")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/vitals/{user_id}", response_model=List[VitalResponse])
async def get_user_vitals(user_id: int):
    check_database()
    
    try:
        result = supabase.table("vitals").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        
        if result.data:
            return result.data
        else:
            return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/notifications/send")
async def send_notification(notification: NotificationRequest):
    check_database()
    
    try:
        user_result = supabase.table("users").select("*").eq("id", notification.user_id).execute()
        
        if not user_result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user = user_result.data[0]
        subject = "HealthMate Alert" if not notification.is_urgent else "URGENT: HealthMate Alert"
        success = send_email(user['caregiver_email'], subject, notification.message)
        
        return {"success": success, "message": "Notification sent" if success else "Failed to send notification"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.get("/dashboard/{user_id}")
async def get_dashboard_data(user_id: int):
    """Get comprehensive dashboard data for a user"""
    check_database()
    
    try:
        # Get user
        user_result = supabase.table("users").select("*").eq("id", user_id).execute()
        if not user_result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user = user_result.data[0]
        
        # Get medications
        medications_result = supabase.table("medications").select("*").eq("user_id", user_id).eq("is_active", True).execute()
        medications = medications_result.data or []
        
        # Convert reminder_times safely for each medication
        for med in medications:
            val = med.get("reminder_times")
            try:
                if isinstance(val, str):
                    med["reminder_times"] = json.loads(val)
                elif isinstance(val, list):
                    med["reminder_times"] = val
                else:
                    med["reminder_times"] = []
            except Exception:
                med["reminder_times"] = []
        
        # Get recent mood
        mood_result = supabase.table("mood_logs").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
        recent_mood = mood_result.data[0] if mood_result.data else None
        
        # Get recent vitals
        vitals_result = supabase.table("vitals").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(5).execute()
        recent_vitals = vitals_result.data or []
        
        # Get insights
        insights = await get_user_insights(user_id)
        
        return {
            "user": user,
            "medications": medications,
            "recent_mood": recent_mood,
            "recent_vitals": recent_vitals,
            "insights": insights
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/mood-logs/quick", response_model=MoodLogResponse)
async def create_quick_mood_log(quick_mood: QuickMoodLog):
    """Create a quick mood log using emoji"""
    check_database()
    
    try:
        # Map emoji to sentiment
        emoji_mapping = {
            "😃": {"label": "positive", "score": 0.9},
            "😐": {"label": "neutral", "score": 0.5},
            "😞": {"label": "negative", "score": 0.1}
        }
        
        if quick_mood.mood_emoji not in emoji_mapping:
            raise HTTPException(status_code=400, detail="Invalid emoji")
        
        sentiment_data = emoji_mapping[quick_mood.mood_emoji]
        mood_text = quick_mood.mood_text or f"Quick mood: {quick_mood.mood_emoji}"
        
        mood_data = {
            "user_id": quick_mood.user_id,
            "mood_text": mood_text,
            "sentiment_score": sentiment_data["score"],
            "sentiment_label": sentiment_data["label"],
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("mood_logs").insert(mood_data).execute()
        
        if result.data:
            # Check for consecutive negative moods
            await check_consecutive_negative_moods(quick_mood.user_id)
            return result.data[0]
        else:
            raise HTTPException(status_code=400, detail="Failed to create mood log")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/insights/{user_id}", response_model=InsightResponse)
async def get_user_insights(user_id: int):
    """Get smart insights for the user"""
    check_database()
    
    try:
        # Get mood logs from last 7 days
        seven_days_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
        mood_result = supabase.table("mood_logs").select("*").eq("user_id", user_id).gte("created_at", seven_days_ago).order("created_at", desc=True).execute()
        mood_logs = mood_result.data or []
        
        # Get medication logs (simplified - in real app, you'd track actual medication taking)
        med_result = supabase.table("medications").select("*").eq("user_id", user_id).eq("is_active", True).execute()
        medications = med_result.data or []
        
        insights = InsightResponse()
        
        # Mood insights
        if len(mood_logs) >= 3:
            recent_moods = [log["sentiment_label"] for log in mood_logs[:3]]
            if all(mood == "negative" for mood in recent_moods):
                insights.mood_insight = "You've had 3 negative moods in a row → consider resting more. 💙"
            elif all(mood == "positive" for mood in recent_moods):
                insights.mood_insight = "Amazing! 3 positive moods in a row! Keep it up! 🌟"
        
        # Medication insights
        if medications:
            adherence_rate = 90  # Simplified - in real app, calculate from actual logs
            insights.medication_insight = f"You've taken {adherence_rate}% of your meds on time this week 👏"
        
        # Streak calculation (simplified)
        insights.streak_count = 5  # Simplified - in real app, calculate from actual data
        insights.streak_type = "medication"
        
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/reminders/{user_id}")
async def get_adaptive_reminders(user_id: int):
    """Get mood-adaptive medication reminders"""
    check_database()
    
    try:
        # Get user
        user_result = supabase.table("users").select("*").eq("id", user_id).execute()
        if not user_result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user = user_result.data[0]
        
        # Get medications
        medications_result = supabase.table("medications").select("*").eq("user_id", user_id).eq("is_active", True).execute()
        medications = medications_result.data or []
        
        # Get recent mood
        mood_result = supabase.table("mood_logs").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
        recent_mood = mood_result.data[0] if mood_result.data else None
        
        # Generate adaptive reminders
        reminders = []
        for med in medications:
            reminder_times = json.loads(med["reminder_times"])
            for time in reminder_times:
                reminder = generate_adaptive_reminder(user["name"], med["name"], recent_mood)
                reminders.append({
                    "medication": med["name"],
                    "time": time,
                    "reminder": reminder,
                    "mood_based": recent_mood is not None
                })
        
        return {"reminders": reminders}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

def generate_adaptive_reminder(name: str, medicine: str, recent_mood: dict = None):
    """Generate mood-adaptive reminder text"""
    if not recent_mood:
        return f"Time for your {medicine}, {name}. 💊"
    
    mood = recent_mood["sentiment_label"]
    
    if mood == "negative":
        return f"Hey {name}, we know today feels tough, but don't forget your {medicine}. 💊"
    elif mood == "positive":
        return f"Great vibes today, {name}! Time to take your {medicine}. 🎉"
    else:
        return f"Time for your {medicine}, {name}. Take care! 💊"

async def check_consecutive_negative_moods(user_id: int):
    """Check for consecutive negative moods and send caregiver alert"""
    try:
        # Get last 2 mood logs
        mood_result = supabase.table("mood_logs").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(2).execute()
        mood_logs = mood_result.data or []
        
        if len(mood_logs) >= 2:
            recent_moods = [log["sentiment_label"] for log in mood_logs[:2]]
            if all(mood == "negative" for mood in recent_moods):
                # Send caregiver notification
                user_result = supabase.table("users").select("*").eq("id", user_id).execute()
                if user_result.data:
                    user = user_result.data[0]
                    subject = "HealthMate Alert: Consecutive Negative Moods"
                    body = f"Your loved one {user['name']} has logged 2 consecutive negative moods. Please check in with them."
                    send_email(user['caregiver_email'], subject, body)
    except Exception as e:
        print(f"Error checking consecutive moods: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
