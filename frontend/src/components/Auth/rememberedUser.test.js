import { beforeEach, describe, expect, it, vi } from 'vitest';
import { firstNameOf, forgetRememberedUser, readRememberedUser, rememberUser, safeReturnPath } from './rememberedUser';

// Tests run in Node, so give them a minimal in-memory localStorage.
const store = new Map();
vi.stubGlobal('localStorage', {
  getItem: (key) => (store.has(key) ? store.get(key) : null),
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key),
  clear: () => store.clear(),
});

describe('remembered user', () => {
  beforeEach(() => store.clear());

  it('keeps a first name and email, and forgets them on request', () => {
    rememberUser({ username: 'alex perez', email: 'a@b.dev', _id: 'secret-id', token: 'x' });
    expect(readRememberedUser()).toEqual({ name: 'Alex', email: 'a@b.dev' });
    forgetRememberedUser();
    expect(readRememberedUser()).toBeNull();
  });

  it('derives a friendly first name', () => {
    expect(firstNameOf('jordan_lee')).toBe('Jordan');
    expect(firstNameOf('')).toBe('');
  });

  it('only returns to in-app paths', () => {
    expect(safeReturnPath('/library?tab=1')).toBe('/library?tab=1');
    expect(safeReturnPath('//evil.example')).toBeNull();
    expect(safeReturnPath('https://evil.example')).toBeNull();
    expect(safeReturnPath(undefined)).toBeNull();
  });
});
