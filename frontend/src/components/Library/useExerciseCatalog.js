import { useCallback, useEffect, useState } from 'react';
import { getExerciseLibrary } from '../../services/api';

// The catalog is the same for everyone, so one request serves every Library view.
let pending = null;
const loadCatalog = () => {
  if (!pending) {
    pending = getExerciseLibrary().catch((error) => {
      pending = null;
      throw error;
    });
  }
  return pending;
};

/** The exercise library: { status: 'loading' | 'ready' | 'error', exercises, filters, reload }. */
export default function useExerciseCatalog() {
  const [state, setState] = useState({ status: 'loading', exercises: [], filters: null });

  const reload = useCallback(() => {
    let alive = true;
    setState((prev) => ({ ...prev, status: 'loading' }));
    loadCatalog()
      .then((data) => alive && setState({ status: 'ready', exercises: data.exercises || [], filters: data.filters }))
      .catch(() => alive && setState({ status: 'error', exercises: [], filters: null }));
    return () => { alive = false; };
  }, []);

  useEffect(() => reload(), [reload]);

  return { ...state, reload };
}
