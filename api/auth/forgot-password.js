import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../_models/User.js';
import connectDB from '../_lib/db.js';
import { handleCors } from '../_lib/middleware.js';

export default async function handler(req, res) {
  // Handle CORS
  handleCors(req, res, () => {});
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { email } = req.body;

    // Validate email
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: 'Please include a valid email' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Create email transporter
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'NutriFlow Password Reset',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <img src="https://your-vercel-app.vercel.app/images/nutriflowlogo.webp" 
               alt="NutriFlow" 
               style="max-width: 200px; margin-bottom: 20px;"
          />
          <h1 style="color: #319795;">Password Reset Request</h1>
          <p>You requested a password reset for your NutriFlow account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="https://your-vercel-app.vercel.app/reset-password/${resetToken}" 
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