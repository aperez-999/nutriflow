import { useEffect, useRef, useState } from 'react';
import { syncChanges } from './serverSync';

/**
 * Saves changed items and deletes removed ones once the first server load is done
 * (`ready`), so a failed load can never delete anything on the account.
 *
 * - `entries`: memoized [{ id, wire }], the current items as the server stores them
 * - `syncedRef`: a ref to a Map id → JSON of what the server last confirmed; the caller
 *   fills it from the first load
 * - `save(id, wire)` / `remove(id)`: the API calls
 *
 * One request per item at a time, so an older save never lands after a newer one; when a
 * request succeeds the effect runs again and sends anything that changed meanwhile.
 * Failed requests wait for the next change instead of retrying in a loop. Returns a
 * number that changes after each successful request (to persist synced ids).
 */
export default function useServerSync({ ready, entries, syncedRef, save, remove }) {
  const inFlightRef = useRef(new Set());
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!ready) return;
    const send = (id, request, onDone) => {
      if (inFlightRef.current.has(id)) return;
      inFlightRef.current.add(id);
      request()
        .then(() => {
          onDone();
          inFlightRef.current.delete(id);
          setVersion((v) => v + 1);
        })
        .catch(() => {
          inFlightRef.current.delete(id);
        });
    };
    const { upserts, removals } = syncChanges(entries, syncedRef.current);
    upserts.forEach(({ id, wire, json }) => send(id, () => save(id, wire), () => syncedRef.current.set(id, json)));
    removals.forEach((id) => send(id, () => remove(id), () => syncedRef.current.delete(id)));
  }, [entries, ready, remove, save, syncedRef, version]);

  return version;
}
