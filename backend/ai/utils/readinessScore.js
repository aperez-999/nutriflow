function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dayKey(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateFromDayKey(key) {
  const [year, month, day] = String(key).split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getDaysAgo(date, now) {
  const diff = startOfDay(now).getTime() - startOfDay(date).getTime();
  return Math.max(0, Math.round(diff / 86400000));
}

function getHoursAgo(date, now) {
  return (now.getTime() - new Date(date).getTime()) / 3600000;
}

function getDailyNutrition(diets = [], now = new Date()) {
  const todayKey = dayKey(now);
  const dailyMap = new Map();

  for (const diet of diets) {
    if (!diet?.date) continue;
    const key = dayKey(diet.date);
    const current = dailyMap.get(key) || { calories: 0, protein: 0, meals: 0 };
    current.calories += toNumber(diet.calories);
    current.protein += toNumber(diet.protein);
    current.meals += 1;
    dailyMap.set(key, current);
  }

  return {
    dailyMap,
    today: dailyMap.get(todayKey) || { calories: 0, protein: 0, meals: 0 },
  };
}

function getLoggingStreak(diets = [], workouts = [], now = new Date()) {
  const loggedDays = new Set();
  diets.forEach((diet) => diet?.date && loggedDays.add(dayKey(diet.date)));
  workouts.forEach((workout) => workout?.date && loggedDays.add(dayKey(workout.date)));

  let streak = 0;
  const cursor = startOfDay(now);
  for (let i = 0; i < 30; i += 1) {
    const key = dayKey(cursor);
    if (!loggedDays.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function getRecentWindowItems(items = [], days, now = new Date()) {
  return items.filter((item) => item?.date && getDaysAgo(item.date, now) < days);
}

function getWorkoutLoadSnapshot(workouts = [], now = new Date()) {
  const workouts7d = getRecentWindowItems(workouts, 7, now);
  const workouts3d = getRecentWindowItems(workouts, 3, now);
  const latestWorkout = workouts
    .filter((workout) => workout?.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0] || null;

  const highLoadCount = workouts3d.filter((workout) => {
    const intensity = (workout.intensity || '').toLowerCase();
    const duration = toNumber(workout.duration);
    return intensity === 'high' || duration >= 75;
  }).length;

  return {
    latestWorkout,
    workouts7d,
    workouts3d,
    highLoadCount,
  };
}

function buildRecommendationBundle({
  score,
  level,
  todayMeals,
  averageCalories,
  averageProtein,
  latestWorkoutHours,
  highLoadCount,
  workouts7d,
  loggingStreak,
}) {
  const recommendations = [];

  if (score >= 75) {
    recommendations.push('You look ready for a normal or challenging session today.');
  } else if (score >= 45) {
    recommendations.push('A moderate workout makes sense today, especially if you fuel before training.');
  } else {
    recommendations.push('Lean toward recovery work or a lighter session unless your energy feels better later.');
  }

  if (todayMeals === 0) {
    recommendations.push('Log a meal or snack before training so you are not going in under-fueled.');
  } else if (averageCalories > 0 && averageCalories < 1600) {
    recommendations.push('Your recent calorie intake is on the low side, so prioritize eating enough today.');
  }

  if (averageProtein > 0 && averageProtein < 90) {
    recommendations.push('Add a higher-protein meal to support recovery and training quality.');
  }

  if (latestWorkoutHours !== null && latestWorkoutHours < 24 && highLoadCount > 0) {
    recommendations.push('Because you trained hard recently, keep intensity in check if you still feel sore.');
  }

  if (workouts7d === 0) {
    recommendations.push('A short session is a good way to rebuild momentum if you want to train today.');
  }

  if (loggingStreak <= 1) {
    recommendations.push('Consistent logging will make this score more accurate over time.');
  }

  const uniqueRecommendations = recommendations.filter(
    (text, index) => recommendations.indexOf(text) === index
  );

  const shortRecommendation =
    uniqueRecommendations[0] ||
    (level === 'high'
      ? 'You are in a strong position to train today.'
      : 'Use today’s logs and energy levels to guide session intensity.');

  return {
    shortRecommendation,
    recommendations: uniqueRecommendations.slice(0, 3),
  };
}

export function calculateReadinessScore({ workouts = [], diets = [], now = new Date() } = {}) {
  const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date));
  const sortedDiets = [...diets].sort((a, b) => new Date(b.date) - new Date(a.date));
  const { latestWorkout, workouts7d, workouts3d, highLoadCount } = getWorkoutLoadSnapshot(sortedWorkouts, now);
  const { dailyMap, today } = getDailyNutrition(sortedDiets, now);
  const loggingStreak = getLoggingStreak(sortedDiets, sortedWorkouts, now);

  const recentNutritionDays = Array.from(dailyMap.entries())
    .filter(([key]) => getDaysAgo(dateFromDayKey(key), now) < 3)
    .map(([, value]) => value);

  const averageCalories = recentNutritionDays.length
    ? Math.round(
        recentNutritionDays.reduce((sum, day) => sum + toNumber(day.calories), 0) / recentNutritionDays.length
      )
    : 0;
  const averageProtein = recentNutritionDays.length
    ? Math.round(
        recentNutritionDays.reduce((sum, day) => sum + toNumber(day.protein), 0) / recentNutritionDays.length
      )
    : 0;

  const latestWorkoutHours = latestWorkout ? getHoursAgo(latestWorkout.date, now) : null;

  let recoveryScore = latestWorkout ? 0 : 18;
  if (latestWorkoutHours !== null) {
    if (latestWorkoutHours < 12) recoveryScore = 6;
    else if (latestWorkoutHours < 24) recoveryScore = 11;
    else if (latestWorkoutHours < 48) recoveryScore = 17;
    else if (latestWorkoutHours < 72) recoveryScore = 22;
    else recoveryScore = 20;
  }
  recoveryScore += workouts3d.length === 0 ? 2 : workouts3d.length === 1 ? 5 : workouts3d.length === 2 ? 2 : -3;
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

  let activityScore = 0;
  if (workouts7d.length >= 2 && workouts7d.length <= 5) activityScore += 18;
  else if (workouts7d.length === 1 || workouts7d.length === 6) activityScore += 14;
  else if (workouts7d.length > 6) activityScore += 10;
  else activityScore += 9;

  if (loggingStreak >= 5) activityScore += 12;
  else if (loggingStreak >= 3) activityScore += 9;
  else if (loggingStreak >= 1) activityScore += 6;
  else activityScore += 2;
  activityScore = clamp(activityScore, 0, 30);

  const score = clamp(Math.round(recoveryScore + nutritionScore + activityScore), 0, 100);
  const level = score >= 75 ? 'high' : score >= 45 ? 'moderate' : 'low';
  const { shortRecommendation, recommendations } = buildRecommendationBundle({
    score,
    level,
    todayMeals: today.meals,
    averageCalories,
    averageProtein,
    latestWorkoutHours,
    highLoadCount,
    workouts7d: workouts7d.length,
    loggingStreak,
  });

  return {
    score,
    level,
    shortRecommendation,
    recommendations,
    factors: {
      recoveryScore,
      nutritionScore,
      activityScore,
      latestWorkoutHours: latestWorkoutHours === null ? null : Math.round(latestWorkoutHours),
      workoutsLast7Days: workouts7d.length,
      workoutsLast3Days: workouts3d.length,
      highLoadCount,
      todayMeals: today.meals,
      todayCalories: today.calories,
      averageCalories,
      averageProtein,
      loggingStreak,
    },
  };
}
