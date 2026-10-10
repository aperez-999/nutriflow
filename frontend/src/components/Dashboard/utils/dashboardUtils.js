import { calculateReadinessScore } from '@shared/readinessScore';
import { getTodayDayKey, parseDayKey, shiftDayKey, toDayKey, toStoredIsoFromDayKey } from '../../../utils/dateUtils';

// Progress Calculations
const sumToday = (diets, field) => {
  if (!Array.isArray(diets) || diets.length === 0) {
    return 0;
  }
  const today = getTodayDayKey();
  return diets.reduce((sum, diet) => {
    if (toDayKey(diet.date) !== today) return sum;
    return sum + (Number(diet[field]) || 0);
  }, 0);
};

export const calculateDailyCalories = (diets) => sumToday(diets, 'calories');

export const calculateDailyProtein = (diets) => sumToday(diets, 'protein');

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

/**
 * Rhythm: which of the three flows (fuel = meal, train = workout, recover = check-in)
 * were logged on each day of the last `weeks` weeks, aligned to Monday-start columns.
 *
 * The rhythm streak is deliberately forgiving: a single missed day is a grace day,
 * two missed days in a row end it. Today does not break the streak until it is over.
 */
export const getRhythm = (diets = [], workouts = [], checkIns = [], weeks = 12) => {
  const flowsByDay = new Map();
  const mark = (key, flow) => {
    const entry = flowsByDay.get(key) || { fuel: false, train: false, recover: false };
    entry[flow] = true;
    flowsByDay.set(key, entry);
  };
  diets.forEach((d) => d?.date && mark(toDayKey(d.date), 'fuel'));
  workouts.forEach((w) => w?.date && mark(toDayKey(w.date), 'train'));
  checkIns.forEach((c) => c?.dayKey && mark(c.dayKey, 'recover'));

  const today = getTodayDayKey();
  const mondayOffset = (parseDayKey(today).getDay() + 6) % 7;
  const start = shiftDayKey(today, -(mondayOffset + (weeks - 1) * 7));
  const columns = [];
  for (let w = 0; w < weeks; w++) {
    const column = [];
    for (let d = 0; d < 7; d++) {
      const dayKey = shiftDayKey(start, w * 7 + d);
      const flows = flowsByDay.get(dayKey) || { fuel: false, train: false, recover: false };
      const count = Number(flows.fuel) + Number(flows.train) + Number(flows.recover);
      column.push({ dayKey, flows, count, isFuture: dayKey > today });
    }
    columns.push(column);
  }

  const isActive = (key) => flowsByDay.has(key);
  let activeDays28 = 0;
  for (let i = 0; i < 28; i++) if (isActive(shiftDayKey(today, -i))) activeDays28++;

  let streak = 0;
  let cursor = isActive(today) ? today : shiftDayKey(today, -1);
  let missedInRow = 0;
  for (let i = 0; i < 365; i++) {
    if (isActive(cursor)) {
      streak++;
      missedInRow = 0;
    } else if (++missedInRow >= 2 || streak === 0) {
      break;
    }
    cursor = shiftDayKey(cursor, -1);
  }

  return { columns, activeDays28, streak };
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

/** True once the user has sent at least one message to the coach (chat threads are stored per user). */
export const hasAskedCoach = (userId) => {
  try {
    const raw = window.localStorage.getItem(`nutriflow.fitnessHub.chatThreads.${userId}`);
    const conversations = raw ? JSON.parse(raw)?.conversations : [];
    return Array.isArray(conversations)
      && conversations.some((c) => Array.isArray(c?.messages) && c.messages.some((m) => m?.type === 'user'));
  } catch {
    return false;
  }
};
