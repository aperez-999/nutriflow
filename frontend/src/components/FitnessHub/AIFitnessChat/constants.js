/** Top-level quick actions for the chat rail. */
export const QUICK_ACTIONS = [
  'Generate Weekly Plan',
  'Create Meal Plan',
  'Analyze My Progress',
  'How ready am I?',
];

/** Primary suggestions returned in-chat. */
export const PRIMARY_SUGGESTIONS = [
  'Generate Weekly Plan',
  'Create Meal Plan',
  'Analyze My Progress',
  'How ready am I?',
];

/** Secondary quick actions — general advice. */
export const SECONDARY_SUGGESTIONS = [
  'Nutrition Advice',
  'Form Tips',
];

/** Default set for follow-up suggestions inside chat replies. */
export const DEFAULT_SUGGESTIONS = [...PRIMARY_SUGGESTIONS, ...SECONDARY_SUGGESTIONS];

export const CHAT_ACTION_BUTTON_PROPS = {
  size: 'sm',
  borderRadius: 'full',
  fontWeight: '600',
};

export const WELCOME_MESSAGE = {
  id: 'welcome-1',
  type: 'ai',
  content: 'Welcome to your AI Fitness Coach. I can help with weekly training plans, nutrition guidance, recovery suggestions, and progress reviews. What would you like to work on today?',
  timestamp: new Date(),
  suggestions: [],
};

export const CLEAR_MESSAGE = {
  id: 'welcome-clear',
  type: 'ai',
  content: 'Chat cleared. What would you like to focus on next?',
  timestamp: new Date(),
  suggestions: [],
};

/** Shown while the AI is generating a response. */
export const TYPING_INDICATOR_TEXT = 'AI Coach is preparing a personalized response';
