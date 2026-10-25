import Workout from '../models/Workout.js';
import { validationResult } from 'express-validator';

const WORKOUT_STOP_WORDS = new Set(['and', '&', 'with', 'the', 'a', 'an', 'for']);
const WORKOUT_FALLBACKS = [
  { name: 'Brisk walking', type: 'Cardio', equipment: 'None', target: 'Cardiovascular system', caloriesPerMinute: 5, intensity: 'Low' },
  { name: 'Jogging', type: 'Cardio', equipment: 'None', target: 'Cardiovascular system', caloriesPerMinute: 10, intensity: 'Medium' },
  { name: 'Bodyweight squats', type: 'Strength', equipment: 'None', target: 'Quadriceps', caloriesPerMinute: 8, intensity: 'Medium' },
  { name: 'Push-ups', type: 'Strength', equipment: 'None', target: 'Chest', caloriesPerMinute: 8, intensity: 'Medium' },
  { name: 'Yoga flow', type: 'Flexibility', equipment: 'None', target: 'Full body', caloriesPerMinute: 4, intensity: 'Low' },
];

function tokenizeWorkoutQuery(text = '') {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((token) => token.trim())
    .filter((token) => token && !WORKOUT_STOP_WORDS.has(token));
}

function buildExerciseQueries(query = '') {
  const trimmed = query.trim();
  const tokens = tokenizeWorkoutQuery(trimmed);
  return Array.from(new Set([trimmed, ...tokens])).filter(Boolean).slice(0, 4);
}

function getWorkoutKey(exercise) {
  return [
    (exercise.name || '').toLowerCase(),
    (exercise.type || '').toLowerCase(),
    (exercise.muscle || '').toLowerCase(),
    (exercise.equipment || '').toLowerCase(),
  ].join('::');
}

function rankWorkoutResult(workout, query) {
  const normalizedQuery = query.trim().toLowerCase();
  const haystack = [
    workout.name,
    workout.type,
    workout.bodyPart,
    workout.target,
    workout.equipment,
    ...(workout.instructions || []),
  ]
    .join(' ')
    .toLowerCase();
  const tokens = tokenizeWorkoutQuery(query);

  let score = 0;
  if (workout.name.toLowerCase() === normalizedQuery) score += 120;
  if (workout.name.toLowerCase().startsWith(normalizedQuery)) score += 55;
  if (workout.name.toLowerCase().includes(normalizedQuery)) score += 40;

  const matchedTokens = tokens.filter((token) => haystack.includes(token)).length;
  score += matchedTokens * 16;
  if (tokens.length > 1 && matchedTokens === tokens.length) score += 35;

  if (workout.equipment && workout.equipment !== 'None') score += 4;
  if (workout.intensity === 'Medium') score += 3;

  return score;
}

