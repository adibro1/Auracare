import React, { useState, useEffect, useCallback } from 'react';
import { 
  Pill, 
  Clock, 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { createMedication, getUserMedications } from '../services/api';

const AddMedication = () => {
  const { user } = useUser();
  const [medications, setMedications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    reminder_times: []
  });

  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    if (user) {
      fetchMedications();
    }
  }, [user, fetchMedications]);

  const fetchMedications = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getUserMedications(user.id);
      setMedications(data);
    } catch (err) {
      setError('Failed to load medications');
      console.error('Medications error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user.id]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addReminderTime = () => {
    if (newTime && !formData.reminder_times.includes(newTime)) {
      setFormData({
        ...formData,
        reminder_times: [...formData.reminder_times, newTime]
      });
      setNewTime('');
    }
  };

  const removeReminderTime = (timeToRemove) => {
    setFormData({
      ...formData,
      reminder_times: formData.reminder_times.filter(time => time !== timeToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.dosage || formData.reminder_times.length === 0) {
      setError('Please fill in all fields and add at least one reminder time');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      const medicationData = {
        user_id: user.id,
        name: formData.name,
        dosage: formData.dosage,
        reminder_times: formData.reminder_times
      };

      await createMedication(medicationData);
      
      setSuccess('Medication added successfully!');
      setFormData({
        name: '',
        dosage: '',
        reminder_times: []
      });
      
      // Refresh medications list
      await fetchMedications();
    } catch (err) {
      setError('Failed to add medication. Please try again.');
      console.error('Add medication error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medication Management</h1>
          <p className="text-gray-600">Add and manage your medications with smart reminders</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add Medication Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Pill className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Add New Medication</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medication Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="vital-input"
                placeholder="e.g., Metformin, Lisinopril"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dosage
              </label>
              <input
                type="text"
                name="dosage"
                value={formData.dosage}
                onChange={handleInputChange}
                required
                className="vital-input"
                placeholder="e.g., 500mg, 10mg twice daily"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reminder Times
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="vital-input flex-1"
                />
                <button
                  type="button"
                  onClick={addReminderTime}
                  className="btn-primary"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              {formData.reminder_times.length > 0 && (
                <div className="space-y-2">
                  {formData.reminder_times.map((time, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded-md p-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">{time}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeReminderTime(time)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
              disabled={isSaving}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>Add Medication</span>
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Current Medications */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Pill className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Current Medications</h2>
          </div>

          {medications.length > 0 ? (
            <div className="space-y-4">
              {medications.map((med) => (
                <div key={med.id} className="medication-card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{med.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{med.dosage}</p>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div className="flex flex-wrap gap-1">
                          {med.reminder_times?.map((time, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                            >
                              {time}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Pill className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No medications added yet</p>
              <p className="text-sm">Add your first medication using the form on the left</p>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Medication Tips</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Set reminders for consistent medication times</li>
          <li>• Include dosage instructions in the dosage field</li>
          <li>• Our AI will adapt reminder tone based on your mood</li>
          <li>• Caregivers will be notified if you miss medications</li>
        </ul>
      </div>
    </div>
  );
};

export default AddMedication;
