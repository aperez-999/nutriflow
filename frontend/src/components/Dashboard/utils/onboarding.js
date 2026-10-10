// Whether the user has hidden the Today getting-started guide (remembered per account).
const key = (userId) => `nutriflow.onboarding.dismissed.${userId}`;

export const isGuideHidden = (userId) => {
  try {
    return window.localStorage.getItem(key(userId)) === '1';
  } catch {
    return false;
  }
};

export const setGuideHidden = (userId, hidden) => {
  try {
    if (hidden) window.localStorage.setItem(key(userId), '1');
    else window.localStorage.removeItem(key(userId));
  } catch {
    // Storage can be unavailable (private mode); the choice then lasts for this visit.
  }
};
