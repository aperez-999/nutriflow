/** Top-level quick actions for the chat rail. */
export const QUICK_ACTIONS = [
  'Generate Weekly Plan',
  'Create Meal Plan',
  'Analyze My Progress',
  'How ready am I?',
];

/** Follow-ups for built-in (offline) replies; online replies get theirs from the backend. */
export const DEFAULT_SUGGESTIONS = QUICK_ACTIONS;

/** A reply never shows more follow-ups than this. */
export const MAX_SUGGESTIONS = 4;

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

/** Starting points shown on an empty conversation, each tied to the flow it works on. */
export const PROMPT_CARDS = [
  { action: 'Generate Weekly Plan', flow: 'train', title: 'Plan my training week', detail: 'Sessions sized to how recovered you are. Saved to your Library.' },
  { action: 'Create Meal Plan', flow: 'fuel', title: 'Make a meal plan', detail: 'A day of meals built around your calorie and protein targets.' },
  { action: 'How ready am I?', flow: 'recover', title: 'How ready am I today?', detail: 'Your readiness score, what drives it and what to do with it.' },
  { action: 'Analyze My Progress', flow: null, title: 'How is my week going?', detail: 'A read on your logs: what is working and what to adjust.' },
];
