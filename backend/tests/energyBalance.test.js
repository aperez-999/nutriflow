import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { energyBalance } from '../utils/energyBalance.js';

const TODAY = '2026-10-29';
const day = (back) => new Date(Date.parse(`${TODAY}T12:00:00Z`) - back * 86400000).toISOString().slice(0, 10);

/** Four weeks of someone eating `kcal` a day while losing `kgPerWeek`, weighing in every other day. */
function weeks({ kcal = 2000, kgPerWeek = -0.5, start = 80, skipFood = [] } = {}) {
  const weighIns = [];
  const diets = [];
  for (let back = 27; back >= 0; back -= 1) {
    if (back % 2 === 0) weighIns.push({ dayKey: day(back), kg: start + (kgPerWeek / 7) * (27 - back) });
    if (!skipFood.includes(back)) diets.push({ date: `${day(back)}T17:00:00Z`, calories: kcal });
  }
  return { weighIns, diets };
}

describe('the weekly check-in', () => {
  it('works out the burn from food eaten and weight lost', () => {
    const result = energyBalance({ ...weeks(), today: TODAY, goal: 'Lose fat', currentTarget: 2400 });
    assert.equal(result.status, 'ready');
    // 2,000 eaten while losing 0.5 kg a week: 2,000 + 0.5 × 7,700 / 7 = 2,550.
    assert.equal(result.expenditure, 2550);
    assert.equal(result.weeklyChangeKg, -0.5);
    assert.equal(result.trendKg, 78.1);
    assert.equal(result.suggestion.calories, 2000, 'Losing 0.5 kg a week means eating 550 under');
    assert.equal(result.line, 'You burn about 2,550 kcal a day. To lose 0.5 kg a week, eat about 2,000 kcal.');
  });

  it('leaves out days that were not fully logged instead of counting them as zero', () => {
    const missing = energyBalance({ ...weeks({ skipFood: [3, 4, 5, 9, 12] }), today: TODAY });
    assert.equal(missing.expenditure, 2550);
    assert.equal(missing.suggestion.calories, 2550, 'Without a goal, it aims to hold the weight');
    assert.match(missing.line, /To hold your weight, eat about 2,550 kcal\./);
  });

  it('says when the suggestion is close enough to the current target', () => {
    const result = energyBalance({ ...weeks({ kgPerWeek: 0 }), today: TODAY, goal: 'Build muscle', currentTarget: 2300 });
    assert.equal(result.expenditure, 2000);
    assert.equal(result.suggestion.calories, 2300);
    assert.equal(result.suggestion.differs, false);
  });

  it('waits for enough data, and says what it is waiting for', () => {
    const { weighIns, diets } = weeks();
    const result = energyBalance({ weighIns: weighIns.slice(-3), diets, today: TODAY });
    assert.equal(result.status, 'learning');
    assert.equal(result.progress.weighIns, 3);
    assert.equal(result.progress.needs.weighIns, 6);
    assert.equal(result.expenditure, undefined);
    assert.match(result.line, /In about two weeks/);
  });
});
