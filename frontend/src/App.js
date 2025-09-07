import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AddMedication from './components/AddMedication';
import MoodVitalsLog from './components/MoodVitalsLog';
import Onboarding from './components/Onboarding';
import Navbar from './components/Navbar';
import { UserProvider, useUser } from './context/UserContext';
import './App.css';

function AppContent() {
  const { user, setUser } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user exists in localStorage
    const savedUser = localStorage.getItem('healthmate_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, [setUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading HealthMate...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Onboarding />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/medications" element={<AddMedication />} />
            <Route path="/mood-vitals" element={<MoodVitalsLog />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;