function buildFallbackWorkouts(query) {
  const tokens = tokenizeWorkoutQuery(query);
  return WORKOUT_FALLBACKS
    .map((workout, index) => ({
      id: `fallback-workout-${index}`,
      bodyPart: workout.target,
      instructions: [],
      matchScore: tokens.filter((token) => `${workout.name} ${workout.target}`.toLowerCase().includes(token)).length,
      ...workout,
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);
}

function normalizeWorkoutType(value) {
  const type = String(value || '').trim().toLowerCase();
  const map = {
    cardio: 'Cardio',
    strength: 'Strength',
    flexibility: 'Flexibility',
    sports: 'Sports',
    other: 'Other',
  };

  return map[type] || null;
}

function normalizeWorkoutIntensity(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const intensity = String(value).trim().toLowerCase();
  const map = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
  };

  return map[intensity] || null;
}

function parseWorkoutNumber(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Please provide a valid ${fieldName}`);
  }

  return parsed;
}

function buildWorkoutInput(body, { partial = false } = {}) {
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

  if (body.type !== undefined) {
    const type = normalizeWorkoutType(body.type);
    if (!type) {
      throw new Error('Please provide a valid workout type');
    }
    next.type = type;
  } else if (!partial) {
    throw new Error('Please provide a valid workout type');
  }

  if (body.duration !== undefined) {
    next.duration = parseWorkoutNumber(body.duration, 'duration');
  } else if (!partial) {
    throw new Error('Please provide a valid duration');
  }

  if (body.caloriesBurned !== undefined) {
    next.caloriesBurned = parseWorkoutNumber(body.caloriesBurned, 'calories burned');
  }

  if (body.intensity !== undefined) {
    const intensity = normalizeWorkoutIntensity(body.intensity);
    if (body.intensity !== '' && !intensity) {
      throw new Error('Please provide a valid intensity');
    }
    next.intensity = intensity;
  }

  if (body.workoutName !== undefined) {
    const workoutName = String(body.workoutName || '').trim();
    next.workoutName = workoutName || undefined;
  }

  if (body.equipment !== undefined) {
    const equipment = String(body.equipment || '').trim();
    next.equipment = equipment || undefined;
  }

  if (body.notes !== undefined) {
    const notes = String(body.notes || '').trim();
    next.notes = notes || undefined;
  }

  return next;
}

// Get all workouts for a user
export const getWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user._id }).sort({ date: -1, createdAt: -1 });
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workouts', error: error.message });
  }
};

// Create a new workout
export const createWorkout = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0]?.msg || 'Invalid workout input' });
    }

    let workoutInput;
    try {
      workoutInput = buildWorkoutInput(req.body);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    const workout = new Workout({
      user: req.user._id,
      ...workoutInput,
    });
    const savedWorkout = await workout.save();
    res.status(201).json(savedWorkout);
  } catch (error) {
    res.status(400).json({ message: 'Error creating workout', error: error.message });
  }
};

// Update a workout
export const updateWorkout = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0]?.msg || 'Invalid workout input' });
    }

    const workout = await Workout.findById(req.params.id);
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    if (workout.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    let updates;
    try {
      updates = buildWorkoutInput(req.body, { partial: true });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    const updatedWorkout = await Workout.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    res.json(updatedWorkout);
  } catch (error) {
    res.status(400).json({ message: 'Error updating workout', error: error.message });
  }
};

// Delete a workout
export const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    if (workout.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await workout.deleteOne();
    res.json({ message: 'Workout removed' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting workout', error: error.message });
  }
};

// Search workouts from external API
export const searchWorkouts = async (req, res) => {
  try {
    const rawQuery = typeof req.query?.query === 'string' ? req.query.query : '';
    const query = rawQuery.trim();
    
    if (!query || query.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const queryTokens = tokenizeWorkoutQuery(query);
    if (queryTokens.length === 0) {
      return res.status(400).json({ message: 'Enter a more specific workout search.' });
    }

    if (!process.env.NINJA_API_KEY) {
      return res.status(200).json({
        workouts: buildFallbackWorkouts(query),
        totalResults: 0,
        message: 'Exercise search is unavailable right now. Showing fallback suggestions.',
      });
    }

    const queryVariants = buildExerciseQueries(query);
    const exerciseResponses = await Promise.all(
      queryVariants.map(async (variant) => {
        const apiUrl = `https://api.api-ninjas.com/v1/exercises?name=${encodeURIComponent(variant)}`;
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'X-Api-Key': process.env.NINJA_API_KEY,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`API Ninjas error: ${response.status} - ${errorData.message || response.statusText}`);
        }

        return response.json();
      })
    );

    const exerciseMap = new Map();
    exerciseResponses.flat().forEach((exercise) => {
      const key = getWorkoutKey(exercise);
      if (!exerciseMap.has(key)) {
        exerciseMap.set(key, exercise);
      }
    });
    const exercises = Array.from(exerciseMap.values());
    
    // Transform API Ninjas data to our format
    const transformedWorkouts = exercises.map((exercise, index) => ({
      id: `${(exercise.name || 'exercise').toLowerCase().replace(/[^a-z0-9]/g, '-')}-${index}`,
      name: exercise.name || 'Unknown',
      type: mapExerciseType(exercise.type, exercise.muscle),
      equipment: exercise.equipment || 'None',
      bodyPart: exercise.muscle || '',
      target: exercise.muscle || '',
      // Estimate calories based on exercise type and difficulty
      caloriesPerMinute: calculateEstimatedCalories(exercise),
      intensity: calculateIntensity(exercise),
      instructions: (exercise.instructions || '').split('. ').filter(Boolean),
    }));

    // Sort by relevance and limit results
    const sortedWorkouts = transformedWorkouts
      .map((workout) => ({
        ...workout,
        matchScore: rankWorkoutResult(workout, query),
      }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 8); // Limit to 8 results

    res.status(200).json({
      workouts: sortedWorkouts,
      totalResults: exercises.length,
    });

  } catch (error) {
    console.error('Workout search error:', error);
    const rawQuery = typeof req.query?.query === 'string' ? req.query.query : '';
    const query = rawQuery.trim();
    res.status(200).json({ 
      workouts: buildFallbackWorkouts(query),
      totalResults: 0,
      message: 'Workout search is temporarily unavailable. Showing fallback suggestions instead.',
      error: error.message, 
    });
  }
};

