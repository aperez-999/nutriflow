// Calculate daily totals for selected date
export const getDailyTotals = (diets, selectedDate) => {
  const todaysDiets = diets.filter(diet => 
    diet.date && diet.date.split('T')[0] === selectedDate
  );
  
  return todaysDiets.reduce((totals, diet) => ({
    calories: totals.calories + (diet.calories || 0),
    protein: totals.protein + (diet.protein || 0),
    carbs: totals.carbs + (diet.carbs || 0),
    fats: totals.fats + (diet.fats || 0),
    count: totals.count + 1
  }), { calories: 0, protein: 0, carbs: 0, fats: 0, count: 0 });
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
