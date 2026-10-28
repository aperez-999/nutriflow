import mongoose from 'mongoose';

// Something lasting a person told the coach ("lactose intolerant", "trains at 6 am"), saved by
// the coach so later answers fit them. The person can see and delete every note.
const coachNoteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, trim: true, maxlength: 160 },
}, {
  timestamps: true
});

coachNoteSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('CoachNote', coachNoteSchema);
