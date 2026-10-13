import { useMemo, useState } from 'react';
import { calculateReadinessScore } from '@shared/readinessScore';

// The landing page demo: a made-up week shaped by a few answers, scored by the
// same readiness formula the app and the coach use.

export const DEFAULT_ANSWERS = { sleepHours: 7.5, energy: 4, soreness: 2, yesterday: 'easy', fuel: 'solid' };

export const YESTERDAY_OPTIONS = [
  { value: 'rest', label: 'Rest' },
  { value: 'easy', label: 'Easy' },
  { value: 'hard', label: 'Hard' },
];

export const FUEL_OPTIONS = [
  { value: 'light', label: 'Under-ate' },
  { value: 'solid', label: 'Ate well' },
];

const DAY_OF_EATING = { solid: { calories: 2300, protein: 140 }, light: { calories: 1300, protein: 55 } };
const MEALS = [[8, 0.3], [13, 0.35], [19, 0.35]];

const atDaysAgo = (now, daysAgo, hour) => {
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

/** Builds the sample week for the answers and scores it. */
export function scoreSampleDay(answers, now = new Date()) {
  // Fixed 8 a.m. "this morning", so only the answers change the result.
  const morning = new Date(now);
  morning.setHours(8, 30, 0, 0);

  const workouts = [
    { date: atDaysAgo(morning, 3, 18), duration: 45, intensity: 'Medium', type: 'Strength' },
    { date: atDaysAgo(morning, 5, 18), duration: 40, intensity: 'Medium', type: 'Cardio' },
  ];
  if (answers.yesterday === 'easy') workouts.push({ date: atDaysAgo(morning, 1, 18), duration: 30, intensity: 'Low', type: 'Cardio' });
  if (answers.yesterday === 'hard') workouts.push({ date: atDaysAgo(morning, 1, 19), duration: 75, intensity: 'High', type: 'Strength' });

  const day = DAY_OF_EATING[answers.fuel] || DAY_OF_EATING.solid;
  const diets = [];
  for (let d = 0; d < 4; d += 1) {
    MEALS.forEach(([hour, share]) => {
      if (d === 0 && hour > 8) return; // only breakfast so far today
      diets.push({ date: atDaysAgo(morning, d, hour), calories: Math.round(day.calories * share), protein: Math.round(day.protein * share) });
    });
  }

  const result = calculateReadinessScore({
    workouts,
    diets,
    checkIn: { sleepHours: answers.sleepHours, energy: answers.energy, soreness: answers.soreness, waterCups: 6 },
    now: morning,
  });

  return {
    score: result.score,
    level: result.level,
    next: result.shortRecommendation,
    // What each flow contributes, as a share of its maximum (0-1).
    parts: {
      fuel: result.factors.nutritionScore / 40,
      train: result.factors.recoveryScore / 30,
      recover: (result.factors.bodyScore ?? 0) / 100,
    },
  };
}

/** State for the demo, shared by the controls, the verdict and the bars. */
export function useTryToday() {
  const [answers, setAnswers] = useState(DEFAULT_ANSWERS);
  const result = useMemo(() => scoreSampleDay(answers), [answers]);
  return { answers, setAnswers, result };
}
