import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { followUpsFor, MAX_FOLLOW_UPS } from '../ai/utils/followUps.js';

describe('followUpsFor', () => {
  it('offers at most four unique follow-ups', () => {
    for (const [message, intent] of [['hi', 'coach'], ['How much protein?', 'coach'], ['How ready am I?', 'readiness'], ['Make a meal plan', 'meal_plan']]) {
      const items = followUpsFor({ message, intent });
      assert.ok(items.length > 0 && items.length <= MAX_FOLLOW_UPS);
      assert.equal(new Set(items).size, items.length);
    }
  });

  it('does not suggest the same plan again right after making one', () => {
    const items = followUpsFor({ message: 'Plan my week [[RETURN_JSON_WORKOUT_PLAN]]', intent: 'coach' });
    assert.ok(!items.includes('Generate Weekly Plan'));
    assert.ok(items.includes('Make the week easier'));
  });

  it('continues the topic of a free question', () => {
    const items = followUpsFor({ message: 'What should I eat before a run?', intent: 'coach' });
    assert.ok(items.includes('What should I eat before training?') || items.includes('Create Meal Plan'));
  });
});
