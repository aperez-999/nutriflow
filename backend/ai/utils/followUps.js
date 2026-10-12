/**
 * followUps — the (at most four) suggestions shown under a coach reply.
 *
 * They continue what was just discussed. Entries that match a chat quick action
 * ('Generate Weekly Plan', 'Create Meal Plan', 'Analyze My Progress', 'How ready am I?')
 * are sent as those actions by the frontend; everything else is sent as a question.
 * Every entry must be something the coach can actually answer in chat.
 */

import { categorizeMessage } from '../../utils/aiUtils.js';

export const MAX_FOLLOW_UPS = 4;

const FOLLOW_UPS = {
  workout_plan: ['Make the week easier', 'Make the sessions shorter', 'Create Meal Plan', 'How ready am I?'],
  meal_plan: ['Make it higher in protein', 'Make it vegetarian', 'Generate Weekly Plan', 'How ready am I?'],
  readiness: ['What should I train today?', 'What helps me recover faster?', 'Generate Weekly Plan', 'Create Meal Plan'],
  insights: ['What should I change first?', 'Generate Weekly Plan', 'Create Meal Plan', 'How ready am I?'],
  greeting: ['How ready am I?', 'Generate Weekly Plan', 'Create Meal Plan', 'Analyze My Progress'],
  muscle: ['How much protein do I need?', 'Generate Weekly Plan', 'Create Meal Plan', 'How ready am I?'],
  workout: ['Make it shorter', 'Make it harder', 'What should I eat after?', 'Generate Weekly Plan'],
  nutrition: ['What should I eat before training?', 'How much protein do I need?', 'Create Meal Plan', 'Analyze My Progress'],
  form: ['What are the common mistakes?', 'Give me an easier variation', 'Give me a harder variation', 'Generate Weekly Plan'],
  progress: ['What should I change first?', 'Generate Weekly Plan', 'Create Meal Plan', 'How ready am I?'],
  plan: ['Make it easier', 'Make it shorter', 'Create Meal Plan', 'How ready am I?'],
  default: ['How ready am I?', 'Generate Weekly Plan', 'Create Meal Plan', 'Analyze My Progress'],
};

/**
 * @param {{ message: string, intent: string }} params - intent from the orchestrator.
 * @returns {string[]}
 */
export function followUpsFor({ message, intent }) {
  const isPlanRequest = /\[\[RETURN_JSON_WORKOUT_PLAN\]\]/i.test(message || '');
  const key = isPlanRequest ? 'workout_plan' : FOLLOW_UPS[intent] ? intent : categorizeMessage(message);
  const asked = String(message || '').trim().toLowerCase();
  return [...new Set(FOLLOW_UPS[key] || FOLLOW_UPS.default)]
    .filter((item) => item.toLowerCase() !== asked)
    .slice(0, MAX_FOLLOW_UPS);
}
