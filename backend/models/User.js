import mongoose from 'mongoose';

// What the person is training for and how they eat, so the coach's answers and plans fit them.
export const ABOUT_GOALS = ['Lose fat', 'Build muscle', 'Get stronger', 'Train for an event', 'Feel better'];
export const ABOUT_DIETS = ['Vegetarian', 'Vegan', 'Pescatarian', 'Halal', 'Kosher', 'Gluten-free', 'Dairy-free', 'No nuts'];

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
    // How far it moves them, in percent of the carb target.
    pushCarbBoost: { type: Number, default: 20, min: 0, max: 50 },
    recoveryCarbCut: { type: Number, default: 15, min: 0, max: 40 },
  },
  about: {
    goal: { type: String, enum: ABOUT_GOALS },
    diet: { type: [{ type: String, enum: ABOUT_DIETS }], default: undefined },
    injuries: { type: String, trim: true, maxlength: 200 },
    note: { type: String, trim: true, maxlength: 300 },
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

const User = mongoose.model('User', userSchema);

export default User;
