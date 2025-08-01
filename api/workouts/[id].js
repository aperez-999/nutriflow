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

    const { id } = req.query;

    if (req.method === 'PUT') {
      // Update workout
      const workout = await Workout.findById(id);

      if (!workout) {
        return res.status(404).json({ message: 'Workout not found' });
      }

      // Verify ownership
      if (workout.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to update this workout' });
      }

      const updatedWorkout = await Workout.findByIdAndUpdate(
        id,
        { ...req.body },
        { new: true, runValidators: true }
      );

      return res.status(200).json(updatedWorkout);
    }

    if (req.method === 'DELETE') {
      // Delete workout
      const workout = await Workout.findById(id);

      if (!workout) {
        return res.status(404).json({ message: 'Workout not found' });
      }

      // Verify ownership
      if (workout.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to delete this workout' });
      }

      await workout.deleteOne();
      return res.status(200).json({ id });
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