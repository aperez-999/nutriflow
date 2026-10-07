import { useContext, useEffect } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import { useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import AppRoutes from './routes'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'
import MobileTabBar, { TAB_BAR_HEIGHT } from './components/Global/MobileTabBar'
import { AuthContext } from './context/AuthContext'

const DEFAULT_META = {
  title: 'NutriFlow | AI Fitness, Nutrition & Readiness Tracking',
  description: 'Track workouts, meals, readiness, and progress with an AI coach in one polished dashboard.',
};

const ROUTE_META = [
  {
    match: (pathname) => pathname === '/',
    title: 'NutriFlow | AI Fitness, Nutrition & Readiness Tracking',
    description: 'NutriFlow brings workout tracking, meal logging, readiness insights, and AI coaching into one clean fitness workspace.',
  },
  {
    match: (pathname) => pathname === '/login',
    title: 'Login | NutriFlow',
    description: 'Log in to NutriFlow to continue tracking workouts, nutrition, and readiness in one workspace.',
  },
  {
    match: (pathname) => pathname === '/register',
    title: 'Sign Up | NutriFlow',
    description: 'Create a NutriFlow account to start tracking meals, workouts, readiness, and AI-guided progress.',
  },
  {
    match: (pathname) => pathname === '/dashboard',
    title: 'Dashboard | NutriFlow',
    description: 'Review your nutrition, workouts, readiness, and recent activity from the NutriFlow dashboard.',
  },
  {
    match: (pathname) => pathname === '/fitness-hub',
    title: 'Fitness Hub | NutriFlow',
    description: 'Use the NutriFlow Fitness Hub for AI coaching, plans, insights, and training discovery.',
  },
  {
    match: (pathname) => pathname === '/settings',
    title: 'Settings | NutriFlow',
    description: 'Manage your NutriFlow profile, preferences, and account settings.',
  },
];

function App() {
  const location = useLocation();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const meta = ROUTE_META.find((entry) => entry.match(location.pathname)) || DEFAULT_META;
    document.title = meta.title;

    const descriptionTag = document.querySelector('meta[name="description"]');
    if (descriptionTag) {
      descriptionTag.setAttribute('content', meta.description);
    }

    const ogTitleTag = document.querySelector('meta[property="og:title"]');
    if (ogTitleTag) {
      ogTitleTag.setAttribute('content', meta.title);
    }

    const ogDescriptionTag = document.querySelector('meta[property="og:description"]');
    if (ogDescriptionTag) {
      ogDescriptionTag.setAttribute('content', meta.description);
    }

    const twitterTitleTag = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitleTag) {
      twitterTitleTag.setAttribute('content', meta.title);
    }

    const twitterDescriptionTag = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescriptionTag) {
      twitterDescriptionTag.setAttribute('content', meta.description);
    }
  }, [location.pathname]);

  return (
    <Flex
      flexDirection="column"
      minH="100vh"
      // Leave room for the fixed tab bar on phones.
      pb={user ? { base: `calc(${TAB_BAR_HEIGHT} + env(safe-area-inset-bottom))`, md: 0 } : 0}
    >
      <Navbar />
      <Box flex="1">
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </Box>
      <Footer />
      <MobileTabBar />
    </Flex>
  )
}

export default App
