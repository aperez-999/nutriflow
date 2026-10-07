import { useState, useCallback, useEffect, useMemo, useRef, useContext } from 'react';
import {
  Box,
  Container,
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
import { addDiet, addWorkout, getWorkouts, getDiets, searchFoods } from '../services/api';
import { handleApiError } from '../utils/apiErrorHandler';
import { AuthContext } from '../context/AuthContext';
import { getTodayDayKey, toStoredIsoFromDayKey } from '../utils/dateUtils';

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

const createStoredMealPlan = ({ title, meals = [], calories = null } = {}) => ({
  id: `meal-plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  title: title || `Meal Plan ${new Date().toLocaleDateString()}`,
  meals,
  calories,
  generatedAt: new Date().toISOString(),
});

const normalizeStoredPlan = (plan) => {
  if (!plan || !Array.isArray(plan.workouts) || plan.workouts.length === 0) return null;

  const title = typeof plan.title === 'string' && plan.title.trim()
    ? plan.title.trim()
    : createStoredPlan(plan.workouts).title;

  return {
    ...plan,
    id: typeof plan.id === 'string' && plan.id.trim()
      ? plan.id
      : `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    generatedAt: plan.generatedAt || new Date().toISOString(),
    workouts: plan.workouts.filter(Boolean),
  };
};

const normalizeStoredMealPlan = (plan) => {
  if (!plan) return null;

  const meals = Array.isArray(plan.meals)
    ? plan.meals
      .map((meal) => {
        if (!meal) return null;
        const mealType = normalizeMealType(meal.mealType);
        const foodName = typeof meal.foodName === 'string' ? meal.foodName.trim() : '';
        if (!foodName) return null;
        return {
          ...meal,
          mealType,
          foodName,
        };
      })
      .filter(Boolean)
    : [];

  if (meals.length === 0) return null;

  const title = typeof plan.title === 'string' && plan.title.trim()
    ? plan.title.trim()
    : `Meal Plan ${new Date(plan.generatedAt || Date.now()).toLocaleDateString()}`;

  return {
    ...plan,
    id: typeof plan.id === 'string' && plan.id.trim()
      ? plan.id
      : `meal-plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    calories: Number.isFinite(Number(plan.calories)) ? Number(plan.calories) : null,
    meals,
    generatedAt: plan.generatedAt || new Date().toISOString(),
  };
};

const getCompletionKey = (type, planId, index) => `${type}:${planId}:${index}`;

const inferWorkoutType = (workout = {}) => {
  const text = [
    workout.title,
    workout.description,
    ...(Array.isArray(workout.focusAreas) ? workout.focusAreas : []),
  ]
    .join(' ')
    .toLowerCase();

  if (/(cardio|run|bike|conditioning|interval|hiit)/.test(text)) return 'Cardio';
  if (/(mobility|stretch|flexibility|yoga|recovery)/.test(text)) return 'Flexibility';
  if (/(sport|soccer|basketball|tennis)/.test(text)) return 'Sports';
  return 'Strength';
};

const normalizeMealType = (mealType = 'Snack') => {
  const normalized = String(mealType).trim().toLowerCase();
  if (normalized.startsWith('breakfast')) return 'Breakfast';
  if (normalized.startsWith('lunch')) return 'Lunch';
  if (normalized.startsWith('dinner')) return 'Dinner';
  return 'Snack';
};

const parseWorkoutCalories = (value, duration = 45) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const matches = String(value || '').match(/\d+/g);
  if (!matches?.length) return Math.round((Number(duration) || 45) * 8);
  const numbers = matches.map(Number).filter(Number.isFinite);
  if (numbers.length === 1) return numbers[0];
  return Math.round(numbers.reduce((sum, num) => sum + num, 0) / numbers.length);
};

const buildWorkoutEquipment = (workout = {}) => {
  const equipment = Array.isArray(workout.exercises)
    ? workout.exercises.map((exercise) => exercise?.equipment).filter(Boolean)
    : [];
  return Array.from(new Set(equipment)).join(', ');
};

const fallbackMealNutrition = (mealType) => {
  if (mealType === 'Breakfast') return { calories: 350, protein: 20, carbs: 35, fats: 12 };
  if (mealType === 'Lunch' || mealType === 'Dinner') return { calories: 520, protein: 32, carbs: 45, fats: 18 };
  return { calories: 220, protein: 15, carbs: 22, fats: 8 };
};

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
  const [savedMealPlans, setSavedMealPlans] = useState([]);
  const [activeMealPlanId, setActiveMealPlanId] = useState(null);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [mealPlansLoading, setMealPlansLoading] = useState(false);
  const [completingItems, setCompletingItems] = useState({});
  const recSectionRef = useRef(null);
  const completionLocksRef = useRef(new Set());
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
  const activeMealPlan = useMemo(
    () => savedMealPlans.find((plan) => plan.id === activeMealPlanId) || savedMealPlans[0] || null,
    [activeMealPlanId, savedMealPlans]
  );
  const bgColor = 'bg.muted';
  const surfaceBg = 'bg.surface';
  const heroBg = useColorModeValue('linear(to-br, white, teal.50, blue.50)', 'linear(to-br, gray.800, gray.800, blue.900)');
  const borderColor = 'border';
  const heroTextColor = 'fg';
  const textColor = 'fg.muted';
  const mutedColor = 'fg.muted';

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
        const restoredPlans = parsed.plans.map(normalizeStoredPlan).filter(Boolean);
        if (restoredPlans.length > 0) {
          setSavedPlans(restoredPlans);
          setActivePlanId(
            restoredPlans.some((plan) => plan.id === parsed.activePlanId)
              ? parsed.activePlanId
              : restoredPlans[0].id
          );
        }
      } else if (Array.isArray(parsed?.workouts)) {
        const migratedPlan = {
          ...createStoredPlan(parsed.workouts),
          generatedAt: parsed.generatedAt || new Date().toISOString(),
        };
        setSavedPlans([migratedPlan]);
        setActivePlanId(migratedPlan.id);
      }

      if (Array.isArray(parsed?.mealPlans) && parsed.mealPlans.length > 0) {
        const restoredMealPlans = parsed.mealPlans.map(normalizeStoredMealPlan).filter(Boolean);
        if (restoredMealPlans.length > 0) {
          setSavedMealPlans(restoredMealPlans);
          setActiveMealPlanId(
            restoredMealPlans.some((plan) => plan.id === parsed.activeMealPlanId)
              ? parsed.activeMealPlanId
              : restoredMealPlans[0].id
          );
        }
      }
    } catch {
      // Ignore invalid persisted data and let the page recover cleanly.
    }
  }, [storageUserId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const timeoutId = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          `${AI_PLANS_STORAGE_KEY}.${storageUserId}`,
          JSON.stringify({
            plans: savedPlans,
            activePlanId,
            mealPlans: savedMealPlans,
            activeMealPlanId,
          })
        );
      } catch {
        // Ignore persistence failures in unsupported/private browsing contexts.
      }
    }, 150);

    return () => window.clearTimeout(timeoutId);
  }, [activeMealPlanId, activePlanId, savedMealPlans, savedPlans, storageUserId]);

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
    const onMealPlanUpdated = (e) => {
      const detail = e.detail;
      const nextPlan = normalizeStoredMealPlan(createStoredMealPlan(detail));
      if (nextPlan) {
        setSavedMealPlans((prev) => [nextPlan, ...prev.filter((plan) => plan.id !== nextPlan.id)]);
        setActiveMealPlanId(nextPlan.id);
        if (recSectionRef.current) {
          recSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
      setMealPlansLoading(false);
    };
    const onMealPlanLoading = () => setMealPlansLoading(true);

    window.addEventListener('ai-recommendations-updated', onUpdated);
    window.addEventListener('ai-recommendations-loading', onLoading);
    window.addEventListener('ai-meal-plan-updated', onMealPlanUpdated);
    window.addEventListener('ai-meal-plan-loading', onMealPlanLoading);

    return () => {
      window.removeEventListener('ai-recommendations-updated', onUpdated);
      window.removeEventListener('ai-recommendations-loading', onLoading);
      window.removeEventListener('ai-meal-plan-updated', onMealPlanUpdated);
      window.removeEventListener('ai-meal-plan-loading', onMealPlanLoading);
    };
  }, []);

  const setCompletionState = useCallback((key, value) => {
    setCompletingItems((prev) => {
      if (!value) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: value };
    });
  }, []);

  const beginCompletion = useCallback((key) => {
    if (completionLocksRef.current.has(key)) return false;
    completionLocksRef.current.add(key);
    setCompletionState(key, true);
    return true;
  }, [setCompletionState]);

  const endCompletion = useCallback((key) => {
    completionLocksRef.current.delete(key);
    setCompletionState(key, false);
  }, [setCompletionState]);

  const markWorkoutCompleted = useCallback((planId, workoutIndex, recordId) => {
    setSavedPlans((prev) =>
      prev.map((plan) => (
        plan.id === planId
          ? {
              ...plan,
              workouts: plan.workouts.map((workout, index) => (
                index === workoutIndex
                  ? { ...workout, completedRecordId: recordId, completedAt: new Date().toISOString() }
                  : workout
              )),
            }
          : plan
      ))
    );
  }, []);

  const markMealCompleted = useCallback((planId, mealIndex, recordId) => {
    setSavedMealPlans((prev) =>
      prev.map((plan) => (
        plan.id === planId
          ? {
              ...plan,
              meals: plan.meals.map((meal, index) => (
                index === mealIndex
                  ? { ...meal, completedRecordId: recordId, completedAt: new Date().toISOString() }
                  : meal
              )),
            }
          : plan
      ))
    );
  }, []);

  const handleCompleteWorkout = useCallback(async (workout, workoutIndex) => {
    const planId = activePlanId;
    if (!planId || !workout) return;
    const key = getCompletionKey('workout', planId, workoutIndex);
    if (!beginCompletion(key)) return;

    try {
      const workoutPayload = {
        date: toStoredIsoFromDayKey(getTodayDayKey()),
        type: inferWorkoutType(workout),
        workoutName: workout.title || `AI Workout ${workoutIndex + 1}`,
        duration: Number(workout.duration) || 45,
        caloriesBurned: parseWorkoutCalories(workout.calories, workout.duration),
        intensity: workout.intensity || 'Medium',
        equipment: buildWorkoutEquipment(workout),
        notes: `Completed from AI plan${workout.description ? `: ${workout.description}` : ''}`,
      };

      const createdWorkout = await addWorkout(workoutPayload);
      setUserWorkouts((prev) => [createdWorkout, ...prev]);
      markWorkoutCompleted(planId, workoutIndex, createdWorkout._id);
      toast({
        title: 'Workout logged',
        description: 'The AI workout was added to your training log.',
        status: 'success',
        duration: 2500,
      });
    } catch (error) {
      handleApiError(error, 'logging AI workout', toast);
    } finally {
      endCompletion(key);
    }
  }, [activePlanId, beginCompletion, endCompletion, markWorkoutCompleted, toast]);

  const handleCompleteMeal = useCallback(async (meal, mealIndex) => {
    const mealPlanId = activeMealPlanId;
    if (!mealPlanId || !meal) return;
    const key = getCompletionKey('meal', mealPlanId, mealIndex);
    if (!beginCompletion(key)) return;

    try {
      const mealType = normalizeMealType(meal.mealType);
      let nutrition = fallbackMealNutrition(mealType);

      try {
        const foodResults = await searchFoods(meal.foodName);
        if (Array.isArray(foodResults?.foods) && foodResults.foods[0]?.nutrition) {
          nutrition = foodResults.foods[0].nutrition;
        }
      } catch {
        // Fall back to meal-type defaults if search is unavailable.
      }

      const dietPayload = {
        date: toStoredIsoFromDayKey(getTodayDayKey()),
        mealType,
        foodName: meal.foodName,
        calories: Number(nutrition.calories) || fallbackMealNutrition(mealType).calories,
        protein: Number(nutrition.protein) || 0,
        carbs: Number(nutrition.carbs) || 0,
        fats: Number(nutrition.fats) || 0,
        notes: 'Logged from AI meal plan',
      };

      const createdDiet = await addDiet(dietPayload);
      setUserDiets((prev) => [createdDiet, ...prev]);
      markMealCompleted(mealPlanId, mealIndex, createdDiet._id);
      toast({
        title: 'Meal logged',
        description: 'The AI meal was added to your nutrition log.',
        status: 'success',
        duration: 2500,
      });
    } catch (error) {
      handleApiError(error, 'logging AI meal', toast);
    } finally {
      endCompletion(key);
    }
  }, [activeMealPlanId, beginCompletion, endCompletion, markMealCompleted, toast]);

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
      {
        label: 'AI Plans Saved',
        value: savedPlans.length + savedMealPlans.length,
        hint: savedPlans.length + savedMealPlans.length ? 'Workout and meal plans stay available after refresh' : 'Generate your first plan in chat',
      },
    ],
    [savedMealPlans.length, savedPlans.length, userDiets.length, userWorkouts.length]
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

          {/* ─── Top Row: AI Chat (left) + Insights + Meal Plans (right) ─── */}
          <Box
            display="grid"
            gridTemplateColumns={{ base: '1fr', xl: '1.15fr 0.85fr' }}
            gap={8}
            alignItems="start"
          >
            {/* AI Chat */}
            <Box minW={0}>
              <FitnessHubChatSection userWorkouts={userWorkouts} userDiets={userDiets} toast={toast} />
            </Box>

            {/* Right column: Insights + Meal Plans stacked */}
            <Box minW={0} display="flex" flexDirection="column" gap={6}>
              <FitnessHubInsightsSection insights={insights} />

              {/* Meal Plans — compact, under insights */}
              <Box ref={recSectionRef} id="meal-plans-section">
                <FitnessHubPlansSection
                  sectionRef={null}
                  recommendationsLoading={false}
                  aiWorkouts={[]}
                  aiGeneratedAt={null}
                  onViewDetails={() => {}}
                  savedPlans={[]}
                  activePlanId={null}
                  onSelectPlan={() => {}}
                  onCompleteWorkout={() => {}}
                  onDeletePlan={() => {}}
                  savedMealPlans={savedMealPlans}
                  activeMealPlanId={activeMealPlanId}
                  onSelectMealPlan={setActiveMealPlanId}
                  onDeleteMealPlan={(planId) => {
                    setSavedMealPlans((prev) => {
                      const nextPlans = prev.filter((plan) => plan.id !== planId);
                      if (nextPlans.length === 0) { setActiveMealPlanId(null); return []; }
                      if (activeMealPlanId === planId) { setActiveMealPlanId(nextPlans[0].id); }
                      return nextPlans;
                    });
                  }}
                  onCompleteMeal={handleCompleteMeal}
                  mealPlansLoading={mealPlansLoading}
                  getWorkoutState={() => ({ loading: false, completed: false })}
                  getMealState={(index) => {
                    const key = getCompletionKey('meal', activeMealPlanId, index);
                    return {
                      loading: Boolean(completingItems[key]),
                      completed: Boolean(activeMealPlan?.meals?.[index]?.completedRecordId),
                    };
                  }}
                  compact
                  mealPlansOnly
                />
              </Box>
            </Box>
          </Box>

          {/* ─── Bottom Row: Exercise Library + AI Workout Plans ─── */}
          <SimpleGrid
            columns={{ base: 1, xl: 2 }}
            spacing={8}
            alignItems="start"
          >
            {/* Exercise Library */}
            <Box minW={0}>
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

            {/* AI Workout Plans only */}
            <Box minW={0}>
              <FitnessHubPlansSection
                sectionRef={null}
                recommendationsLoading={recommendationsLoading}
                aiWorkouts={aiWorkouts}
                aiGeneratedAt={aiGeneratedAt}
                onViewDetails={handleViewDetails}
                savedPlans={savedPlans}
                activePlanId={activePlanId}
                onSelectPlan={setActivePlanId}
                onCompleteWorkout={handleCompleteWorkout}
                onDeletePlan={(planId) => {
                  setSavedPlans((prev) => {
                    const nextPlans = prev.filter((plan) => plan.id !== planId);
                    if (nextPlans.length === 0) { setActivePlanId(null); return []; }
                    if (activePlanId === planId) { setActivePlanId(nextPlans[0].id); }
                    return nextPlans;
                  });
                }}
                savedMealPlans={[]}
                activeMealPlanId={null}
                onSelectMealPlan={() => {}}
                onDeleteMealPlan={() => {}}
                onCompleteMeal={() => {}}
                mealPlansLoading={false}
                getWorkoutState={(index) => {
                  const key = getCompletionKey('workout', activePlanId, index);
                  return {
                    loading: Boolean(completingItems[key]),
                    completed: Boolean(activePlan?.workouts?.[index]?.completedRecordId),
                  };
                }}
                getMealState={() => ({ loading: false, completed: false })}
                compact
                workoutPlansOnly
              />
            </Box>
          </SimpleGrid>

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
