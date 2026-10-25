import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { toClientPlan, validatePlanBody } from '../controllers/planController.js';

describe('saved plans', () => {
  it('returns training plans with workouts and meal plans with meals', () => {
    const at = new Date('2026-10-26T08:00:00Z');
    assert.deepEqual(
      toClientPlan({ clientId: 'plan-1', kind: 'training', title: 'Full Body week', generatedAt: at, items: [{ title: 'Legs' }] }),
      { id: 'plan-1', title: 'Full Body week', generatedAt: at.toISOString(), workouts: [{ title: 'Legs' }] }
    );
    assert.deepEqual(
      toClientPlan({ clientId: 'meal-1', kind: 'meal', title: 'Day', calories: 2200, generatedAt: at, items: [{ foodName: 'Oats' }] }),
      { id: 'meal-1', title: 'Day', generatedAt: at.toISOString(), calories: 2200, meals: [{ foodName: 'Oats' }] }
    );
  });

  it('rejects plans that are malformed or too big', () => {
    assert.equal(validatePlanBody({ kind: 'training', title: 'Week', items: [{ title: 'A' }] }), null);
    assert.match(validatePlanBody({ kind: 'cardio', title: 'Week', items: [{}] }), /kind/);
    assert.match(validatePlanBody({ kind: 'meal', title: ' ', items: [{}] }), /title/);
    assert.match(validatePlanBody({ kind: 'meal', title: 'Day', items: [] }), /items/);
    assert.match(validatePlanBody({ kind: 'meal', title: 'Day', items: ['oats'] }), /objects/);
    assert.match(validatePlanBody({ kind: 'meal', title: 'Day', items: [{ note: 'x'.repeat(70000) }] }), /too large/);
  });
});
