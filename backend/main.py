from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from typing import List, Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv
from transformers import pipeline
import json

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="HealthMate AI Guardian API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./healthmate.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    caregiver_email = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Medication(Base):
    __tablename__ = "medications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    name = Column(String, nullable=False)
    dosage = Column(String, nullable=False)
    reminder_times = Column(Text, nullable=False)  # JSON string of times
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class MoodLog(Base):
    __tablename__ = "mood_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    mood_text = Column(Text, nullable=False)
    sentiment_score = Column(Float, nullable=False)
    sentiment_label = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Vital(Base):
    __tablename__ = "vitals"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    blood_pressure_systolic = Column(Integer)
    blood_pressure_diastolic = Column(Integer)
    blood_sugar = Column(Float)
    sleep_hours = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

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
    created_at: datetime

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
    created_at: datetime

class MoodLogCreate(BaseModel):
    user_id: int
    mood_text: str

class MoodLogResponse(BaseModel):
    id: int
    user_id: int
    mood_text: str
    sentiment_score: float
    sentiment_label: str
    created_at: datetime

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
    created_at: datetime

class NotificationRequest(BaseModel):
    user_id: int
    message: str
    is_urgent: bool = False

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize sentiment analysis pipeline
sentiment_pipeline = pipeline("sentiment-analysis", model="cardiffnlp/twitter-roberta-base-sentiment-latest")

# Email configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")

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
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/medications", response_model=MedicationResponse)
async def create_medication(medication: MedicationCreate, db: Session = Depends(get_db)):
    db_medication = Medication(
        user_id=medication.user_id,
        name=medication.name,
        dosage=medication.dosage,
        reminder_times=json.dumps(medication.reminder_times)
    )
    db.add(db_medication)
    db.commit()
    db.refresh(db_medication)
    
    # Convert reminder_times back to list for response
    db_medication.reminder_times = json.loads(db_medication.reminder_times)
    return db_medication

@app.get("/medications/{user_id}", response_model=List[MedicationResponse])
async def get_user_medications(user_id: int, db: Session = Depends(get_db)):
    medications = db.query(Medication).filter(Medication.user_id == user_id).all()
    for med in medications:
        med.reminder_times = json.loads(med.reminder_times)
    return medications

@app.post("/mood-logs", response_model=MoodLogResponse)
async def create_mood_log(mood_log: MoodLogCreate, db: Session = Depends(get_db)):
    # Analyze sentiment
    result = sentiment_pipeline(mood_log.mood_text)
    sentiment_score = result[0]['score']
    sentiment_label = result[0]['label']
    
    # Map sentiment labels to more user-friendly terms
    label_mapping = {
        'LABEL_0': 'negative',
        'LABEL_1': 'neutral', 
        'LABEL_2': 'positive'
    }
    sentiment_label = label_mapping.get(sentiment_label, sentiment_label)
    
    db_mood_log = MoodLog(
        user_id=mood_log.user_id,
        mood_text=mood_log.mood_text,
        sentiment_score=sentiment_score,
        sentiment_label=sentiment_label
    )
    db.add(db_mood_log)
    db.commit()
    db.refresh(db_mood_log)
    
    # Check if we should send notification to caregiver
    if sentiment_label == 'negative' and sentiment_score > 0.7:
        user = db.query(User).filter(User.id == mood_log.user_id).first()
        if user:
            subject = "HealthMate Alert: Negative Mood Detected"
            body = f"Your loved one {user.name} has logged a negative mood. Please check in with them.\n\nMood entry: {mood_log.mood_text}"
            send_email(user.caregiver_email, subject, body)
    
    return db_mood_log

@app.post("/vitals", response_model=VitalResponse)
async def create_vital(vital: VitalCreate, db: Session = Depends(get_db)):
    db_vital = Vital(**vital.dict())
    db.add(db_vital)
    db.commit()
    db.refresh(db_vital)
    return db_vital

@app.get("/vitals/{user_id}", response_model=List[VitalResponse])
async def get_user_vitals(user_id: int, db: Session = Depends(get_db)):
    vitals = db.query(Vital).filter(Vital.user_id == user_id).order_by(Vital.created_at.desc()).all()
    return vitals

@app.post("/notifications/send")
async def send_notification(notification: NotificationRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == notification.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    subject = "HealthMate Alert" if not notification.is_urgent else "URGENT: HealthMate Alert"
    success = send_email(user.caregiver_email, subject, notification.message)
    
    return {"success": success, "message": "Notification sent" if success else "Failed to send notification"}

@app.get("/dashboard/{user_id}")
async def get_dashboard_data(user_id: int, db: Session = Depends(get_db)):
    """Get comprehensive dashboard data for a user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    medications = db.query(Medication).filter(Medication.user_id == user_id, Medication.is_active == True).all()
    recent_mood = db.query(MoodLog).filter(MoodLog.user_id == user_id).order_by(MoodLog.created_at.desc()).first()
    recent_vitals = db.query(Vital).filter(Vital.user_id == user_id).order_by(Vital.created_at.desc()).limit(5).all()
    
    # Convert medications reminder_times back to list
    for med in medications:
        med.reminder_times = json.loads(med.reminder_times)
    
    return {
        "user": user,
        "medications": medications,
        "recent_mood": recent_mood,
        "recent_vitals": recent_vitals
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
