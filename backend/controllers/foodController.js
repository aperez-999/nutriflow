import { cached } from '../utils/lookupCache.js';


const FOOD_STOP_WORDS = new Set(['and', '&', 'with', 'the', 'a', 'an', 'of']);
const FOOD_FALLBACKS = [
  { description: 'Chicken breast with rice', nutrition: { calories: 330, protein: 32, carbs: 28, fats: 8 } },
  { description: 'Greek yogurt bowl', nutrition: { calories: 190, protein: 17, carbs: 16, fats: 4 } },
  { description: 'Salmon with potatoes', nutrition: { calories: 410, protein: 30, carbs: 27, fats: 18 } },
  { description: 'Eggs and toast', nutrition: { calories: 280, protein: 17, carbs: 21, fats: 12 } },
  { description: 'Turkey sandwich', nutrition: { calories: 360, protein: 24, carbs: 34, fats: 11 } },
];

function tokenizeSearchText(text = '') {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((token) => token.trim())
    .filter((token) => token && !FOOD_STOP_WORDS.has(token));
}

// Words that describe how a food is prepared, not a different food.
const DESCRIPTORS = new Set(['raw', 'cooked', 'plain', 'whole', 'fresh', 'nfs', 'regular', 'prepared', 'boiled', 'baked',
  'grilled', 'roasted', 'steamed', 'no', 'added', 'fat', 'salt', 'skin', 'not', 'eaten', 'without', 'unsalted', 'large', 'medium', 'small']);

/**
 * How well a food matches the search. USDA names plain foods "Rice, white, cooked" and
 * "Fish, salmon, grilled", so a name part that is the search itself counts most; then the
 * words matched; then a small preference for plainer names and foods with household measures.
 */
export function rankFoodResult(food, query) {
  const normalizedQuery = query.trim().toLowerCase();
  const description = (food.description || '').toLowerCase();
  const haystack = `${description} ${(food.brandOwner || '').toLowerCase()} ${(food.ingredients || '').toLowerCase()}`;
  const tokens = tokenizeSearchText(query);
  const sameWords = (a, b) => a.length === b.length && a.every((word) => b.includes(word));
  const segments = description.split(',').map((part) => tokenizeSearchText(part));

  let score = 0;
  if (description === normalizedQuery) score += 120;
  if (segments.some((part) => sameWords(part, tokens)) || sameWords(segments.slice(0, 2).flat(), tokens)) score += 45;
  if (description.startsWith(normalizedQuery)) score += 40;
  if (description.includes(normalizedQuery)) score += 25;

  const matchedTokens = tokens.filter((token) => haystack.includes(token)).length;
  score += matchedTokens * 18;
  if (tokens.length > 1 && matchedTokens === tokens.length) score += 40;

  const dataType = (food.dataType || '').toLowerCase();
  if (dataType.includes('foundation')) score += 18;
  else if (dataType.includes('survey')) score += 14;
  else if (dataType.includes('legacy')) score += 12;
  else if (dataType.includes('branded')) score += 8;

  if (food.nutrition?.protein >= 15) score += 4;
  if (food.nutrition?.calories > 0) score += 8;

  // The plainer match first: "Banana, raw" before "Banana split".
  const extraWords = segments.flat().filter((word) => !DESCRIPTORS.has(word) && !tokens.some((token) => word.startsWith(token))).length;
  score -= Math.min(extraWords, 6) * 3;
  // A food with cups, slices or pieces is easier to log, and the common ones have the most.
  score += Math.min(food.measures?.length || 0, 5) * 1.5;

  return score;
}

/**
 * The results in the order to show them. A search that names a brand ("quest bar") shows
 * that brand first. Otherwise plain foods come first (up to five), then packaged ones: a
 * packaged food called just "BANANA" is usually a flavor or a mix, not a banana.
 */
export function orderFoodResults(foods, query) {
  const tokens = tokenizeSearchText(query);
  const ranked = foods
    .map((food) => ({ ...food, matchScore: rankFoodResult(food, query) }))
    .sort((a, b) => b.matchScore - a.matchScore);
  // A search word names a brand when packaged foods carry it in their maker's name and no
  // plain food is called by it ("quest" in "quest bar", but not "protein").
  const isBranded = (food) => (food.dataType || '').toLowerCase().includes('branded');
  const plainNames = ranked.filter((food) => !isBranded(food)).map((food) => (food.description || '').toLowerCase()).join(' ');
  const brandWords = tokens.filter((token) => token.length > 2 && !plainNames.includes(token));
  const fromNamedBrand = ranked.filter((food) => isBranded(food) && brandWords.some((token) => (food.brandOwner || '').toLowerCase().includes(token)));
  const rest = ranked.filter((food) => !fromNamedBrand.includes(food));
  const plain = rest.filter((food) => !isBranded(food));
  const packaged = rest.filter(isBranded);
  return [...fromNamedBrand, ...plain.slice(0, 5), ...packaged, ...plain.slice(5)].slice(0, 8);
}

