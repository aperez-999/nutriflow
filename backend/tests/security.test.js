import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { isCurrent, sessionToken } from '../utils/session.js';
import { verifyGoogleIdToken } from '../utils/googleAuth.js';

const request = (method, headers) => ({ method, headers });

describe('session tokens', () => {
  it('come from the bearer header first, then the cookie', () => {
    assert.deepEqual(sessionToken(request('GET', { authorization: 'Bearer abc' })), { token: 'abc' });
    assert.deepEqual(sessionToken(request('GET', { cookie: 'theme=dark; nf_session=xyz' })), { token: 'xyz' });
    assert.deepEqual(sessionToken(request('GET', {})), { token: null });
  });

  it('refuse a cookie-signed write without the website header', () => {
    assert.equal(sessionToken(request('POST', { cookie: 'nf_session=xyz' })).refused, 'Missing request header');
    assert.deepEqual(sessionToken(request('DELETE', { cookie: 'nf_session=xyz', 'x-requested-with': 'NutriFlow' })), { token: 'xyz' });
    // A bearer token needs no such header.
    assert.deepEqual(sessionToken(request('POST', { authorization: 'Bearer abc' })), { token: 'abc' });
  });

  it('stop working once the account moves to a new session version', () => {
    assert.equal(isCurrent({ id: 'u' }, { tokenVersion: 0 }), true);
    assert.equal(isCurrent({ id: 'u', v: 1 }, { tokenVersion: 1 }), true);
    assert.equal(isCurrent({ id: 'u', v: 1 }, { tokenVersion: 2 }), false);
  });
});

describe('Google sign-in tokens', () => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const keyFor = async (kid) => (kid === 'k1' ? publicKey : undefined);
  const audience = ['web-client.apps.googleusercontent.com'];
  const sign = (claims, options = {}) => jwt.sign(
    { sub: '1234', email: 'Sam@Example.com', email_verified: true, given_name: 'Sam', ...claims },
    privateKey,
    { algorithm: 'RS256', keyid: 'k1', issuer: 'https://accounts.google.com', audience: audience[0], expiresIn: '5m', ...options },
  );

  it('are read when Google signed them for NutriFlow', async () => {
    const profile = await verifyGoogleIdToken(sign({}), { audience, keyFor });
    assert.deepEqual(profile, { sub: '1234', email: 'sam@example.com', emailVerified: true, name: 'Sam' });
  });

  it('are refused for another app, another issuer, an unknown key, or once expired', async () => {
    await assert.rejects(verifyGoogleIdToken(sign({}, { audience: 'someone-else' }), { audience, keyFor }));
    await assert.rejects(verifyGoogleIdToken(sign({}, { issuer: 'https://evil.example' }), { audience, keyFor }));
    await assert.rejects(verifyGoogleIdToken(sign({}, { keyid: 'k2' }), { audience, keyFor }));
    await assert.rejects(verifyGoogleIdToken(sign({}, { expiresIn: -10 }), { audience, keyFor }));
    const forged = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey;
    const token = jwt.sign({ sub: '1', email: 'a@b.c' }, forged, { algorithm: 'RS256', keyid: 'k1', issuer: 'accounts.google.com', audience: audience[0] });
    await assert.rejects(verifyGoogleIdToken(token, { audience, keyFor }));
  });

  it('read client IDs pasted with quotes or spaces', async () => {
    const { googleClientIds } = await import('../utils/googleAuth.js');
    const saved = process.env.GOOGLE_CLIENT_IDS;
    process.env.GOOGLE_CLIENT_IDS = '"a.apps.googleusercontent.com, b.apps.googleusercontent.com"';
    assert.deepEqual(googleClientIds(), ['a.apps.googleusercontent.com', 'b.apps.googleusercontent.com']);
    process.env.GOOGLE_CLIENT_IDS = saved;
  });

  it('say so when the server has no client IDs', async () => {
    await assert.rejects(verifyGoogleIdToken(sign({}), { audience: [], keyFor }), /not configured/);
  });
});

describe('usernames for Google accounts', async () => {
  const { freeUsername } = await import('../controllers/authController.js');
  it('take the Google name, numbered when taken', async () => {
    const taken = new Set(['Sam', 'Sam2']);
    assert.equal(await freeUsername('Sam', async (name) => taken.has(name)), 'Sam3');
    assert.equal(await freeUsername('Zoë <b>', async () => false), 'Zoë b');
    assert.equal(await freeUsername('', async () => false), 'NutriFlow');
  });
});
