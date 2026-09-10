import React, { useState, useCallback, useEffect, useMemo, useRef, useContext } from 'react';
import {
  Box,
  Container,
  Grid,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  Badge,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import FitnessHubChatSection from '../components/FitnessHub/FitnessHubChatSection';
import FitnessHubInsightsSection from '../components/FitnessHub/FitnessHubInsightsSection';
import FitnessHubPlansSection from '../components/FitnessHub/FitnessHubPlansSection';
import FitnessHubDiscoverySection from '../components/FitnessHub/FitnessHubDiscoverySection';
import ExerciseDetailsModal from '../components/FitnessHub/ExerciseDetailsModal';
import { getWorkouts, getDiets } from '../services/api';
import { handleApiError } from '../utils/apiErrorHandler';
import { AuthContext } from '../context/AuthContext';

const MotionBox = motion(Box);
const AI_PLANS_STORAGE_KEY = 'nutriflow.fitnessHub.aiPlans';

const createStoredPlan = (workouts = []) => ({
  id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  title:
    workouts[0]?.title ||
    (Array.isArray(workouts[0]?.focusAreas) && workouts[0].focusAreas.length > 0 ? workouts[0].focusAreas.join(' / ') : null) ||
    `Plan ${new Date().toLocaleDateString()}`,
  workouts,
  generatedAt: new Date().toISOString(),
});

const DISCOVERY_EXERCISES = [
  {
    name: 'Push-ups',
    muscleGroup: 'Chest',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
    notes: 'A reliable push pattern for warm-ups, hypertrophy, and conditioning.',
  },
  {
    name: 'Incline Push-ups',
    muscleGroup: 'Chest',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
    notes: 'An easier press variation that keeps the shoulder angle friendly.',
  },
  {
    name: 'Bench Press',
    muscleGroup: 'Chest',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
    notes: 'Classic strength builder for chest, triceps, and front delts.',
  },
  {
    name: 'Dumbbell Fly',
    muscleGroup: 'Chest',
    equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    videoUrl: 'https://www.youtube.com/watch?v=8iPEnn-ltC8',
    notes: 'Great for controlled chest isolation and a wider range of motion.',
  },
  {
    name: 'Pull-ups',
    muscleGroup: 'Back',
    equipment: 'Bodyweight',
    difficulty: 'Advanced',
    videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
    notes: 'A major upper-back and lat strength marker.',
  },
  {
    name: 'Lat Pulldown',
    muscleGroup: 'Back',
    equipment: 'Machine',
    difficulty: 'Intermediate',
    videoUrl: 'https://www.youtube.com/watch?v=pYcpY20QaE8',
    notes: 'Useful for building vertical pulling strength with smoother load control.',
  },
  {
    name: 'Seated Cable Row',
    muscleGroup: 'Back',
    equipment: 'Cable',
    difficulty: 'Intermediate',
    videoUrl: 'https://www.youtube.com/watch?v=GZbfZ033f74',
    notes: 'A strong horizontal pull for mid-back thickness and posture.',
  },
  {
    name: 'Single-arm Row',
    muscleGroup: 'Back',
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    videoUrl: 'https://www.youtube.com/watch?v=roCP6wCXPqo',
    notes: 'Lets each side work independently and helps correct strength imbalances.',
  },
  {
    name: 'Squats',
    muscleGroup: 'Legs',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    videoUrl: 'https://www.youtube.com/watch?v=aclHkVaku9U',
    notes: 'Foundational lower-body movement for strength and mobility.',
  },
  {
    name: 'Goblet Squat',
    muscleGroup: 'Legs',
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    videoUrl: 'https://www.youtube.com/watch?v=MeIiIdhvXT4',
    notes: 'A highly usable squat variation for improving depth and torso control.',
  },
  {
    name: 'Romanian Deadlift',
    muscleGroup: 'Legs',
    equipment: 'Dumbbells',
    difficulty: 'Advanced',
    videoUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
    notes: 'Great posterior-chain builder for hamstrings and glutes.',
  },
  {
    name: 'Walking Lunge',
    muscleGroup: 'Legs',
    equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    videoUrl: 'https://www.youtube.com/watch?v=wrwwXE_x-pQ',
    notes: 'Adds unilateral strength, balance, and dynamic stability.',
  },
  {
    name: 'Leg Press',
    muscleGroup: 'Legs',
    equipment: 'Machine',
    difficulty: 'Beginner',
    videoUrl: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
    notes: 'Machine-based leg volume that is easy to scale up safely.',
  },
  {
    name: 'Standing Calf Raise',
    muscleGroup: 'Legs',
    equipment: 'Machine',
    difficulty: 'Beginner',
    videoUrl: 'https://www.youtube.com/watch?v=YMmgqO8Jo-k',
    notes: 'Simple accessory work that adds lower-leg volume and ankle strength.',
  },
  {
    name: 'Bulgarian Split Squat',
    muscleGroup: 'Glutes',
    equipment: 'Dumbbells',
    difficulty: 'Advanced',
    videoUrl: 'https://www.youtube.com/watch?v=2C-uNgKwPLE',
    notes: 'Hard unilateral leg work with a big glute and quad stimulus.',
  },
  {
    name: 'Plank',
    muscleGroup: 'Core',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    videoUrl: 'https://www.youtube.com/watch?v=pSHjTRCQxIw',
    notes: 'A simple anti-extension drill for core stability.',
  },
  {
    name: 'Dead Bug',
    muscleGroup: 'Core',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    videoUrl: 'https://www.youtube.com/watch?v=4XLEnwUr1d8',
    notes: 'Great for trunk control while keeping the lower back protected.',
  },
  {
    name: 'Pallof Press',
    muscleGroup: 'Core',
    equipment: 'Cable',
    difficulty: 'Intermediate',
    videoUrl: 'https://www.youtube.com/watch?v=FQskThL0VJg',
    notes: 'Anti-rotation core work that carries over to nearly every lift.',
  },
  {
    name: 'Shoulder Press',
    muscleGroup: 'Shoulders',
    equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    videoUrl: 'https://www.youtube.com/watch?v=qEwKCR5JCog',
    notes: 'Primary vertical press for delts, triceps, and upper-body strength.',
  },
  {
    name: 'Lateral Raise',
    muscleGroup: 'Shoulders',
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
    notes: 'Useful isolation work for side delt development.',
  },
  {
    name: 'Bicep Curl',
    muscleGroup: 'Arms',
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    videoUrl: 'https://www.youtube.com/watch?v=av7-8igSXTs',
    notes: 'A classic arm movement that pairs well with pull days.',
  },
  {
    name: 'Triceps Pushdown',
    muscleGroup: 'Arms',
    equipment: 'Cable',
    difficulty: 'Beginner',
    videoUrl: 'https://www.youtube.com/watch?v=2-LAMcpzODU',
    notes: 'Easy-to-load triceps work for arm volume and elbow-friendly reps.',
  },
  {
    name: 'Kettlebell Swing',
    muscleGroup: 'Full Body',
    equipment: 'Kettlebell',
    difficulty: 'Intermediate',
    videoUrl: 'https://www.youtube.com/watch?v=YSxHifyI6s8',
    notes: 'Explosive hinge work that blends conditioning and posterior-chain power.',
  },
  {
    name: 'Jump Rope Intervals',
    muscleGroup: 'Cardio',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    videoUrl: 'https://www.youtube.com/watch?v=1BZMtlT9cMM',
    notes: 'A compact conditioning option that is easy to scale by interval length.',
  },
  {
    name: 'Mobility Flow',
    muscleGroup: 'Mobility',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    videoUrl: 'https://www.youtube.com/watch?v=HqFPO5qz0AA',
    notes: 'A recovery-friendly movement break for hips, spine, and shoulders.',
  },
];

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
          content: 'You have meal data available, but no recent workouts logged yet. Add a session to unlock training-specific guidance.',
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
          content: 'You have workout data available, but no recent nutrition logs yet. Add meals to generate more personalized fueling insights.',
        },
    {
      type: 'consistency',
      title: 'Consistency Trend',
      content: `You recorded fitness or nutrition activity on ${logDays.size} different days recently, which gives the coach enough signal to keep recommendations relevant.`,
    },
  ];
};

