import { toDayKey } from '../../../../utils/dateUtils';

// Calculate daily totals for selected date
export const getDailyTotals = (diets, selectedDate) => {
  const todaysDiets = diets.filter(diet => 
    diet.date && toDayKey(diet.date) === selectedDate
  );
  
  return todaysDiets.reduce((totals, diet) => ({
    calories: totals.calories + (diet.calories || 0),
    protein: totals.protein + (diet.protein || 0),
    carbs: totals.carbs + (diet.carbs || 0),
    fats: totals.fats + (diet.fats || 0),
    count: totals.count + 1
  }), { calories: 0, protein: 0, carbs: 0, fats: 0, count: 0 });
};
