/**
 * get_coach_context: everything the coach should know about one person before answering,
 * read from their account each time (so it is always current, and the person can see and
 * change every part of it): who they are and what they're after, their day so far against
 * today's targets, the last seven days, and what the coach has saved from earlier chats.
 */

import Diet from '../../models/Diet.js';
import Workout from '../../models/Workout.js';
import User from '../../models/User.js';
import CheckIn from '../../models/CheckIn.js';
import CoachNote from '../../models/CoachNote.js';
import { calculateReadinessScore } from '../../../shared/readinessScore.js';

const LEVEL_LABEL = { high: 'Push day', moderate: 'Steady day', low: 'Recovery day' };
const DAY_MS = 86400000;
const NOTE_LIMIT = 30;

/** A time zone the runtime knows, or UTC. */
export function safeTimeZone(timeZone) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return typeof timeZone === 'string' && timeZone ? timeZone : 'UTC';
  } catch {
    return 'UTC';
  }
}

/** "2026-10-28": the calendar day a moment falls on where the person is. */
export function dayKeyIn(date, timeZone) {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(new Date(date));
}

/** The verdict a client showed, if it is well formed. */
function cleanVerdict(verdict) {
  const score = Number(verdict?.score);
  if (!LEVEL_LABEL[verdict?.level] || !Number.isInteger(score) || score < 0 || score > 100) return null;
  return { level: verdict.level, score };
}

/** Today's macro targets, as the clients work them out: fat 30% of calories unless set, carbs the rest, moved by the verdict. */
export function targetsFor(goals = {}, level) {
  const calories = goals.dailyCalories ?? 2000;
  const protein = goals.dailyProtein ?? 150;
  const fats = goals.dailyFats ?? Math.round((calories * 0.3) / 9);
  const carbs = goals.dailyCarbs ?? Math.max(0, Math.round((calories - protein * 4 - fats * 9) / 4));
  if (goals.fuelFollowsVerdict === false || level === 'moderate' || !level) {
    return { calories, protein, carbs, fats, carbChange: 0 };
  }
  const percent = level === 'high' ? (goals.pushCarbBoost ?? 20) : -(goals.recoveryCarbCut ?? 15);
  const carbChange = Math.round(carbs * (1 + percent / 100)) - carbs;
  return { calories: calories + carbChange * 4, protein, carbs: carbs + carbChange, fats, carbChange };
}

const sum = (items, field) => items.reduce((total, item) => total + (Number(item[field]) || 0), 0);
const grams = (value) => `${Math.round(value)} g`;
const kcal = (value) => `${Math.round(value).toLocaleString('en-US')} kcal`;

function heartLine(checkIn) {
  const parts = [];
  if (Number.isFinite(checkIn.hrvChange)) {
    const hrv = Math.round(checkIn.hrvChange);
    parts.push(hrv === 0 ? 'HRV at their usual' : `HRV ${Math.abs(hrv)}% ${hrv < 0 ? 'under' : 'above'} their usual`);
  }
  if (Number.isFinite(checkIn.restingHrChange)) {
    const resting = Math.round(checkIn.restingHrChange);
    parts.push(`resting heart rate ${Math.abs(resting)} bpm ${resting < 0 ? 'under' : 'above'} usual`);
  }
  return parts.length ? `, measured: ${parts.join(', ')}` : '';
}

/**
 * The brief the coach reads before answering, as plain lines. Pure, so it can be tested:
 * `diets` and `workouts` cover at least the last eight days, `now` is the moment of the question.
 */
