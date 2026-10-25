import { describe, expect, it } from 'vitest';
import { mergePlans, planChanges, toWirePlan } from './planSync';

const plan = (id, generatedAt, workouts) => ({ id, title: id, generatedAt, workouts });

describe('mergePlans', () => {
  it('keeps server plans, adds never-uploaded local ones, newest first', () => {
    const server = [plan('a', '2026-10-01', [{ title: 'Run' }])];
    const local = [plan('b', '2026-10-05', [{ title: 'Lift' }])];
    expect(mergePlans('training', server, local, []).map((p) => p.id)).toEqual(['b', 'a']);
  });

  it('drops a local plan that was deleted on another device', () => {
    const local = [plan('gone', '2026-10-05', [{ title: 'Lift' }])];
    expect(mergePlans('training', [], local, ['gone'])).toEqual([]);
  });

  it('keeps a session logged on either copy', () => {
    const server = [plan('a', '2026-10-01', [{ title: 'Run' }, { title: 'Lift', completedRecordId: 's1' }])];
    const local = [plan('a', '2026-10-01', [{ title: 'Run', completedRecordId: 'l1', completedAt: 'x' }, { title: 'Lift' }])];
    const [merged] = mergePlans('training', server, local, ['a']);
    expect(merged.workouts.map((w) => w.completedRecordId)).toEqual(['l1', 's1']);
  });
});

describe('planChanges', () => {
  it('saves new or changed plans and deletes removed ones of the same kind', () => {
    const a = plan('a', '2026-10-01', [{ title: 'Run' }]);
    const synced = new Map([
      ['a', { kind: 'training', json: JSON.stringify(toWirePlan('training', a)) }],
      ['old', { kind: 'training', json: '{}' }],
      ['meal-1', { kind: 'meal', json: '{}' }],
    ]);
    const b = plan('b', '2026-10-02', [{ title: 'Lift' }]);
    const { upserts, removals } = planChanges('training', [a, b], synced);
    expect(upserts.map((u) => u.id)).toEqual(['b']);
    expect(removals).toEqual(['old']);
  });
});
