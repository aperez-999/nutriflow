import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import { addDiet, addWorkout, deleteSavedPlan, getSavedPlans, saveSavedPlan, searchFoods } from '../../services/api';
import { mergePlans, planChanges } from './planSync';
import { handleApiError } from '../../utils/apiErrorHandler';
import { AuthContext } from '../../context/AuthContext';
import { getTodayDayKey, toStoredIsoFromDayKey } from '../../utils/dateUtils';

const AI_PLANS_STORAGE_KEY = 'nutriflow.fitnessHub.aiPlans';

/**
 * A name for a whole week, not its first session: the focus most sessions share
 * ("Full Body week"), or the session count when there is none.
 */
export const planTitle = (workouts = []) => {
  const counts = new Map();
  workouts.forEach((workout) => (workout?.focusAreas || []).forEach((area) => {
    const key = String(area).trim();
    if (key) counts.set(key, (counts.get(key) || 0) + 1);
  }));
  const [top] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] || [];
  if (top) return `${top.charAt(0).toUpperCase()}${top.slice(1)} week`;
  return workouts.length ? `${workouts.length}-session week` : `Plan ${new Date().toLocaleDateString()}`;
};

const createStoredPlan = (workouts = []) => ({
  id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  title: planTitle(workouts),
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

/** Reads saved plans for a user synchronously, migrating the old single-plan format. */
const readStoredLibrary = (storageUserId) => {
  const empty = { plans: [], activePlanId: null, mealPlans: [], activeMealPlanId: null, syncedIds: [] };
  if (typeof window === 'undefined') return empty;
  try {
    const raw = window.localStorage.getItem(`${AI_PLANS_STORAGE_KEY}.${storageUserId}`);
    if (!raw) return empty;
    const parsed = JSON.parse(raw);
    const result = { ...empty };
    if (Array.isArray(parsed?.plans) && parsed.plans.length > 0) {
      result.plans = parsed.plans.map(normalizeStoredPlan).filter(Boolean);
      result.activePlanId = result.plans.some((plan) => plan.id === parsed.activePlanId)
        ? parsed.activePlanId
        : result.plans[0]?.id ?? null;
    } else if (Array.isArray(parsed?.workouts)) {
      const migratedPlan = { ...createStoredPlan(parsed.workouts), generatedAt: parsed.generatedAt || new Date().toISOString() };
      result.plans = [migratedPlan];
      result.activePlanId = migratedPlan.id;
    }
    if (Array.isArray(parsed?.mealPlans) && parsed.mealPlans.length > 0) {
      result.mealPlans = parsed.mealPlans.map(normalizeStoredMealPlan).filter(Boolean);
      result.activeMealPlanId = result.mealPlans.some((plan) => plan.id === parsed.activeMealPlanId)
        ? parsed.activeMealPlanId
        : result.mealPlans[0]?.id ?? null;
    }
    result.syncedIds = Array.isArray(parsed?.syncedIds) ? parsed.syncedIds.filter((id) => typeof id === 'string') : [];
    return result;
  } catch {
    // Ignore invalid persisted data and start clean.
    return empty;
  }
};

/**
 * Saved AI training and meal plans for the signed-in user.
 * Kept on the account (/api/plans) with a localStorage copy for an instant first render,
 * captures new plans the coach chat announces (window events), and logs a planned
 * session or meal into the user's log.
 * Used by Coach (to save plans as they are generated) and Library (to use them).
 */
export default function usePlanLibrary() {
  const toast = useToast();
  const { user } = useContext(AuthContext);
  const storageUserId = user?.user?._id || user?._id || user?.result?._id || 'anonymous';
  // Read storage before the first render so the first save can never overwrite saved plans.
  const [stored] = useState(() => readStoredLibrary(storageUserId));
  const [savedPlans, setSavedPlans] = useState(stored.plans);
  const [activePlanId, setActivePlanId] = useState(stored.activePlanId);
  const [savedMealPlans, setSavedMealPlans] = useState(stored.mealPlans);
  const [activeMealPlanId, setActiveMealPlanId] = useState(stored.activeMealPlanId);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [mealPlansLoading, setMealPlansLoading] = useState(false);
  const [completingItems, setCompletingItems] = useState({});
  const completionLocksRef = useRef(new Set());
  // Server sync: what the server last confirmed (id -> { kind, json }), and whether the
  // first load finished. Nothing is saved or deleted before that, so a failed load can
  // never delete plans on the account.
  const syncedRef = useRef(new Map());
  // One request per plan at a time, so an older save can never land after a newer one.
  const inFlightRef = useRef(new Set());
  const [serverReady, setServerReady] = useState(false);
  const [syncVersion, setSyncVersion] = useState(0);

  const activePlan = useMemo(
    () => savedPlans.find((plan) => plan.id === activePlanId) || savedPlans[0] || null,
    [activePlanId, savedPlans]
  );
  const activeMealPlan = useMemo(
    () => savedMealPlans.find((plan) => plan.id === activeMealPlanId) || savedMealPlans[0] || null,
    [activeMealPlanId, savedMealPlans]
  );

  // Save on every change, synchronously: a delayed write could be cancelled if the user
  // navigates away (e.g. Coach -> Library) right after a plan arrives, losing the plan.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        `${AI_PLANS_STORAGE_KEY}.${storageUserId}`,
        JSON.stringify({
          plans: savedPlans,
          activePlanId,
          mealPlans: savedMealPlans,
          activeMealPlanId,
          syncedIds: serverReady ? [...syncedRef.current.keys()] : stored.syncedIds,
        })
      );
    } catch {
      // Ignore persistence failures in unsupported/private browsing contexts.
    }
  }, [activeMealPlanId, activePlanId, savedMealPlans, savedPlans, serverReady, stored.syncedIds, storageUserId, syncVersion]);

  // Load the account's plans once and merge them with this browser's copy.
  useEffect(() => {
    if (storageUserId === 'anonymous') return undefined;
    let cancelled = false;
    getSavedPlans()
      .then((data) => {
        if (cancelled) return;
        const remember = (kind, plans) => plans.forEach((plan) => {
          const items = kind === 'meal' ? plan.meals : plan.workouts;
          syncedRef.current.set(plan.id, {
            kind,
            json: JSON.stringify({ kind, title: plan.title, calories: plan.calories ?? null, generatedAt: plan.generatedAt, items }),
          });
        });
        remember('training', data.plans || []);
        remember('meal', data.mealPlans || []);
        setSavedPlans((local) => mergePlans('training', data.plans || [], local, stored.syncedIds));
        setSavedMealPlans((local) => mergePlans('meal', data.mealPlans || [], local, stored.syncedIds));
        setServerReady(true);
      })
      .catch(() => {
        // Offline or the server failed: keep working from this browser's copy.
      });
    return () => { cancelled = true; };
  }, [stored.syncedIds, storageUserId]);

  // After the first load, save changed plans and delete removed ones. When a request
  // finishes, syncVersion changes and this runs again to send anything that changed meanwhile.
  useEffect(() => {
    if (!serverReady) return;
    const send = (id, request, onDone) => {
      if (inFlightRef.current.has(id)) return;
      inFlightRef.current.add(id);
      request()
        .then(() => {
          onDone();
          inFlightRef.current.delete(id);
          setSyncVersion((v) => v + 1);
        })
        .catch(() => {
          // Left unsynced and retried on the next change; never in a loop.
          inFlightRef.current.delete(id);
        });
    };
    [['training', savedPlans], ['meal', savedMealPlans]].forEach(([kind, plans]) => {
      const { upserts, removals } = planChanges(kind, plans, syncedRef.current);
      upserts.forEach(({ id, wire, json }) => send(id, () => saveSavedPlan(id, wire), () => syncedRef.current.set(id, { kind, json })));
      removals.forEach((id) => send(id, () => deleteSavedPlan(id), () => syncedRef.current.delete(id)));
    });
  }, [savedMealPlans, savedPlans, serverReady, syncVersion]);

  useEffect(() => {
    const onUpdated = (e) => {
      const workouts = Array.isArray(e.detail) ? e.detail : [];
      if (workouts.length > 0) {
        const nextPlan = createStoredPlan(workouts);
        setSavedPlans((prev) => [nextPlan, ...prev]);
        setActivePlanId(nextPlan.id);
      }
      setRecommendationsLoading(false);
    };
    const onLoading = () => setRecommendationsLoading(true);
    const onMealPlanUpdated = (e) => {
      const detail = e.detail;
      const nextPlan = normalizeStoredMealPlan(createStoredMealPlan(detail));
      if (nextPlan) {
        setSavedMealPlans((prev) => [nextPlan, ...prev.filter((plan) => plan.id !== nextPlan.id)]);
        setActiveMealPlanId(nextPlan.id);
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

  const deletePlan = useCallback((planId) => {
    setSavedPlans((prev) => {
      const nextPlans = prev.filter((plan) => plan.id !== planId);
      setActivePlanId((current) => (current === planId ? nextPlans[0]?.id ?? null : current));
      return nextPlans;
    });
  }, []);

  const deleteMealPlan = useCallback((planId) => {
    setSavedMealPlans((prev) => {
      const nextPlans = prev.filter((plan) => plan.id !== planId);
      setActiveMealPlanId((current) => (current === planId ? nextPlans[0]?.id ?? null : current));
      return nextPlans;
    });
  }, []);

  const getWorkoutState = useCallback((index) => ({
    loading: Boolean(completingItems[getCompletionKey('workout', activePlanId, index)]),
    completed: Boolean(activePlan?.workouts?.[index]?.completedRecordId),
  }), [activePlan, activePlanId, completingItems]);

  const getMealState = useCallback((index) => ({
    loading: Boolean(completingItems[getCompletionKey('meal', activeMealPlanId, index)]),
    completed: Boolean(activeMealPlan?.meals?.[index]?.completedRecordId),
  }), [activeMealPlan, activeMealPlanId, completingItems]);

  return {
    savedPlans,
    activePlanId,
    setActivePlanId,
    activePlan,
    deletePlan,
    savedMealPlans,
    activeMealPlanId,
    setActiveMealPlanId,
    activeMealPlan,
    deleteMealPlan,
    recommendationsLoading,
    mealPlansLoading,
    handleCompleteWorkout,
    handleCompleteMeal,
    getWorkoutState,
    getMealState,
  };
}
