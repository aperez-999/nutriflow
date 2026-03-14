/**
 * InsightsAgent — analyzes user workout and diet data and produces
 * actionable insights about habits, trends, and improvements.
 *
 * Uses get_user_stats(userId) when context.userId is available.
 * Applies rule-based logic; no LLM call. Returns structured insights
 * for formatting and display in chat.
 */

import { get_user_stats } from '../tools/get_user_stats.js';

/** Start of current week (Sunday 00:00) for "this week" counts. */
function getWeekStart() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day;
  const weekStart = new Date(d);
  weekStart.setDate(diff);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

/**
 * @param {{ message?: string, context?: { userId?: string }, history?: Array }} params
 * @returns {Promise<{ type: 'insights', insights: string[], source: string }>}
 */
export async function runInsightsAgent({ message, context = {}, history = [] }) {
  let stats = { recentWorkouts: [], recentDiets: [], userName: 'User' };
  if (context.userId) {
    try {
      stats = await get_user_stats(context.userId);
    } catch (err) {
      console.error('InsightsAgent get_user_stats error:', err);
    }
  }

  const recentWorkouts = stats.recentWorkouts || [];
  const recentDiets = stats.recentDiets || [];
  const weekStart = getWeekStart();

  const workoutsThisWeek = recentWorkouts.filter((w) => new Date(w.date) >= weekStart).length;
  const workoutsTotal = recentWorkouts.length;
  const dietEntries = recentDiets.length;

  let totalCalories = 0;
  let calorieCount = 0;
  for (const d of recentDiets) {
    if (typeof d.calories === 'number') {
      totalCalories += d.calories;
      calorieCount += 1;
    }
  }
  const averageCalories = calorieCount > 0 ? Math.round(totalCalories / calorieCount) : 0;

  const workoutTypes = {};
  for (const w of recentWorkouts) {
    const t = (w.type || 'Other').toLowerCase();
    workoutTypes[t] = (workoutTypes[t] || 0) + 1;
  }
  const cardioCount = (workoutTypes.cardio || 0);
  const strengthCount = (workoutTypes.strength || 0);

  const insights = [];

  if (workoutsThisWeek <= 1 && workoutsTotal > 0) {
    insights.push("You're training only once per week. Try aiming for 3–4 sessions.");
  }
  if (workoutsTotal === 0) {
    insights.push("No workouts logged yet. Start with 2–3 sessions per week and build from there.");
  }

  if (dietEntries > 0 && averageCalories > 0) {
    if (averageCalories < 1500) {
      insights.push("Your calorie intake is very low for your activity level.");
    } else if (averageCalories > 3500) {
      insights.push("Your average intake is quite high. Consider balancing with your goals.");
    }
  }

  if (workoutsTotal >= 2 && cardioCount > strengthCount) {
    insights.push("Most of your workouts are cardio. Add resistance training for balance.");
  }
  if (workoutsTotal >= 2 && strengthCount > 0 && cardioCount === 0) {
    insights.push("Adding 1–2 cardio sessions per week can improve endurance.");
  }

  if (dietEntries < 3 && dietEntries > 0) {
    insights.push("You log meals inconsistently. Logging daily helps spot patterns.");
  }
  if (dietEntries === 0) {
    insights.push("No meals logged yet. Logging food helps you hit your nutrition goals.");
  }

  if (insights.length === 0) {
    insights.push("Keep logging workouts and meals to get personalized insights.");
  }

  console.log('Insights generated:', insights);

  return {
    type: 'insights',
    insights,
    source: 'insights',
  };
}
