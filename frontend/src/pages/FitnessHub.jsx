import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Card, CardBody, Container, Flex, Heading, Spinner, Text, useToast } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import FitnessHubChatSection from '../components/FitnessHub/FitnessHubChatSection';
import FitnessHubInsightsSection from '../components/FitnessHub/FitnessHubInsightsSection';
import CoachContextCard from '../components/FitnessHub/CoachContextCard';
import PageBand, { PageBandFigures } from '../components/Global/PageBand';
import { DURATION, EASE_OUT } from '../components/Motion/tokens';
import usePlanLibrary from '../components/Library/usePlanLibrary';
import { AuthContext } from '../context/AuthContext';
import { getWorkouts, getDiets, getCheckIns } from '../services/api';
import { handleApiError } from '../utils/apiErrorHandler';
import {
  calculateDailyCalories,
  calculateDailyProtein,
  calculateDailyReadiness,
  calculateWeeklyWorkouts,
} from '../components/Dashboard/utils/dashboardUtils';
import { getTodayDayKey } from '../utils/dateUtils';

const DEFAULT_GOALS = { dailyCalories: 2000, dailyProtein: 150, weeklyWorkouts: 5 };
const MotionBox = motion(Box);
const rise = (i) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DURATION.slow, ease: EASE_OUT, delay: 0.1 + i * 0.08 },
});

const getInsightContent = (userWorkouts, userDiets) => {
  const sortedWorkouts = [...userWorkouts]
    .filter((item) => item?.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const sortedDiets = [...userDiets]
    .filter((item) => item?.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const recentWorkouts = sortedWorkouts.slice(0, 7);
  const recentDiets = sortedDiets.slice(0, 10);

  if (!recentWorkouts.length && !recentDiets.length) return [];

  const workoutDays = new Set(recentWorkouts.map((item) => new Date(item.date).toDateString()));
  const avgDuration = recentWorkouts.length
    ? Math.round(recentWorkouts.reduce((sum, item) => sum + (Number(item.duration) || 0), 0) / recentWorkouts.length)
    : 0;
  const avgCalories = recentDiets.length
    ? Math.round(recentDiets.reduce((sum, item) => sum + (Number(item.calories) || 0), 0) / recentDiets.length)
    : 0;
  const avgProtein = recentDiets.length
    ? Math.round(recentDiets.reduce((sum, item) => sum + (Number(item.protein) || 0), 0) / recentDiets.length)
    : 0;
  const mealTypes = new Set(recentDiets.map((item) => item.mealType).filter(Boolean));
  const logDays = new Set([
    ...sortedWorkouts.map((item) => item?.date && new Date(item.date).toDateString()).filter(Boolean),
    ...sortedDiets.map((item) => item?.date && new Date(item.date).toDateString()).filter(Boolean),
  ]);

  return [
    recentWorkouts.length
      ? {
          type: 'training',
          title: 'Training Load',
          content: `You logged ${recentWorkouts.length} recent workouts across ${workoutDays.size} active days with an average session length of ${avgDuration} minutes.`,
        }
      : {
          type: 'training',
          title: 'Training Load',
          content: 'You have meal data available, but no recent workouts logged yet. Log a session and the training advice gets specific.',
        },
    recentDiets.length
      ? {
          type: 'nutrition',
          title: 'Nutrition Snapshot',
          content: `Your recent meals average about ${avgCalories} calories and ${avgProtein}g of protein, with ${mealTypes.size || 1} meal types represented in your log.`,
        }
      : {
          type: 'nutrition',
          title: 'Nutrition Snapshot',
          content: 'You have workout data available, but no recent nutrition logs yet. Log a few meals and the fuel advice gets specific.',
        },
    {
      type: 'consistency',
      title: 'Consistency Trend',
      content: `You recorded fitness or nutrition activity on ${logDays.size} different days recently, which gives the coach enough signal to keep recommendations relevant.`,
    },
  ];
};

/** Confirms where generated plans go, so the Coach page stays about the conversation. */
function LibraryShortcut({ library }) {
  const { savedPlans, savedMealPlans, recommendationsLoading, mealPlansLoading } = library;
  const busy = recommendationsLoading || mealPlansLoading;
  const latest = [savedPlans[0], savedMealPlans[0]]
    .filter(Boolean)
    .sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt))[0];

  return (
    <Card>
      <CardBody py={4}>
        <Flex justify="space-between" align="center" gap={3}>
          <Heading as="h2" size="sm">Your Library</Heading>
          <Button as={RouterLink} to="/library" size="sm" variant="outline">Open</Button>
        </Flex>
        {busy ? (
          <Flex align="center" gap={2} mt={2} color="fg.muted" fontSize="sm">
            <Spinner size="xs" /> Building your plan. It will be saved to your Library.
          </Flex>
        ) : (
          <Text fontSize="sm" color="fg.muted" mt={1}>
            {savedPlans.length} training {savedPlans.length === 1 ? 'plan' : 'plans'}, {savedMealPlans.length} meal{' '}
            {savedMealPlans.length === 1 ? 'plan' : 'plans'} saved.
            {latest ? ` Latest: ${latest.title}.` : ' Plans you ask for here are saved there automatically.'}
          </Text>
        )}
      </CardBody>
    </Card>
  );
}

