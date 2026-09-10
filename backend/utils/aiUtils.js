export const categorizeMessage = (text) => {
  const m = (text || '').toLowerCase();

  if (/^(hi|hello|hey|yo|good (morning|afternoon|evening)|what'?s up)\b/.test(m)) return 'greeting';
  if (m.includes('build muscle') || m.includes('gain muscle') || m.includes('muscle') || m.includes('hypertrophy') || m.includes('bulk')) return 'muscle';
  if (m.includes('workout') || m.includes('exercise') || m.includes('train') || m.includes('lift')) return 'workout';
  if (m.includes('nutrition') || m.includes('protein') || m.includes('calorie') || m.includes('meal') || m.includes('eat')) return 'nutrition';
  if (m.includes('form') || m.includes('technique') || m.includes('how to')) return 'form';
  if (m.includes('progress') || m.includes('analyze') || m.includes('track')) return 'progress';
  if (m.includes('plan') || m.includes('schedule') || m.includes('week')) return 'plan';
  return 'default';
};

export const suggestionsByCategory = {
  greeting: ['How can I build muscle?', 'Create a workout plan', 'Nutrition advice', 'How ready am I?'],
  muscle: ['Create a workout plan', 'Nutrition advice', 'Form tips', 'How ready am I?'],
  workout: ['Show me the exercises', 'Adjust difficulty', 'Plan my week', 'How ready am I?'],
  nutrition: ['Create a meal plan', 'Nutrition advice', 'Track my intake', 'How ready am I?'],
  form: ['Specific exercise form', 'Video demonstrations', 'Form checklist', 'Common mistakes'],
  progress: ['Detailed analysis', 'Set new goals', 'Weekly plan', 'How ready am I?'],
  plan: ['Customize plan', 'Add to calendar', 'Nutrition details', 'Exercise library'],
  default: ['How can I build muscle?', 'Workout plan', 'Nutrition advice', 'How ready am I?'],
};

/** Suggestions that trigger future agents (workout plan, meal plan, progress analysis). */
export const COACHING_ACTION_SUGGESTIONS = [
  'Generate workout plan',
  'Create meal plan',
  'Analyze my progress',
  'How ready am I?',
];

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
  const name = ctx?.userName || 'there';

  switch (type) {
    case 'greeting':
      return `Hey ${name} - I can help with training, nutrition, recovery, or your next plan. Tell me your goal and I'll help you map the next step.`;
    case 'muscle':
      return `If your goal is to build muscle, focus on progressive overload, enough protein, and consistent training. Tell me how many days you train and what equipment you have, and I'll help you shape a plan.`;
    case 'workout':
      return `I'll help you design an effective workout based on your goals and fitness level. What type of workout interests you most: strength, cardio, or flexibility?`;
    case 'nutrition':
      return `I can help you tune your nutrition around your goal. If you want, tell me whether you're trying to gain muscle, cut fat, or just eat better, and I'll tailor the advice.`;
    case 'form':
      return `Proper form is essential for both results and safety. Which exercise would you like to learn more about?`;
    case 'progress':
      return `Let's analyze your progress and set some new goals. What specific aspects of your fitness journey would you like to focus on?`;
    case 'plan':
      return `I'll help you create a personalized plan. What are your main fitness goals right now?`;
    default:
      return `I'm here for the full coaching side of your fitness journey: training, nutrition, recovery, and planning. Tell me what you want to improve, and I'll help you move forward.`;
  }
};
