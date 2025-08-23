import connectDB from './_lib/db.js';
import { handleCors, protect } from './_lib/middleware.js';
import Diet from './_models/Diet.js';
import Workout from './_models/Workout.js';

const collections = { diets: Diet, workouts: Workout };

export default async function handler(req, res) {
  console.log('[API] collection root hit', { method: req.method, url: req.url });
  handleCors(req, res, () => {});
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectDB();

    // Run auth; if it sends a 401, just return
    await protect(req, res, () => {});
    if (!req.user) return; // protect already responded

    // Determine collection from dynamic param or path
    let collection = req.query.collection;
    if (!collection) {
      const path = (req.url || '').split('?')[0];
      const parts = path.split('/').filter(Boolean);
      collection = parts.length ? parts[parts.length - 1] : null; // e.g., '/api/diets' => 'diets'
    }
    if (!collection || !collections[collection]) {
      return res.status(404).json({ message: 'Not found' });
    }

    const Model = collections[collection];
    const method = String(req.method || '').toUpperCase();

    if (method === 'GET') {
      const items = await Model.find({ user: req.user._id });
      return res.status(200).json(items);
    }

    if (method === 'POST') {
      const body = req.body || {};
      if (collection === 'diets') {
        const { date, mealType, foodName, calories, protein, carbs, fats, notes } = body;
        if (!date || !mealType || !foodName || calories == null) {
          return res.status(400).json({ message: 'Please provide date, meal type, food name and calories' });
        }
        const doc = await Model.create({
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
        return res.status(201).json(doc);
      }

      if (collection === 'workouts') {
        const { date, type, workoutName, duration, caloriesBurned, intensity, equipment, notes } = body;
        if (!date || !type || duration == null) {
          return res.status(400).json({ message: 'Please provide date, type and duration' });
        }
        const doc = await Model.create({
          user: req.user._id,
          date,
          type,
          workoutName: workoutName || '',
          duration,
          caloriesBurned: caloriesBurned || 0,
          intensity: intensity || '',
          equipment: equipment || '',
          notes: notes || ''
        });
        return res.status(201).json(doc);
      }

      return res.status(400).json({ message: 'Invalid collection' });
    }

    return res.status(405).json({ message: `Method ${method} not allowed` });
  } catch (error) {
    console.error('Collection root error:', error);
    if (error.message === 'Not authorized' || error.message === 'Not authorized, no token') {
      return res.status(401).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Server error' });
  }
}
