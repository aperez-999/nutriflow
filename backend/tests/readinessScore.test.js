import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateBodyScore, calculateReadinessScore } from '../../shared/readinessScore.js';

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

  it('is unchanged when no check-in is provided', () => {
    const base = calculateReadinessScore({ now: NOW });
    assert.equal(calculateReadinessScore({ now: NOW, checkIn: null }).score, base.score);
    assert.equal(base.factors.bodyScore, null);
  });

  it('raises the score after a great night and lowers it after a rough one', () => {
    const base = calculateReadinessScore({ now: NOW }).score;
    const great = calculateReadinessScore({
      now: NOW,
      checkIn: { sleepHours: 8, energy: 5, soreness: 1, waterCups: 8 },
    });
    const rough = calculateReadinessScore({
      now: NOW,
      checkIn: { sleepHours: 4.5, energy: 1, soreness: 5, waterCups: 1 },
    });
    assert.ok(great.score > base && base > rough.score, `${great.score} > ${base} > ${rough.score}`);
    assert.match(rough.shortRecommendation, /Sleep ran short/);
  });
});

describe('calculateBodyScore', () => {
  it('maps an ideal check-in to 100 and the worst to a low score', () => {
    assert.equal(calculateBodyScore({ sleepHours: 8, energy: 5, soreness: 1, waterCups: 10 }), 100);
    assert.equal(calculateBodyScore({ sleepHours: 3, energy: 1, soreness: 5, waterCups: 0 }), 8);
    assert.equal(calculateBodyScore(null), null);
  });
});

describe('measured heart signals', () => {
  const felt = { sleepHours: 7.5, energy: 3, soreness: 2, waterCups: 6 };

  it('leave a hand-typed check-in alone', () => {
    const base = calculateBodyScore(felt);
    assert.equal(calculateBodyScore({ ...felt, hrvChange: null, restingHrChange: undefined }), base);
    assert.equal(calculateBodyScore({ ...felt, hrvChange: 3, restingHrChange: 2 }), base);
  });

  it('lower the body score when HRV drops or resting heart rate climbs', () => {
    const base = calculateBodyScore(felt);
    assert.equal(calculateBodyScore({ ...felt, hrvChange: -10 }), base - 5);
    assert.equal(calculateBodyScore({ ...felt, hrvChange: -20 }), base - 10);
    assert.equal(calculateBodyScore({ ...felt, hrvChange: 12 }), base + 4);
    assert.equal(calculateBodyScore({ ...felt, hrvChange: -20, restingHrChange: 6 }), base - 15);
    assert.equal(calculateBodyScore({ sleepHours: 8, energy: 5, soreness: 1, waterCups: 10, hrvChange: 20 }), 100);
    assert.equal(calculateBodyScore({ sleepHours: 3, energy: 1, soreness: 5, waterCups: 0, hrvChange: -40, restingHrChange: 9 }), 0);
  });

  it('say why first, in plain numbers', () => {
    const result = calculateReadinessScore({ now: NOW, checkIn: { ...felt, hrvChange: -18.4, restingHrChange: 6 } });
    assert.equal(result.recommendations[0], 'Your HRV is 18% under your usual, a sign your body is still recovering. Keep today easy.');
    assert.match(result.recommendations[1], /^Your resting heart rate is 6 beats above your usual\./);
  });
});
