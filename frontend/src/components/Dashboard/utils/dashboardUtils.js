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
  return Math.min((current / goal) * 100, 100);
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
