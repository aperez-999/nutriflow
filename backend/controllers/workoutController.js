import Workout from '../models/Workout.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all workouts for a user
// @route   GET /api/workouts
// @access  Private
export const getWorkouts = asyncHandler(async (req, res) => {
    const workouts = await Workout.find({ user: req.user._id });
    res.status(200).json(workouts);
});

// @desc    Create a new workout
// @route   POST /api/workouts
// @access  Private
export const createWorkout = asyncHandler(async (req, res) => {
    const { date, type, duration, caloriesBurned, notes } = req.body;

    if (!date || !type || !duration) {
        res.status(400);
        throw new Error('Please provide date, type and duration');
    }

    const workout = await Workout.create({
        user: req.user._id,
        date,
        type,
        duration,
        caloriesBurned: caloriesBurned || 0,
        notes: notes || ''
    });

    res.status(201).json(workout);
});

// @desc    Update a workout
// @route   PUT /api/workouts/:id
// @access  Private
export const updateWorkout = asyncHandler(async (req, res) => {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
        res.status(404);
        throw new Error('Workout not found');
    }

    // Verify ownership
    if (workout.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to update this workout');
    }

    const updatedWorkout = await Workout.findByIdAndUpdate(
        req.params.id,
        { ...req.body },
        { new: true, runValidators: true }
    );

    res.status(200).json(updatedWorkout);
});

// @desc    Delete a workout
// @route   DELETE /api/workouts/:id
// @access  Private
export const deleteWorkout = asyncHandler(async (req, res) => {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
        res.status(404);
        throw new Error('Workout not found');
    }

    // Verify ownership
    if (workout.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to delete this workout');
    }

    await workout.deleteOne();
    res.status(200).json({ id: req.params.id });
});