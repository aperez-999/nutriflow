import mongoose from 'mongoose';

// One weight a day per person, in kilograms (the apps show pounds when asked). From the person,
// or from Apple Health.
const weighInSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dayKey: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  kg: { type: Number, required: true, min: 25, max: 350 },
  source: { type: String, enum: ['manual', 'health'], default: 'manual' },
}, {
  timestamps: true
});

weighInSchema.index({ user: 1, dayKey: -1 }, { unique: true });

export default mongoose.model('WeighIn', weighInSchema);
