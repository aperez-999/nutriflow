import mongoose from 'mongoose';

const workoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Cardio', 'Strength', 'Flexibility', 'Sports', 'Other']
  },
  workoutName: {
    type: String,
    required: false
  },
  duration: {
    type: Number,
    required: true
  },
  caloriesBurned: {
    type: Number,
    default: 0
  },
  intensity: {
    type: String,
    enum: ['Low', 'Medium', 'High']
  },
  equipment: {
    type: String
  },
  notes: {
    type: String
  },
  // The id a workout had where it was recorded (a watch, another app), so importing it again
  // finds this one instead of logging it twice.
  externalId: {
    type: String,
    trim: true,
    maxlength: 200
  }
}, {
  timestamps: true
});

workoutSchema.index({ user: 1, date: -1 });
workoutSchema.index(
  { user: 1, externalId: 1 },
  { unique: true, partialFilterExpression: { externalId: { $type: 'string' } } }
);

export default mongoose.model('Workout', workoutSchema);