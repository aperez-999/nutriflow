export const categorizeMessage = (text) => {
  const m = text.toLowerCase();
  if (m.includes('workout') || m.includes('exercise') || m.includes('train')) return 'workout';
  if (m.includes('form') || m.includes('technique') || m.includes('how to')) return 'form';
  if (m.includes('progress') || m.includes('analyze') || m.includes('track')) return 'progress';
  if (m.includes('plan') || m.includes('schedule') || m.includes('week')) return 'plan';
  return 'default';
};

export const suggestionsByCategory = {
  workout: ['Show me the exercises', 'Adjust difficulty', 'Plan my week', 'Track this workout'],
  form: ['Specific exercise form', 'Video demonstrations', 'Form checklist', 'Common mistakes'],
  progress: ['Detailed analysis', 'Set new goals', 'Weekly plan', 'Nutrition tips'],
  plan: ['Customize plan', 'Add to calendar', 'Nutrition details', 'Exercise library'],
  default: ['Workout plan', 'Nutrition advice', 'Form tips', 'Progress tracking'],
};

export const getDefaultWorkoutPlan = () => [
  {
    title: 'Full Body Strength',
    duration: 45,
    intensity: 'Medium',
    focusAreas: ['Full Body'],
    exercises: [
      { name: 'Squat', sets: 3, reps: 10, interval: null },
      { name: 'Push-up', sets: 3, reps: 12, interval: null },
      { name: 'Bent-over Row', sets: 3, reps: 10, interval: null }
    ],
    videoId: null,
    description: 'Balanced strength session',
    calories: '250-350',
    difficulty: 'Beginner/Intermediate'
  },
  {
    title: 'Cardio Intervals',
    duration: 30,
    intensity: 'High',
    focusAreas: ['Cardio'],
    exercises: [
      { name: 'Run/Bike', sets: 1, reps: null, interval: 20 },
      { name: 'Walk/Easy Spin', sets: 1, reps: null, interval: 40 }
    ],
    videoId: null,
    description: 'Interval cardio for conditioning',
    calories: '200-300',
    difficulty: 'Beginner/Intermediate'
  },
  {
    title: 'Mobility & Core',
    duration: 20,
    intensity: 'Low',
    focusAreas: ['Mobility', 'Core'],
    exercises: [
      { name: 'Plank', sets: 3, reps: 30, interval: null },
      { name: 'Hip Hinge Mobility', sets: 2, reps: 10, interval: null },
      { name: 'Thoracic Opener', sets: 2, reps: 8, interval: null }
    ],
    videoId: null,
    description: 'Recovery-focused mobility and core',
    calories: '80-150',
    difficulty: 'Beginner'
  }
];

export const generateFallbackResponse = (message, context) => {
  const ctx = {
    recentWorkouts: context?.recentWorkouts || [],
    recentDiets: context?.recentDiets || [],
    userName: context?.userName || 'there',
  };
  
  const type = categorizeMessage(message);
  return {
    content: getFallbackContent(type, ctx),
    suggestions: suggestionsByCategory[type] || suggestionsByCategory.default
  };
};

const getFallbackContent = (type, ctx) => {
  switch (type) {
    case 'workout':
      return `I'll help you design an effective workout based on your goals and fitness level. What type of workout interests you most: strength, cardio, or flexibility?`;
    case 'form':
      return `Proper form is essential for both results and safety. Which exercise would you like to learn more about?`;
    case 'progress':
      return `Let's analyze your progress and set some new goals. What specific aspects of your fitness journey would you like to focus on?`;
    case 'plan':
      return `I'll help you create a personalized plan. What are your main fitness goals right now?`;
    default:
      return `I'm here to help with your fitness journey! What would you like to focus on today?`;
  }
};
