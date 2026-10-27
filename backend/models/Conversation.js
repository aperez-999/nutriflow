import mongoose from 'mongoose';

// One coach conversation. `clientId` is the browser's id for it, so it is updated in place
// from any device; `updatedAt` is the time of its last message as the client saw it.
const conversationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: String, required: true, maxlength: 80 },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  updatedAt: { type: Date, default: Date.now },
  messages: [{
    _id: false,
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    suggestions: { type: [String], default: undefined },
    createdAt: { type: Date, default: Date.now },
  }],
});

conversationSchema.index({ user: 1, clientId: 1 }, { unique: true });
conversationSchema.index({ user: 1, updatedAt: -1 });

export default mongoose.model('Conversation', conversationSchema);
