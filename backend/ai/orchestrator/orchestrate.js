/**
 * AI Orchestrator — entry point for the AI layer.
 *
 * Detects the intent of the user's message (coach, workout_plan, meal_plan, readiness,
 * insights) and runs the matching agent from the registry in agents/index.js.
 *
 * Always returns the chat contract { content, suggestions, source }.
 */

import { runHeadCoachAgent } from '../agents/HeadCoachAgent.js';
import { AGENTS } from '../agents/index.js';
import { verifyAgentResult } from '../agents/VerifierAgent.js';
import { formatWorkoutPlanForChat, formatMealPlanForChat } from '../utils/formatPlannerOutput.js';
import { formatInsightsForChat } from '../utils/formatInsightsOutput.js';
import { narrateFacts } from '../utils/narrateFacts.js';
import { followUpsFor } from '../utils/followUps.js';


/** Supported intents. */
const INTENT = {
  COACH: 'coach',
  WORKOUT_PLAN: 'workout_plan',
  MEAL_PLAN: 'meal_plan',
  ANALYZE_PROGRESS: 'analyze_progress',
  INSIGHTS: 'insights',
  READINESS: 'readiness',
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
  const m = text.toLowerCase().trim();

  // Existing special token path handled by HeadCoachAgent.
  if (/\[\[RETURN_JSON_WORKOUT_PLAN\]\]/i.test(text)) {
    return INTENT.COACH;
  }

  if (!m) return INTENT.COACH;
  if (/^(hi|hello|hey|yo|good (morning|afternoon|evening)|what'?s up)\b/.test(m)) return INTENT.COACH;
  if (m.includes('build muscle') || m.includes('gain muscle') || m.includes('muscle') || m.includes('hypertrophy') || m.includes('bulk')) {
    return INTENT.COACH;
  }

  if (m.includes('workout plan')) return INTENT.WORKOUT_PLAN;
  if (m.includes('meal plan')) return INTENT.MEAL_PLAN;
  if (
    m.includes('readiness score') ||
    m.includes('how ready am i') ||
    m.includes('how ready i am') ||
    m.includes('am i ready') ||
    m.includes('should i train today') ||
    m.includes('can i train today') ||
    m.includes('ready to train') ||
    // "Why is today a recovery day?" from the Coach page asks about the verdict itself.
    /why is today an? (push|steady|recovery) day/.test(m)
  ) {
    return INTENT.READINESS;
  }
  if (
    m.includes('analyze my progress') ||
    m.includes('progress analysis') ||
    m.includes('how am i doing') ||
    m.includes('how is my week going') ||
    m.includes('fitness insights')
  ) {
    return INTENT.INSIGHTS;
  }
  if (m.includes('analyze') && m.includes('progress')) return INTENT.INSIGHTS;

  return INTENT.COACH;
}

/**
 * Readiness and insights are computed by rules, so their wording never changes.
 * The model answers the user's question from those computed facts; if no
 * provider is reachable, the rule-based text is returned as before.
 */
async function withNarration(response, { message, history }) {
  try {
    const narrated = await narrateFacts({ message, facts: response.content, history });
    return narrated.content ? { ...response, ...narrated } : response;
  } catch (err) {
    console.error('narrateFacts provider error:', err.message);
    return response;
  }
}

/** Runs the agent for an intent and normalizes its result to { content, source }. */
async function runAgent(intent, { message, context, history }) {
  if (intent === INTENT.COACH) {
    const { content, source } = await runHeadCoachAgent({ message, context, history });
    return { content, source };
  }

  let agentKey = 'coach';
  if (intent === INTENT.WORKOUT_PLAN) agentKey = 'workout_plan';
  if (intent === INTENT.MEAL_PLAN) agentKey = 'meal_plan';
  if (intent === INTENT.INSIGHTS) agentKey = 'insights';
  if (intent === INTENT.READINESS) agentKey = 'readiness';

  const agentRunner = AGENTS[agentKey] || runHeadCoachAgent;
  let result = await agentRunner({ message, context, history });

  // Run VerifierAgent for planner and insights outputs before formatting.
  if (
    result &&
    (result.type === 'workout_plan' || result.type === 'meal_plan' || result.type === 'insights')
  ) {
    result = verifyAgentResult(result);
  }

  const source = result?.source || 'agent';

  if (result && typeof result.content === 'string') {
    const response = { content: result.content, source };
    return intent === INTENT.READINESS ? withNarration(response, { message, history }) : response;
  }
  if (result && result.type === 'workout_plan') {
    return { content: formatWorkoutPlanForChat(result), source };
  }
  if (result && result.type === 'meal_plan') {
    return { content: formatMealPlanForChat(result), source };
  }
  if (result && result.type === 'insights') {
    return withNarration({ content: formatInsightsForChat(result), source }, { message, history });
  }
  return { content: JSON.stringify(result ?? {}, null, 2), source };
}

/**
 * Orchestrates the AI request: detects intent, runs the corresponding agent, and
 * attaches the follow-up suggestions (chosen here only, at most four per reply).
 * @param {Object} params
 * @param {string} params.message - User message.
 * @param {Object} [params.context] - { recentWorkouts, recentDiets, userName } (optional, from client).
 * @param {Array<{ type: string, content: string }>} [params.history] - Previous chat messages.
 * @returns {Promise<{ content: string, suggestions: string[], source: string }>}
 */
export async function orchestrateAI({ message, context = {}, history = [] }) {
  const intent = detectIntent(message);
  const { content, source } = await runAgent(intent, { message, context, history });
  return { content, suggestions: followUpsFor({ message, intent }), source };
}
