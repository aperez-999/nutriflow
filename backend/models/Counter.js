import mongoose from 'mongoose';

// A count that expires: rate limits, daily AI allowances and the AI budget all use one. Kept in
// MongoDB so every server instance (Vercel runs several) sees the same numbers; MongoDB deletes
// each one once its window is over.
const counterSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  hits: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
}, { versionKey: false });

counterSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Counter', counterSchema);
