import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import RegistrationForm from './components/RegistrationForm';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import LoadingScreen from './components/LoadingScreen';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import axios from 'axios'; // Import axios
import './App.css';

// Set default base URL for Axios based on environment
// Prefer an explicit REACT_APP_API_BASE_URL when provided (e.g. during deploy).
// If it's not provided, use localhost in development, otherwise use a relative path
// so the frontend will talk to the same origin (recommended for many hosting setups).
axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL ?? (
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

// Main App Component
function AppContent() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#e2e8f0',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            },
            success: {
              iconTheme: {
                primary: '#06b6d4',
                secondary: '#e2e8f0',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#f87171',
                secondary: '#e2e8f0',
              },
            },
          }}
        />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<RegistrationForm />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Protected Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

// App with Auth Provider
function App() {
  // Note: do not print reCAPTCHA site key to console in production for noise/privacy

  return (
    <AuthProvider>
      <GoogleReCaptchaProvider 
        reCaptchaKey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
        scriptProps={{
          async: false,
          defer: false,
          appendTo: "head",
          nonce: undefined
        }}
        container={{
          parameters: {
            badge: 'bottomright',
            theme: 'dark'
          }
        }}
      >
        <AppContent />
      </GoogleReCaptchaProvider>
    </AuthProvider>
  );
}

export default App;