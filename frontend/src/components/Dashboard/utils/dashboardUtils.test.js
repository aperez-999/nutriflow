import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  calculateDailyCalories,
  calculateDailyReadiness,
  calculateProgress,
  getLoggingStreak,
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

  it('caps progress at 100 and guards a zero goal', () => {
    expect(calculateProgress(3000, 2000)).toBe(100);
    expect(calculateProgress(500, 0)).toBe(0);
  });

  it('returns seven chart days ending today', () => {
    const week = getWeeklyCaloriesByDay([{ date: daysAgo(0), calories: 400 }]);
    expect(week).toHaveLength(7);
    expect(week[6]).toMatchObject({ date: '2026-10-24', calories: 400 });
  });

  it('counts consecutive logged days back from today', () => {
    const diets = [{ date: daysAgo(0) }, { date: daysAgo(1) }];
    const workouts = [{ date: daysAgo(2) }, { date: daysAgo(4) }];
    expect(getLoggingStreak(diets, workouts)).toBe(3);
  });

  it('keeps readiness within 0-100 for empty history', () => {
    const readiness = calculateDailyReadiness([], []);
    expect(readiness.score).toBeGreaterThanOrEqual(0);
    expect(readiness.score).toBeLessThanOrEqual(100);
    expect(['low', 'moderate', 'high']).toContain(readiness.level);
  });
});
