import { lazy, Suspense, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Center, Spinner } from '@chakra-ui/react';
import { AuthContext } from '../context/AuthContext';

// Route-level code splitting keeps the initial bundle small.
const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../components/Auth/Login'));
const Register = lazy(() => import('../components/Auth/Register'));
const ForgotPassword = lazy(() => import('../components/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../components/Auth/ResetPassword'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const FitnessHub = lazy(() => import('../pages/FitnessHub'));
const ProfileSettings = lazy(() => import('../pages/ProfileSettings'));
const Privacy = lazy(() => import('../components/Footer/Privacy'));
const Terms = lazy(() => import('../components/Footer/Terms'));
const Contact = lazy(() => import('../components/Footer/Contact'));

const RouteFallback = () => (
  <Center minH="40vh">
    <Spinner size="lg" color="brand.400" thickness="3px" />
  </Center>
);

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
    <Suspense fallback={<RouteFallback />}>
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
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <ProfileSettings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes; 
