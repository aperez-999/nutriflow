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
