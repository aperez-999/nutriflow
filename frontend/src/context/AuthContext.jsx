import { createContext, useState, useEffect } from 'react';
import { rememberUser } from '../components/Auth/rememberedUser';

export const AuthContext = createContext();

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

  if (loading) {
    return null; // or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
