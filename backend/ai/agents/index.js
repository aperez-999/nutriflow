import { runHeadCoachAgent } from './HeadCoachAgent.js';
import { runWorkoutPlannerAgent } from './WorkoutPlannerAgent.js';
import { runMealPlannerAgent } from './MealPlannerAgent.js';
import { runInsightsAgent } from './InsightsAgent.js';

/**
 * Agent registry — maps logical agent keys to their runner functions.
 *
 * Each runner has the signature:
 *   ({ message, context, history }) => Promise<AgentResult>
 *
 * where AgentResult is generally:
 *   { content, suggestions?, source?, type? }
 */
export const AGENTS = {
  coach: runHeadCoachAgent,
  workout_plan: runWorkoutPlannerAgent,
  meal_plan: runMealPlannerAgent,
  insights: runInsightsAgent,
};

