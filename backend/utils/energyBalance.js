/**
 * The weekly check-in: what a person actually burns, worked out from what they ate and how
 * their weight moved, and the daily calories that would get them where they're going.
 *
 * It is forgiving of imperfect logging: only days with a full day of food count toward the
 * average (missed days are left out, not counted as zero), and the weight trend is a
 * straight-line fit through every weigh-in, so one heavy morning barely moves it.
 */

import { dayKeyIn } from '../ai/tools/get_coach_context.js';

const DAY_MS = 86400000;
/** Four weeks: long enough to see past water weight, short enough to keep up with change. */
export const WINDOW_DAYS = 28;
/** What it needs before it will say a number. */
export const NEEDS = { weighIns: 6, foodDays: 10, spanDays: 10 };
/** A day under this much logged food is treated as not fully logged. */
const FULL_DAY_KCAL = 800;
/** Roughly the energy in a kilogram of body weight. */
const KCAL_PER_KG = 7700;

/** The weekly change each goal aims for, in kg. */
const GOAL_RATE = {
  'Lose fat': -0.5,
  'Build muscle': 0.25,
};

const roundTo = (value, step) => Math.round(value / step) * step;
const daysBetween = (from, to) => Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / DAY_MS);
const addDays = (dayKey, days) => new Date(Date.parse(`${dayKey}T12:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
const kcal = (value) => `${Math.round(value).toLocaleString('en-US')} kcal`;

/** Least-squares line through (x, y) points: { slope, at(x) }. */
function fitLine(points) {
  const n = points.length;
  const meanX = points.reduce((sum, p) => sum + p.x, 0) / n;
  const meanY = points.reduce((sum, p) => sum + p.y, 0) / n;
  const sxx = points.reduce((sum, p) => sum + (p.x - meanX) ** 2, 0);
  const slope = sxx === 0 ? 0 : points.reduce((sum, p) => sum + (p.x - meanX) * (p.y - meanY), 0) / sxx;
  return { slope, at: (x) => meanY + slope * (x - meanX) };
}

/**
 * @param {Object} params
 * @param {Array<{ dayKey: string, kg: number }>} params.weighIns
 * @param {Array<{ date: Date|string, calories: number }>} params.diets
 * @param {string} params.today - "2026-10-29", on the person's calendar.
 * @param {string} params.timeZone
 * @param {string} [params.goal] - About you's goal.
 * @param {number} [params.currentTarget] - Today's everyday calorie target.
 */
export function energyBalance({ weighIns = [], diets = [], today, timeZone = 'UTC', goal, currentTarget }) {
  const first = addDays(today, -(WINDOW_DAYS - 1));
  const inWindow = (dayKey) => dayKey >= first && dayKey <= today;

  const weights = weighIns
    .filter((w) => inWindow(w.dayKey) && Number(w.kg) > 0)
    .sort((a, b) => a.dayKey.localeCompare(b.dayKey));

  const intakeByDay = new Map();
  for (const diet of diets) {
    const day = dayKeyIn(diet.date, timeZone);
    if (inWindow(day)) intakeByDay.set(day, (intakeByDay.get(day) || 0) + (Number(diet.calories) || 0));
  }
  // Today isn't over, so it never counts as a full day yet.
  const fullDays = [...intakeByDay].filter(([day, total]) => day !== today && total >= FULL_DAY_KCAL).map(([, total]) => total);

  const spanDays = weights.length ? daysBetween(weights[0].dayKey, weights[weights.length - 1].dayKey) : 0;
  const progress = { weighIns: weights.length, foodDays: fullDays.length, spanDays, needs: NEEDS };
  const trendKg = weights.length >= 2
    ? fitLine(weights.map((w) => ({ x: daysBetween(first, w.dayKey), y: Number(w.kg) }))).at(WINDOW_DAYS - 1)
    : weights.at(-1)?.kg ?? null;

  const ready = weights.length >= NEEDS.weighIns && fullDays.length >= NEEDS.foodDays && spanDays >= NEEDS.spanDays;
  if (!ready) {
    return {
      status: 'learning',
      progress,
      trendKg: trendKg === null ? null : Math.round(trendKg * 10) / 10,
      line: 'Weigh in a few mornings a week and log your food most days. In about two weeks NutriFlow can tell you what you actually burn.',
    };
  }

  const line = fitLine(weights.map((w) => ({ x: daysBetween(first, w.dayKey), y: Number(w.kg) })));
  const intake = fullDays.reduce((sum, value) => sum + value, 0) / fullDays.length;
  const expenditure = Math.min(Math.max(roundTo(intake - line.slope * KCAL_PER_KG, 50), 1200), 6000);
  const weeklyChangeKg = Math.round(line.slope * 7 * 10) / 10;

  const rate = GOAL_RATE[goal] ?? 0;
  const calories = Math.max(roundTo(expenditure + (rate / 7) * KCAL_PER_KG, 50), 1200);
  const aim = rate < 0 ? `To lose ${Math.abs(rate)} kg a week` : rate > 0 ? `To gain ${rate} kg a week` : 'To hold your weight';
  const differs = !currentTarget || Math.abs(calories - currentTarget) >= 100;

  return {
    status: 'ready',
    progress,
    trendKg: Math.round(line.at(WINDOW_DAYS - 1) * 10) / 10,
    weeklyChangeKg,
    averageIntake: Math.round(intake),
    expenditure,
    suggestion: { calories, weeklyRateKg: rate, differs },
    line: `You burn about ${kcal(expenditure)} a day. ${aim}, eat about ${kcal(calories)}.`,
  };
}
