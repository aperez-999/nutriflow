// Keeping a list stored in the browser in step with the account (saved plans, coach
// conversations). Every item has a string `id`; the server keeps the same id.

/**
 * The server's items plus local items never uploaded. A local item that was synced
 * before (its id is in `syncedIds`) but is gone from the server was deleted on another
 * device, so it is dropped rather than uploaded again. `combine(server, local)` picks or
 * blends the two copies of an item both sides have.
 */
export function mergeWithServer(serverItems = [], localItems = [], syncedIds = [], combine = (server) => server) {
  const localById = new Map(localItems.map((item) => [item.id, item]));
  const serverIds = new Set(serverItems.map((item) => item.id));
  const synced = new Set(syncedIds);
  const merged = serverItems.map((item) => (localById.has(item.id) ? combine(item, localById.get(item.id)) : item));
  const unsent = localItems.filter((item) => !serverIds.has(item.id) && !synced.has(item.id));
  return [...merged, ...unsent];
}

/**
 * Compares the current items (`entries`: { id, wire }) with what the server last confirmed
 * (`synced`: id → JSON) and returns what to save and which ids to delete.
 */
export function syncChanges(entries, synced) {
  const current = new Set();
  const upserts = [];
  entries.forEach(({ id, wire }) => {
    current.add(id);
    const json = JSON.stringify(wire);
    if (synced.get(id) !== json) upserts.push({ id, wire, json });
  });
  const removals = [...synced.keys()].filter((id) => !current.has(id));
  return { upserts, removals };
}