export function describeCoachContext({ user, diets = [], workouts = [], checkIns = [], notes = [], timeZone = 'UTC', verdict = null, now = new Date() }) {
  const today = dayKeyIn(now, timeZone);
  const name = user?.username || 'this person';
  const lines = [`About ${name} (fit every answer to them; don't recite this back):`];

  const about = user?.about || {};
  const aboutParts = [
    about.goal && `Training for: ${about.goal}.`,
    about.diet?.length && `Diet: ${about.diet.join(', ')}.`,
    about.injuries && `Injuries or limits: ${about.injuries}.`,
    about.note && `In their words: "${about.note}"`,
  ].filter(Boolean);
  lines.push(aboutParts.length ? `- ${aboutParts.join(' ')}` : '- They haven\'t said what they\'re training for yet.');
  if (notes.length) {
    lines.push(`- What they told you before: ${notes.map((note) => note.text).join('; ')}.`);
  }

  // Today, on their calendar.
  const todayCheckIn = checkIns.find((checkIn) => checkIn.dayKey === today) || null;
  const shown = cleanVerdict(verdict);
  const readiness = shown || calculateReadinessScore({ workouts, diets, checkIn: todayCheckIn, now });
  const targets = targetsFor(user?.goals, readiness.level);
  const mealsToday = diets.filter((diet) => dayKeyIn(diet.date, timeZone) === today);
  const workoutsToday = workouts.filter((workout) => dayKeyIn(workout.date, timeZone) === today);
  const weekday = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'long', hour: 'numeric' }).format(now);

  lines.push('', `Today (${weekday}, their time):`);
  lines.push(`- Verdict: ${LEVEL_LABEL[readiness.level]}, readiness ${readiness.score}/100.`);
  lines.push(todayCheckIn
    ? `- Check-in: slept ${todayCheckIn.sleepHours} h, energy ${todayCheckIn.energy}/5, soreness ${todayCheckIn.soreness}/5${heartLine(todayCheckIn)}.`
    : '- No check-in yet today.');
  const carbNote = targets.carbChange
    ? ` (${Math.abs(targets.carbChange)} g ${targets.carbChange > 0 ? 'more' : 'fewer'} carbs because of the verdict)`
    : '';
  lines.push(`- Targets: ${kcal(targets.calories)}, ${grams(targets.protein)} protein, ${grams(targets.carbs)} carbs${carbNote}, ${grams(targets.fats)} fat.`);
  if (mealsToday.length) {
    const eaten = { calories: sum(mealsToday, 'calories'), protein: sum(mealsToday, 'protein'), carbs: sum(mealsToday, 'carbs'), fats: sum(mealsToday, 'fats') };
    lines.push(`- Eaten so far (${mealsToday.length} ${mealsToday.length === 1 ? 'entry' : 'entries'}): ${kcal(eaten.calories)}, ${grams(eaten.protein)} protein, ${grams(eaten.carbs)} carbs, ${grams(eaten.fats)} fat.`);
    lines.push(`- Left for today: ${kcal(Math.max(0, targets.calories - eaten.calories))}, ${grams(Math.max(0, targets.protein - eaten.protein))} protein.`);
  } else {
    lines.push('- Nothing eaten logged yet today.');
  }
  lines.push(workoutsToday.length
    ? `- Trained today: ${workoutsToday.map((w) => `${w.workoutName || w.type} ${Math.round(w.duration)} min${w.intensity ? ` (${w.intensity.toLowerCase()})` : ''}`).join(', ')}.`
    : '- No training logged today.');

  // The week before today.
  const weekStart = now.getTime() - 7 * DAY_MS;
  const week = workouts.filter((workout) => new Date(workout.date).getTime() >= weekStart && new Date(workout.date) <= now);
  const pastMeals = diets.filter((diet) => {
    const time = new Date(diet.date).getTime();
    return time >= weekStart && dayKeyIn(diet.date, timeZone) !== today;
  });
  const days = new Map();
  for (const meal of pastMeals) {
    const key = dayKeyIn(meal.date, timeZone);
    const day = days.get(key) || { calories: 0, protein: 0 };
    day.calories += Number(meal.calories) || 0;
    day.protein += Number(meal.protein) || 0;
    days.set(key, day);
  }

  lines.push('', 'Last 7 days:');
  if (week.length) {
    const kinds = {};
    week.forEach((workout) => { kinds[workout.type] = (kinds[workout.type] || 0) + 1; });
    const hard = week.filter((workout) => workout.intensity === 'High').length;
    lines.push(`- ${week.length} ${week.length === 1 ? 'workout' : 'workouts'} (${Object.entries(kinds).map(([kind, count]) => `${count} ${kind.toLowerCase()}`).join(', ')}), ${Math.round(sum(week, 'duration'))} min, ${hard} hard. Their goal is ${user?.goals?.weeklyWorkouts ?? 5} a week.`);
  } else {
    lines.push(`- No workouts logged. Their goal is ${user?.goals?.weeklyWorkouts ?? 5} a week.`);
  }
  if (days.size) {
    const values = [...days.values()];
    lines.push(`- Food logged on ${days.size} of the previous 7 days, about ${kcal(sum(values, 'calories') / days.size)} and ${grams(sum(values, 'protein') / days.size)} protein on those days.`);
  } else {
    lines.push('- No food logged on the previous 7 days.');
  }
  return lines.join('\n');
}

/** Loads the account and builds the brief. `timeZone` and `verdict` come from the client that asked. */
export async function get_coach_context(userId, { timeZone, verdict, now = new Date() } = {}) {
  const since = new Date(now.getTime() - 8 * DAY_MS);
  const [user, diets, workouts, checkIns, notes] = await Promise.all([
    User.findById(userId).select('username goals about').lean(),
    Diet.find({ user: userId, date: { $gte: since } }).lean(),
    Workout.find({ user: userId, date: { $gte: since } }).lean(),
    CheckIn.find({ user: userId }).sort({ dayKey: -1 }).limit(2).lean(),
    CoachNote.find({ user: userId }).sort({ createdAt: -1 }).limit(NOTE_LIMIT).lean(),
  ]);
  return {
    user,
    summary: describeCoachContext({ user, diets, workouts, checkIns, notes, timeZone: safeTimeZone(timeZone), verdict, now }),
  };
}
