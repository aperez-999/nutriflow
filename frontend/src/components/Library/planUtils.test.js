import { describe, expect, it } from 'vitest';
import { EXERCISE_CATALOG } from '../../../../backend/data/exerciseCatalog.js';
import { matchExercise, planMuscles, planProgress } from './planUtils';
import { planTitle } from './usePlanLibrary';

const name = (text) => matchExercise(text, EXERCISE_CATALOG)?.name ?? null;

describe('matchExercise', () => {
  it('matches the way the coach writes exercise names', () => {
    expect(name('Squats 3x8')).toBe('Squats');
    expect(name('Goblet squats')).toBe('Goblet Squat');
    expect(name('Pushups')).toBe('Push-ups');
    expect(name('Deadlifts')).toBe('Deadlift');
    expect(name('Romanian deadlift')).toBe('Romanian Deadlift');
    expect(name('Overhead Press 3x8')).toBe('Shoulder Press');
    expect(name('Bent-over rows')).toBe('Seated Cable Row');
    expect(name('Plank 3 x 30 sec')).toBe('Plank');
  });

  it('returns null for exercises the library does not have', () => {
    expect(name('Burpees')).toBeNull();
    expect(name('')).toBeNull();
  });
});

describe('planMuscles', () => {
  it('collects main muscles and keeps helpers separate', () => {
    const result = planMuscles([{ exercises: [{ name: 'Squats' }, 'Burpees'] }, { exercises: ['Plank'] }], EXERCISE_CATALOG);
    expect(result.matched).toBe(2);
    expect(result.total).toBe(3);
    expect(result.primary).toEqual(expect.arrayContaining(['quads', 'glutes', 'abs']));
    expect(result.secondary.some((m) => result.primary.includes(m))).toBe(false);
  });
});

describe('planProgress', () => {
  it('counts logged items', () => {
    expect(planProgress([{ completedRecordId: 'a' }, {}, { completedRecordId: 'b' }])).toEqual({ done: 2, total: 3 });
  });
});

describe('planTitle', () => {
  it('names a plan after the focus most sessions share', () => {
    expect(planTitle([{ title: 'Monday - Full Body', focusAreas: ['Full Body'] }, { focusAreas: ['Full Body', 'Core'] }, { focusAreas: ['Cardio'] }])).toBe('Full Body week');
  });

  it('falls back to the session count', () => {
    expect(planTitle([{ title: 'Monday - Run' }, { title: 'Wednesday - Lift' }])).toBe('2-session week');
  });
});
