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
import { AGENTS } from '../agents/index.js';
import { verifyAgentResult } from '../agents/VerifierAgent.js';
import { formatWorkoutPlanForChat, formatMealPlanForChat } from '../utils/formatPlannerOutput.js';
import { formatInsightsForChat } from '../utils/formatInsightsOutput.js';
import { COACHING_ACTION_SUGGESTIONS } from '../../utils/aiUtils.js';

const INSIGHTS_SUGGESTIONS = ['Generate workout plan', 'Create meal plan'];

/** Supported intents. */
export const INTENT = {
  COACH: 'coach',
  WORKOUT_PLAN: 'workout_plan',
  MEAL_PLAN: 'meal_plan',
  ANALYZE_PROGRESS: 'analyze_progress',
  INSIGHTS: 'insights',
};

/**
 * Simple intent detection from the user message.
 * For backward compatibility, [[RETURN_JSON_WORKOUT_PLAN]] continues to be
 * handled by the HeadCoachAgent, since the frontend expects that format.
 * @param {string} message
 * @returns {string}
 */
function detectIntent(message) {
  const text = message || '';
  const m = text.toLowerCase();

  // Existing special token path handled by HeadCoachAgent.
  if (/\[\[RETURN_JSON_WORKOUT_PLAN\]\]/i.test(text)) {
    return INTENT.COACH;
  }

  if (m.includes('workout plan')) return INTENT.WORKOUT_PLAN;
  if (m.includes('meal plan')) return INTENT.MEAL_PLAN;
  if (
    m.includes('analyze my progress') ||
    m.includes('progress analysis') ||
    m.includes('how am i doing') ||
    m.includes('fitness insights')
  ) {
    return INTENT.INSIGHTS;
  }
  if (m.includes('analyze') && m.includes('progress')) return INTENT.INSIGHTS;

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

  let agentKey = 'coach';
  if (intent === INTENT.WORKOUT_PLAN) agentKey = 'workout_plan';
  if (intent === INTENT.MEAL_PLAN) agentKey = 'meal_plan';
  if (intent === INTENT.INSIGHTS) agentKey = 'insights';

  const agentRunner = AGENTS[agentKey] || runHeadCoachAgent;
  let result = await agentRunner({ message, context, history });

  // Run VerifierAgent for planner and insights outputs before formatting.
  if (
    result &&
    (result.type === 'workout_plan' || result.type === 'meal_plan' || result.type === 'insights')
  ) {
    result = verifyAgentResult(result);
  }

  // Normalize result to API shape { content, suggestions, source }.
  if (result && typeof result.content === 'string') {
    return {
      content: result.content,
      suggestions: result.suggestions || COACHING_ACTION_SUGGESTIONS,
      source: result.source || 'agent',
    };
  }

  if (result && result.type === 'workout_plan') {
    return {
      content: formatWorkoutPlanForChat(result),
      suggestions: COACHING_ACTION_SUGGESTIONS,
      source: result.source || 'agent',
    };
  }

  if (result && result.type === 'meal_plan') {
    return {
      content: formatMealPlanForChat(result),
      suggestions: COACHING_ACTION_SUGGESTIONS,
      source: result.source || 'agent',
    };
  }

  if (result && result.type === 'insights') {
    return {
      content: formatInsightsForChat(result),
      suggestions: INSIGHTS_SUGGESTIONS,
      source: result.source || 'agent',
    };
  }

  const payload = JSON.stringify(result ?? {}, null, 2);
  return {
    content: payload,
    suggestions: COACHING_ACTION_SUGGESTIONS,
    source: result?.source || 'agent',
  };
}
