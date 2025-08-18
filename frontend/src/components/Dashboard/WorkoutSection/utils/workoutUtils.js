// Calculate daily totals for selected date
export const getDailyTotals = (workouts, selectedDate) => {
  const todaysWorkouts = workouts.filter(workout => 
    workout.date && workout.date.split('T')[0] === selectedDate
  );
  
  return todaysWorkouts.reduce((totals, workout) => ({
    duration: totals.duration + (workout.duration || 0),
    caloriesBurned: totals.caloriesBurned + (workout.caloriesBurned || 0),
    count: totals.count + 1
  }), { duration: 0, caloriesBurned: 0, count: 0 });
};

// Date navigation functions
export const getNavigationDates = (selectedDate) => {
  const getPreviousDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    return currentDate.toISOString().split('T')[0];
  };

  const getNextDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    return currentDate.toISOString().split('T')[0];
  };

  const getToday = () => {
    return new Date().toISOString().split('T')[0];
  };

  return {
    getPreviousDay,
    getNextDay,
    getToday
  };
};

// Format date for display
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return {
    full: date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    }),
    year: date.getFullYear()
  };
};

// Get workout type color
export const getWorkoutTypeColor = (type) => {
  switch (type) {
    case 'Cardio': return 'red';
    case 'Strength': return 'blue';
    case 'Flexibility': return 'green';
    case 'Sports': return 'purple';
    default: return 'gray';
  }
};

// Get workout type icon
export const getWorkoutTypeIcon = (type) => {
  switch (type) {
    case 'Cardio': return 'FiHeart';
    case 'Strength': return 'FiActivity';
    case 'Flexibility': return 'FiTarget';
    case 'Sports': return 'FiTrendingUp';
    default: return 'FiActivity';
  }
};

// Calculate calories per minute
export const calculateCaloriesPerMinute = (caloriesBurned, duration) => {
  if (caloriesBurned && duration) {
    return Math.round((caloriesBurned / duration) * 10) / 10;
  }
  return 0;
};
