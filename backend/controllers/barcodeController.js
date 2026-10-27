// Barcode lookup: Open Food Facts first (free, no key, wide packaged-food coverage), then
// USDA branded foods by UPC. Both answers become one shape, with nutrition per 100 g (or ml)
// and per serving when the label gives one.

const LOOKUP_TIMEOUT_MS = 6000;
const USER_AGENT = 'NutriFlow/1.0 (https://nutriflowdev.vercel.app)';
const NOT_FOUND = "We couldn't find that barcode. You can still log it by typing the numbers.";

/**
 * Digits only, 8 to 14 of them (EAN-8, UPC-A, EAN-13, GTIN-14); otherwise null. Codes that are
 * mostly leading zeros are refused: USDA stores some products under all-zero placeholders.
 */
export function normalizeBarcode(value) {
  const digits = String(value ?? '').trim();
  if (!/^\d{8,14}$/.test(digits)) return null;
  return digits.replace(/^0+/, '').length >= 6 ? digits : null;
}

const round = (value) => Math.round(Number(value) * 10) / 10;

function nutrition(calories, protein, carbs, fats) {
  if (!Number.isFinite(Number(calories)) || calories === null || calories === undefined) return null;
  return {
    calories: round(calories),
    protein: round(protein ?? 0),
    carbs: round(carbs ?? 0),
    fats: round(fats ?? 0),
  };
}

const unitOf = (unit) => (/^(ml|mlt|l)$/i.test(String(unit || '').trim()) ? 'ml' : 'g');

/** An Open Food Facts product, or null when it has no calories to log. */
export function foodFromOpenFoodFacts(product, barcode) {
  if (!product) return null;
  const n = product.nutriments || {};
  const per100 = nutrition(n['energy-kcal_100g'], n.proteins_100g, n.carbohydrates_100g, n.fat_100g);
  const servingNutrition = nutrition(n['energy-kcal_serving'], n.proteins_serving, n.carbohydrates_serving, n.fat_serving);
  const servingAmount = Number(product.serving_quantity);
  const unit = unitOf(product.serving_quantity_unit || product.product_quantity_unit);

  let serving = null;
  if (Number.isFinite(servingAmount) && servingAmount > 0 && per100) {
    serving = {
      label: product.serving_size || `1 serving (${round(servingAmount)} ${unit})`,
      amount: round(servingAmount),
      nutrition: nutrition(
        (per100.calories * servingAmount) / 100,
        (per100.protein * servingAmount) / 100,
        (per100.carbs * servingAmount) / 100,
        (per100.fats * servingAmount) / 100
      ),
    };
  } else if (servingNutrition) {
    serving = { label: product.serving_size || '1 serving', amount: null, nutrition: servingNutrition };
  }

  if (!per100 && !serving) return null;
  return {
    barcode,
    name: String(product.product_name || '').trim() || 'Unnamed product',
    brand: String(product.brands || '').split(',')[0].trim() || null,
    source: 'Open Food Facts',
    unit,
    per100,
    serving,
  };
}

/** A USDA branded food (nutrients are per 100 g or ml), or null without calories. */
export function foodFromUsda(food, barcode) {
  if (!food) return null;
  const value = (id) => food.foodNutrients?.find((item) => item.nutrientId === id)?.value;
  const per100 = nutrition(value(1008), value(1003), value(1005), value(1004));
  if (!per100) return null;

  const amount = Number(food.servingSize);
  const unit = unitOf(food.servingSizeUnit);
  const serving = Number.isFinite(amount) && amount > 0
    ? {
        label: food.householdServingFullText
          ? `${food.householdServingFullText} (${round(amount)} ${unit})`
          : `1 serving (${round(amount)} ${unit})`,
        amount: round(amount),
        nutrition: nutrition(
          (per100.calories * amount) / 100,
          (per100.protein * amount) / 100,
          (per100.carbs * amount) / 100,
          (per100.fats * amount) / 100
        ),
      }
    : null;

  return {
    barcode,
    name: String(food.description || '').trim() || 'Unnamed product',
    brand: food.brandName || food.brandOwner || null,
    source: 'USDA',
    unit,
    per100,
    serving,
  };
}

/**
 * USDA matches only the exact digits it stored, and it stores the same product as 12, 13 or
 * 14 digits (sometimes 11), while a scanner reads UPC-A (12) or EAN-13 (13). Ask for every padding.
 */
export function usdaBarcodeQuery(barcode) {
  const digits = barcode.replace(/^0+/, '');
  const forms = new Set([barcode, digits, ...[11, 12, 13, 14].map((length) => digits.padStart(length, '0'))]);
  return [...forms].filter((form) => form.length >= 8).map((form) => `gtinUpc:${form}`).join(' OR ');
}

async function fromOpenFoodFacts(barcode) {
  const fields = 'product_name,brands,nutriments,serving_size,serving_quantity,serving_quantity_unit,product_quantity_unit';
  const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}?fields=${fields}`, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Open Food Facts answered ${response.status}`);
  const data = await response.json();
  return data.status === 1 ? foodFromOpenFoodFacts(data.product, barcode) : null;
}

async function fromUsda(barcode) {
  if (!process.env.USDA_API_KEY) return null;
  const response = await fetch(
    `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(process.env.USDA_API_KEY)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: usdaBarcodeQuery(barcode), dataType: ['Branded'], pageSize: 10 }),
      signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
    }
  );
  if (!response.ok) throw new Error(`USDA answered ${response.status}`);
  const data = await response.json();
  // UPC-A and EAN-13 differ by a leading zero, so compare without them.
  const wanted = barcode.replace(/^0+/, '');
  const match = data.foods?.find((food) => String(food.gtinUpc || '').replace(/^0+/, '') === wanted);
  return foodFromUsda(match, barcode);
}

// @desc    Look up a packaged food by its barcode
// @route   GET /api/food/barcode/:code
export const lookUpBarcode = async (req, res) => {
  const barcode = normalizeBarcode(req.params.code);
  if (!barcode) {
    return res.status(400).json({ message: 'That does not look like a product barcode.' });
  }

  // One source being down shouldn't hide an answer from the other.
  let failures = 0;
  for (const source of [fromOpenFoodFacts, fromUsda]) {
    try {
      const food = await source(barcode);
      if (food) return res.json({ food });
    } catch (error) {
      failures += 1;
      console.error('Barcode lookup error:', error.message);
    }
  }

  if (failures === 2) {
    return res.status(503).json({ message: 'Barcode lookup is unavailable right now. You can still log it by typing the numbers.' });
  }
  return res.status(404).json({ message: NOT_FOUND });
};
