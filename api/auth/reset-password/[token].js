import bcrypt from 'bcrypt';
import User from '../../_models/User.js';
import connectDB from '../../_lib/db.js';
import { handleCors } from '../../_lib/middleware.js';

export default async function handler(req, res) {
  // Handle CORS
  handleCors(req, res, () => {});
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { password } = req.body;
    const { token } = req.query;

    // Validate input
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be 6 or more characters' });
    }

    if (!token) {
      return res.status(400).json({ message: 'Reset token is required' });
    }

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