import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { householdMeasures, orderFoodResults, toFoodResult } from '../controllers/foodController.js';

const food = (description, dataType, extra = {}) => ({
  description,
  dataType,
  brandOwner: null,
  nutrition: { calories: 100, protein: 2, carbs: 20, fats: 1 },
  measures: [],
  ...extra,
});

describe('household measures', () => {
  it('keeps the ones a person would pick, most useful first', () => {
    const measures = householdMeasures({
      foodMeasures: [
        { disseminationText: 'Quantity not specified', gramWeight: 126, rank: 1 },
        { disseminationText: '1 cup, mashed', gramWeight: 225, rank: 5 },
        { disseminationText: '1 banana', gramWeight: 126.4, rank: 2 },
        { disseminationText: '1 oz, raw', gramWeight: 28.35, rank: 3 },
        { disseminationText: 'Guideline amount per fl oz of beverage', gramWeight: 2.5, rank: 4 },
        { disseminationText: '1 Banana', gramWeight: 126, rank: 6 },
        { disseminationText: '2 slices', gramWeight: 12, rank: 7 },
      ],
    });
    assert.deepEqual(measures, [{ label: 'banana', grams: 126.4 }, { label: 'cup, mashed', grams: 225 }]);
    assert.deepEqual(householdMeasures({}), []);
  });

  it("uses a packaged food's own serving words, but only for grams and millilitres", () => {
    const yogurt = toFoodResult({ fdcId: 1, description: 'GREEK YOGURT', dataType: 'Branded', servingSize: 150, servingSizeUnit: 'g', householdServingFullText: '1 container', foodNutrients: [{ nutrientId: 1008, value: 59 }] });
    assert.equal(yogurt.householdServing, '1 container');
    assert.equal(yogurt.servingSize, 150);
    assert.equal(yogurt.nutrition.calories, 59);
    const odd = toFoodResult({ fdcId: 2, description: 'OATMEAL', dataType: 'Branded', servingSize: 45, servingSizeUnit: 'IU', householdServingFullText: '1/2 cup', foodNutrients: [] });
    assert.equal(odd.householdServing, undefined);
    assert.equal(odd.servingSize, 100);
  });
});

describe('the order of search results', () => {
  it('shows the plain food before packaged ones named the same', () => {
    const ordered = orderFoodResults([
      food('BANANA', 'Branded', { brandOwner: 'Wonder Natural Foods' }),
      food('Banana split', 'Survey (FNDDS)', { measures: [{ label: 'banana split', grams: 490 }] }),
      food('Banana, raw', 'Survey (FNDDS)', { measures: [{ label: 'banana', grams: 126 }, { label: 'cup', grams: 150 }, { label: 'slice', grams: 6 }] }),
    ], 'banana');
    assert.deepEqual(ordered.map((f) => f.description), ['Banana, raw', 'Banana split', 'BANANA']);
  });

  it("reads USDA's names the way they're written", () => {
    const ordered = orderFoodResults([
      food('Beans and white rice', 'Survey (FNDDS)'),
      food('Rice, white, cooked, no added fat', 'Survey (FNDDS)', { measures: [{ label: 'cup, cooked', grams: 158 }] }),
    ], 'white rice');
    assert.equal(ordered[0].description, 'Rice, white, cooked, no added fat');
  });

  it('puts a named brand first, without taking plain words for brands', () => {
    const ordered = orderFoodResults([
      food('Nutrition bar (protein)', 'Survey (FNDDS)'),
      food('PROTEIN BAR', 'Branded', { brandOwner: 'Supreme Protein' }),
      food('QUEST BAR, CHOCOLATE CHIP', 'Branded', { brandOwner: 'Quest Nutrition' }),
    ], 'quest protein bar');
    assert.equal(ordered[0].description, 'QUEST BAR, CHOCOLATE CHIP');
    assert.equal(ordered[1].description, 'Nutrition bar (protein)', '"protein" names a food, not a brand');
  });
});
