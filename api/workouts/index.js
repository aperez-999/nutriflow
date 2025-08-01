import Workout from '../_models/Workout.js';
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
      // Get all workouts for user
      const workouts = await Workout.find({ user: req.user._id });
      return res.status(200).json(workouts);
    }

    if (req.method === 'POST') {
      // Create new workout
      const { date, type, duration, caloriesBurned, notes } = req.body;

      if (!date || !type || !duration) {
        return res.status(400).json({ 
          message: 'Please provide date, type and duration' 
        });
      }

      const workout = await Workout.create({
        user: req.user._id,
        date,
        type,
        duration,
        caloriesBurned: caloriesBurned || 0,
        notes: notes || ''
      });

      return res.status(201).json(workout);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Workout API error:', error);
    if (error.message === 'Not authorized' || error.message === 'Not authorized, no token') {
      return res.status(401).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Server error' });
  }
}