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
import { fetchCompat } from '../utils/fetchCompat.js';
import {
  categorizeMessage,
  suggestionsByCategory,
  COACHING_ACTION_SUGGESTIONS,
  getDefaultWorkoutPlan,
  generateFallbackResponse,
} from '../../utils/aiUtils.js';

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
  const provider = process.env.NODE_ENV === 'production' ? 'groq' : 'ollama';

  try {
    if (provider === 'groq') {
      if (!process.env.GROQ_API_KEY) throw new Error('Missing GROQ_API_KEY');
      const response = await fetchCompat('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || 'llama3-8b-8192',
          messages,
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error(`Groq error ${response.status}`);
      const data = await response.json();
      let content = data?.choices?.[0]?.message?.content?.trim() || '';

      if (isPlanRequest && (!content.includes('[') || /^\s*\[\s*\]\s*$/.test(content))) {
        content = JSON.stringify(getDefaultWorkoutPlan());
      }

      return {
        content,
        suggestions,
        source: 'groq',
      };
    }

    if (provider === 'ollama') {
      const base = process.env.OLLAMA_URL || 'http://localhost:11434';
      const response = await fetchCompat(`${base.replace(/\/$/, '')}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL || 'llama3:latest',
          messages,
          stream: false,
        }),
      });

      if (!response.ok) throw new Error(`Ollama error ${response.status}`);
      const data = await response.json();
      let content = data?.message?.content?.trim() || '';

      if (isPlanRequest && (!content.includes('[') || /^\s*\[\s*\]\s*$/.test(content))) {
        content = JSON.stringify(getDefaultWorkoutPlan());
      }

      return {
        content,
        suggestions,
        source: 'ollama',
      };
    }

    const fallback = generateFallbackResponse(message, coachingContext);
    return { ...fallback, suggestions: [...(fallback.suggestions || []), ...COACHING_ACTION_SUGGESTIONS], source: 'fallback' };
  } catch (err) {
    console.error('HeadCoachAgent provider error:', err);
    const fallback = generateFallbackResponse(message, coachingContext);
    return { ...fallback, suggestions: [...(fallback.suggestions || []), ...COACHING_ACTION_SUGGESTIONS], source: 'fallback' };
  }
}
