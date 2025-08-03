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
  }
}, {
  timestamps: true
});

export default mongoose.model('Workout', workoutSchema);