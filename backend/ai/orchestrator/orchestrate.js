/**
 * AI Orchestrator — entry point for the AI layer.
 *
 * Receives the user message and context, detects intent (coach, workout_plan, meal_plan),
 * and routes to the appropriate agent. Phase 1 supports only "coach" intent; other
 * intents can be added in later phases (MealPlannerAgent, WorkoutPlannerAgent).
 *
 * Return format matches the current API: { content, suggestions, source } so that
 * the existing frontend (AIFitnessChat, chat history, JSON workout plan parsing)
 * continues to work without changes.
 */

import { runHeadCoachAgent } from '../agents/HeadCoachAgent.js';

/** Supported intents. Phase 1 only uses COACH. */
export const INTENT = {
  COACH: 'coach',
  WORKOUT_PLAN: 'workout_plan',
  MEAL_PLAN: 'meal_plan',
};

/**
 * Simple intent detection from the user message.
 * Phase 1: everything routes to coach. Later phases can route workout_plan / meal_plan to dedicated agents.
 * @param {string} message
 * @returns {string}
 */
function detectIntent(message) {
  const m = (message || '').toLowerCase();
  // Future: if (m.includes('meal plan') || m.includes('meal plan')) return INTENT.MEAL_PLAN;
  // Future: if (m.includes('workout plan') && /\[\[RETURN_JSON_WORKOUT_PLAN\]\]/.test(message)) return INTENT.WORKOUT_PLAN;
  return INTENT.COACH;
}

/**
 * Orchestrates the AI request: detects intent and runs the corresponding agent.
 * @param {Object} params
 * @param {string} params.message - User message.
 * @param {Object} [params.context] - { recentWorkouts, recentDiets, userName } (optional, from client).
 * @param {Array<{ type: string, content: string }>} [params.history] - Previous chat messages.
 * @returns {Promise<{ content: string, suggestions: string[], source: string }>}
 */
export async function orchestrateAI({ message, context = {}, history = [] }) {
  const intent = detectIntent(message);

  if (intent === INTENT.COACH) {
    return runHeadCoachAgent({ message, context, history });
  }

  // Phase 2+: workout_plan → WorkoutPlannerAgent, meal_plan → MealPlannerAgent
  // Fallback to coach for any unrecognized or not-yet-implemented intent
  return runHeadCoachAgent({ message, context, history });
}
