import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateReadinessScore } from '../ai/utils/readinessScore.js';

const NOW = new Date(2026, 9, 24, 15, 0);
const hoursAgo = (h) => new Date(NOW.getTime() - h * 3600000).toISOString();

describe('calculateReadinessScore', () => {
  it('returns a bounded score and level for empty history', () => {
    const result = calculateReadinessScore({ now: NOW });
    assert.ok(result.score >= 0 && result.score <= 100);
    assert.ok(['low', 'moderate', 'high'].includes(result.level));
    assert.ok(result.recommendations.length > 0);
  });

  it('scores a well-fueled, well-rested week above a fatigued, unfueled one', () => {
    const rested = calculateReadinessScore({
      now: NOW,
      workouts: [
        { date: hoursAgo(50), duration: 45, intensity: 'Medium' },
        { date: hoursAgo(98), duration: 40, intensity: 'Medium' },
      ],
      diets: [0, 3, 6, 24, 27, 30].map((h) => ({ date: hoursAgo(h), calories: 700, protein: 40 })),
    });
    const fatigued = calculateReadinessScore({
      now: NOW,
      workouts: [
        { date: hoursAgo(4), duration: 90, intensity: 'High' },
        { date: hoursAgo(28), duration: 80, intensity: 'High' },
        { date: hoursAgo(52), duration: 85, intensity: 'High' },
      ],
      diets: [],
    });
    assert.ok(rested.score > fatigued.score, `${rested.score} should beat ${fatigued.score}`);
  });
});
