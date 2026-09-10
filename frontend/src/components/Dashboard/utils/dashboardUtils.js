// Progress Calculations
export const calculateDailyCalories = (diets) => {
  const today = new Date().toISOString().split('T')[0];
  const todaysDiets = diets.filter(diet => {
    const dietDate = new Date(diet.date).toISOString().split('T')[0];
    return dietDate === today;
  });
  return todaysDiets.reduce((sum, diet) => sum + (Number(diet.calories) || 0), 0);
};

export const calculateWeeklyWorkouts = (workouts) => {
  if (!Array.isArray(workouts)) {
    return 0;
  }
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return workouts.filter(workout => new Date(workout.date) >= weekAgo).length;
};

export const calculateProgress = (current, goal) => {
  if (!goal || goal === 0) return 0;
  return Math.min((current / goal) * 100, 100);
};

/** Calories per day for the last 7 days (for charts). Returns [{ dayName, date, calories }, ...]. */
export const getWeeklyCaloriesByDay = (diets) => {
  const result = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = dayNames[d.getDay()];
    const dayDiets = (diets || []).filter(
      (diet) => new Date(diet.date).toISOString().split('T')[0] === dateStr
    );
    const calories = dayDiets.reduce((sum, diet) => sum + (Number(diet.calories) || 0), 0);
    result.push({ dayName, date: dateStr, calories });
  }
  return result;
};

/** Average daily calories over the last 7 days (from diet entries). */
export const getWeeklyCaloriesAverage = (diets) => {
  if (!Array.isArray(diets) || diets.length === 0) return 0;
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const inWeek = diets.filter((d) => new Date(d.date) >= weekAgo);
  if (inWeek.length === 0) return 0;
  const total = inWeek.reduce((sum, d) => sum + (Number(d.calories) || 0), 0);
  const daysWithData = new Set(inWeek.map((d) => new Date(d.date).toISOString().split('T')[0])).size;
  return daysWithData > 0 ? Math.round(total / daysWithData) : 0;
};

/**
 * Consecutive days (including today) with at least one diet or workout log.
 * Counts backward from today until a day has no logs.
 */
export const getLoggingStreak = (diets, workouts) => {
  const datesWithLogs = new Set();
  (diets || []).forEach((d) => datesWithLogs.add(new Date(d.date).toISOString().split('T')[0]));
  (workouts || []).forEach((w) => datesWithLogs.add(new Date(w.date).toISOString().split('T')[0]));
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const dateStr = d.toISOString().split('T')[0];
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
    date: new Date(dietData.date).toISOString(),
  };
};

