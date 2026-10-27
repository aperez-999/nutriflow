import { mergeWithServer } from '../../utils/serverSync';

// Saved plans on the account: how the server and browser copies of a plan combine, and
// what the server stores for one.

const ITEMS = { training: 'workouts', meal: 'meals' };
const byNewest = (a, b) => new Date(b.generatedAt) - new Date(a.generatedAt);

/** Completion marks (a logged session or meal) from either copy are kept. */
const mergeItems = (serverItems = [], localItems = []) =>
  serverItems.map((item, index) => {
    const local = localItems[index];
    if (item?.completedRecordId || !local?.completedRecordId) return item;
    return { ...item, completedRecordId: local.completedRecordId, completedAt: local.completedAt };
  });

/** The account's plans merged with this browser's (see mergeWithServer), newest first. */
export function mergePlans(kind, serverPlans = [], localPlans = [], syncedIds = []) {
  const key = ITEMS[kind];
  return mergeWithServer(serverPlans, localPlans, syncedIds, (server, local) => ({
    ...server,
    [key]: mergeItems(server[key], local[key]),
  })).sort(byNewest);
}

/** What the server stores for a plan; equal JSON means nothing to send. */
export const toWirePlan = (kind, plan) => ({
  kind,
  title: plan.title,
  calories: plan.calories ?? null,
  generatedAt: plan.generatedAt,
  items: plan[ITEMS[kind]] || [],
});
