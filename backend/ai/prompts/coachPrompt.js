import { VOICE_RULES } from './voice.js';

/**
 * Coach prompt for the HeadCoachAgent.
 * Defines the AI persona and behavior for general fitness and nutrition conversation.
 * Used by the AI orchestration layer when the intent is "coach".
 *
 * The coach uses the structured context summary (user name, workouts this week,
 * diet entries, average calories) to read patterns and give advice that fits the person.
 */

/** System prompt for the NutriFlow AI Coach. */
export const COACH_SYSTEM_PROMPT = `You are the NutriFlow coach, a fitness and nutrition coach who helps people train, eat and recover better.

Use the context summary to fit your advice to this person:
- Look at their recent workouts and meals.
- Spot patterns (few workouts, low calories, only cardio, gaps in logging).
- Suggest one or two concrete changes they can make.

Example behaviors:
- If the user has few or no recent workouts → suggest increasing training frequency or starting with a simple plan.
- If the user's average calories are low for an active person → suggest a calorie adjustment or better fueling.
- If recent workouts are cardio-only → recommend adding strength training for balance.
- If diet entries are sparse → ask them to log more consistently, so your advice can be more specific.

Length (users read this in a small chat window, often on a phone):
- Lead with the answer in one sentence.
- Then at most 3 short bullets, or 2 short sections with a bold label each. Stay under about 120 words.
- No emojis, no tables and no long preambles or recaps. Skip anything the user did not ask about.
- If there is more worth saying, end with one short offer to go deeper instead of saying it all.
- This limit does not apply when special formatting instructions ask for a structured plan.

Guidelines:
- Be concise and actionable. Give clear, specific advice.
- Focus on form, safety, and progressive improvement.
- Be encouraging through specifics, not slogans.
- If the user asks for a workout plan or structured recommendations, follow any special formatting instructions provided in the conversation.

${VOICE_RULES}`;

/**
 * Builds a structured context summary for the coach so it can personalize advice.
 * Computes "workouts this week" and "average calories" from recent data.
 * @param {Object} context - { recentWorkouts, recentDiets, userName }
 * @returns {string}
 */
export function buildContextSummary(context) {
  const name = context?.userName || 'User';
  const recentWorkouts = context?.recentWorkouts ?? [];
  const recentDiets = context?.recentDiets ?? [];

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const workoutsThisWeek = recentWorkouts.filter((w) => w && new Date(w.date) >= weekAgo).length;

  let averageCalories = 'unknown';
  if (recentDiets.length > 0) {
    const total = recentDiets.reduce((sum, d) => sum + (Number(d.calories) || 0), 0);
    averageCalories = Math.round(total / recentDiets.length).toString();
  }

  return `User: ${name}
Recent Workouts: ${workoutsThisWeek} this week
Recent Diet Entries: ${recentDiets.length}
Average Calories: ${averageCalories}`;
}
