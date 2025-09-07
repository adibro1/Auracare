import React, { useState, useEffect, useCallback } from 'react';
import { 
  Heart, 
  Activity, 
  Save, 
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Calendar,
  Droplets,
  Moon,
  Gauge
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { createMoodLog, createVital, getUserVitals } from '../services/api';

const MoodVitalsLog = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('mood');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Mood form data
  const [moodData, setMoodData] = useState({
    mood_text: ''
  });

  // Vitals form data
  const [vitalsData, setVitalsData] = useState({
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    blood_sugar: '',
    sleep_hours: ''
  });

  // Recent vitals for display
  const [recentVitals, setRecentVitals] = useState([]);

  useEffect(() => {
    if (user) {
      fetchRecentVitals();
    }
  }, [user, fetchRecentVitals]);

  const fetchRecentVitals = useCallback(async () => {
    try {
      const data = await getUserVitals(user.id);
      setRecentVitals(data.slice(0, 5)); // Show last 5 entries
    } catch (err) {
      console.error('Failed to fetch vitals:', err);
    }
  }, [user.id]);

  const handleMoodChange = (e) => {
    setMoodData({
      ...moodData,
      [e.target.name]: e.target.value
    });
  };

  const handleVitalsChange = (e) => {
    setVitalsData({
      ...vitalsData,
      [e.target.name]: e.target.value
    });
  };

  const handleMoodSubmit = async (e) => {
    e.preventDefault();
    if (!moodData.mood_text.trim()) {
      setError('Please enter your mood');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      await createMoodLog({
        user_id: user.id,
        mood_text: moodData.mood_text
      });

      setSuccess('Mood logged successfully! Our AI has analyzed your sentiment.');
      setMoodData({ mood_text: '' });
    } catch (err) {
      setError('Failed to log mood. Please try again.');
      console.error('Mood log error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVitalsSubmit = async (e) => {
    e.preventDefault();
    const hasData = Object.values(vitalsData).some(value => value !== '');
    
    if (!hasData) {
      setError('Please enter at least one vital sign');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      const vitalData = {
        user_id: user.id,
        ...(vitalsData.blood_pressure_systolic && {
          blood_pressure_systolic: parseInt(vitalsData.blood_pressure_systolic)
        }),
        ...(vitalsData.blood_pressure_diastolic && {
          blood_pressure_diastolic: parseInt(vitalsData.blood_pressure_diastolic)
        }),
        ...(vitalsData.blood_sugar && {
          blood_sugar: parseFloat(vitalsData.blood_sugar)
        }),
        ...(vitalsData.sleep_hours && {
          sleep_hours: parseFloat(vitalsData.sleep_hours)
        })
      };

      await createVital(vitalData);
      
      setSuccess('Vitals logged successfully!');
      setVitalsData({
        blood_pressure_systolic: '',
        blood_pressure_diastolic: '',
        blood_sugar: '',
        sleep_hours: ''
      });
      
      // Refresh recent vitals
      await fetchRecentVitals();
    } catch (err) {
      setError('Failed to log vitals. Please try again.');
      console.error('Vitals log error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // const getMoodEmoji = (sentiment) => {
  //   switch (sentiment) {
  //     case 'positive': return '😊';
  //     case 'negative': return '😔';
  //     default: return '😐';
  //   }
  // };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mood & Vitals Logging</h1>
          <p className="text-gray-600">Track your daily mood and vital signs</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm p-1">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('mood')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'mood'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Heart className="w-5 h-5" />
            <span>Mood Logging</span>
          </button>
          <button
            onClick={() => setActiveTab('vitals')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'vitals'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span>Vitals Tracking</span>
          </button>
        </div>
      </div>

      {/* Mood Logging Tab */}
      {activeTab === 'mood' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Heart className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">How are you feeling?</h2>
            </div>

            <form onSubmit={handleMoodSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your mood today
                </label>
                <textarea
                  name="mood_text"
                  value={moodData.mood_text}
                  onChange={handleMoodChange}
                  rows={6}
                  className="vital-input"
                  placeholder="e.g., I'm feeling great today! Had a good workout and feeling energized. Or: Feeling a bit stressed about work, but trying to stay positive."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Our AI will analyze your mood and adapt medication reminders accordingly
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <p className="text-sm text-green-600">{success}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Log Mood</span>
                  </div>
                )}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood Analysis</h3>
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">How it works</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Our AI analyzes your text for sentiment</li>
                  <li>• Detects positive, negative, or neutral moods</li>
                  <li>• Adapts medication reminder tone accordingly</li>
                  <li>• Alerts caregivers if mood is consistently negative</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Example responses</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span>😊</span>
                    <span className="text-gray-700">"Feeling great today!"</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>😐</span>
                    <span className="text-gray-700">"Just a regular day"</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>😔</span>
                    <span className="text-gray-700">"Feeling stressed and tired"</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vitals Tracking Tab */}
      {activeTab === 'vitals' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Activity className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">Log Your Vitals</h2>
            </div>

            <form onSubmit={handleVitalsSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Gauge className="w-4 h-4 inline mr-1" />
                    Systolic BP
                  </label>
                  <input
                    type="number"
                    name="blood_pressure_systolic"
                    value={vitalsData.blood_pressure_systolic}
                    onChange={handleVitalsChange}
                    className="vital-input"
                    placeholder="120"
                    min="50"
                    max="250"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Gauge className="w-4 h-4 inline mr-1" />
                    Diastolic BP
                  </label>
                  <input
                    type="number"
                    name="blood_pressure_diastolic"
                    value={vitalsData.blood_pressure_diastolic}
                    onChange={handleVitalsChange}
                    className="vital-input"
                    placeholder="80"
                    min="30"
                    max="150"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Droplets className="w-4 h-4 inline mr-1" />
                  Blood Sugar (mg/dL)
                </label>
                <input
                  type="number"
                  name="blood_sugar"
                  value={vitalsData.blood_sugar}
                  onChange={handleVitalsChange}
                  className="vital-input"
                  placeholder="100"
                  min="50"
                  max="500"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Moon className="w-4 h-4 inline mr-1" />
                  Sleep Hours
                </label>
                <input
                  type="number"
                  name="sleep_hours"
                  value={vitalsData.sleep_hours}
                  onChange={handleVitalsChange}
                  className="vital-input"
                  placeholder="8"
                  min="0"
                  max="24"
                  step="0.5"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <p className="text-sm text-green-600">{success}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Log Vitals</span>
                  </div>
                )}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Vitals</h3>
            
            {recentVitals.length > 0 ? (
              <div className="space-y-4">
                {recentVitals.map((vital) => (
                  <div key={vital.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {new Date(vital.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {vital.blood_pressure_systolic && (
                        <div>
                          <span className="text-gray-600">BP:</span>
                          <span className="font-medium ml-1">
                            {vital.blood_pressure_systolic}/{vital.blood_pressure_diastolic}
                          </span>
                        </div>
                      )}
                      {vital.blood_sugar && (
                        <div>
                          <span className="text-gray-600">Sugar:</span>
                          <span className="font-medium ml-1">{vital.blood_sugar} mg/dL</span>
                        </div>
                      )}
                      {vital.sleep_hours && (
                        <div className="col-span-2">
                          <span className="text-gray-600">Sleep:</span>
                          <span className="font-medium ml-1">{vital.sleep_hours} hours</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No vitals logged yet</p>
                <p className="text-sm">Start tracking your health metrics</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-green-50 rounded-lg p-6 border border-green-200">
        <h3 className="text-lg font-semibold text-green-900 mb-3">💡 Health Tracking Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
          <div>
            <h4 className="font-medium mb-2">Mood Logging:</h4>
            <ul className="space-y-1">
              <li>• Be honest about your feelings</li>
              <li>• Include context about your day</li>
              <li>• Log at the same time daily</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Vitals Tracking:</h4>
            <ul className="space-y-1">
              <li>• Measure at consistent times</li>
              <li>• Record before meals for blood sugar</li>
              <li>• Track sleep quality, not just hours</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodVitalsLog;
