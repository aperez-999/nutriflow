import express from 'express';
import path from 'path';
import cors from 'cors';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import dietRoutes from './routes/dietRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import authRoutes from './routes/authRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

const app = express();

// Connect to database
connectDB();

// CORS configuration for local development
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from the frontend build directory (root-level dist/)
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'dist')));

// API Routes
app.use('/api/diets', dietRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);

// Food search route (temporary for local development)
app.get('/api/food/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    // USDA FoodData Central API endpoint
    const usdaApiUrl = `https://api.nal.usda.gov/fdc/v1/foods/search`;
    
    const searchParams = new URLSearchParams({
      api_key: process.env.USDA_API_KEY,
      query: query.trim(),
      dataType: ['Foundation', 'SR Legacy'],
      pageSize: 10,
      sortBy: 'dataType.keyword',
      sortOrder: 'asc'
    });

    const response = await fetch(`${usdaApiUrl}?${searchParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform USDA data to our format
    const transformedFoods = data.foods?.map(food => {
      const nutrients = food.foodNutrients || [];
      
      const getNutrient = (nutrientId) => {
        const nutrient = nutrients.find(n => n.nutrientId === nutrientId);
        return nutrient ? Math.round(nutrient.value * 100) / 100 : 0;
      };

      return {
        fdcId: food.fdcId,
        description: food.description,
        brandOwner: food.brandOwner || null,
        nutrition: {
          calories: getNutrient(1008),
          protein: getNutrient(1003),
          carbs: getNutrient(1005),
          fats: getNutrient(1004),
        },
        servingSize: 100,
        servingSizeUnit: 'g'
      };
    }) || [];

    const validFoods = transformedFoods.filter(food => food.nutrition.calories > 0);

    res.status(200).json({
      foods: validFoods.slice(0, 8),
      totalResults: data.totalHits || 0
    });

  } catch (error) {
    console.error('Food search error:', error);
    res.status(500).json({ 
      message: 'Error searching foods',
      error: error.message 
    });
  }
});

// Serve frontend index.html for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handler middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});