import { toDayKey } from '../../../../utils/dateUtils';

// Calculate daily totals for selected date
export const getDailyTotals = (workouts, selectedDate) => {
  const todaysWorkouts = workouts.filter(workout => 
    workout.date && toDayKey(workout.date) === selectedDate
  );
  
  return todaysWorkouts.reduce((totals, workout) => ({
    duration: totals.duration + (workout.duration || 0),
    caloriesBurned: totals.caloriesBurned + (workout.caloriesBurned || 0),
    count: totals.count + 1
  }), { duration: 0, caloriesBurned: 0, count: 0 });
};

// Calculate calories per minute
export const calculateCaloriesPerMinute = (caloriesBurned, duration) => {
  if (caloriesBurned && duration) {
    return Math.round((caloriesBurned / duration) * 10) / 10;
  }
  return 0;
};
