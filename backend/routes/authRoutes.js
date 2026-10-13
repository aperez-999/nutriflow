import express from 'express';
import { check } from 'express-validator';
import {
  register,
  login,
  updateProfile,
  changePassword,
  updateGoals,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { forgotPasswordLimiter } from '../middleware/rateLimits.js';

const router = express.Router();

router.post(
  '/register',
  [
    check('username', 'Username is required').trim().not().isEmpty(),
    check('email', 'Please include a valid email').trim().isEmail().normalizeEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
  ],
  register
);

router.post(
  '/login',
  [
    check('email', 'Please include a valid email').trim().isEmail().normalizeEmail(),
    check('password', 'Password is required').exists(),
  ],
  login
);

router.put(
  '/me',
  protect,
  [
    check('username', 'Username is required').trim().not().isEmpty(),
    check('email', 'Please include a valid email').trim().isEmail().normalizeEmail(),
  ],
  updateProfile
);

router.put(
  '/me/password',
  protect,
  [
    check('currentPassword', 'Current password is required').exists(),
    check('newPassword', 'New password must be 6 or more characters').isLength({ min: 6 }),
  ],
  changePassword
);

router.put(
  '/me/goals',
  protect,
  [
    check('dailyCalories', 'Daily calories must be between 800 and 6000').isInt({ min: 800, max: 6000 }),
    check('dailyProtein', 'Daily protein must be between 20 and 400 grams').isInt({ min: 20, max: 400 }),
    check('weeklyWorkouts', 'Weekly workouts must be between 0 and 14').isInt({ min: 0, max: 14 }),
  ],
  updateGoals
);

router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  [check('email', 'Please include a valid email').trim().isEmail().normalizeEmail()],
  forgotPassword
);

// PUT is what the frontend sends; POST is kept for links from older emails and clients.
const resetPasswordChain = [check('password', 'Password must be 6 or more characters').isLength({ min: 6 }), resetPassword];
router.post('/reset-password/:token', resetPasswordChain);
router.put('/reset-password/:token', resetPasswordChain);

export default router;
