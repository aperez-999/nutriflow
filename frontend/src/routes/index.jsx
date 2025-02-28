import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../components/Auth/Login';
import Register from '../components/Auth/Register';
import Dashboard from '../pages/Dashboard';
import Home from '../pages/Home';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import ResetPassword from '../components/Auth/ResetPassword';
import ForgotPassword from '../components/Auth/ForgotPassword';
import Privacy from '../components/Footer/Privacy';
import Terms from '../components/Footer/Terms';
import Contact from '../components/Footer/Contact';
import FitnessHub from '../pages/FitnessHub';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function AppRoutes() {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/contact" element={<Contact />} />
      <Route
        path="/fitness-hub"
        element={
          <ProtectedRoute>
            <FitnessHub />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes; 