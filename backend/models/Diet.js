import mongoose from 'mongoose';

const dietSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    date: {
        type: Date,
        required: true
    },
    mealType: {
        type: String,
        required: true,
        // One of the account's meals (User.meals): the usual four, or names the person chose.
        trim: true,
        maxlength: 30
    },
    foodName: {
        type: String,
        required: true
    },
    calories: {
        type: Number,
        required: true
    },
    protein: {
        type: Number,
        default: 0
    },
    carbs: {
        type: Number,
        default: 0
    },
    fats: {
        type: Number,
        default: 0
    },
    // Grams; optional, since many foods and older entries don't say.
    fiber: {
        type: Number,
        min: 0
    },
    notes: {
        type: String
    }
}, {
  timestamps: true
});

dietSchema.index({ user: 1, date: -1 });

export default mongoose.model('Diet', dietSchema);