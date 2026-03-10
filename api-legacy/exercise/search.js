import { handleCors } from '../_lib/middleware.js';
import connectDB from '../_lib/db.js';

export default async function handler(req, res) {
  console.log('[API] exercise/search hit', { method: req.method, url: req.url });
  // CORS
  handleCors(req, res, () => {});
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // No DB needed for this endpoint, but ensuring env access in Vercel env
    await connectDB().catch(() => {});

    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    if (!process.env.NINJA_API_KEY) {
      throw new Error('NINJA_API_KEY is not configured');
    }

    const apiUrl = `https://api.api-ninjas.com/v1/exercises?name=${encodeURIComponent(query)}`;
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-Api-Key': process.env.NINJA_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Ninjas error: ${response.status} - ${errorData.message || response.statusText}`);
    }

    const exercises = await response.json();

    const transformed = (exercises || []).map((exercise, index) => ({
      id: `${(exercise.name || '').toLowerCase().replace(/[^a-z0-9]/g, '-')}-${index}`,
      name: exercise.name,
      type: mapExerciseType(exercise.type, exercise.muscle),
      equipment: exercise.equipment || 'None',
      bodyPart: exercise.muscle,
      target: exercise.muscle,
      caloriesPerMinute: calculateEstimatedCalories(exercise),
      intensity: calculateIntensity(exercise),
      instructions: typeof exercise.instructions === 'string' 
        ? exercise.instructions.split('. ').filter(Boolean)
        : [],
    }));

    const sorted = transformed
      .sort((a, b) => {
        const aExact = (a.name || '').toLowerCase() === query.toLowerCase();
        const bExact = (b.name || '').toLowerCase() === query.toLowerCase();
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return 0;
      })
      .slice(0, 8);

    return res.status(200).json({ workouts: sorted, totalResults: (exercises || []).length });
  } catch (error) {
    console.error('Exercise search error:', error);
    return res.status(500).json({ message: 'Error searching exercises', error: error.message });
  }
}

function mapExerciseType(type, muscle) {
  if (String(type).toLowerCase() === 'cardio') return 'Cardio';
  if (String(type).toLowerCase() === 'strength') return 'Strength';
  if (['stretching', 'plyometrics'].includes(String(type).toLowerCase())) return 'Flexibility';

  const muscleLower = String(muscle || '').toLowerCase();
  const cardioMuscles = ['cardiovascular system'];
  const flexibilityMuscles = ['abdominals', 'lower back'];

  if (cardioMuscles.includes(muscleLower)) return 'Cardio';
  if (flexibilityMuscles.includes(muscleLower)) return 'Flexibility';
  return 'Strength';
}

function calculateEstimatedCalories(exercise) {
  const baseCalories = { cardio: 12, strength: 8, stretching: 3, plyometrics: 10 };
  const muscleIntensity = {
    'cardiovascular system': 1.2,
    quadriceps: 1.1,
    glutes: 1.1,
    hamstrings: 1.1,
    calves: 0.9,
    chest: 1.0,
    back: 1.0,
    shoulders: 0.9,
    biceps: 0.8,
    triceps: 0.8,
    abdominals: 0.9,
    'lower back': 0.9,
    'middle back': 1.0,
    lats: 1.0,
  };
  const equipmentIntensity = {
    'body weight': 0.9,
    dumbbell: 1.1,
    barbell: 1.2,
    cable: 1.0,
    kettlebell: 1.1,
    machine: 1.0,
    band: 0.9,
    'medicine ball': 1.0,
    'bosu ball': 0.9,
    'stability ball': 0.9,
    'foam roll': 0.8,
    none: 0.9,
  };

  const type = String(exercise.type || '').toLowerCase();
  const muscle = String(exercise.muscle || '').toLowerCase();
  const equipment = String(exercise.equipment || '').toLowerCase();

  let base = baseCalories[type] || 8;
  const muscleMultiplier = muscleIntensity[muscle] || 1;
  const equipMultiplier = equipmentIntensity[equipment] || 1;

  return Math.round(base * muscleMultiplier * equipMultiplier);
}

function calculateIntensity(exercise) {
  const highIntensityKeywords = ['explosive', 'jump', 'sprint', 'power', 'burpee', 'clean', 'snatch'];
  const lowIntensityKeywords = ['stretch', 'mobility', 'walk', 'foam', 'roll'];

  const name = String(exercise.name || '').toLowerCase();
  const type = String(exercise.type || '').toLowerCase();
  const equipment = String(exercise.equipment || '').toLowerCase();
  const difficulty = String(exercise.difficulty || '').toLowerCase();

  if (
    highIntensityKeywords.some((k) => name.includes(k)) ||
    type === 'cardio' ||
    type === 'plyometrics' ||
    difficulty === 'expert' ||
    equipment === 'barbell'
  ) {
    return 'High';
  }

  if (
    lowIntensityKeywords.some((k) => name.includes(k)) ||
    type === 'stretching' ||
    difficulty === 'beginner' ||
    equipment === 'foam roll' ||
    equipment === 'none'
  ) {
    return 'Low';
  }

  return 'Medium';
}
