import { describe, expect, it } from 'vitest';
import { DEFAULT_ANSWERS, scoreSampleDay } from './tryDay';

const NOW = new Date('2026-10-25T12:00:00');

describe('scoreSampleDay', () => {
  it('reaches all three verdicts from the controls', () => {
    const best = scoreSampleDay({ sleepHours: 8, energy: 5, soreness: 1, yesterday: 'rest', fuel: 'solid' }, NOW);
    const middle = scoreSampleDay({ sleepHours: 6, energy: 3, soreness: 3, yesterday: 'easy', fuel: 'light' }, NOW);
    const worst = scoreSampleDay({ sleepHours: 4.5, energy: 1, soreness: 5, yesterday: 'hard', fuel: 'light' }, NOW);
    expect(best.level).toBe('high');
    expect(middle.level).toBe('moderate');
    expect(worst.level).toBe('low');
    expect(best.score).toBeGreaterThan(middle.score);
    expect(middle.score).toBeGreaterThan(worst.score);
  });

  it('gives a next step and flow parts between 0 and 1', () => {
    const result = scoreSampleDay(DEFAULT_ANSWERS, NOW);
    expect(result.next).toMatch(/\w/);
    Object.values(result.parts).forEach((part) => {
      expect(part).toBeGreaterThanOrEqual(0);
      expect(part).toBeLessThanOrEqual(1);
    });
  });

  it('does not depend on the time of day it is opened', () => {
    const morning = scoreSampleDay(DEFAULT_ANSWERS, new Date('2026-10-25T06:00:00'));
    const night = scoreSampleDay(DEFAULT_ANSWERS, new Date('2026-10-25T23:00:00'));
    expect(night.score).toBe(morning.score);
  });
});
