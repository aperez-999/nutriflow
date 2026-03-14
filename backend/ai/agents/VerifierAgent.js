/**
 * VerifierAgent — validates and lightly normalizes AI-generated plans.
 *
 * This is intentionally conservative: it does not make additional LLM calls.
 * Instead it checks for obviously unreasonable values and ensures shapes are
 * at least structurally sound before returning them to callers.
 */

/**
 * @param {{ type?: string, plan?: any, meals?: any, calories?: number }} result
 * @returns {{ type?: string, plan?: any, meals?: any, calories?: number }}
 */
export function verifyAgentResult(result) {
  if (!result || typeof result !== 'object') return result;

  // Workout plan checks
  if (result.type === 'workout_plan' && Array.isArray(result.plan)) {
    const sanitizedPlan = result.plan
      .filter((day) => day && typeof day.day === 'string')
      .map((day) => ({
        day: String(day.day).slice(0, 80),
        exercises: Array.isArray(day.exercises)
          ? day.exercises.map((ex) => String(ex).slice(0, 120))
          : [],
      }))
      .slice(0, 14); // Max ~2 weeks of entries

    return { ...result, plan: sanitizedPlan };
  }

  // Meal plan checks
  if (result.type === 'meal_plan' && Array.isArray(result.meals)) {
    let { calories } = result;
    if (typeof calories === 'number') {
      if (calories < 800) calories = 800;
      if (calories > 4000) calories = 4000;
    }

    const meals = result.meals
      .filter((m) => m && (m.meal || m.food))
      .map((m) => ({
        meal: String(m.meal || 'Meal').slice(0, 60),
        food: String(m.food || '').slice(0, 200),
      }))
      .slice(0, 6);

    return { ...result, calories, meals };
  }

  return result;
}

