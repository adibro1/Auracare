import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Pill, 
  Activity, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  Plus,
  Calendar,
  Zap,
  Brain,
  Target,
  Flame,
  Smile,
  Frown,
  Meh
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { getDashboardData, createQuickMoodLog, getAdaptiveReminders } from '../services/api';

const Dashboard = () => {
  const { user } = useUser();
  const [dashboardData, setDashboardData] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [moodLogging, setMoodLogging] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      fetchReminders();
    }
  }, [user]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getDashboardData(user.id);
      setDashboardData(data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user.id]);

  const fetchReminders = useCallback(async () => {
    try {
      const data = await getAdaptiveReminders(user.id);
      setReminders(data.reminders || []);
    } catch (err) {
      console.error('Reminders error:', err);
    }
  }, [user.id]);

  const handleQuickMoodLog = async (emoji) => {
    try {
      setMoodLogging(true);
      await createQuickMoodLog({
        user_id: user.id,
        mood_emoji: emoji
      });
      // Refresh dashboard data
      await fetchDashboardData();
      await fetchReminders();
    } catch (err) {
      console.error('Quick mood log error:', err);
    } finally {
      setMoodLogging(false);
    }
  };

  const getMoodIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😔';
      default: return '😐';
    }
  };

  const getMoodColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-pink-600 bg-pink-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="mt-4 btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500 via-green-500 to-pink-500 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
              <Heart className="w-8 h-8 text-white health-icon-bounce" />
            </div>
            <div>
              <h1 className="text-4xl font-bold font-display">Welcome back, {user?.name}!</h1>
              <p className="text-blue-100 text-lg font-health">Your wellness journey continues today</p>
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm">
              <span className="text-sm font-medium">🧘‍♀️ Wellness Focused</span>
            </div>
            <div className="bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm">
              <span className="text-sm font-medium">🤖 AI-Powered</span>
            </div>
            <div className="bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm">
              <span className="text-sm font-medium">👨‍⚕️ Caregiver Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Mood Logging */}
      <div className="wellness-card mood">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Smile className="w-6 h-6 text-soft-500" />
            <h2 className="text-xl font-semibold text-gray-900">Quick Mood Check</h2>
          </div>
          <span className="text-sm text-gray-500">Tap to log instantly</span>
        </div>
        
        <div className="flex justify-center space-x-6">
          <button
            onClick={() => handleQuickMoodLog('😃')}
            disabled={moodLogging}
            className="text-4xl hover:scale-125 transition-transform duration-200 disabled:opacity-50"
          >
            😃
          </button>
          <button
            onClick={() => handleQuickMoodLog('😐')}
            disabled={moodLogging}
            className="text-4xl hover:scale-125 transition-transform duration-200 disabled:opacity-50"
          >
            😐
          </button>
          <button
            onClick={() => handleQuickMoodLog('😞')}
            disabled={moodLogging}
            className="text-4xl hover:scale-125 transition-transform duration-200 disabled:opacity-50"
          >
            😞
          </button>
        </div>
        
        {moodLogging && (
          <div className="text-center mt-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-soft-500 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Logging your mood...</p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="wellness-card medications">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Medications</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.medications?.length || 0}
              </p>
            </div>
            <Pill className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="wellness-card mood">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Mood</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.recent_mood ? 
                  getMoodIcon(dashboardData.recent_mood.sentiment_label) : 
                  '—'
                }
              </p>
            </div>
            <Heart className="w-8 h-8 text-pink-500" />
          </div>
        </div>

        <div className="wellness-card vitals">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vitals Logged</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.recent_vitals?.length || 0}
              </p>
            </div>
            <Activity className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="wellness-card insights">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Streak</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.insights?.streak_count || 0} 🔥
              </p>
            </div>
            <Flame className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Insights Card */}
      {dashboardData?.insights && (
        <div className="wellness-card insights">
          <div className="flex items-center space-x-3 mb-4">
            <Brain className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900">Smart Insights</h2>
          </div>
          
          <div className="space-y-4">
            {dashboardData.insights.mood_insight && (
              <div className="bg-pink-50 rounded-2xl p-4 border-l-4 border-pink-500">
                <p className="text-gray-700 font-medium">{dashboardData.insights.mood_insight}</p>
              </div>
            )}
            {dashboardData.insights.medication_insight && (
              <div className="bg-green-50 rounded-2xl p-4 border-l-4 border-green-500">
                <p className="text-gray-700 font-medium">{dashboardData.insights.medication_insight}</p>
              </div>
            )}
            {!dashboardData.insights.mood_insight && !dashboardData.insights.medication_insight && (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Keep logging your mood and medications to get personalized insights!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Adaptive Reminders */}
      {reminders.length > 0 && (
        <div className="wellness-card medications">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-900">Mood-Adaptive Reminders</h2>
          </div>
          
          <div className="space-y-3">
            {reminders.slice(0, 3).map((reminder, index) => (
              <div key={index} className="bg-green-50 rounded-2xl p-4 border-l-4 border-green-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{reminder.medication}</span>
                  <span className="text-sm text-gray-500">{reminder.time}</span>
                </div>
                <p className="text-gray-700 text-sm">{reminder.reminder}</p>
                {reminder.mood_based && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      🤖 AI-Adapted
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Medications */}
        <div className="wellness-card medications">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Pill className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-semibold text-gray-900">Medications</h2>
            </div>
            <Link to="/medications" className="btn-primary text-sm">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Link>
          </div>
          
          {dashboardData?.medications?.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.medications.slice(0, 3).map((med) => (
                <div key={med.id} className="medication-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{med.name}</h3>
                      <p className="text-sm text-gray-600">{med.dosage}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Times</p>
                      <p className="text-sm font-medium">
                        {med.reminder_times?.join(', ') || 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {dashboardData.medications.length > 3 && (
                <p className="text-sm text-gray-500 text-center">
                  +{dashboardData.medications.length - 3} more medications
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Pill className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No medications added yet</p>
              <Link to="/medications" className="btn-primary mt-4 inline-block">
                Add Your First Medication
              </Link>
            </div>
          )}
        </div>

        {/* Recent Mood */}
        <div className="wellness-card mood">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Heart className="w-6 h-6 text-pink-500" />
              <h2 className="text-xl font-semibold text-gray-900">Recent Mood</h2>
            </div>
            <Link to="/mood-vitals" className="btn-primary text-sm">
              <Activity className="w-4 h-4 mr-1" />
              Log
            </Link>
          </div>
          
          {dashboardData?.recent_mood ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">
                  {getMoodIcon(dashboardData.recent_mood.sentiment_label)}
                </span>
                <div>
                  <p className="font-medium text-gray-900 capitalize">
                    {dashboardData.recent_mood.sentiment_label} Mood
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(dashboardData.recent_mood.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="bg-pink-50 rounded-2xl p-4">
                <p className="text-gray-700 italic">"{dashboardData.recent_mood.mood_text}"</p>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Confidence: {Math.round(dashboardData.recent_mood.sentiment_score * 100)}%
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No mood logged today</p>
              <Link to="/mood-vitals" className="btn-primary mt-4 inline-block">
                Log Your Mood
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Vitals */}
      {dashboardData?.recent_vitals?.length > 0 && (
        <div className="wellness-card vitals">
          <div className="flex items-center space-x-3 mb-4">
            <Activity className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-900">Recent Vitals</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dashboardData.recent_vitals.slice(0, 3).map((vital) => (
              <div key={vital.id} className="bg-yellow-50 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {new Date(vital.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="space-y-1">
                  {vital.blood_pressure_systolic && (
                    <p className="text-sm">
                      <span className="text-gray-600">BP:</span> 
                      <span className="font-medium ml-1">
                        {vital.blood_pressure_systolic}/{vital.blood_pressure_diastolic}
                      </span>
                    </p>
                  )}
                  {vital.blood_sugar && (
                    <p className="text-sm">
                      <span className="text-gray-600">Sugar:</span> 
                      <span className="font-medium ml-1">{vital.blood_sugar} mg/dL</span>
                    </p>
                  )}
                  {vital.sleep_hours && (
                    <p className="text-sm">
                      <span className="text-gray-600">Sleep:</span> 
                      <span className="font-medium ml-1">{vital.sleep_hours}h</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-yellow-50 to-pink-50 rounded-3xl p-6 border border-yellow-200">
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/medications" className="btn-primary text-center">
            <Pill className="w-4 h-4 mr-2" />
            Manage Medications
          </Link>
          <Link to="/mood-vitals" className="btn-secondary text-center">
            <Activity className="w-4 h-4 mr-2" />
            Log Mood & Vitals
          </Link>
          <button className="btn-outline text-center">
            <Clock className="w-4 h-4 mr-2" />
            View Reminders
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;