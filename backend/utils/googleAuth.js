import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

/**
 * Checks a Google ID token (from a "Sign in with Google" button) the way
 * Google documents: signed by one of Google's current keys, issued by Google, meant for one of
 * NutriFlow's client IDs (GOOGLE_CLIENT_IDS, comma-separated), and not expired.
 */

const CERTS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const ISSUERS = ['accounts.google.com', 'https://accounts.google.com'];

// Quotes and spaces pasted into a hosting dashboard's value are ignored.
export const googleClientIds = () => String(process.env.GOOGLE_CLIENT_IDS || '')
  .split(',')
  .map((id) => id.trim().replace(/^["']|["']$/g, '').trim())
  .filter(Boolean);

let cached = { keys: new Map(), expires: 0 };

/** Google's signing keys by key id, kept as long as Google's cache header says. */
async function signingKeys(fetchImpl) {
  if (cached.expires > Date.now()) return cached.keys;
  const response = await fetchImpl(CERTS_URL);
  if (!response.ok) throw new Error(`Google keys answered ${response.status}`);
  const { keys = [] } = await response.json();
  const maxAge = Number(/max-age=(\d+)/.exec(response.headers.get('cache-control') || '')?.[1] || 3600);
  cached = {
    keys: new Map(keys.map((jwk) => [jwk.kid, crypto.createPublicKey({ key: jwk, format: 'jwk' })])),
    expires: Date.now() + maxAge * 1000,
  };
  return cached.keys;
}

/**
 * @param {string} idToken
 * @param {{ audience?: string[], keyFor?: (kid: string) => Promise<crypto.KeyObject|undefined> }} [options]
 *   Tests pass their own keys; everything else uses Google's.
 * @returns {Promise<{ sub: string, email: string, emailVerified: boolean, name: string }>}
 */
export async function verifyGoogleIdToken(idToken, { audience = googleClientIds(), keyFor, fetchImpl = fetch } = {}) {
  if (!audience.length) throw new Error('Google sign-in is not configured');
  const kid = jwt.decode(String(idToken || ''), { complete: true })?.header?.kid;
  if (!kid) throw new Error('Not a Google sign-in token');
  const key = keyFor ? await keyFor(kid) : (await signingKeys(fetchImpl)).get(kid);
  if (!key) throw new Error('Unknown Google key');

  const claims = jwt.verify(idToken, key, { algorithms: ['RS256'], audience, issuer: ISSUERS });
  if (!claims.sub || !claims.email) throw new Error('Google sign-in left out the account');
  return {
    sub: String(claims.sub),
    email: String(claims.email).toLowerCase(),
    emailVerified: claims.email_verified === true || claims.email_verified === 'true',
    name: String(claims.given_name || claims.name || '').trim(),
  };
}
