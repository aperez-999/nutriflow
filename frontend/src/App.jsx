import { useContext, useEffect } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { DURATION, EASE_OUT } from './components/Motion/tokens'
import { useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import AppRoutes from './routes'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'
import MobileTabBar, { TAB_BAR_HEIGHT } from './components/Global/MobileTabBar'
import { AuthContext } from './context/AuthContext'

const DEFAULT_META = {
  title: 'NutriFlow: know what today needs',
  description: 'Meals, training and a 20-second check-in become one call for the day: push, hold steady or recover.',
};

const ROUTE_META = [
  {
    match: (pathname) => pathname === '/',
    title: 'NutriFlow: know what today needs',
    description: 'Log meals and workouts, check in each morning, and get one call for the day: push, hold steady or recover.',
  },
  {
    match: (pathname) => pathname === '/login',
    title: 'Log in | NutriFlow',
    description: 'Log in to see today’s verdict.',
  },
  {
    match: (pathname) => pathname === '/register',
    title: 'Create an account | NutriFlow',
    description: 'Create a free NutriFlow account. Your first check-in comes right after.',
  },
  {
    match: (pathname) => pathname === '/dashboard',
    title: 'Today | NutriFlow',
    description: 'Today’s verdict, readiness, meals and training.',
  },
  {
    match: (pathname) => pathname === '/fitness-hub',
    title: 'Coach | NutriFlow',
    description: 'Ask the NutriFlow coach about training, food and recovery, with answers from your own log.',
  },
  {
    match: (pathname) => pathname === '/library',
    title: 'Library | NutriFlow',
    description: 'Your saved training and meal plans and the NutriFlow exercise library.',
  },
  {
    match: (pathname) => pathname === '/profile',
    title: 'Profile | NutriFlow',
    description: 'Your NutriFlow profile: streaks, rhythm and what you log most.',
  },
  {
    match: (pathname) => pathname === '/settings',
    title: 'Settings | NutriFlow',
    description: 'Goals, profile, password, appearance and your data.',
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
          {/* Enter-only route transition: no exit animation, so navigation never waits. */}
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATION.base, ease: EASE_OUT }}
          >
            <AppRoutes />
          </motion.div>
        </ErrorBoundary>
      </Box>
      <Footer />
      <MobileTabBar />
    </Flex>
  )
}

export default App
