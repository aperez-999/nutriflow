// Keeping saved plans in step with the account: merging what the server has with this
// browser's copy, and working out what to save or delete after a change.

const ITEMS = { training: 'workouts', meal: 'meals' };
const byNewest = (a, b) => new Date(b.generatedAt) - new Date(a.generatedAt);

/** Completion marks (a logged session or meal) from either copy are kept. */
const mergeItems = (serverItems = [], localItems = []) =>
  serverItems.map((item, index) => {
    const local = localItems[index];
    if (item?.completedRecordId || !local?.completedRecordId) return item;
    return { ...item, completedRecordId: local.completedRecordId, completedAt: local.completedAt };
  });

/**
 * Server plans plus local ones never uploaded. A local plan that was synced before but is
 * no longer on the server was deleted on another device, so it is dropped, not re-uploaded.
 */
export function mergePlans(kind, serverPlans = [], localPlans = [], syncedIds = []) {
  const key = ITEMS[kind];
  const localById = new Map(localPlans.map((plan) => [plan.id, plan]));
  const serverIds = new Set(serverPlans.map((plan) => plan.id));
  const synced = new Set(syncedIds);
  const merged = serverPlans.map((plan) => {
    const local = localById.get(plan.id);
    return local ? { ...plan, [key]: mergeItems(plan[key], local[key]) } : plan;
  });
  const unsent = localPlans.filter((plan) => !serverIds.has(plan.id) && !synced.has(plan.id));
  return [...merged, ...unsent].sort(byNewest);
}

/** What the server stores for a plan; equal JSON means nothing to send. */
export const toWirePlan = (kind, plan) => ({
  kind,
  title: plan.title,
  calories: plan.calories ?? null,
  generatedAt: plan.generatedAt,
  items: plan[ITEMS[kind]] || [],
});

/**
 * Compares plans with the last version the server confirmed (`synced`: id → JSON) and
 * returns what to save and what to delete.
 */
export function planChanges(kind, plans, synced) {
  const current = new Set();
  const upserts = [];
  plans.forEach((plan) => {
    current.add(plan.id);
    const wire = toWirePlan(kind, plan);
    const json = JSON.stringify(wire);
    if (synced.get(plan.id)?.json !== json) upserts.push({ id: plan.id, wire, json });
  });
  const removals = [...synced.entries()]
    .filter(([id, entry]) => entry.kind === kind && !current.has(id))
    .map(([id]) => id);
  return { upserts, removals };
}
