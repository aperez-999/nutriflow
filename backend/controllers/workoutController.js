import fetch from 'node-fetch';
import Workout from '../models/Workout.js';

// Get all workouts for a user
export const getWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user.id });
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workouts', error: error.message });
  }
};

// Create a new workout
export const createWorkout = async (req, res) => {
  try {
    const workout = new Workout({
      user: req.user.id,
      ...req.body
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
    const workout = await Workout.findById(req.params.id);
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    if (workout.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const updatedWorkout = await Workout.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
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
    if (workout.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
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
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    if (!process.env.NINJA_API_KEY) {
      throw new Error('NINJA_API_KEY is not configured');
    }

    // API Ninjas endpoint
    const apiUrl = `https://api.api-ninjas.com/v1/exercises?name=${encodeURIComponent(query)}`;
    
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

    const exercises = await response.json();
    
    // Transform API Ninjas data to our format
    const transformedWorkouts = exercises.map((exercise, index) => ({
      id: `${exercise.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${index}`,
      name: exercise.name,
      type: mapExerciseType(exercise.type, exercise.muscle),
      equipment: exercise.equipment || 'None',
      bodyPart: exercise.muscle,
      target: exercise.muscle,
      // Estimate calories based on exercise type and difficulty
      caloriesPerMinute: calculateEstimatedCalories(exercise),
      intensity: calculateIntensity(exercise),
      instructions: exercise.instructions.split('. ').filter(Boolean)
    }));

    // Sort by relevance and limit results
    const sortedWorkouts = transformedWorkouts
      .sort((a, b) => {
        // Prioritize exact matches
        const aExact = a.name.toLowerCase() === query.toLowerCase();
        const bExact = b.name.toLowerCase() === query.toLowerCase();
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return 0;
      })
      .slice(0, 8); // Limit to 8 results

    res.status(200).json({
      workouts: sortedWorkouts,
      totalResults: exercises.length
    });

  } catch (error) {
    console.error('Workout search error:', error);
    res.status(500).json({ 
      message: 'Error searching workouts',
      error: error.message 
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
  const cardioMuscles = ['cardiovascular system'];
  const flexibilityMuscles = ['abdominals', 'lower back'];
  
  if (cardioMuscles.includes(muscle.toLowerCase())) return 'Cardio';
  if (flexibilityMuscles.includes(muscle.toLowerCase())) return 'Flexibility';
  
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
  const muscleMultiplier = muscleIntensity[exercise.muscle.toLowerCase()] || 1;
  const equipMultiplier = equipmentIntensity[exercise.equipment.toLowerCase()] || 1;

  return Math.round(base * muscleMultiplier * equipMultiplier);
}

// Helper function to determine exercise intensity
function calculateIntensity(exercise) {
  const highIntensityKeywords = ['explosive', 'jump', 'sprint', 'power', 'burpee', 'clean', 'snatch'];
  const lowIntensityKeywords = ['stretch', 'mobility', 'walk', 'foam', 'roll'];
  
  const name = exercise.name.toLowerCase();
  const type = exercise.type.toLowerCase();
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