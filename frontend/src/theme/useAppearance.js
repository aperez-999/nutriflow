import { useCallback, useEffect, useState } from 'react';
import { useColorMode } from '@chakra-ui/react';

// The user's appearance choice. Chakra only stores the resolved light/dark value,
// so "follow my device" is remembered here and re-applied when the device changes.
const KEY = 'nutriflow.appearance';
const media = () => (typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null);
const systemMode = () => (media()?.matches ? 'dark' : 'light');

const readPreference = () => {
  try {
    return window.localStorage.getItem(KEY) || 'system';
  } catch {
    return 'system';
  }
};

/** [preference, setPreference] where preference is 'light' | 'dark' | 'system'. */
export default function useAppearance() {
  const { setColorMode } = useColorMode();
  const [preference, setPreferenceState] = useState(readPreference);

  const setPreference = useCallback((next) => {
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      // Without storage the choice still applies for this visit.
    }
    setPreferenceState(next);
    setColorMode(next === 'system' ? systemMode() : next);
    window.dispatchEvent(new Event('nutriflow-appearance'));
  }, [setColorMode]);

  // Keep every instance in sync, and follow the device while on 'system'.
  useEffect(() => {
    const sync = () => {
      const current = readPreference();
      setPreferenceState(current);
      if (current === 'system') setColorMode(systemMode());
    };
    const query = media();
    sync();
    window.addEventListener('nutriflow-appearance', sync);
    query?.addEventListener('change', sync);
    return () => {
      window.removeEventListener('nutriflow-appearance', sync);
      query?.removeEventListener('change', sync);
    };
  }, [setColorMode]);

  return [preference, setPreference];
}
