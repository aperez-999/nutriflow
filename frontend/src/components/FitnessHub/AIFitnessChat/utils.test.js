import { describe, expect, it } from 'vitest';
import { createAIMessage, formatWorkoutsAsMarkdown, pickSuggestions, resolveAssistantActionPrompt } from './utils';

describe('formatWorkoutsAsMarkdown', () => {
  it('summarises a plan in a few lines and points to the Library', () => {
    const text = formatWorkoutsAsMarkdown([
      { title: 'Full body', duration: 40, exercises: [{ name: 'Squats' }] },
      { title: 'Easy run', duration: 30 },
    ]);
    expect(text).toContain('**2 sessions, 70 min in total**');
    expect(text).toContain('- **Full body**, 40 min');
    expect(text).toContain('Library');
    expect(text).not.toContain('Squats');
    expect(text.split('\n').length).toBeLessThanOrEqual(6);
  });
});

describe('createAIMessage', () => {
  it('marks built-in replies as offline only when asked', () => {
    expect(createAIMessage('hi', []).offline).toBeUndefined();
    expect(createAIMessage('hi', [], true).offline).toBe(true);
  });
});

describe('pickSuggestions', () => {
  it('keeps at most four, dropping ones that read the same', () => {
    const picked = pickSuggestions(['Generate Weekly Plan', 'Plan my training week', 'Create Meal Plan', 'Form tips', 'Analyze My Progress', 'How ready am I?']);
    expect(picked).toEqual(['Generate Weekly Plan', 'Create Meal Plan', 'Form tips', 'Analyze My Progress']);
  });
});

describe('resolveAssistantActionPrompt', () => {
  it('turns plan follow-ups into requests for a new saved plan', () => {
    expect(resolveAssistantActionPrompt('Make the week easier')).toContain('[[RETURN_JSON_WORKOUT_PLAN]]');
    expect(resolveAssistantActionPrompt('Make it vegetarian')).toMatch(/meal plan/i);
    expect(resolveAssistantActionPrompt('What should I eat after?')).toBe('What should I eat after?');
  });
});