export const transformWorkoutData = (workoutData) => {
  return {
    ...workoutData,
    duration: Number(workoutData.duration),
    caloriesBurned: Number(workoutData.caloriesBurned),
    date: new Date(workoutData.date).toISOString(),
  };
};

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getDayKey = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const dateFromDayKey = (key) => {
  const [year, month, day] = String(key).split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getDaysAgo = (date, now = new Date()) => {
  const diff = startOfDay(now).getTime() - startOfDay(date).getTime();
  return Math.max(0, Math.round(diff / 86400000));
};

const getHoursAgo = (date, now = new Date()) => {
  return (now.getTime() - new Date(date).getTime()) / 3600000;
};

export const calculateDailyReadiness = (workouts = [], diets = []) => {
  const now = new Date();
  const sortedWorkouts = [...(workouts || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
  const recentWorkouts7d = sortedWorkouts.filter((workout) => workout?.date && getDaysAgo(workout.date, now) < 7);
  const recentWorkouts3d = sortedWorkouts.filter((workout) => workout?.date && getDaysAgo(workout.date, now) < 3);
  const latestWorkout = sortedWorkouts.find((workout) => workout?.date) || null;
  const latestWorkoutHours = latestWorkout ? getHoursAgo(latestWorkout.date, now) : null;
  const highLoadCount = recentWorkouts3d.filter((workout) => {
    const intensity = (workout.intensity || '').toLowerCase();
    return intensity === 'high' || toNumber(workout.duration) >= 75;
  }).length;

  const dailyNutrition = new Map();
  (diets || []).forEach((diet) => {
    if (!diet?.date) return;
    const key = getDayKey(diet.date);
    const current = dailyNutrition.get(key) || { calories: 0, protein: 0, meals: 0 };
    current.calories += toNumber(diet.calories);
    current.protein += toNumber(diet.protein);
    current.meals += 1;
    dailyNutrition.set(key, current);
  });

  const today = dailyNutrition.get(getDayKey(now)) || { calories: 0, protein: 0, meals: 0 };
  const recentNutritionDays = Array.from(dailyNutrition.entries())
    .filter(([key]) => getDaysAgo(dateFromDayKey(key), now) < 3)
    .map(([, value]) => value);
  const averageCalories = recentNutritionDays.length
    ? Math.round(recentNutritionDays.reduce((sum, day) => sum + toNumber(day.calories), 0) / recentNutritionDays.length)
    : 0;
  const averageProtein = recentNutritionDays.length
    ? Math.round(recentNutritionDays.reduce((sum, day) => sum + toNumber(day.protein), 0) / recentNutritionDays.length)
    : 0;

  let recoveryScore = latestWorkout ? 0 : 18;
  if (latestWorkoutHours !== null) {
    if (latestWorkoutHours < 12) recoveryScore = 6;
    else if (latestWorkoutHours < 24) recoveryScore = 11;
    else if (latestWorkoutHours < 48) recoveryScore = 17;
    else if (latestWorkoutHours < 72) recoveryScore = 22;
    else recoveryScore = 20;
  }
  recoveryScore += recentWorkouts3d.length === 0 ? 2 : recentWorkouts3d.length === 1 ? 5 : recentWorkouts3d.length === 2 ? 2 : -3;
  recoveryScore -= highLoadCount * 4;
  recoveryScore = clamp(recoveryScore, 0, 30);

  let nutritionScore = 0;
  if (today.meals >= 3) nutritionScore += 16;
  else if (today.meals === 2) nutritionScore += 13;
  else if (today.meals === 1) nutritionScore += 9;
  else nutritionScore += 4;

  if (averageCalories >= 1800 && averageCalories <= 2800) nutritionScore += 14;
  else if (averageCalories >= 1500) nutritionScore += 10;
  else if (averageCalories > 0) nutritionScore += 6;
  else nutritionScore += 5;

  if (averageProtein >= 110) nutritionScore += 10;
  else if (averageProtein >= 80) nutritionScore += 8;
  else if (averageProtein > 0) nutritionScore += 5;
  else nutritionScore += 3;
  nutritionScore = clamp(nutritionScore, 0, 40);

  const loggingStreak = getLoggingStreak(diets, workouts);
  let activityScore = 0;
  if (recentWorkouts7d.length >= 2 && recentWorkouts7d.length <= 5) activityScore += 18;
  else if (recentWorkouts7d.length === 1 || recentWorkouts7d.length === 6) activityScore += 14;
  else if (recentWorkouts7d.length > 6) activityScore += 10;
  else activityScore += 9;

  if (loggingStreak >= 5) activityScore += 12;
  else if (loggingStreak >= 3) activityScore += 9;
  else if (loggingStreak >= 1) activityScore += 6;
  else activityScore += 2;
  activityScore = clamp(activityScore, 0, 30);

  const score = clamp(Math.round(recoveryScore + nutritionScore + activityScore), 0, 100);
  const level = score >= 75 ? 'high' : score >= 45 ? 'moderate' : 'low';

  const recommendations = [];
  if (score >= 75) {
    recommendations.push('You are in a strong position for a quality workout today.');
  } else if (score >= 45) {
    recommendations.push('A moderate session is a good fit today if you fuel first.');
  } else {
    recommendations.push('Consider recovery work or a lighter session today.');
  }
  if (today.meals === 0) {
    recommendations.push('Log a meal or snack before training to improve energy availability.');
  } else if (averageCalories > 0 && averageCalories < 1600) {
    recommendations.push('Your recent intake looks low, so prioritize fueling today.');
  }
  if (averageProtein > 0 && averageProtein < 90) {
    recommendations.push('Add more protein today to support recovery.');
  }
  if (latestWorkoutHours !== null && latestWorkoutHours < 24 && highLoadCount > 0) {
    recommendations.push('Keep intensity in check if you still feel fatigue from recent hard training.');
  }
  if (recentWorkouts7d.length === 0) {
    recommendations.push('A short session is a good way to rebuild momentum.');
  }

  return {
    score,
    level,
    shortRecommendation: recommendations[0] || 'Use your current logs to guide training intensity today.',
    recommendations: recommendations.slice(0, 3),
    factors: {
      averageCalories,
      averageProtein,
      loggingStreak,
      todayMeals: today.meals,
      workoutsLast7Days: recentWorkouts7d.length,
    },
  };
};
