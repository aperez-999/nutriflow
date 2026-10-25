import Diet from '../models/Diet.js';
import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';

function normalizeMealType(value) {
  const mealType = String(value || '').trim().toLowerCase();
  const map = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
  };

  return map[mealType] || null;
}

function parseNumber(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildDietInput(body, { partial = false } = {}) {
  const next = {};

  if (body.date !== undefined) {
    const parsedDate = new Date(body.date);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error('Please provide a valid date');
    }
    next.date = parsedDate;
  } else if (!partial) {
    throw new Error('Please provide a valid date');
  }

  if (body.mealType !== undefined) {
    const mealType = normalizeMealType(body.mealType);
    if (!mealType) {
      throw new Error('Please provide a valid meal type');
    }
    next.mealType = mealType;
  } else if (!partial) {
    throw new Error('Please provide a valid meal type');
  }

  if (body.foodName !== undefined) {
    const foodName = String(body.foodName || '').trim();
    if (!foodName) {
      throw new Error('Please provide a food name');
    }
    next.foodName = foodName;
  } else if (!partial) {
    throw new Error('Please provide a food name');
  }

  if (body.calories !== undefined) {
    const calories = parseNumber(body.calories);
    if (calories === null || calories < 0) {
      throw new Error('Please provide valid calories');
    }
    next.calories = calories;
  } else if (!partial) {
    throw new Error('Please provide valid calories');
  }

  if (body.protein !== undefined) {
    const protein = parseNumber(body.protein);
    if (protein === null || protein < 0) {
      throw new Error('Please provide valid protein');
    }
    next.protein = protein;
  }

  if (body.carbs !== undefined) {
    const carbs = parseNumber(body.carbs);
    if (carbs === null || carbs < 0) {
      throw new Error('Please provide valid carbs');
    }
    next.carbs = carbs;
  }

  if (body.fats !== undefined) {
    const fats = parseNumber(body.fats);
    if (fats === null || fats < 0) {
      throw new Error('Please provide valid fats');
    }
    next.fats = fats;
  }

  if (body.notes !== undefined) {
    const notes = String(body.notes || '').trim();
    next.notes = notes || undefined;
  }

  return next;
}

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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400);
        throw new Error(errors.array()[0]?.msg || 'Invalid diet input');
    }

    let dietInput;
    try {
      dietInput = buildDietInput(req.body);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }

    const diet = await Diet.create({
        user: req.user._id,
        ...dietInput,
        protein: dietInput.protein ?? 0,
        carbs: dietInput.carbs ?? 0,
        fats: dietInput.fats ?? 0
    });

    res.status(201).json(diet);
});

// @desc    Update a diet
// @route   PUT /api/diets/:id
// @access  Private
export const updateDiet = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400);
        throw new Error(errors.array()[0]?.msg || 'Invalid diet input');
    }

    const diet = await Diet.findById(req.params.id);

    if (!diet) {
        res.status(404);
        throw new Error('Diet record not found');
    }

    // Verify ownership
    if (diet.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this diet record');
    }

    let updates;
    try {
      updates = buildDietInput(req.body, { partial: true });
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }

    const updatedDiet = await Diet.findByIdAndUpdate(
        req.params.id,
        updates,
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
        res.status(403);
        throw new Error('Not authorized to delete this diet record');
    }

    await diet.deleteOne();
    res.status(200).json({ id: req.params.id });
});
