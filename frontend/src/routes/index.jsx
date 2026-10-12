import { lazy, Suspense, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Container, SimpleGrid, Skeleton } from '@chakra-ui/react';
import { AuthContext } from '../context/AuthContext';

// Route-level code splitting keeps the initial bundle small.
const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../components/Auth/Login'));
const Register = lazy(() => import('../components/Auth/Register'));
const ForgotPassword = lazy(() => import('../components/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../components/Auth/ResetPassword'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const FitnessHub = lazy(() => import('../pages/FitnessHub'));
const Settings = lazy(() => import('../pages/Settings'));
const Library = lazy(() => import('../pages/Library'));
const Profile = lazy(() => import('../pages/Profile'));
const Privacy = lazy(() => import('../components/Footer/Privacy'));
const Terms = lazy(() => import('../components/Footer/Terms'));
const Contact = lazy(() => import('../components/Footer/Contact'));

// While a page's code loads: the shape of a page (band, then content), not a spinner.
const RouteFallback = () => (
  <Box aria-busy="true" aria-label="Loading">
    <Box bg="bg.surface" borderBottomWidth="1px" borderColor="border">
      <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={{ base: 7, md: 10 }}>
        <Skeleton h={{ base: '48px', md: '64px' }} w="240px" borderRadius="md" />
        <Skeleton h="20px" w={{ base: '80%', md: '420px' }} mt={4} borderRadius="md" />
      </Container>
    </Box>
    <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={{ base: 6, md: 8 }}>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        {[0, 1, 2].map((i) => <Skeleton key={i} h="160px" borderRadius="panel" />)}
      </SimpleGrid>
      <Skeleton h="240px" borderRadius="panel" mt={6} />
    </Container>
  </Box>
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
          path="/library"
          element={
            <ProtectedRoute>
              <Library />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes; 
