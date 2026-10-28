/**
 * WorkoutPlannerAgent: generates structured workout plans.
 *
 * Day headings: Monday–Sunday (optionally with suffix like "Monday (Push Day)"
 * or "Monday - Push Day"), or standalone split labels (Push Day, Pull Day, etc.).
 * Exercises: lines starting with •, -, *, or containing reps (e.g. 3x10, 4x8).
 *
 * NOTE: [[RETURN_JSON_WORKOUT_PLAN]] is still handled by HeadCoachAgent.
 */

import { VOICE_RULES } from '../prompts/voice.js';
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

function buildFallbackWeeklyPlan(rawContent) {
  const extractedExercises = String(rawContent || '')
    .split('\n')
    .map((line) => stripBullet(line))
    .filter((line) => line && !isDayHeading(line))
    .slice(0, 12);

  const buckets = [
    { day: 'Monday', exercises: extractedExercises.slice(0, 4) },
    { day: 'Wednesday', exercises: extractedExercises.slice(4, 8) },
    { day: 'Friday', exercises: extractedExercises.slice(8, 12) },
  ].filter((entry) => entry.exercises.length > 0);

  if (buckets.length > 0) return buckets;

  return [
    { day: 'Monday', exercises: ['Squats 3x8', 'Push-ups 3x12', 'Rows 3x10'] },
    { day: 'Wednesday', exercises: ['Deadlifts 3x6', 'Overhead Press 3x8', 'Plank 3 x 30 sec'] },
    { day: 'Friday', exercises: ['Lunges 3x10', 'Bench Press 3x8', 'Lat Pulldown 3x10'] },
  ];
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
    VOICE_RULES,
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

  let content = '';
  let provider = 'fallback';
  try {
    const result = await generateChatCompletion(messages, { temperature: 0.7 });
    content = result.content;
    provider = result.provider;
  } catch (err) {
    console.error('WorkoutPlannerAgent provider error:', err);
    return {
      type: 'workout_plan',
      plan: buildFallbackWeeklyPlan(message),
      rawContent: 'Workout Plan\n\nMonday\n• Squats 3x8\n• Push-ups 3x12\n• Rows 3x10\n\nWednesday\n• Deadlifts 3x6\n• Overhead Press 3x8\n• Plank 3 x 30 sec\n\nFriday\n• Lunges 3x10\n• Bench Press 3x8\n• Lat Pulldown 3x10',
      source: 'fallback',
    };
  }

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

  const finalPlan = plan.length > 0 ? plan : buildFallbackWeeklyPlan(content);

  return {
    type: 'workout_plan',
    plan: finalPlan,
    rawContent: content,
    source: provider,
  };
}
