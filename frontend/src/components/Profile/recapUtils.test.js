import { describe, expect, it } from 'vitest';
import { getWeeklyRecap, recapShareText } from './recapUtils';

const NOW = new Date(2026, 9, 26, 18, 0); // Mon Oct 26 2026, 6 pm local
const at = (daysAgo, hour = 12) => new Date(2026, 9, 26 - daysAgo, hour).toISOString();

describe('getWeeklyRecap', () => {
  const diets = [
    { date: at(0), calories: 600, protein: 40 },
    { date: at(0, 19), calories: 900, protein: 50 }, // later today: not eaten yet at 6 pm
    { date: at(2), calories: 2000, protein: 120 },
    { date: at(9), calories: 1800, protein: 100 },
  ];
  const workouts = [{ date: at(1), duration: 45, intensity: 'High' }, { date: at(8), duration: 30, intensity: 'Low' }];
  const checkIns = [{ dayKey: '2026-10-26', sleepHours: 8, energy: 5, soreness: 1, waterCups: 6 }];

  it('compares the last 7 days with the 7 before', () => {
    const { week, lastWeek } = getWeeklyRecap(diets, workouts, checkIns, NOW);
    expect(week).toMatchObject({ daysLogged: 3, sessions: 1, minutes: 45, meals: 3, checkIns: 1 });
    expect(week.avgCalories).toBe(1750); // (600 + 900 + 2000) over 2 days with meals
    expect(lastWeek).toMatchObject({ daysLogged: 2, sessions: 1, minutes: 30, meals: 1, checkIns: 0 });
  });

  it('scores each of the 7 days, oldest first, and picks the best logged day', () => {
    const { days, best } = getWeeklyRecap(diets, workouts, checkIns, NOW);
    expect(days).toHaveLength(7);
    expect(days[6].dayKey).toBe('2026-10-26');
    expect(days.filter((d) => d.logged).map((d) => d.dayKey)).toEqual(['2026-10-24', '2026-10-25', '2026-10-26']);
    expect(best.logged).toBe(true);
    expect(best.score).toBe(Math.max(...days.filter((d) => d.logged).map((d) => d.score)));
  });

  it('does not score a day with logs from after it', () => {
    const early = getWeeklyRecap([], [{ date: at(0, 9), duration: 60, intensity: 'High' }], [], NOW).days[5];
    const none = getWeeklyRecap([], [], [], NOW).days[5];
    expect(early.score).toBe(none.score); // yesterday is unaffected by today's workout
  });

  it('has no best day in an empty week', () => {
    expect(getWeeklyRecap([], [], [], NOW).best).toBeNull();
  });
});

describe('recapShareText', () => {
  it('reads as one sentence', () => {
    const recap = getWeeklyRecap([], [{ date: at(1), duration: 45 }], [], NOW);
    expect(recapShareText(recap)).toMatch(/^My NutriFlow week: 1 of 7 days logged, 1 session \(45 min\), best day Sunday at readiness \d+\.$/);
  });
});
