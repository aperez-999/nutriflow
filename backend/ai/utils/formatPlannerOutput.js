/**
 * Format planner agent results as readable chat content.
 * Used by the orchestrator so the API still returns { content, suggestions, source }
 * with content as plain text instead of raw JSON.
 */

/**
 * @param {{ type: string, plan?: Array<{ day: string, exercises: string[] }> }} result
 * @returns {string}
 */
export function formatWorkoutPlanForChat(result) {
  if (!result || result.type !== 'workout_plan' || !Array.isArray(result.plan)) {
    return result?.rawContent || 'No workout plan generated.';
  }
  if (result.plan.length === 0) {
    return result.rawContent || 'No workout plan generated.';
  }

  const lines = ['Workout Plan', ''];

  for (const day of result.plan) {
    if (!day || !day.day) continue;
    const dayLabel = String(day.day).trim();
    const exercises = Array.isArray(day.exercises) ? day.exercises : [];
    lines.push(`${dayLabel}`);
    for (const ex of exercises) {
      const name = String(ex).trim();
      if (name) lines.push(`• ${name}`);
    }
    lines.push('');
  }

  return lines.join('\n').trim() || result.rawContent || 'No workout plan generated.';
}

/**
 * @param {{ type: string, meals?: Array<{ meal: string, food: string }>, calories?: number }} result
 * @returns {string}
 */
export function formatMealPlanForChat(result) {
  if (!result || result.type !== 'meal_plan' || !Array.isArray(result.meals)) {
    return result?.rawContent || 'No meal plan generated.';
  }
  if (result.meals.length === 0) {
    return result.rawContent || 'No meal plan generated.';
  }

  const lines = ['Daily Meal Plan', ''];

  if (typeof result.calories === 'number') {
    lines.push(`Target: ${result.calories} calories`, '');
  }

  for (const m of result.meals) {
    if (!m || (!m.meal && !m.food)) continue;
    const meal = String(m.meal || 'Meal').trim();
    const food = String(m.food || '').trim();
    lines.push(meal);
    lines.push(food || '—');
    lines.push('');
  }

  return lines.join('\n').trim() || result.rawContent || 'No meal plan generated.';
}
