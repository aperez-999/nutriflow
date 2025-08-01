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

    const { id } = req.query;

    if (req.method === 'PUT') {
      // Update diet
      const diet = await Diet.findById(id);

      if (!diet) {
        return res.status(404).json({ message: 'Diet record not found' });
      }

      // Verify ownership
      if (diet.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to update this diet record' });
      }

      const updatedDiet = await Diet.findByIdAndUpdate(
        id,
        { ...req.body },
        { new: true, runValidators: true }
      );

      return res.status(200).json(updatedDiet);
    }

    if (req.method === 'DELETE') {
      // Delete diet
      const diet = await Diet.findById(id);

      if (!diet) {
        return res.status(404).json({ message: 'Diet record not found' });
      }

      // Verify ownership
      if (diet.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to delete this diet record' });
      }

      await diet.deleteOne();
      return res.status(200).json({ id });
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