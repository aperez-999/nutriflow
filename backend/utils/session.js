import jwt from 'jsonwebtoken';

/**
 * Sessions: a signed token that API clients send as a bearer header, and that the website keeps
 * in an httpOnly cookie page scripts can't read. Each token carries the
 * account's session version: changing the password, resetting it, or signing out everywhere
 * bumps the version, and every older token stops working.
 */

export const SESSION_LENGTH = '7d';
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;
export const COOKIE_NAME = 'nf_session';
/** Sent by the website on every request. A cookie-signed write without it is refused. */
export const CSRF_HEADER = 'x-requested-with';

/** At least 8 characters, for every way a password is set. */
export const PASSWORD_MIN = 8;
export const PASSWORD_RULE = `Password must be ${PASSWORD_MIN} or more characters`;

export function signSession(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error('Authentication is not configured');
  }
  return jwt.sign({ id: user._id, v: user.tokenVersion || 0 }, process.env.JWT_SECRET, { expiresIn: SESSION_LENGTH });
}

const isHttps = (req) => req.secure || req.headers['x-forwarded-proto'] === 'https';

/** Sets the website's session cookie: httpOnly, same-site only, and HTTPS-only when served over HTTPS. */
export function setSessionCookie(req, res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isHttps(req),
    sameSite: 'lax',
    path: '/api',
    maxAge: SESSION_MS,
  });
}

export function clearSessionCookie(req, res) {
  res.clearCookie(COOKIE_NAME, { httpOnly: true, secure: isHttps(req), sameSite: 'lax', path: '/api' });
}

/** Signs the session, sets the cookie, and returns the token for bearer clients. */
export function startSession(req, res, user) {
  const token = signSession(user);
  setSessionCookie(req, res, token);
  return token;
}

function cookieValue(header, name) {
  for (const part of String(header || '').split(';')) {
    const index = part.indexOf('=');
    if (index > 0 && part.slice(0, index).trim() === name) {
      try {
        return decodeURIComponent(part.slice(index + 1).trim());
      } catch {
        return null;
      }
    }
  }
  return null;
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * The request's session token: the bearer header first, else the cookie (the
 * website). A cookie only counts for a write when the website's header came with it, which
 * another site's form or script can't send.
 * @returns {{ token: string|null, refused?: string }}
 */
export function sessionToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    return { token: header.slice(7).trim() || null };
  }
  const cookie = cookieValue(req.headers.cookie, COOKIE_NAME);
  if (!cookie) return { token: null };
  if (!SAFE_METHODS.has(req.method) && !req.headers[CSRF_HEADER]) {
    return { token: null, refused: 'Missing request header' };
  }
  return { token: cookie };
}

/** Whether a decoded token is still current for this account. */
export const isCurrent = (decoded, user) => (decoded.v || 0) === (user.tokenVersion || 0);
