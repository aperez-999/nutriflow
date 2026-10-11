import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DIFFICULTY, EQUIPMENT, EXERCISE_CATALOG, MUSCLE_GROUPS, MUSCLES } from '../data/exerciseCatalog.js';
import { buildExerciseQuery } from '../controllers/exerciseLibraryController.js';

describe('exercise catalog', () => {
  it('has unique slugs and only known groups, equipment, difficulty and muscles', () => {
    const slugs = new Set();
    for (const ex of EXERCISE_CATALOG) {
      assert.ok(!slugs.has(ex.slug), `duplicate slug ${ex.slug}`);
      slugs.add(ex.slug);
      assert.ok(MUSCLE_GROUPS.includes(ex.muscleGroup), `${ex.slug} group`);
      assert.ok(EQUIPMENT.includes(ex.equipment), `${ex.slug} equipment`);
      assert.ok(DIFFICULTY.includes(ex.difficulty), `${ex.slug} difficulty`);
      assert.ok(ex.primary.length > 0, `${ex.slug} needs a primary muscle`);
      for (const m of [...ex.primary, ...ex.secondary]) assert.ok(MUSCLES.includes(m), `${ex.slug} muscle ${m}`);
      assert.equal(ex.cues.length, 3, `${ex.slug} cues`);
      assert.match(ex.videoUrl, /^https:\/\/www\.youtube\.com\//);
    }
  });
});

describe('buildExerciseQuery', () => {
  it('keeps valid filters and ignores unknown values', () => {
    assert.deepEqual(buildExerciseQuery({ muscleGroup: 'Chest', equipment: 'Spaceship', difficulty: 'Beginner' }), {
      muscleGroup: 'Chest',
      difficulty: 'Beginner',
    });
  });

  it('escapes search text so it cannot inject a regex', () => {
    const query = buildExerciseQuery({ q: '  row.*(  ' });
    assert.equal(query.name.$regex, 'row\\.\\*\\(');
    assert.equal(buildExerciseQuery({ q: { $gt: '' } }).name, undefined);
  });
});
