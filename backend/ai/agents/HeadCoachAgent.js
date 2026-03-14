/**
 * HeadCoachAgent — handles general fitness and nutrition conversation.
 *
 * Uses NutriFlow data to personalize advice: when context.userId is present,
 * calls get_user_stats(userId) to load recent workouts, diets, and user name
 * from the database. The structured context summary (workouts this week,
 * diet entries, average calories) is passed into the coach prompt so the AI
 * can analyze patterns and recommend improvements (e.g. more strength work,
 * calorie adjustment). Preserves existing behavior: [[RETURN_JSON_WORKOUT_PLAN]],
 * fallback responses, Groq/Ollama, and category-based suggestions plus
 * coaching action suggestions for future agents.
 */

import { get_user_stats } from '../tools/get_user_stats.js';
import { COACH_SYSTEM_PROMPT, buildContextSummary } from '../prompts/coachPrompt.js';
import { generateChatCompletion, selectProvider } from '../config/aiProvider.js';
import {
  categorizeMessage,
  suggestionsByCategory,
  COACHING_ACTION_SUGGESTIONS,
  getDefaultWorkoutPlan,
  generateFallbackResponse,
} from '../../utils/aiUtils.js';

/** Minimum safe daily calorie recommendation (safety clamp for AI output). */
const MIN_SAFE_CALORIES = 1500;

const SAFE_CALORIE_MESSAGE =
  "Your calorie intake appears low for your activity level. Most active adults require at least 1500–2000 calories per day to support healthy energy levels.";

/** Detect unsafe low-calorie recommendations in text and return safe message if found. */
function clampUnsafeCalorieContent(content) {
  if (typeof content !== 'string' || !content.trim()) return content;
  const lower = content.toLowerCase();
  const lowCalMatch = lower.match(/\b(\d{1,4})\s*[-–]?\s*(\d{0,4})?\s*calories?/);
  if (lowCalMatch) {
    const a = parseInt(lowCalMatch[1], 10);
    const b = lowCalMatch[2] ? parseInt(lowCalMatch[2], 10) : a;
    const minVal = Math.min(a, b);
    if (minVal > 0 && minVal < MIN_SAFE_CALORIES) return SAFE_CALORIE_MESSAGE;
  }
  const underMatch = content.match(/\b(?:under|below|less than)\s+(\d{1,4})\s*calories?/i);
  if (underMatch) {
    const n = parseInt(underMatch[1], 10);
    if (n > 0 && n < MIN_SAFE_CALORIES) return SAFE_CALORIE_MESSAGE;
  }
  return content;
}

/**
 * Runs the HeadCoachAgent: optionally enriches context from DB via get_user_stats,
 * builds messages with the structured context summary, calls LLM, returns content and suggestions.
 * @param {Object} params
 * @param {string} params.message - User message.
 * @param {Object} [params.context] - { userId?, recentWorkouts?, recentDiets?, userName? }. If userId is set, get_user_stats(userId) is called and its result is used for the prompt.
 * @param {Array<{ type: string, content: string }>} [params.history] - Previous chat turns.
 * @returns {Promise<{ content: string, suggestions: string[], source: 'groq'|'ollama'|'fallback' }>}
 */
export async function runHeadCoachAgent({ message, context = {}, history = [] }) {
  // When userId is available, load fresh stats from the DB for personalized coaching.
  let coachingContext = context;
  if (context.userId) {
    try {
      const stats = await get_user_stats(context.userId);
      coachingContext = {
        recentWorkouts: stats.recentWorkouts,
        recentDiets: stats.recentDiets,
        userName: stats.userName,
      };
    } catch (err) {
      console.error('HeadCoachAgent get_user_stats error:', err);
      // Keep client-supplied context if DB call fails.
    }
  }

  const contextSummary = buildContextSummary(coachingContext);
  const isPlanRequest = /\[\[RETURN_JSON_WORKOUT_PLAN\]\]/i.test(message);

  const messages = [
    { role: 'system', content: COACH_SYSTEM_PROMPT },
    { role: 'system', content: contextSummary },
    ...history.map((m) => ({
      role: m.type === 'user' ? 'user' : 'assistant',
      content: m.content,
    })),
    { role: 'user', content: message },
  ];

  if (isPlanRequest) {
    messages.splice(2, 0, {
      role: 'system',
      content:
        'Return ONLY a valid JSON array of workout objects with fields: title, duration, intensity, focusAreas, exercises (with name, sets, reps, interval), videoId, description, calories, difficulty.',
    });
  }

  const type = categorizeMessage(message);
  const categorySuggestions = suggestionsByCategory[type] || suggestionsByCategory.default;
  const suggestions = [...categorySuggestions, ...COACHING_ACTION_SUGGESTIONS];
  const provider = selectProvider();

  try {
    const { content: rawContent, provider: usedProvider } = await generateChatCompletion(messages, { temperature: 0.7 });
    let content = rawContent;

    if (isPlanRequest && (!content.includes('[') || /^\s*\[\s*\]\s*$/.test(content))) {
      content = JSON.stringify(getDefaultWorkoutPlan());
    }

    if (!isPlanRequest) {
      content = clampUnsafeCalorieContent(content);
    }

    return {
      content,
      suggestions,
      source: usedProvider,
    };
  } catch (err) {
    console.error('HeadCoachAgent provider error:', err);
    const fallback = generateFallbackResponse(message, coachingContext);
    return {
      ...fallback,
      suggestions: [...(fallback.suggestions || []), ...COACHING_ACTION_SUGGESTIONS],
      source: 'fallback',
    };
  }
}
