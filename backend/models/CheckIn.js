import mongoose from 'mongoose';

// One subjective wellness check-in per user per local calendar day.
const checkInSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dayKey: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  sleepHours: { type: Number, required: true, min: 0, max: 14 },
  energy: { type: Number, required: true, min: 1, max: 5 },
  soreness: { type: Number, required: true, min: 1, max: 5 },
  waterCups: { type: Number, default: 0, min: 0, max: 20 },
  // Measured, not felt: today's HRV against the person's 30-day average (percent) and resting
  // heart rate against its average (beats per minute), from a heart-rate source when they have one.
  hrvChange: { type: Number, min: -100, max: 300 },
  restingHrChange: { type: Number, min: -60, max: 60 },
}, {
  timestamps: true
});

checkInSchema.index({ user: 1, dayKey: -1 }, { unique: true });

export default mongoose.model('CheckIn', checkInSchema);
