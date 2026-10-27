import { describe, expect, it } from 'vitest';
import { mergePlans } from './planSync';

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
