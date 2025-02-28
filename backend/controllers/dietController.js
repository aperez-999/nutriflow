import Diet from '../models/Diet.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all diets for a user
// @route   GET /api/diets
// @access  Private
export const getDiets = asyncHandler(async (req, res) => {
    const diets = await Diet.find({ user: req.user._id });
    res.status(200).json(diets);
});

// @desc    Create a new diet
// @route   POST /api/diets
// @access  Private
export const createDiet = asyncHandler(async (req, res) => {
    const { date, mealType, foodName, calories, protein, carbs, fats } = req.body;

    if (!date || !mealType || !foodName || !calories) {
        res.status(400);
        throw new Error('Please provide date, meal type, food name and calories');
    }

    const diet = await Diet.create({
        user: req.user._id,
        date,
        mealType,
        foodName,
        calories,
        protein: protein || 0,
        carbs: carbs || 0,
        fats: fats || 0
    });

    res.status(201).json(diet);
});

// @desc    Update a diet
// @route   PUT /api/diets/:id
// @access  Private
export const updateDiet = asyncHandler(async (req, res) => {
    const diet = await Diet.findById(req.params.id);

    if (!diet) {
        res.status(404);
        throw new Error('Diet record not found');
    }

    // Verify ownership
    if (diet.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to update this diet record');
    }

    const updatedDiet = await Diet.findByIdAndUpdate(
        req.params.id,
        { ...req.body },
        { new: true, runValidators: true }
    );

    res.status(200).json(updatedDiet);
});

// @desc    Delete a diet
// @route   DELETE /api/diets/:id
// @access  Private
export const deleteDiet = asyncHandler(async (req, res) => {
    const diet = await Diet.findById(req.params.id);

    if (!diet) {
        res.status(404);
        throw new Error('Diet record not found');
    }

    // Verify ownership
    if (diet.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to delete this diet record');
    }

    await diet.deleteOne();
    res.status(200).json({ id: req.params.id });
});