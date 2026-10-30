import express from 'express';
import { check } from 'express-validator';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  updateGoals,
  forgotPassword,
  resetPassword,
  exportAccount,
  deleteAccount,
  updateAbout,
  updateMeals,
  updateBody,
  updateAvatar,
  getAvatar,
  deleteAvatar,
  getInvites,
  getCoachNotes,
  deleteCoachNote,
} from '../controllers/authController.js';
import { ABOUT_DIETS, ABOUT_GOALS } from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import { forgotPasswordLimiter, logInLimiter, photoLimiter, signUpLimiter } from '../middleware/rateLimits.js';

const router = express.Router();

router.post(
  '/register',
  signUpLimiter,
  [
    check('username', 'Username is required').trim().not().isEmpty(),
    check('email', 'Please include a valid email').trim().isEmail().normalizeEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
  ],
  register
);

router.post(
  '/login',
  logInLimiter,
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

router.get('/me', protect, getMe);
router.put(
  '/me/about',
  protect,
  [
    check('goal', 'Pick one of the listed goals').optional({ values: 'falsy' }).isIn(ABOUT_GOALS),
    check('diet', 'Diet must be a list').optional({ values: 'null' }).isArray({ max: ABOUT_DIETS.length }),
    check('diet.*', 'Pick from the listed diets').isIn(ABOUT_DIETS),
    check('injuries', 'Keep injuries under 200 characters').optional({ values: 'null' }).isString().isLength({ max: 200 }),
    check('note', 'Keep the note under 300 characters').optional({ values: 'null' }).isString().isLength({ max: 300 }),
  ],
  updateAbout
);
router.put(
  '/me/body',
  protect,
  [
    check('heightCm', 'Height must be between 100 and 250 cm').optional({ values: 'null' }).isFloat({ min: 100, max: 250 }),
    check('weightKg', 'Weight must be between 30 and 300 kg').optional({ values: 'null' }).isFloat({ min: 30, max: 300 }),
    check('birthYear', 'Birth year must be between 1920 and 2015').optional({ values: 'null' }).isInt({ min: 1920, max: 2015 }),
    check('sex', 'Sex must be female or male').optional({ values: 'null' }).isIn(['female', 'male']),
    check('goalKg', 'Goal weight must be between 25 and 350 kg').optional({ values: 'null' }).isFloat({ min: 25, max: 350 }),
  ],
  updateBody
);
router.get('/me/avatar', protect, getAvatar);
router.put('/me/avatar', protect, photoLimiter, updateAvatar);
router.delete('/me/avatar', protect, deleteAvatar);
router.get('/me/invites', protect, getInvites);
router.put('/me/meals', protect, updateMeals);
router.get('/me/notes', protect, getCoachNotes);
router.delete('/me/notes/:id', protect, deleteCoachNote);
router.get('/me/export', protect, exportAccount);
router.delete('/me', protect, deleteAccount);

router.put(
  '/me/goals',
  protect,
  [
    check('dailyCalories', 'Daily calories must be between 800 and 6000').isInt({ min: 800, max: 6000 }),
    check('dailyProtein', 'Daily protein must be between 20 and 400 grams').isInt({ min: 20, max: 400 }),
    check('weeklyWorkouts', 'Weekly workouts must be between 0 and 14').isInt({ min: 0, max: 14 }),
    check('dailyCarbs', 'Daily carbs must be between 0 and 1000 grams').optional({ values: 'null' }).isInt({ min: 0, max: 1000 }),
    check('dailyFats', 'Daily fat must be between 0 and 400 grams').optional({ values: 'null' }).isInt({ min: 0, max: 400 }),
    check('fuelFollowsVerdict', 'fuelFollowsVerdict must be true or false').optional().isBoolean({ strict: true }),
    check('pushCarbBoost', 'The push-day carb boost must be between 0 and 50 percent').optional().isInt({ min: 0, max: 50 }),
    check('recoveryCarbCut', 'The recovery-day carb cut must be between 0 and 40 percent').optional().isInt({ min: 0, max: 40 }),
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
