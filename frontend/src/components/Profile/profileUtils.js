import { parseDayKey, shiftDayKey, toDayKey } from '../../utils/dateUtils';

const countBy = (items, keyOf) => {
  const counts = new Map();
  items.forEach((item) => {
    const key = keyOf(item);
    if (key) counts.set(key, (counts.get(key) || 0) + 1);
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, count]) => ({ label, count }));
};

/**
 * Longest run of active days using the same forgiving rule as the dashboard rhythm:
 * one missed day is a grace day, two in a row end the streak.
 */
export const getBestStreak = (activeDayKeys) => {
  const days = [...new Set(activeDayKeys)].sort();
  if (days.length === 0) return 0;
  const active = new Set(days);
  let best = 0;
  let current = 0;
  let missedInRow = 0;
  for (let day = days[0]; day <= days[days.length - 1]; day = shiftDayKey(day, 1)) {
    if (active.has(day)) {
      current += 1;
      missedInRow = 0;
      best = Math.max(best, current);
    } else if (++missedInRow >= 2) {
      current = 0;
    }
  }
  return best;
};

/** Account creation date from a MongoDB ObjectId (its first 4 bytes are a Unix timestamp). */
export const memberSince = (objectId) => {
  if (!/^[0-9a-f]{24}$/i.test(String(objectId || ''))) return null;
  return new Date(parseInt(String(objectId).slice(0, 8), 16) * 1000);
};

/** Everything the profile shows, derived from the user's own logs. */
export const getProfileStats = (diets = [], workouts = [], checkIns = []) => {
  const fuelDays = new Set(diets.filter((d) => d?.date).map((d) => toDayKey(d.date)));
  const trainDays = new Set(workouts.filter((w) => w?.date).map((w) => toDayKey(w.date)));
  const recoverDays = new Set(checkIns.filter((c) => c?.dayKey).map((c) => c.dayKey));
  const activeDays = new Set([...fuelDays, ...trainDays, ...recoverDays]);
  const firstDay = [...activeDays].sort()[0] || null;

  return {
    activeDays: activeDays.size,
    firstLoggedDay: firstDay ? parseDayKey(firstDay) : null,
    bestStreak: getBestStreak([...activeDays]),
    meals: diets.length,
    workouts: workouts.length,
    checkIns: checkIns.length,
    mix: { fuel: fuelDays.size, train: trainDays.size, recover: recoverDays.size },
    topFoods: countBy(diets, (d) => d.foodName?.trim()).slice(0, 3),
    topWorkoutTypes: countBy(workouts, (w) => w.workoutName?.trim() || w.type).slice(0, 3),
  };
};
