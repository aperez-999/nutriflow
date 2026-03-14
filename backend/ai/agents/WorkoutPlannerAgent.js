/**
 * WorkoutPlannerAgent — generates structured workout plans.
 *
 * Day headings: Monday–Sunday (optionally with suffix like "Monday (Push Day)"
 * or "Monday - Push Day"), or standalone split labels (Push Day, Pull Day, etc.).
 * Exercises: lines starting with •, -, *, or containing reps (e.g. 3x10, 4x8).
 *
 * NOTE: [[RETURN_JSON_WORKOUT_PLAN]] is still handled by HeadCoachAgent.
 */

import { get_user_stats } from '../tools/get_user_stats.js';
import { generateChatCompletion } from '../config/aiProvider.js';

// Weekday with optional suffix: Monday (Push Day), Monday - Push Day, Monday – Push Day
const WEEKDAY_REGEX = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)(\s*[-–(].*)?$/i;
// Standalone split labels only (no suffix on same line)
const SPLIT_DAY_REGEX = /^(Push\s+Day|Pull\s+Day|Leg\s+Day|Upper|Lower|Rest\s+Day)$/i;

function isDayHeading(line) {
  const trimmed = line.replace(/^[-•*]\s*/, '').trim();
  if (!trimmed) return false;
  if (WEEKDAY_REGEX.test(trimmed)) return true;
  // Split labels count only as day headings when they are the entire line (standalone)
  if (SPLIT_DAY_REGEX.test(trimmed)) return true;
  return false;
}

function isExerciseLine(line) {
  const t = line.trim();
  if (!t) return false;
  if (t.startsWith('•') || t.startsWith('-') || t.startsWith('*')) return true;
  // Reps pattern: 3x10, 4x8, (3x10), etc.
  if (/\d+x\d+/.test(t)) return true;
  if (/\(\s*\d+\s*x\s*\d+\s*\)/.test(t)) return true;
  return false;
}

function stripBullet(line) {
  return line.replace(/^[•\-*]\s*/, '').trim();
}

export async function runWorkoutPlannerAgent({ message, context = {}, history = [] }) {
  let stats = null;
  if (context.userId) {
    try {
      stats = await get_user_stats(context.userId);
    } catch (err) {
      console.error('WorkoutPlannerAgent get_user_stats error:', err);
    }
  }

  const systemPrompt = [
    'You are the NutriFlow Workout Planner Agent.',
    'Design a practical weekly workout plan.',
    'Use clear day headings: either weekday names (Monday, Tuesday, ...) or split names (Push Day, Pull Day, Leg Day, Upper, Lower, Rest Day).',
    'Under each day, list 3–5 exercises as bullet points (e.g. "- Bench Press" or "• Squats") or with reps (e.g. "Bench Press (3x10)" or "Squats 4x8").',
    'Do not use exercise names as day headings.',
  ].join(' ');

  const contextSummary = stats
    ? `Recent workouts: ${stats.recentWorkouts.length}. Recent diets: ${stats.recentDiets.length}. User: ${stats.userName || 'User'}.`
    : 'No user stats available.';

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'system', content: contextSummary },
    ...history.map((m) => ({
      role: m.type === 'user' ? 'user' : 'assistant',
      content: m.content,
    })),
    {
      role: 'user',
      content: `${message}\n\nReply with a weekly workout plan. Use only the day labels above and bullet lists of exercises.`,
    },
  ];

  const { content, provider } = await generateChatCompletion(messages, { temperature: 0.7 });

  const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
  const plan = [];
  let currentDay = null;

  for (const line of lines) {
    const cleaned = stripBullet(line);
    if (isDayHeading(cleaned)) {
      currentDay = { day: cleaned, exercises: [] };
      plan.push(currentDay);
    } else if (currentDay && isExerciseLine(line)) {
      const ex = stripBullet(line);
      if (ex) currentDay.exercises.push(ex);
    }
  }

  console.log('Parsed workout plan:', plan);

  return {
    type: 'workout_plan',
    plan,
    rawContent: content,
    source: provider,
  };
}
