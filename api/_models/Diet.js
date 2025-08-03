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
        enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack']
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
    notes: {
        type: String
    }
}, {
    timestamps: true
});

export default mongoose.model('Diet', dietSchema);