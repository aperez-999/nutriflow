import connectDB from '../_lib/db.js';
import { handleCors, protect } from '../_lib/middleware.js';
import Diet from '../_models/Diet.js';
import Workout from '../_models/Workout.js';

const collections = {
  diets: Diet,
  workouts: Workout,
};

export default async function handler(req, res) {
  console.log('[API] collection catch-all hit', { method: req.method, url: req.url });
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

    const collection = req.query.collection;
    const raw = req.query.id;
    const id = Array.isArray(raw) ? raw[0] : raw;

    if (!collection || !collections[collection]) {
      return res.status(404).json({ message: 'Not found' });
    }
    if (!id) {
      return res.status(400).json({ message: 'Record id is required' });
    }

    const Model = collections[collection];
    const method = String(req.method || '').toUpperCase();

    if (method === 'PUT') {
      const record = await Model.findById(id);
      if (!record) return res.status(404).json({ message: 'Record not found' });
      if (record.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: `Not authorized to update this ${collection.slice(0, -1)}` });
      }
      const updated = await Model.findByIdAndUpdate(
        id,
        { ...req.body },
        { new: true, runValidators: true }
      );
      return res.status(200).json(updated);
    }

    if (method === 'DELETE') {
      const record = await Model.findById(id);
      if (!record) return res.status(404).json({ message: 'Record not found' });
      if (record.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: `Not authorized to delete this ${collection.slice(0, -1)}` });
      }
      await record.deleteOne();
      return res.status(200).json({ id });
    }

    return res.status(405).json({ message: `Method ${method} not allowed` });
  } catch (error) {
    console.error('Collection API catch-all error:', error);
    if (error.message === 'Not authorized' || error.message === 'Not authorized, no token') {
      return res.status(401).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Server error' });
  }
}
