import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { nextUtcMidnight, windowEnd } from '../utils/counters.js';
import { DAILY_ALLOWANCE } from '../middleware/rateLimits.js';
import { groqModelOrder, LIGHT_GROQ_MODEL } from '../ai/config/aiProvider.js';

describe('limits', () => {
  it('count in fixed windows every server agrees on', () => {
    const minute = 60 * 1000;
    assert.equal(windowEnd(minute, Date.UTC(2026, 9, 29, 10, 15, 42)).toISOString(), '2026-10-29T10:16:00.000Z');
    assert.equal(nextUtcMidnight(new Date('2026-10-29T23:59:59Z')).toISOString(), '2026-10-30T00:00:00.000Z');
    assert.equal(nextUtcMidnight(new Date('2026-12-31T08:00:00Z')).toISOString(), '2027-01-01T00:00:00.000Z');
  });

  it('give each account 30 coach messages and 15 meal estimates a day', () => {
    assert.equal(DAILY_ALLOWANCE.coach.limit, 30);
    assert.equal(DAILY_ALLOWANCE.estimate.limit, 15);
  });

  it('start small jobs on the light model and let the coach fall over to it', () => {
    const saved = process.env.GROQ_MODEL;
    delete process.env.GROQ_MODEL;
    assert.deepEqual(groqModelOrder(), ['openai/gpt-oss-120b', LIGHT_GROQ_MODEL]);
    assert.deepEqual(groqModelOrder({ light: true }), [LIGHT_GROQ_MODEL, 'openai/gpt-oss-120b']);
    if (saved !== undefined) process.env.GROQ_MODEL = saved;
  });
});
