import Diet from '../_models/Diet.js';
import connectDB from '../_lib/db.js';
import { handleCors, protect } from '../_lib/middleware.js';

export default async function handler(req, res) {
  // Handle CORS
  handleCors(req, res, () => {});
  
  try {
    await connectDB();

    // Apply authentication middleware
    await new Promise((resolve, reject) => {
      protect(req, res, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    if (req.method === 'GET') {
      // Get all diets for user
      const diets = await Diet.find({ user: req.user._id });
      return res.status(200).json(diets);
    }

    if (req.method === 'POST') {
      // Create new diet
      const { date, mealType, foodName, calories, protein, carbs, fats, notes } = req.body;

      if (!date || !mealType || !foodName || !calories) {
        return res.status(400).json({ 
          message: 'Please provide date, meal type, food name and calories' 
        });
      }

      const diet = await Diet.create({
        user: req.user._id,
        date,
        mealType,
        foodName,
        calories,
        protein: protein || 0,
        carbs: carbs || 0,
        fats: fats || 0,
        notes: notes || ''
      });

      return res.status(201).json(diet);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Diet API error:', error);
    if (error.message === 'Not authorized' || error.message === 'Not authorized, no token') {
      return res.status(401).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Server error' });
  }
}