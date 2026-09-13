import { calculateReadinessScore } from '@shared/readinessScore';
import { getTodayDayKey, parseDayKey, toDayKey, toStoredIsoFromDayKey } from '../../../utils/dateUtils';

// Progress Calculations
export const calculateDailyCalories = (diets) => {
  if (!Array.isArray(diets) || diets.length === 0) {
    return 0;
  }
  const today = getTodayDayKey();
  return diets.reduce((sum, diet) => {
    if (toDayKey(diet.date) !== today) return sum;
    return sum + (Number(diet.calories) || 0);
  }, 0);
};

export const calculateWeeklyWorkouts = (workouts) => {
  if (!Array.isArray(workouts)) {
    return 0;
  }
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return workouts.reduce((count, workout) => (
    new Date(workout.date) >= weekAgo ? count + 1 : count
  ), 0);
};

export const calculateProgress = (current, goal) => {
  if (!goal || goal === 0) return 0;
  return Math.min((current / goal) * 100, 100);
};

/** Calories per day for the last 7 days (for charts). Returns [{ dayName, date, calories }, ...]. */
export const getWeeklyCaloriesByDay = (diets) => {
  const caloriesByDay = new Map();
  for (const diet of diets || []) {
    const dayKey = toDayKey(diet.date);
    caloriesByDay.set(dayKey, (caloriesByDay.get(dayKey) || 0) + (Number(diet.calories) || 0));
  }

  const result = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = toDayKey(d);
    const dayName = dayNames[parseDayKey(dateStr).getDay()];
    result.push({ dayName, date: dateStr, calories: caloriesByDay.get(dateStr) || 0 });
  }
  return result;
};

/** Average daily calories over the last 7 days (from diet entries). */
export const getWeeklyCaloriesAverage = (diets) => {
  if (!Array.isArray(diets) || diets.length === 0) return 0;
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  let total = 0;
  const daysWithData = new Set();
  for (const diet of diets) {
    if (new Date(diet.date) < weekAgo) continue;
    total += Number(diet.calories) || 0;
    daysWithData.add(toDayKey(diet.date));
  }
  return daysWithData.size > 0 ? Math.round(total / daysWithData.size) : 0;
};

/**
 * Consecutive days (including today) with at least one diet or workout log.
 * Counts backward from today until a day has no logs.
 */
export const getLoggingStreak = (diets, workouts) => {
  const datesWithLogs = new Set();
  (diets || []).forEach((d) => datesWithLogs.add(toDayKey(d.date)));
  (workouts || []).forEach((w) => datesWithLogs.add(toDayKey(w.date)));
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const dateStr = toDayKey(d);
    if (datesWithLogs.has(dateStr)) streak++;
    else break;
    d.setDate(d.getDate() - 1);
  }
  return streak;
};

/** Mixed recent activity: diets and workouts sorted by date desc, with type. */
export const getRecentActivity = (diets, workouts, limit = 8) => {
  const dietItems = (diets || []).map((d) => ({
    id: d._id,
    type: 'diet',
    date: new Date(d.date),
    label: d.foodName || 'Meal',
    sub: d.mealType,
    value: `${d.calories} cal`,
  }));
  const workoutItems = (workouts || []).map((w) => ({
    id: w._id,
    type: 'workout',
    date: new Date(w.date),
    label: w.workoutName || w.type || 'Workout',
    sub: `${w.duration} min`,
    value: w.caloriesBurned ? `${w.caloriesBurned} cal` : null,
  }));
  const combined = [...dietItems, ...workoutItems]
    .sort((a, b) => b.date - a.date)
    .slice(0, limit);
  return combined;
};

// Error Handling
export const handleApiError = (error, toast, action) => {
  toast({
    title: `Error ${action}`,
    description: error.message,
    status: 'error',
    duration: 2000,
  });
};

export const handleApiSuccess = (toast, message) => {
  toast({
    title: message,
    status: 'success',
    duration: 2000,
  });
};

// Data Transformation
export const transformDietData = (dietData) => {
  return {
    ...dietData,
    calories: Number(dietData.calories),
    protein: Number(dietData.protein),
    date: toStoredIsoFromDayKey(dietData.date),
  };
};

export const transformWorkoutData = (workoutData) => {
  return {
    ...workoutData,
    duration: Number(workoutData.duration),
    caloriesBurned: Number(workoutData.caloriesBurned),
    date: toStoredIsoFromDayKey(workoutData.date),
  };
};

/** Readiness uses the same scoring as the AI agents (shared/readinessScore.js). */
export const calculateDailyReadiness = (workouts = [], diets = [], checkIn = null) =>
  calculateReadinessScore({ workouts, diets, checkIn });

export const getDailyActionPlan = (readiness, dailyCalories = 0, dailyCalorieGoal = 0) => {
  const score = Number(readiness?.score) || 0;
  const factors = readiness?.factors || {};
  const averageProtein = Number(factors.averageProtein) || 0;
  const averageCalories = Number(factors.averageCalories) || 0;
  const todayMeals = Number(factors.todayMeals) || 0;
  const workoutsLast7Days = Number(factors.workoutsLast7Days) || 0;

  let workoutIntensity = 'Moderate';
  let workoutDetail = 'Keep today focused on quality reps, steady pacing, and leaving a little in reserve.';

  if (score >= 75) {
    workoutIntensity = 'High';
    workoutDetail = 'A harder session is a good fit today. Push your main lifts or intervals, then stop before form slips.';
  } else if (score < 45) {
    workoutIntensity = 'Low';
    workoutDetail = 'Use today for light movement, mobility, or an easy walk so recovery keeps moving forward.';
  }

  let nutritionSuggestion = 'Keep meals balanced today with protein, carbs, and enough total intake to support training quality.';
  if (todayMeals === 0) {
    nutritionSuggestion = 'Eat before your main session today. A simple meal with protein and carbs will improve energy and output.';
  } else if (averageProtein > 0 && averageProtein < 90) {
    nutritionSuggestion = 'Anchor your next meal around 25-35g of protein to support recovery and make the day more productive.';
  } else if (dailyCalorieGoal > 0 && dailyCalories < dailyCalorieGoal * 0.7) {
    nutritionSuggestion = 'You are still light on calories today, so use the next meal to close the gap with a more substantial option.';
  } else if (averageCalories > 0 && averageCalories < 1600) {
    nutritionSuggestion = 'Recent intake looks low, so prioritize a more complete meal instead of another light snack.';
  }

  let recoverySuggestion = 'Protect recovery with hydration, a short walk after training, and a consistent bedtime tonight.';
  if (score < 45) {
    recoverySuggestion = 'Bias toward recovery today: easy movement, extra fluids, and a slightly earlier night will pay off quickly.';
  } else if (workoutsLast7Days >= 5) {
    recoverySuggestion = 'You have logged a solid week of work, so add cooldown time and keep sleep non-negotiable tonight.';
  } else if (score >= 75) {
    recoverySuggestion = 'You have room to train well today, but keep the cooldown and post-workout hydration in place so tomorrow stays strong.';
  }

  return {
    workoutIntensity,
    workoutDetail,
    nutritionSuggestion,
    recoverySuggestion,
  };
};
