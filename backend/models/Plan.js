import mongoose from 'mongoose';

// A training or meal plan the coach built and the user saved. `clientId` is the id the
// browser gave the plan, so the same plan is updated in place from any device.
const planSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: String, required: true, maxlength: 80 },
  kind: { type: String, enum: ['training', 'meal'], required: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  calories: { type: Number, default: null },
  generatedAt: { type: Date, default: Date.now },
  // Sessions (training) or meals (meal), each possibly marked completed.
  items: { type: [mongoose.Schema.Types.Mixed], default: [] },
}, {
  timestamps: true,
});

planSchema.index({ user: 1, clientId: 1 }, { unique: true });
planSchema.index({ user: 1, generatedAt: -1 });

export default mongoose.model('Plan', planSchema);