function buildFallbackFoods(query) {
  const tokens = tokenizeSearchText(query);
  return FOOD_FALLBACKS
    .map((food, index) => ({
      fdcId: `fallback-food-${index}`,
      description: food.description,
      brandOwner: null,
      ingredients: null,
      dataType: 'Fallback',
      nutrition: {
        ...food.nutrition,
        fiber: 0,
        sugar: 0,
        sodium: 0,
      },
      servingSize: 1,
      servingSizeUnit: 'serving',
      matchScore: tokens.filter((token) => food.description.toLowerCase().includes(token)).length,
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);
}

const round1 = (value) => Math.round(value * 10) / 10;

// USDA rows that aren't a measure someone would pick.
const NOT_A_MEASURE = /^(quantity not specified|guideline amount|nfs\b)/i;
// Units the app already offers on its own.
const PLAIN_UNIT = /^(oz|ounces?|fl oz|g|grams?|ml|millilit(er|re)s?)\b/i;

/**
 * A food's household measures, as "1 <label>" = grams: { label: 'cup, cooked', grams: 158 }.
 * Most useful first (USDA's rank), at most five.
 */
export function householdMeasures(food) {
  const seen = new Set();
  const measures = [];
  const ranked = [...(food.foodMeasures || [])].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
  for (const measure of ranked) {
    const text = String(measure.disseminationText || '').trim();
    const grams = Number(measure.gramWeight);
    const label = text.match(/^1\s+(.+)$/)?.[1]?.trim();
    if (!label || !(grams > 0) || NOT_A_MEASURE.test(text) || NOT_A_MEASURE.test(label) || PLAIN_UNIT.test(label)) continue;
    if (seen.has(label.toLowerCase())) continue;
    seen.add(label.toLowerCase());
    measures.push({ label, grams: round1(grams) });
    if (measures.length === 5) break;
  }
  return measures;
}

/** A USDA search result as the clients use it: nutrition per 100 g (or ml), plus serving and measures. */
export function toFoodResult(food) {
  const nutrients = food.foodNutrients || [];
  const getNutrient = (nutrientId) => {
    const nutrient = nutrients.find((n) => n.nutrientId === nutrientId);
    return nutrient ? Math.round(nutrient.value * 100) / 100 : 0;
  };
  // Servings only count in grams or millilitres (some labels say "45 IU").
  const servingUnit = String(food.servingSizeUnit || 'g').trim().toLowerCase();
  const hasServing = ['g', 'grm', 'gm', 'ml', 'mlt'].includes(servingUnit) && Number(food.servingSize) > 0;
  const household = hasServing && typeof food.householdServingFullText === 'string' ? food.householdServingFullText.trim() : '';

  return {
    fdcId: food.fdcId,
    description: food.description,
    brandOwner: food.brandOwner || null,
    ingredients: food.ingredients || null,
    dataType: food.dataType || null,
    nutrition: {
      calories: getNutrient(1008), // Energy (kcal)
      protein: getNutrient(1003),  // Protein
      carbs: getNutrient(1005),    // Carbohydrates
      fats: getNutrient(1004),     // Total lipid (fat)
      fiber: getNutrient(1079),    // Fiber
      sugar: getNutrient(2000),    // Sugars
      sodium: getNutrient(1093),   // Sodium
    },
    servingSize: hasServing ? food.servingSize : 100,
    servingSizeUnit: hasServing ? food.servingSizeUnit : 'g',
    // A packaged food's serving as its label words it ("2 Tbsp"), when it has one.
    ...(household && { householdServing: household }),
    measures: householdMeasures(food),
  };
}

/** One USDA search, trimmed to what the apps use (USDA's own answer is far larger). */
async function searchUsdaFoods(query, dataType) {
  const data = await searchUsda(query, dataType);
  return { foods: (data.foods || []).map(toFoodResult), totalHits: data.totalHits || 0 };
}

async function searchUsda(query, dataType) {
  const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(process.env.USDA_API_KEY)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, dataType, pageSize: 25 }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`USDA API error: ${response.status} - ${errorData.error || response.statusText}`);
  }
  return response.json();
}

export const searchFood = async (req, res) => {
  try {
    const rawQuery = typeof req.query?.query === 'string' ? req.query.query : '';
    const query = rawQuery.trim();
    
    if (!query || query.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const queryTokens = tokenizeSearchText(query);
    if (queryTokens.length === 0) {
      return res.status(400).json({ message: 'Enter a more specific food search.' });
    }

    if (!process.env.USDA_API_KEY) {
      return res.status(200).json({
        foods: buildFallbackFoods(query),
        totalResults: 0,
        message: 'USDA search is unavailable right now. Showing fallback suggestions.',
      });
    }

    // Plain foods (with household measures like "1 cup, cooked") and packaged ones are asked
    // for separately, each in USDA's relevance order, so a search for "banana" finds bananas
    // before banana syrup; the ranking below then merges them.
    // Each half is cached for 30 days by the words searched.
    const words = queryTokens.join(' ');
    const [generic, branded] = await Promise.allSettled([
      cached(`usda:plain:${words}`, 30, () => searchUsdaFoods(query, ['Foundation', 'SR Legacy', 'Survey (FNDDS)'])),
      cached(`usda:branded:${words}`, 30, () => searchUsdaFoods(query, ['Branded'])),
    ]);
    if (generic.status === 'rejected' && branded.status === 'rejected') throw generic.reason;
    const halves = [generic, branded].filter((result) => result.status === 'fulfilled').map((result) => result.value);
    const transformedFoods = halves.flatMap((half) => half.foods);
    const totalHits = halves.reduce((sum, half) => sum + half.totalHits, 0);

    // No calories means an incomplete entry; over 900 per 100 g (pure fat) is a typo.
    const validFoods = transformedFoods.filter((food) => food.nutrition.calories > 0 && food.nutrition.calories <= 900);

    res.status(200).json({
      foods: orderFoodResults(validFoods, query),
      totalResults: totalHits,
    });

  } catch (error) {
    console.error('Food search error:', error);
    const rawQuery = typeof req.query?.query === 'string' ? req.query.query : '';
    const query = rawQuery.trim();
    res.status(200).json({ 
      foods: buildFallbackFoods(query),
      totalResults: 0,
      message: 'Food search is temporarily unavailable. Showing fallback suggestions instead.',
      error: error.message, 
    });
  }
};
