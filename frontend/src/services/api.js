import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User API
export const createUser = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};

export const getUser = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

// Medication API
export const createMedication = async (medicationData) => {
  const response = await api.post('/medications', medicationData);
  return response.data;
};

export const getUserMedications = async (userId) => {
  const response = await api.get(`/medications/${userId}`);
  return response.data;
};

// Mood Log API
export const createMoodLog = async (moodData) => {
  const response = await api.post('/mood-logs', moodData);
  return response.data;
};

// Vitals API
export const createVital = async (vitalData) => {
  const response = await api.post('/vitals', vitalData);
  return response.data;
};

export const getUserVitals = async (userId) => {
  const response = await api.get(`/vitals/${userId}`);
  return response.data;
};

// Dashboard API
export const getDashboardData = async (userId) => {
  const response = await api.get(`/dashboard/${userId}`);
  return response.data;
};

// Notifications API
export const sendNotification = async (notificationData) => {
  const response = await api.post('/notifications/send', notificationData);
  return response.data;
};

// Quick Mood Logging API
export const createQuickMoodLog = async (moodData) => {
  const response = await api.post('/mood-logs/quick', moodData);
  return response.data;
};

// Insights API
export const getUserInsights = async (userId) => {
  const response = await api.get(`/insights/${userId}`);
  return response.data;
};

// Adaptive Reminders API
export const getAdaptiveReminders = async (userId) => {
  const response = await api.get(`/reminders/${userId}`);
  return response.data;
};

export default api;
