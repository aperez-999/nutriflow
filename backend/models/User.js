import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  preferences: {
    notificationsEnabled: { type: Boolean, default: true },
  },
  goals: {
    dailyCalories: { type: Number, default: 2000, min: 800, max: 6000 },
    dailyProtein: { type: Number, default: 150, min: 20, max: 400 },
    weeklyWorkouts: { type: Number, default: 5, min: 0, max: 14 },
    // Carb and fat targets are optional: without them, clients split the remaining calories.
    dailyCarbs: { type: Number, min: 0, max: 1000 },
    dailyFats: { type: Number, min: 0, max: 400 },
    // Whether the day's verdict moves the carb target (more on push days, less on recovery days).
    fuelFollowsVerdict: { type: Boolean, default: true },
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

const User = mongoose.model('User', userSchema);

export default User;
