import { calculateReadinessScore } from '@shared/readinessScore';
import { formatDayKey, parseDayKey, shiftDayKey, toDayKey } from '../../utils/dateUtils';

// "Your week": the last 7 days compared with the 7 before, and readiness for each day,
// scored with the same formula as the dashboard.

const total = (records, field) => records.reduce((sum, record) => sum + (Number(record[field]) || 0), 0);
const dayRange = (lastDay, length) => Array.from({ length }, (_, i) => shiftDayKey(lastDay, i - length + 1));

/** Totals for a set of days. */
function summarize(dayKeys, diets, workouts, checkInDays) {
  const days = new Set(dayKeys);
  const meals = diets.filter((d) => d?.date && days.has(toDayKey(d.date)));
  const sessions = workouts.filter((w) => w?.date && days.has(toDayKey(w.date)));
  const mealDays = new Set(meals.map((d) => toDayKey(d.date)));
  const checkIns = dayKeys.filter((key) => checkInDays.has(key));
  const logged = new Set([...mealDays, ...sessions.map((w) => toDayKey(w.date)), ...checkIns]);
  return {
    totals: {
      daysLogged: logged.size,
      sessions: sessions.length,
      minutes: total(sessions, 'duration'),
      meals: meals.length,
      avgCalories: mealDays.size ? Math.round(total(meals, 'calories') / mealDays.size) : 0,
      checkIns: checkIns.length,
    },
    loggedDays: logged,
  };
}

/**
 * @param {Date} now - "today"; each past day is scored at its end, today at `now`.
 * @returns {{ days: Array<{ dayKey, label, score, level, logged }>, week, lastWeek, best }}
 */
export function getWeeklyRecap(diets = [], workouts = [], checkIns = [], now = new Date()) {
  const today = toDayKey(now);
  const weekDays = dayRange(today, 7);
  const lastWeekDays = dayRange(shiftDayKey(today, -7), 7);
  const checkInByDay = new Map(checkIns.filter((c) => c?.dayKey).map((c) => [c.dayKey, c]));
  const checkInDays = new Set(checkInByDay.keys());
  const week = summarize(weekDays, diets, workouts, checkInDays);
  const lastWeek = summarize(lastWeekDays, diets, workouts, checkInDays);

  const days = weekDays.map((dayKey) => {
    const end = parseDayKey(dayKey);
    end.setHours(23, 59, 59, 999);
    const at = dayKey === today ? now : end;
    // Only what had been logged by then, so a past day is not scored with later workouts.
    const { score, level } = calculateReadinessScore({
      workouts: workouts.filter((w) => w?.date && new Date(w.date) <= at),
      diets: diets.filter((d) => d?.date && new Date(d.date) <= at),
      checkIn: checkInByDay.get(dayKey) || null,
      now: at,
    });
    return { dayKey, label: formatDayKey(dayKey, { weekday: 'short' }), score, level, logged: week.loggedDays.has(dayKey) };
  });

  const logged = days.filter((day) => day.logged);
  const best = logged.length ? logged.reduce((top, day) => (day.score > top.score ? day : top)) : null;
  return { days, week: week.totals, lastWeek: lastWeek.totals, best };
}

/** A short plain-text summary for sharing. */
export function recapShareText({ week, best }) {
  const parts = [
    `${week.daysLogged} of 7 days logged`,
    `${week.sessions} ${week.sessions === 1 ? 'session' : 'sessions'}${week.minutes ? ` (${week.minutes} min)` : ''}`,
  ];
  if (best) parts.push(`best day ${formatDayKey(best.dayKey, { weekday: 'long' })} at readiness ${best.score}`);
  return `My NutriFlow week: ${parts.join(', ')}.`;
}
