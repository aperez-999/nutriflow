import express from 'express';
import { check, validationResult } from 'express-validator';
import { register, login, updateProfile, changePassword } from '../controllers/authController.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import { protect } from '../middleware/authMiddleware.js';

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

// New forgot password route
router.post('/forgot-password', 
  [
    check('email', 'Please include a valid email').trim().isEmail().normalizeEmail(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0]?.msg || 'Invalid email input' });
      }

      const email = String(req.body.email || '').trim().toLowerCase();

      if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
        return res.status(503).json({
          message: 'Password reset email is not configured. Set EMAIL_USERNAME and EMAIL_PASSWORD in the server environment.',
        });
      }

      const frontendUrl = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
      if (!frontendUrl) {
        return res.status(503).json({
          message: 'Password reset email is not configured. Set FRONTEND_URL in the server environment.',
        });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
      const user = await User.findOne({ email });

      if (user) {
        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpires = Date.now() + 3600000; // Token valid for 1 hour
        await user.save();
      }

      if (user) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
          },
        });

        await transporter.sendMail({
          from: process.env.EMAIL_USERNAME,
          to: email,
          subject: 'NutriFlow Password Reset',
          html: `
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <img src="${process.env.FRONTEND_URL}/public/images/nutriflowlogo.webp" 
                   alt="NutriFlow" 
                   style="max-width: 200px; margin-bottom: 20px;"
              />
              <h1 style="color: #319795;">Password Reset Request</h1>
              <p>You requested a password reset for your NutriFlow account.</p>
              <p>Click the link below to reset your password:</p>
              <a href="${frontendUrl}/reset-password/${resetToken}" 
                 style="display: inline-block; 
                        background-color: #319795; 
                        color: white; 
                        padding: 10px 20px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        margin: 20px 0;">
                Reset Password
              </a>
              <p style="color: #666;">This link will expire in 1 hour.</p>
              <p style="color: #666;">If you didn't request this, please ignore this email.</p>
            </div>
          `
        });
      }

      return res.json({ message: 'If an account exists for that email, a password reset link has been sent.' });
    } catch (error) {
      console.error('Password reset error:', error);
      return res.status(500).json({ message: 'Error sending reset email' });
    }
  }
);

// Reset password handler (shared for POST and PUT; frontend uses PUT)
const resetPasswordHandler = [
  check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0]?.msg || 'Invalid password input' });
      }

      const password = String(req.body.password || '');
      const token = String(req.params.token || '');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({
        resetPasswordToken: tokenHash,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      user.password = await bcrypt.hash(password, 12);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return res.json({ message: 'Password successfully reset' });
    } catch (error) {
      console.error('Reset password error:', error);
      return res.status(500).json({ message: 'Error resetting password' });
    }
  }
];

router.post('/reset-password/:token', resetPasswordHandler);
router.put('/reset-password/:token', resetPasswordHandler);

export default router;
