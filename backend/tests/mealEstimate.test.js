import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseMealEstimate } from '../controllers/mealEstimateController.js';

describe('a described meal', () => {
  it('becomes items to check, with numbers for the amount eaten', () => {
    const estimate = parseMealEstimate(`Here you go:
{"title": "Chicken burrito bowl", "items": [
  {"name": "grilled chicken", "grams": 113, "calories": 180, "protein": 32, "carbs": 0, "fats": 7},
  {"name": "White rice", "grams": 150, "calories": 195, "protein": 4, "carbs": 43, "fats": 0.4}
]}`);
    assert.equal(estimate.title, 'Chicken burrito bowl');
    assert.deepEqual(estimate.items[0], { name: 'Grilled chicken', grams: 113, calories: 180, protein: 32, carbs: 0, fats: 7 });
    assert.equal(estimate.items.length, 2);
  });

  it('trusts the macros when the calories disagree with them', () => {
    const estimate = parseMealEstimate('{"title":"Toast","items":[{"name":"Toast","grams":30,"calories":900,"protein":3,"carbs":15,"fats":1}]}');
    assert.equal(estimate.items[0].calories, 81);
  });

  it('drops impossible items, and says no when nothing is left', () => {
    const estimate = parseMealEstimate('{"title":"","items":[{"name":"Rice","grams":150,"calories":195,"protein":4,"carbs":43,"fats":0},{"name":"Rock","grams":-5,"calories":0,"protein":0,"carbs":0,"fats":0},{"name":"","grams":10,"calories":1,"protein":0,"carbs":0,"fats":0}]}');
    assert.equal(estimate.items.length, 1);
    assert.equal(estimate.title, 'Rice', 'Named after its foods when the model gives no title');
    assert.equal(parseMealEstimate('{"title":"","items":[]}'), null);
    assert.equal(parseMealEstimate('I can only help with food.'), null);
    assert.equal(parseMealEstimate('{"items": [oops'), null);
  });
});
