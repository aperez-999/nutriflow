import LookupCache from '../models/LookupCache.js';

const DAY = 24 * 60 * 60 * 1000;

/**
 * The cached answer for `key`, or `load()`'s, saved for `days`. A load that returns null
 * isn't saved. The cache only ever helps: if the database can't be reached, it loads.
 */
export async function cached(key, days, load) {
  try {
    const hit = await LookupCache.findOne({ key, expiresAt: { $gt: new Date() } }).lean();
    if (hit) return hit.value;
  } catch (error) {
    console.error('Lookup cache read error:', error.message);
  }
  const value = await load();
  if (value !== null && value !== undefined) {
    LookupCache.updateOne({ key }, { $set: { value, expiresAt: new Date(Date.now() + days * DAY) } }, { upsert: true })
      .catch((error) => console.error('Lookup cache write error:', error.message));
  }
  return value;
}
