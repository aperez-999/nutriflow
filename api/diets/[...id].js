import Diet from '../_models/Diet.js';
import connectDB from '../_lib/db.js';
import { handleCors, protect } from '../_lib/middleware.js';

export default async function handler(req, res) {
  console.log('[API] diets catch-all hit', { method: req.method, url: req.url });
  handleCors(req, res, () => {});
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectDB();

    await new Promise((resolve, reject) => {
      protect(req, res, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    const raw = req.query.id;
    const id = Array.isArray(raw) ? raw[0] : raw;

    if (!id) {
      return res.status(400).json({ message: 'Diet id is required' });
    }

    const method = String(req.method || '').toUpperCase();

    if (method === 'PUT') {
      const diet = await Diet.findById(id);
      if (!diet) return res.status(404).json({ message: 'Diet record not found' });
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

    if (method === 'DELETE') {
      const diet = await Diet.findById(id);
      if (!diet) return res.status(404).json({ message: 'Diet record not found' });
      if (diet.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to delete this diet record' });
      }
      await diet.deleteOne();
      return res.status(200).json({ id });
    }

    return res.status(405).json({ message: `Method ${method} not allowed` });
  } catch (error) {
    console.error('Diet API catch-all error:', error);
    if (error.message === 'Not authorized' || error.message === 'Not authorized, no token') {
      return res.status(401).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Server error' });
  }
}
