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
  fontWeight: '500',
};

/** Display labels for quick actions; the values above stay as the prompts the chat logic expects. */
export const QUICK_ACTION_LABELS = {
  'Generate Weekly Plan': 'Plan my training week',
  'Create Meal Plan': 'Make a meal plan',
  'Analyze My Progress': 'How is my week going?',
  'How ready am I?': 'How ready am I today?',
  'Nutrition Advice': 'Nutrition advice',
  'Form Tips': 'Form tips',
};

export const WELCOME_MESSAGE = {
  id: 'welcome-1',
  type: 'ai',
  content: 'Hi. I can plan your training week, build a meal plan around your targets, or look at how your week is going. What do you need?',
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
export const TYPING_INDICATOR_TEXT = 'Coach is thinking';

export const GENERIC_BACKEND_FALLBACK_MESSAGE =
  "I'm here to help with your fitness journey! What would you like to focus on today?";
