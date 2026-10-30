import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { isCurrent, sessionToken } from '../utils/session.js';

/** The signed-in account for a token, or null when the token is invalid, expired or revoked. */
async function accountFor(token) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('-password');
  return user && isCurrent(decoded, user) ? user : null;
}

/** Requires a session: a bearer token or the website's cookie (see utils/session.js). */
export const protect = asyncHandler(async (req, res, next) => {
  const { token, refused } = sessionToken(req);

  if (!token) {
    res.status(refused ? 403 : 401);
    throw new Error(refused || 'Not authorized, no token');
  }

  if (!process.env.JWT_SECRET) {
    res.status(500);
    throw new Error('Authentication is not configured');
  }

  let user = null;
  try {
    user = await accountFor(token);
  } catch (error) {
    console.warn('JWT verification failed:', error.message);
  }
  if (!user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  req.user = user;
  return next();
});

/**
 * Attaches req.user when a valid session is present, but never rejects.
 * For endpoints that work anonymously and personalize when signed in.
 */
export const identifyUser = asyncHandler(async (req, res, next) => {
  const { token } = sessionToken(req);

  if (token && process.env.JWT_SECRET) {
    try {
      req.user = (await accountFor(token)) || undefined;
    } catch (error) {
      console.warn('Optional JWT verification failed:', error.message);
    }
  }

  return next();
});
