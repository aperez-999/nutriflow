import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  calculateDailyCalories,
  calculateDailyReadiness,
  getRhythm,
  getWeeklyCaloriesByDay,
} from './dashboardUtils';

const NOW = new Date(2026, 9, 24, 15, 0);
const daysAgo = (n, hour = 12) => new Date(2026, 9, 24 - n, hour).toISOString();

describe('dashboardUtils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('sums only today\'s calories', () => {
    const diets = [
      { date: daysAgo(0), calories: 500 },
      { date: daysAgo(0), calories: '250' },
      { date: daysAgo(1), calories: 900 },
    ];
    expect(calculateDailyCalories(diets)).toBe(750);
  });

  it('returns seven chart days ending today', () => {
    const week = getWeeklyCaloriesByDay([{ date: daysAgo(0), calories: 400 }]);
    expect(week).toHaveLength(7);
    expect(week[6]).toMatchObject({ date: '2026-10-24', calories: 400 });
  });

  it('keeps readiness within 0-100 for empty history', () => {
    const readiness = calculateDailyReadiness([], []);
    expect(readiness.score).toBeGreaterThanOrEqual(0);
    expect(readiness.score).toBeLessThanOrEqual(100);
    expect(['low', 'moderate', 'high']).toContain(readiness.level);
  });

  describe('getRhythm', () => {
    it('builds Monday-aligned week columns that include today', () => {
      const { columns } = getRhythm([], [], [], 12);
      expect(columns).toHaveLength(12);
      const last = columns[11];
      expect(last[0].dayKey).toBe('2026-10-19'); // Monday
      expect(last.find((d) => d.dayKey === '2026-10-24').isFuture).toBe(false);
      expect(last[6]).toMatchObject({ dayKey: '2026-10-25', isFuture: true });
    });

    it('marks each flow from meals, workouts and check-ins', () => {
      const { columns } = getRhythm(
        [{ date: daysAgo(0) }],
        [{ date: daysAgo(0) }],
        [{ dayKey: '2026-10-24' }],
      );
      const today = columns[11].find((d) => d.dayKey === '2026-10-24');
      expect(today.flows).toEqual({ fuel: true, train: true, recover: true });
      expect(today.count).toBe(3);
    });

    it('forgives a single missed day but not two in a row', () => {
      // logged: today, 2 days ago (1 missed), 3 days ago, then 6 days ago (2 missed) -> streak 3
      const diets = [0, 2, 3, 6].map((n) => ({ date: daysAgo(n) }));
      expect(getRhythm(diets).streak).toBe(3);
    });

    it('does not break the streak just because today is not logged yet', () => {
      const diets = [1, 2].map((n) => ({ date: daysAgo(n) }));
      expect(getRhythm(diets).streak).toBe(2);
      expect(getRhythm(diets).activeDays28).toBe(2);
    });
  });
});
