import { describe, expect, it } from 'vitest';
import { createAIMessage, formatWorkoutsAsMarkdown } from './utils';

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
