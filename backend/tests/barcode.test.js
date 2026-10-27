import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { foodFromOpenFoodFacts, foodFromUsda, normalizeBarcode, usdaBarcodeQuery } from '../controllers/barcodeController.js';

describe('barcode lookup', () => {
  it('accepts 8 to 14 digits only', () => {
    assert.equal(normalizeBarcode('3017620422003'), '3017620422003');
    assert.equal(normalizeBarcode(' 038000138416 '), '038000138416');
    assert.equal(normalizeBarcode('1234567'), null);
    assert.equal(normalizeBarcode('12345678901234567'), null);
    assert.equal(normalizeBarcode('30176204220a3'), null);
    assert.equal(normalizeBarcode(undefined), null);
    assert.equal(normalizeBarcode('00000000'), null, 'USDA has all-zero placeholders');
    assert.equal(normalizeBarcode('0000000012345'), null);
  });

  it('asks USDA for every padding of a UPC', () => {
    assert.equal(
      usdaBarcodeQuery('818290019790'),
      'gtinUpc:818290019790 OR gtinUpc:0818290019790 OR gtinUpc:00818290019790'
    );
    assert.equal(
      usdaBarcodeQuery('0038000138416'),
      'gtinUpc:0038000138416 OR gtinUpc:38000138416 OR gtinUpc:038000138416 OR gtinUpc:00038000138416'
    );
  });

  it('reads an Open Food Facts product with a serving', () => {
    const food = foodFromOpenFoodFacts({
      product_name: 'Original Potato Crisps',
      brands: 'Pringles, Kellogg',
      serving_size: '1 portion (28.349 g)',
      serving_quantity: '28.349',
      nutriments: { 'energy-kcal_100g': 536, proteins_100g: 3.5, carbohydrates_100g: 51, fat_100g: 34 },
    }, '038000138416');

    assert.equal(food.name, 'Original Potato Crisps');
    assert.equal(food.brand, 'Pringles');
    assert.equal(food.unit, 'g');
    assert.deepEqual(food.per100, { calories: 536, protein: 3.5, carbs: 51, fats: 34 });
    assert.equal(food.serving.amount, 28.3);
    assert.equal(food.serving.nutrition.calories, 152);
  });

  it('reads drinks per 100 ml', () => {
    const food = foodFromOpenFoodFacts({
      product_name: 'Coca-Cola Original',
      serving_quantity: 330,
      serving_quantity_unit: 'ml',
      nutriments: { 'energy-kcal_100g': 42.4, proteins_100g: 0, carbohydrates_100g: 10.6, fat_100g: 0 },
    }, '5449000000996');

    assert.equal(food.unit, 'ml');
    assert.equal(food.serving.nutrition.calories, 139.9);
  });

  it('falls back to per-serving numbers when there are no per-100 g ones', () => {
    const food = foodFromOpenFoodFacts({
      product_name: 'Protein bar',
      serving_size: '1 bar',
      nutriments: { 'energy-kcal_serving': 210, proteins_serving: 20 },
    }, '12345678');

    assert.equal(food.per100, null);
    assert.deepEqual(food.serving, { label: '1 bar', amount: null, nutrition: { calories: 210, protein: 20, carbs: 0, fats: 0 } });
  });

  it('skips products without calories', () => {
    assert.equal(foodFromOpenFoodFacts({ product_name: 'Mystery', nutriments: {} }, '12345678'), null);
    assert.equal(foodFromOpenFoodFacts(undefined, '12345678'), null);
  });

  it('reads a USDA branded food', () => {
    const food = foodFromUsda({
      description: 'GREEK YOGURT',
      brandOwner: 'Chobani',
      gtinUpc: '818290014337',
      servingSize: 150,
      servingSizeUnit: 'GRM',
      householdServingFullText: '1 container',
      foodNutrients: [
        { nutrientId: 1008, value: 53 },
        { nutrientId: 1003, value: 10 },
        { nutrientId: 1005, value: 3.6 },
        { nutrientId: 1004, value: 0 },
      ],
    }, '818290014337');

    assert.equal(food.source, 'USDA');
    assert.equal(food.brand, 'Chobani');
    assert.equal(food.serving.label, '1 container (150 g)');
    assert.equal(food.serving.nutrition.protein, 15);
  });
});
