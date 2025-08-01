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
  duration: {
    type: Number,
    required: true
  },
  caloriesBurned: {
    type: Number,
    default: 0
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model('Workout', workoutSchema);