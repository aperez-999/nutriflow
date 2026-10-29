import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { rememberUser } from '../components/Auth/rememberedUser';
import { getMe } from '../services/api';

// How often coming back to the tab re-reads the account, at most.
const REFRESH_EVERY_MS = 60 * 1000;

const normalizeUserRecord = (payload) => {
  if (!payload) return null;
  const account = payload.user || payload.result || payload;
  if (!account) return null;

  return {
    ...payload,
    user: {
      ...account,
      preferences: {
        notificationsEnabled: account.preferences?.notificationsEnabled ?? true,
      },
    },
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Get user data from localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(normalizeUserRecord(JSON.parse(storedUser)));
      }
    } catch (error) {
      console.error('Error parsing profile:', error);
      // If there's an error parsing, clear the invalid data
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData) => {
    const normalized = normalizeUserRecord(userData);
    localStorage.setItem('user', JSON.stringify(normalized));
    rememberUser(normalized?.user);
    setUser(normalized);
  };

  const updateUser = (nextUserData) => {
    const normalized = normalizeUserRecord(nextUserData);
    localStorage.setItem('user', JSON.stringify(normalized));
    setUser(normalized);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  // The account saved at login goes stale when the app changes it (a new photo, goals, a
  // name), so it is re-read from the server on load and when the tab comes back into view.
  const refresh = useCallback(async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const { user: account } = await getMe();
      setUser((current) => {
        if (!current) return current;
        const next = normalizeUserRecord({ ...current, user: account });
        localStorage.setItem('user', JSON.stringify(next));
        return next;
      });
    } catch (error) {
      // An expired session ends here, as any other request would end it.
      if (error?.response?.status === 401) logout();
    }
  }, []);

  useEffect(() => {
    if (loading) return undefined;
    refresh();
    let last = Date.now();
    const onVisible = () => {
      if (document.visibilityState !== 'visible' || Date.now() - last < REFRESH_EVERY_MS) return;
      last = Date.now();
      refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [loading, refresh]);

  if (loading) {
    return null; // or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
