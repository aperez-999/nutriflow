import { handleCors } from '../_lib/middleware.js';

export default async function handler(req, res) {
  // Handle CORS
  handleCors(req, res, () => {});
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    // USDA FoodData Central API endpoint
    const usdaApiUrl = `https://api.nal.usda.gov/fdc/v1/foods/search`;
    
    const searchParams = new URLSearchParams({
      query: query.trim(),
      dataType: ['Foundation', 'SR Legacy'], // Most reliable data types
      pageSize: 10, // Limit results
      sortBy: 'dataType.keyword',
      sortOrder: 'asc'
    });

    if (!process.env.USDA_API_KEY) {
      throw new Error('USDA_API_KEY is not configured');
    }

    const response = await fetch(`${usdaApiUrl}?${searchParams}&api_key=${process.env.USDA_API_KEY}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
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
      const getnutrient = (nutrientId) => {
        const nutrient = nutrients.find(n => n.nutrientId === nutrientId);
        return nutrient ? Math.round(nutrient.value * 100) / 100 : 0;
      };

      return {
        fdcId: food.fdcId,
        description: food.description,
        brandOwner: food.brandOwner || null,
        ingredients: food.ingredients || null,
        nutrition: {
          calories: getnutrient(1008), // Energy (kcal)
          protein: getnutrient(1003),  // Protein
          carbs: getnutrient(1005),    // Carbohydrates
          fats: getnutrient(1004),     // Total lipid (fat)
          fiber: getnutrient(1079),    // Fiber
          sugar: getnutrient(2000),    // Sugars
          sodium: getnutrient(1093),   // Sodium
        },
        servingSize: food.servingSize || 100,
        servingSizeUnit: food.servingSizeUnit || 'g'
      };
    }) || [];

    // Filter out foods with no calorie data (incomplete entries)
    const validFoods = transformedFoods.filter(food => food.nutrition.calories > 0);

    res.status(200).json({
      foods: validFoods.slice(0, 8), // Return top 8 results
      totalResults: data.totalHits || 0
    });

  } catch (error) {
    console.error('Food search error:', error);
    res.status(500).json({ 
      message: 'Error searching foods',
      error: error.message 
    });
  }
}