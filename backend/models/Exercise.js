import mongoose from 'mongoose';

// Library exercise. Seeded and kept in sync from data/exerciseCatalog.js.
const exerciseSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  muscleGroup: { type: String, required: true },
  equipment: { type: String, required: true },
  difficulty: { type: String, required: true, enum: ['Beginner', 'Intermediate', 'Advanced'] },
  primary: [{ type: String }],
  secondary: [{ type: String }],
  summary: { type: String },
  cues: [{ type: String }],
  videoUrl: { type: String },
}, {
  timestamps: true
});

exerciseSchema.index({ muscleGroup: 1, name: 1 });

export default mongoose.model('Exercise', exerciseSchema);
