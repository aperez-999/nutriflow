import { createContext } from 'react';

/** The signed-in user ({ user, token }) or null, with login, logout and updateUser. Provided by AuthProvider. */
export const AuthContext = createContext();
