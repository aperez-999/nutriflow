export const categorizeMessage = (text) => {
  const m = (text || '').toLowerCase();

  if (/^(hi|hello|hey|yo|good (morning|afternoon|evening)|what'?s up)\b/.test(m)) return 'greeting';
  if (m.includes('build muscle') || m.includes('gain muscle') || m.includes('muscle') || m.includes('hypertrophy') || m.includes('bulk')) return 'muscle';
  // Food first: "protein after training" is a food question.
  if (m.includes('nutrition') || m.includes('protein') || m.includes('calorie') || m.includes('meal') || m.includes('eat')) return 'nutrition';
  if (m.includes('workout') || m.includes('exercise') || m.includes('train') || m.includes('lift')) return 'workout';
  if (m.includes('form') || m.includes('technique') || m.includes('how to')) return 'form';
  if (m.includes('progress') || m.includes('analyze') || m.includes('track')) return 'progress';
  if (m.includes('plan') || m.includes('schedule') || m.includes('week')) return 'plan';
  return 'default';
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
  return { content: getFallbackContent(type, ctx) };
};

const getFallbackContent = (type, ctx) => {
  const name = ctx?.userName || 'there';

  switch (type) {
    case 'greeting':
      return `Hey ${name}. Ask me about training, food, recovery or your next plan, and I'll give you the next step.`;
    case 'muscle':
      return `If your goal is to build muscle, focus on progressive overload, enough protein, and consistent training. Tell me how many days you train and what equipment you have, and I'll help you shape a plan.`;
    case 'workout':
      return `Happy to plan a workout. What do you want from it: strength, cardio or mobility? And how long do you have?`;
    case 'nutrition':
      return `Tell me your goal (gain muscle, lose fat, or just eat better) and I'll point out the first thing to change in what you eat.`;
    case 'form':
      return `Good form keeps you progressing and out of trouble. Which exercise do you want to check?`;
    case 'progress':
      return `Your logs are the best place to start. Is it training, food or recovery you want to look at first?`;
    case 'plan':
      return `What's the plan for: getting stronger, losing fat, or training for something? Tell me and how many days a week you can train.`;
    default:
      return `Ask me about training, food or recovery. Tell me what you want to improve and I'll give you the next step.`;
  }
};
