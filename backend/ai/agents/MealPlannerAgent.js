/**
 * MealPlannerAgent — generates structured meal plans.
 *
 * Step 1: strip bullet characters (*, -, •).
 * Step 2: detect meal labels (Breakfast, Lunch, Dinner, Snack).
 * Step 3: split on : or - or first space to get meal + food.
 * Caps meals at 6.
 */

import { get_user_stats } from '../tools/get_user_stats.js';
import { generateChatCompletion } from '../config/aiProvider.js';

const MEAL_LABELS = ['breakfast', 'lunch', 'dinner', 'snack'];
const MAX_MEALS = 6;

function stripBullet(line) {
  return line.replace(/^[•\-*]\s*/, '').trim();
}

/**
 * Returns the meal label if the line starts with one (case-insensitive), else null.
 */
function detectMealType(text) {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();
  for (const label of MEAL_LABELS) {
    if (lower.startsWith(label)) return label;
  }
  return null;
}

/**
 * Extract food from a line that starts with a meal label.
 * Handles "Breakfast: Greek yogurt", "Breakfast - Greek yogurt", "Breakfast Greek yogurt".
 */
function extractFoodAfterLabel(line, mealType) {
  const rest = line.replace(new RegExp(`^${mealType}[\\s:–-]*`, 'i'), '').trim();
  return rest || '';
}

export async function runMealPlannerAgent({ message, context = {}, history = [] }) {
  let stats = null;
  if (context.userId) {
    try {
      stats = await get_user_stats(context.userId);
    } catch (err) {
      console.error('MealPlannerAgent get_user_stats error:', err);
    }
  }

  const systemPrompt = [
    'You are the NutriFlow Meal Planner Agent.',
    'Create a realistic daily meal plan. Use exactly these meal labels: Breakfast, Lunch, Dinner, Snack.',
    'You can write "Breakfast: description" or "Breakfast - description" or "Breakfast description".',
  ].join(' ');

  const contextSummary = stats
    ? `Recent diet entries: ${stats.recentDiets.length}. User: ${stats.userName || 'User'}.`
    : 'No diet history. Suggest a balanced plan (e.g. 1800–2200 calories).';

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'system', content: contextSummary },
    ...history.map((m) => ({
      role: m.type === 'user' ? 'user' : 'assistant',
      content: m.content,
    })),
    {
      role: 'user',
      content: `${message}\n\nReply with a daily meal plan: Breakfast, Lunch, Dinner, and optional Snack. One line per meal.`,
    },
  ];

  const { content, provider } = await generateChatCompletion(messages, { temperature: 0.7 });

  const lines = content.split('\n').map((l) => stripBullet(l)).map((l) => l.trim()).filter(Boolean);
  const meals = [];
  let currentMeal = null;
  let currentFood = null;

  for (const line of lines) {
    const mealType = detectMealType(line);
    if (mealType) {
      if (currentMeal && currentFood !== null) {
        meals.push({ meal: currentMeal, food: currentFood || '—' });
      }
      currentMeal = mealType.charAt(0).toUpperCase() + mealType.slice(1);
      currentFood = extractFoodAfterLabel(line, mealType);
    } else if (currentMeal && line) {
      currentFood = (currentFood ? `${currentFood} ` : '') + line;
    }
  }
  if (currentMeal) {
    meals.push({ meal: currentMeal, food: currentFood || '—' });
  }

  const capped = meals.slice(0, MAX_MEALS);

  console.log('Parsed meal plan:', capped);

  return {
    type: 'meal_plan',
    calories: undefined,
    meals: capped,
    rawContent: content,
    source: provider,
  };
}
