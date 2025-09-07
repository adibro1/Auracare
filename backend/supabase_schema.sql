-- HealthMate AI Guardian Database Schema for Supabase
-- Run this in your Supabase SQL editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

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
    reminder_times TEXT NOT NULL, -- JSON string of times
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
-- In production, you'd want more restrictive policies
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on medications" ON medications FOR ALL USING (true);
CREATE POLICY "Allow all operations on mood_logs" ON mood_logs FOR ALL USING (true);
CREATE POLICY "Allow all operations on vitals" ON vitals FOR ALL USING (true);

-- Insert sample data for testing
INSERT INTO users (name, age, caregiver_email) VALUES 
('John Doe', 65, 'caregiver@example.com'),
('Jane Smith', 58, 'family@example.com');

INSERT INTO medications (user_id, name, dosage, reminder_times) VALUES 
(1, 'Metformin', '500mg twice daily', '["08:00", "20:00"]'),
(1, 'Lisinopril', '10mg once daily', '["09:00"]'),
(2, 'Atorvastatin', '20mg once daily', '["19:00"]');

INSERT INTO mood_logs (user_id, mood_text, sentiment_score, sentiment_label) VALUES 
(1, 'Feeling great today! Had a good walk in the morning.', 0.95, 'positive'),
(2, 'Feeling a bit tired but overall okay.', 0.65, 'neutral');

INSERT INTO vitals (user_id, blood_pressure_systolic, blood_pressure_diastolic, blood_sugar, sleep_hours) VALUES 
(1, 120, 80, 95.5, 7.5),
(2, 135, 85, 110.2, 6.0);