function FitnessHub() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { user } = useContext(AuthContext);
  const [userWorkouts, setUserWorkouts] = useState([]);
  const [userDiets, setUserDiets] = useState([]);
  const [savedPlans, setSavedPlans] = useState([]);
  const [activePlanId, setActivePlanId] = useState(null);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const recSectionRef = useRef(null);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [discoveryMuscle, setDiscoveryMuscle] = useState('');
  const [discoveryEquipment, setDiscoveryEquipment] = useState('');
  const [discoveryDifficulty, setDiscoveryDifficulty] = useState('');

  const storageUserId = user?.user?._id || user?._id || user?.result?._id || 'anonymous';
  const activePlan = useMemo(
    () => savedPlans.find((plan) => plan.id === activePlanId) || savedPlans[0] || null,
    [activePlanId, savedPlans]
  );
  const aiWorkouts = activePlan?.workouts || [];
  const aiGeneratedAt = activePlan?.generatedAt ? new Date(activePlan.generatedAt) : null;
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const surfaceBg = useColorModeValue('white', 'gray.800');
  const heroBg = useColorModeValue('linear(to-br, white, teal.50, blue.50)', 'linear(to-br, gray.800, gray.800, blue.900)');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const heroTextColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const mutedColor = useColorModeValue('gray.500', 'gray.500');

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const [workouts, diets] = await Promise.all([
          getWorkouts().catch((err) => {
            handleApiError(err, 'loading workouts', toast);
            return [];
          }),
          getDiets().catch((err) => {
            handleApiError(err, 'loading diets', toast);
            return [];
          }),
        ]);

        if (isMounted) {
          setUserWorkouts(Array.isArray(workouts) ? workouts : []);
          setUserDiets(Array.isArray(diets) ? diets : []);
        }
      } catch (e) {
        handleApiError(e, 'loading Fitness Hub data', toast);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [toast]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(`${AI_PLANS_STORAGE_KEY}.${storageUserId}`);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.plans) && parsed.plans.length > 0) {
        setSavedPlans(parsed.plans);
        setActivePlanId(parsed.activePlanId || parsed.plans[0].id);
      } else if (Array.isArray(parsed?.workouts)) {
        const migratedPlan = {
          ...createStoredPlan(parsed.workouts),
          generatedAt: parsed.generatedAt || new Date().toISOString(),
        };
        setSavedPlans([migratedPlan]);
        setActivePlanId(migratedPlan.id);
      }
    } catch {
      // Ignore invalid persisted data and let the page recover cleanly.
    }
  }, [storageUserId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        `${AI_PLANS_STORAGE_KEY}.${storageUserId}`,
        JSON.stringify({
          plans: savedPlans,
          activePlanId,
        })
      );
    } catch {
      // Ignore persistence failures in unsupported/private browsing contexts.
    }
  }, [activePlanId, savedPlans, storageUserId]);

  useEffect(() => {
    const onUpdated = (e) => {
      const workouts = Array.isArray(e.detail) ? e.detail : [];
      if (workouts.length > 0) {
        const nextPlan = createStoredPlan(workouts);
        setSavedPlans((prev) => [nextPlan, ...prev]);
        setActivePlanId(nextPlan.id);
      }
      setRecommendationsLoading(false);
      if (recSectionRef.current && workouts.length > 0) {
        recSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    const onLoading = () => setRecommendationsLoading(true);

    window.addEventListener('ai-recommendations-updated', onUpdated);
    window.addEventListener('ai-recommendations-loading', onLoading);

    return () => {
      window.removeEventListener('ai-recommendations-updated', onUpdated);
      window.removeEventListener('ai-recommendations-loading', onLoading);
    };
  }, []);

  const handleCloseDetails = useCallback(() => {
    onClose();
    setActiveWorkout(null);
  }, [onClose]);

  const handleViewDetails = useCallback((workout) => {
    setActiveWorkout(workout);
    onOpen();
  }, [onOpen]);

  const filteredExercises = useMemo(
    () =>
      DISCOVERY_EXERCISES.filter((ex) => {
        if (discoveryMuscle && ex.muscleGroup !== discoveryMuscle) return false;
        if (discoveryEquipment && ex.equipment !== discoveryEquipment) return false;
        if (discoveryDifficulty && ex.difficulty !== discoveryDifficulty) return false;
        return true;
      }),
    [discoveryDifficulty, discoveryEquipment, discoveryMuscle]
  );

  const insights = useMemo(() => getInsightContent(userWorkouts, userDiets), [userDiets, userWorkouts]);

  const hubStats = useMemo(
    () => [
      { label: 'Logged Workouts', value: userWorkouts.length, hint: 'Used to personalize AI plans' },
      { label: 'Meals Logged', value: userDiets.length, hint: 'Nutrition context for coaching' },
      { label: 'AI Plans Saved', value: savedPlans.length, hint: savedPlans.length ? 'Previous plans stay available after refresh' : 'Generate your first weekly plan in chat' },
    ],
    [savedPlans.length, userDiets.length, userWorkouts.length]
  );

  return (
    <Box bg={bgColor} minH="100vh">
      <Container maxW="1400px" py={{ base: 6, md: 8 }} px={{ base: 4, md: 6 }}>
        <VStack spacing={8} align="stretch">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card
              bgGradient={heroBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="2xl"
              boxShadow="xl"
              overflow="hidden"
            >
              <CardBody p={{ base: 6, md: 8 }}>
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 6, lg: 10 }} alignItems="center">
                  <VStack align="start" spacing={4}>
                    <Badge colorScheme="teal" variant="subtle" px={3} py={1} borderRadius="full">
                      AI-Powered Fitness Workspace
                    </Badge>
                    <Heading size="2xl" color={heroTextColor} lineHeight="1.05">
                      Fitness Hub
                    </Heading>
                    <Text fontSize={{ base: 'md', md: 'lg' }} color={textColor} maxW="2xl">
                      Coach, plan, review, and discover from a single workspace with cleaner conversations, saved AI
                      plans, and insight cards driven by your real activity.
                    </Text>
                    <HStack spacing={3} flexWrap="wrap">
                      <Badge colorScheme="blue" variant="outline" px={3} py={1} borderRadius="full">
                        Saved plan history
                      </Badge>
                      <Badge colorScheme="teal" variant="outline" px={3} py={1} borderRadius="full">
                        Real activity insights
                      </Badge>
                      <Badge colorScheme="orange" variant="outline" px={3} py={1} borderRadius="full">
                        Guided exercise discovery
                      </Badge>
                    </HStack>
                  </VStack>

                  <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
                    {hubStats.map((stat) => (
                      <Card
                        key={stat.label}
                        bg={surfaceBg}
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="xl"
                        boxShadow="sm"
                      >
                        <CardBody>
                          <Text fontSize="sm" color={mutedColor} mb={2}>
                            {stat.label}
                          </Text>
                          <Heading size="lg" color={heroTextColor} mb={2}>
                            {stat.value}
                          </Heading>
                          <Text fontSize="sm" color={textColor}>
                            {stat.hint}
                          </Text>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                </SimpleGrid>
              </CardBody>
            </Card>
          </MotionBox>

          <Grid
            templateColumns={{ base: '1fr', xl: 'minmax(0, 1.55fr) minmax(360px, 1fr)' }}
            gap={8}
            alignItems="stretch"
          >
            <Box minW={0} display="flex" h="100%">
              <FitnessHubChatSection userWorkouts={userWorkouts} userDiets={userDiets} toast={toast} />
            </Box>
            <Box minW={0} display="flex" h="100%">
              <FitnessHubPlansSection
                sectionRef={recSectionRef}
                recommendationsLoading={recommendationsLoading}
                aiWorkouts={aiWorkouts}
                aiGeneratedAt={aiGeneratedAt}
                onViewDetails={handleViewDetails}
                savedPlans={savedPlans}
                activePlanId={activePlanId}
                onSelectPlan={setActivePlanId}
                onDeletePlan={(planId) => {
                  setSavedPlans((prev) => {
                    const nextPlans = prev.filter((plan) => plan.id !== planId);
                    if (nextPlans.length === 0) {
                      setActivePlanId(null);
                      return [];
                    }
                    if (activePlanId === planId) {
                      setActivePlanId(nextPlans[0].id);
                    }
                    return nextPlans;
                  });
                }}
                compact
              />
            </Box>
          </Grid>

          <Grid
            templateColumns={{ base: '1fr', xl: 'minmax(320px, 0.95fr) minmax(0, 1.35fr)' }}
            gap={8}
            alignItems="stretch"
          >
            <Box minW={0} display="flex" h="100%">
              <FitnessHubInsightsSection insights={insights} />
            </Box>
            <Box minW={0} display="flex" h="100%">
              <FitnessHubDiscoverySection
                muscle={discoveryMuscle}
                equipment={discoveryEquipment}
                difficulty={discoveryDifficulty}
                onMuscleChange={setDiscoveryMuscle}
                onEquipmentChange={setDiscoveryEquipment}
                onDifficultyChange={setDiscoveryDifficulty}
                filteredExercises={filteredExercises}
                totalExercises={DISCOVERY_EXERCISES.length}
                onClearFilters={() => {
                  setDiscoveryMuscle('');
                  setDiscoveryEquipment('');
                  setDiscoveryDifficulty('');
                }}
              />
            </Box>
          </Grid>

          <ExerciseDetailsModal
            isOpen={isOpen}
            onClose={handleCloseDetails}
            workout={activeWorkout}
          />
        </VStack>
      </Container>
    </Box>
  );
}

export default FitnessHub;