function FitnessHub() {
  const toast = useToast();
  const [userWorkouts, setUserWorkouts] = useState([]);
  const [userDiets, setUserDiets] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const goals = { ...DEFAULT_GOALS, ...user?.user?.goals };
  // "Ask Coach about this" elsewhere in the app lands here as ?ask=...
  const [searchParams, setSearchParams] = useSearchParams();
  const askPrompt = searchParams.get('ask');
  const clearAsk = useCallback(() => setSearchParams({}, { replace: true }), [setSearchParams]);
  const chatRef = useRef(null);
  const chatBoxRef = useRef(null);
  // Questions asked from the side panel go into the open conversation; on phones the
  // chat sits above the panel, so bring it back into view.
  const askCoach = useCallback((question) => {
    chatRef.current?.send(question);
    const top = chatBoxRef.current?.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * 0.6) {
      chatBoxRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);
  // Mounted here so plans generated in the chat are captured and saved.
  const library = usePlanLibrary();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const [workouts, diets, recentCheckIns] = await Promise.all([
        getWorkouts().catch((err) => {
          handleApiError(err, 'loading workouts', toast);
          return [];
        }),
        getDiets().catch((err) => {
          handleApiError(err, 'loading diets', toast);
          return [];
        }),
        getCheckIns(7).catch(() => []),
      ]);
      if (isMounted) {
        setUserWorkouts(Array.isArray(workouts) ? workouts : []);
        setUserDiets(Array.isArray(diets) ? diets : []);
        setCheckIns(Array.isArray(recentCheckIns) ? recentCheckIns : []);
        setIsLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [toast]);

  const insights = useMemo(() => getInsightContent(userWorkouts, userDiets), [userDiets, userWorkouts]);
  const todayCheckIn = useMemo(() => checkIns.find((c) => c.dayKey === getTodayDayKey()) || null, [checkIns]);
  const readiness = useMemo(
    () => calculateDailyReadiness(userWorkouts, userDiets, todayCheckIn),
    [todayCheckIn, userDiets, userWorkouts]
  );
  const today = useMemo(() => ({
    calories: calculateDailyCalories(userDiets),
    protein: calculateDailyProtein(userDiets),
    weeklyWorkouts: calculateWeeklyWorkouts(userWorkouts),
  }), [userDiets, userWorkouts]);

  return (
    <Box>
      <PageBand
        flow="recover"
        title="Coach"
        description="Ask anything about training, food or recovery. Answers come from your own log."
      >
        <PageBandFigures
          items={[
            { value: readiness.score, label: 'readiness today' },
            { value: today.calories, label: `of ${goals.dailyCalories.toLocaleString()} kcal today` },
            { value: today.weeklyWorkouts, label: `of ${goals.weeklyWorkouts} sessions this week` },
          ]}
        />
      </PageBand>
      <Container maxW="container.xl" py={{ base: 6, md: 8 }} px={{ base: 4, md: 6 }}>
        <Box display="grid" gridTemplateColumns={{ base: '1fr', xl: 'minmax(0, 1fr) 360px' }} gap={6} alignItems="start">
          <Box minW={0} ref={chatBoxRef} scrollMarginTop="80px">
            <FitnessHubChatSection
              ref={chatRef}
              userWorkouts={userWorkouts}
              userDiets={userDiets}
              initialPrompt={askPrompt}
              onPromptConsumed={clearAsk}
            />
          </Box>
          <Box minW={0} display="flex" flexDirection="column" gap={6}>
            <MotionBox {...rise(0)}>
              <CoachContextCard
                readiness={readiness}
                hasCheckIn={Boolean(todayCheckIn)}
                isLoading={isLoading}
                onAsk={askCoach}
              />
            </MotionBox>
            <MotionBox {...rise(1)}>
              <LibraryShortcut library={library} />
            </MotionBox>
            <MotionBox {...rise(2)}>
              <FitnessHubInsightsSection insights={insights} onAsk={askCoach} />
            </MotionBox>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default FitnessHub;
