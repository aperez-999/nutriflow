/** Primary quick actions — prominent, trigger future agents (workout plan, meal plan, progress). */
export const PRIMARY_SUGGESTIONS = [
  'Generate Workout Plan',
  'Create Meal Plan',
  'Analyze My Progress',
  'How ready am I?',
];

/** Secondary quick actions — general advice. */
export const SECONDARY_SUGGESTIONS = [
  'Nutrition Advice',
  'Form Tips',
];

/** Default set for welcome/clear: primary + secondary. */
export const DEFAULT_SUGGESTIONS = [...PRIMARY_SUGGESTIONS, ...SECONDARY_SUGGESTIONS];

export const WELCOME_MESSAGE = {
  id: 'welcome-1',
  type: 'ai',
  content: "Welcome to your AI Fitness Coach. I can help with personalized workout plans, nutrition guidance, recovery suggestions, and progress reviews. What would you like to work on today?",
  timestamp: new Date(),
  suggestions: DEFAULT_SUGGESTIONS,
};

export const CLEAR_MESSAGE = {
  id: 'welcome-clear',
  type: 'ai',
  content: 'Chat cleared. What would you like to focus on next?',
  timestamp: new Date(),
  suggestions: DEFAULT_SUGGESTIONS,
};

/** Shown while the AI is generating a response. */
export const TYPING_INDICATOR_TEXT = 'AI Coach is analyzing your activity...';
