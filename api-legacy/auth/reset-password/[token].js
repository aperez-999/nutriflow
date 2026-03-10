import bcrypt from 'bcryptjs';
import User from '../../_models/User.js';
import connectDB from '../../_lib/db.js';
import { handleCors } from '../../_lib/middleware.js';

export default async function handler(req, res) {
  // Handle CORS
  handleCors(req, res, () => {});
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Temp diagnostics for Vercel logs
  try {
    const pathOnly = (req.url || '').split('?')[0];
    const pathToken = pathOnly.split('/').filter(Boolean).pop();
    console.log('[Auth] reset-password hit', {
      method: req.method,
      url: req.url,
      hasBody: !!req.body,
      bodyKeys: req.body ? Object.keys(req.body) : [],
      query: req.query,
      pathTokenSample: pathToken ? pathToken.slice(0, 8) + '...' : null,
    });
  } catch (e) {
    console.log('[Auth] reset-password log error', e?.message);
  }
  
  const method = String(req.method || '').toUpperCase();
  if (!['POST', 'PUT', 'PATCH'].includes(method)) {
    return res.status(405).json({ message: `Method ${method} not allowed` });
  }

  try {
    await connectDB();

    const { password } = req.body || {};
    let { token } = req.query || {};
    if (!token) {
      try {
        const path = (req.url || '').split('?')[0];
        token = decodeURIComponent(path.split('/').filter(Boolean).pop() || '');
      } catch (_) {
        token = undefined;
      }
    }

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