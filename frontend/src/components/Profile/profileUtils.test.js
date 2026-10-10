import { describe, expect, it } from 'vitest';
import { getBestStreak, getProfileStats, memberSince } from './profileUtils';

describe('profileUtils', () => {
  it('finds the longest forgiving streak across history', () => {
    // 1-3 active, 4 missed (grace), 5-6 active => 5; then 7-8 missed ends it; 9 active => 1.
    const days = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-05', '2026-10-06', '2026-10-09'];
    expect(getBestStreak(days)).toBe(5);
    expect(getBestStreak([])).toBe(0);
  });

  it('reads the creation date from an ObjectId', () => {
    expect(memberSince('6add75ae963d7f8d2f9c29c2').getUTCFullYear()).toBe(2026);
    expect(memberSince('not-an-id')).toBeNull();
  });

  it('summarizes logs into the profile', () => {
    const at = (day) => new Date(2026, 9, day, 12).toISOString();
    const stats = getProfileStats(
      [{ date: at(1), foodName: 'Oats' }, { date: at(2), foodName: 'Oats' }, { date: at(2), foodName: 'Rice' }],
      [{ date: at(2), type: 'Strength', workoutName: 'Legs' }],
      [{ dayKey: '2026-10-03' }],
    );
    expect(stats).toMatchObject({ activeDays: 3, meals: 3, workouts: 1, checkIns: 1, bestStreak: 3 });
    expect(stats.mix).toEqual({ fuel: 2, train: 1, recover: 1 });
    expect(stats.topFoods[0]).toEqual({ label: 'Oats', count: 2 });
  });
});
