import { describe, expect, it } from 'vitest';
import { mergeWithServer, syncChanges } from './serverSync';

describe('mergeWithServer', () => {
  it('keeps server items and adds local items never uploaded', () => {
    expect(mergeWithServer([{ id: 'a' }], [{ id: 'b' }], []).map((i) => i.id)).toEqual(['a', 'b']);
  });

  it('drops a local item deleted on another device', () => {
    expect(mergeWithServer([], [{ id: 'gone' }], ['gone'])).toEqual([]);
  });

  it('lets the caller combine both copies of an item', () => {
    const [item] = mergeWithServer([{ id: 'a', n: 1 }], [{ id: 'a', n: 2 }], ['a'], (s, l) => ({ ...s, n: s.n + l.n }));
    expect(item.n).toBe(3);
  });
});

describe('syncChanges', () => {
  it('saves new or changed items and deletes removed ones', () => {
    const synced = new Map([['same', JSON.stringify({ v: 1 })], ['changed', JSON.stringify({ v: 1 })], ['removed', '{}']]);
    const { upserts, removals } = syncChanges([
      { id: 'same', wire: { v: 1 } },
      { id: 'changed', wire: { v: 2 } },
      { id: 'new', wire: { v: 1 } },
    ], synced);
    expect(upserts.map((u) => u.id)).toEqual(['changed', 'new']);
    expect(removals).toEqual(['removed']);
  });
});
