import express from 'express';
import { check } from 'express-validator';
import { register, login } from '../controllers/authController.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

const router = express.Router();

router.post(
  '/register',
  [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
  ],
  register
);

router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  login
);

// New forgot password route
router.post('/forgot-password', 
  [
    check('email', 'Please include a valid email').isEmail(),
  ],
  async (req, res) => {
    console.log('🚀 Forgot password route hit');
    try {
      const { email } = req.body;
      console.log('📧 Received reset request for email:', email);

      const user = await User.findOne({ email });
      if (!user) {
        console.log('User not found:', email);
        return res.status(404).json({ message: 'User not found' });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      console.log('Generated reset token');

      // Before sending email, log the configuration
      console.log('Email configuration:', {
        username: process.env.EMAIL_USERNAME,
        passwordLength: process.env.EMAIL_PASSWORD?.length,
        frontendUrl: process.env.FRONTEND_URL
      });

      // Create email transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      // Test the transporter connection
      transporter.verify(function(error, success) {
        if (error) {
          console.log('Transporter error:', error);
        } else {
          console.log('Server is ready to send emails');
        }
      });

      // Send email with more detailed error catching
      try {
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
              <a href="${process.env.FRONTEND_URL}/reset-password/${resetToken}" 
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
        console.log('Email sent successfully');
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        throw emailError;
      }

      // Save token to user
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // Token valid for 1 hour
      await user.save();

      res.json({ message: 'Password reset link sent to email' });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ message: 'Error sending reset email' });
    }
  }
);

// New reset password route
router.post('/reset-password/:token',
  [
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const { password } = req.body;
      const { token } = req.params;

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      // Update password
      user.password = await bcrypt.hash(password, 10);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.json({ message: 'Password successfully reset' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Error resetting password' });
    }
  }
);

export default router;