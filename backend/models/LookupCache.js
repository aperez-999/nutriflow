import mongoose from 'mongoose';

// Answers from USDA and Open Food Facts, kept a while: food data rarely changes, repeat searches
// come back at once, and the app stays under those services' hourly limits.
const lookupCacheSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  expiresAt: { type: Date, required: true },
}, { versionKey: false });

lookupCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('LookupCache', lookupCacheSchema);
