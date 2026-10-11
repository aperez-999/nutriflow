import { describe, expect, it } from 'vitest';
import { MUSCLES } from '../../../../backend/data/exerciseCatalog.js';
import { LABEL, describeMuscles } from './anatomy';

describe('anatomy', () => {
  it('has a plain-language label for every muscle in the exercise catalog', () => {
    expect(Object.keys(LABEL).sort()).toEqual([...MUSCLES].sort());
  });

  it('describes main and helper muscles', () => {
    expect(describeMuscles(['quads', 'glutes'], ['adductors'])).toBe('Works quads, glutes; also inner thighs.');
    expect(describeMuscles(['upperBack'])).toBe('Works upper back.');
  });
});
