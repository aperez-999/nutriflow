
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

function rankFoodResult(food, query) {
  const normalizedQuery = query.trim().toLowerCase();
  const description = (food.description || '').toLowerCase();
  const brandOwner = (food.brandOwner || '').toLowerCase();
  const ingredients = (food.ingredients || '').toLowerCase();
  const haystack = `${description} ${brandOwner} ${ingredients}`;
  const tokens = tokenizeSearchText(query);

  let score = 0;

  if (description === normalizedQuery) score += 120;
  if (description.startsWith(normalizedQuery)) score += 60;
  if (description.includes(normalizedQuery)) score += 45;

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

  return score;
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

    const usdaApiUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(process.env.USDA_API_KEY)}`;
    const response = await fetch(usdaApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        dataType: ['Foundation', 'SR Legacy', 'Survey (FNDDS)', 'Branded'],
        pageSize: 20,
        sortBy: 'dataType.keyword',
        sortOrder: 'asc',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`USDA API error: ${response.status} - ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    
    // Transform USDA data to our format
    const transformedFoods = data.foods?.map(food => {
      // Extract nutrition data
      const nutrients = food.foodNutrients || [];
      
      // Find specific nutrients by their nutrient IDs
      const getNutrient = (nutrientId) => {
        const nutrient = nutrients.find(n => n.nutrientId === nutrientId);
        return nutrient ? Math.round(nutrient.value * 100) / 100 : 0;
      };

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
        servingSize: food.servingSize || 100,
        servingSizeUnit: food.servingSizeUnit || 'g',
      };
    }) || [];

    // Filter out foods with no calorie data (incomplete entries)
    const validFoods = transformedFoods
      .filter((food) => food.nutrition.calories > 0)
      .map((food) => ({
        ...food,
        matchScore: rankFoodResult(food, query),
      }))
      .sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      foods: validFoods.slice(0, 8),
      totalResults: data.totalHits || 0,
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
