export const DEFAULT_SUGGESTIONS = [
  'Recommend a workout for today',
  'Help me with my form',
  'Analyze my progress',
  'Create a weekly plan',
];

export const WELCOME_MESSAGE = {
  id: 'welcome-1',
  type: 'ai',
  content: "👋 Hi! I'm your AI Fitness Coach! I can help you with personalized workout recommendations, form tips, and nutrition advice. What would you like to work on today?",
  timestamp: new Date(),
  suggestions: DEFAULT_SUGGESTIONS,
};

export const CLEAR_MESSAGE = {
  id: 'welcome-clear',
  type: 'ai',
  content: 'Chat cleared! How can I help you with your fitness goals today? 💪',
  timestamp: new Date(),
  suggestions: DEFAULT_SUGGESTIONS,
};
