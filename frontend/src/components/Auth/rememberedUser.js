// The last account used on this device, so the login page can greet it by name and
// fill in the email. Only the display name and email are kept; it survives logout
// on purpose, and "Not you?" on the login page forgets it.
const KEY = 'nutriflow.lastUser';

export const firstNameOf = (username = '') => {
  const first = String(username).trim().split(/[\s._-]+/)[0] || '';
  return first ? first.charAt(0).toUpperCase() + first.slice(1) : '';
};

export function rememberUser(account) {
  if (!account?.email) return;
  try {
    localStorage.setItem(KEY, JSON.stringify({ name: firstNameOf(account.username), email: account.email }));
  } catch {
    // Storage can be unavailable (private mode); the login page then just stays generic.
  }
}

export function readRememberedUser() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || 'null');
    return stored?.email ? stored : null;
  } catch {
    return null;
  }
}

export function forgetRememberedUser() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to forget.
  }
}

/** Where a login should return to: only in-app paths, never another origin. */
export const safeReturnPath = (from) => (typeof from === 'string' && /^\/(?!\/)/.test(from) ? from : null);

/**
 * After an account is deleted: removes everything this browser kept for it (cached plans
 * and chats, onboarding flags; their keys end with the user id) and the login greeting.
 */
export function forgetAccountOnDevice(userId) {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith('nutriflow.') && userId && key.endsWith(`.${userId}`))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    // Storage unavailable: nothing was kept.
  }
  forgetRememberedUser();
}