// Helper function to map exercise type
function mapExerciseType(type, muscle) {
  // First check the explicit type
  if (type === 'cardio') return 'Cardio';
  if (type === 'strength') return 'Strength';
  if (type === 'stretching' || type === 'plyometrics') return 'Flexibility';
  
  // If type is not definitive, check the muscle group
  const muscleLower = (muscle || '').toLowerCase();
  const cardioMuscles = ['cardiovascular system'];
  const flexibilityMuscles = ['abdominals', 'lower back'];
  
  if (cardioMuscles.includes(muscleLower)) return 'Cardio';
  if (flexibilityMuscles.includes(muscleLower)) return 'Flexibility';
  
  // Default to strength training
  return 'Strength';
}

// Helper function to estimate calories based on exercise type
function calculateEstimatedCalories(exercise) {
  const baseCalories = {
    cardio: 12,
    strength: 8,
    stretching: 3,
    plyometrics: 10
  };

  const muscleIntensity = {
    'cardiovascular system': 1.2,
    'quadriceps': 1.1,
    'glutes': 1.1,
    'hamstrings': 1.1,
    'calves': 0.9,
    'chest': 1.0,
    'back': 1.0,
    'shoulders': 0.9,
    'biceps': 0.8,
    'triceps': 0.8,
    'abdominals': 0.9,
    'lower back': 0.9,
    'middle back': 1.0,
    'lats': 1.0
  };

  const equipmentIntensity = {
    'body weight': 0.9,
    'dumbbell': 1.1,
    'barbell': 1.2,
    'cable': 1.0,
    'kettlebell': 1.1,
    'machine': 1.0,
    'band': 0.9,
    'medicine ball': 1.0,
    'bosu ball': 0.9,
    'stability ball': 0.9,
    'foam roll': 0.8,
    'none': 0.9
  };

  let base = baseCalories[exercise.type] || 8;
  const muscleMultiplier = muscleIntensity[(exercise.muscle || '').toLowerCase()] || 1;
  const equipMultiplier = equipmentIntensity[(exercise.equipment || '').toLowerCase()] || 1;

  return Math.round(base * muscleMultiplier * equipMultiplier);
}

// Helper function to determine exercise intensity
function calculateIntensity(exercise) {
  const highIntensityKeywords = ['explosive', 'jump', 'sprint', 'power', 'burpee', 'clean', 'snatch'];
  const lowIntensityKeywords = ['stretch', 'mobility', 'walk', 'foam', 'roll'];
  
  const name = (exercise.name || '').toLowerCase();
  const type = (exercise.type || '').toLowerCase();
  const equipment = (exercise.equipment || '').toLowerCase();
  const difficulty = (exercise.difficulty || '').toLowerCase();

  // Check for high intensity indicators
  if (
    highIntensityKeywords.some(keyword => name.includes(keyword)) ||
    type === 'cardio' ||
    type === 'plyometrics' ||
    difficulty === 'expert' ||
    equipment === 'barbell'
  ) {
    return 'High';
  }

  // Check for low intensity indicators
  if (
    lowIntensityKeywords.some(keyword => name.includes(keyword)) ||
    type === 'stretching' ||
    difficulty === 'beginner' ||
    equipment === 'foam roll' ||
    equipment === 'none'
  ) {
    return 'Low';
  }

  // Default to medium intensity
  return 'Medium';
}
