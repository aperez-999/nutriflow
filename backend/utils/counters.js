import Counter from '../models/Counter.js';

/** The start of the next window of `windowMs` (fixed windows, the same on every server). */
export function windowEnd(windowMs, now = Date.now()) {
  return new Date((Math.floor(now / windowMs) + 1) * windowMs);
}

/** The next midnight, UTC: when daily allowances come back. */
export function nextUtcMidnight(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
}

/**
 * Adds one to the count for `key` until `expiresAt`, and returns the new count. Atomic, so two
 * requests at once are both counted; a race to create the first one is retried once.
 */
export async function bump(key, expiresAt, by = 1) {
  const update = { $inc: { hits: by }, $setOnInsert: { expiresAt } };
  for (let attempt = 0; ; attempt += 1) {
    try {
      const counter = await Counter.findOneAndUpdate({ key }, update, { upsert: true, new: true }).lean();
      return counter.hits;
    } catch (error) {
      if (error?.code !== 11000 || attempt > 0) throw error;
    }
  }
}

/** Takes one back, without creating a count that isn't there. */
export async function unbump(key) {
  await Counter.updateOne({ key, hits: { $gt: 0 } }, { $inc: { hits: -1 } });
}
