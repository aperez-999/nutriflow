import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  if (!process.env.JWT_SECRET) {
    res.status(500);
    throw new Error('Authentication is not configured');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(401);
      throw new Error('Not authorized');
    }

    req.user = user;
    return next();
  } catch (error) {
    console.warn('JWT verification failed:', error.message);
    if (res.statusCode >= 500) {
      throw error;
    }

    res.status(401);
    throw new Error('Not authorized');
  }
});
