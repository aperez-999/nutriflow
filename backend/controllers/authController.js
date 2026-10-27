import crypto from 'node:crypto';
import User from '../models/User.js';
import Diet from '../models/Diet.js';
import Workout from '../models/Workout.js';
import CheckIn from '../models/CheckIn.js';
import Plan from '../models/Plan.js';
import ChatMessage from '../models/ChatMessage.js';
import Conversation from '../models/Conversation.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { isMailConfigured, sendMail } from '../utils/mailer.js';

const JWT_SECRET = process.env.JWT_SECRET;

function buildUserPayload(user) {
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    preferences: {
      notificationsEnabled: user.preferences?.notificationsEnabled ?? true,
    },
    goals: {
      dailyCalories: user.goals?.dailyCalories ?? 2000,
      dailyProtein: user.goals?.dailyProtein ?? 150,
      weeklyWorkouts: user.goals?.weeklyWorkouts ?? 5,
    },
  };
}

const SESSION_LENGTH = '7d';

function signAuthToken(userId, expiresIn = SESSION_LENGTH) {
  if (!JWT_SECRET) {
    throw new Error('Authentication is not configured');
  }

  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn });
}

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const username = String(req.body.username || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email and password are required' });
  }

  try {
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ username, email, password: hashedPassword });

    await newUser.save();

    const token = signAuthToken(newUser._id);

    return res.status(201).json({ result: buildUserPayload(newUser), token });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'User already exists' });
    }
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0]?.msg || 'Invalid login input' });
  }

  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signAuthToken(user._id);

    return res.status(200).json({
      user: buildUserPayload(user),
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0]?.msg || 'Invalid profile input' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const nextUsername = String(req.body.username || '').trim();
    const nextEmail = String(req.body.email || '').trim().toLowerCase();
    const notificationsEnabled = req.body?.preferences?.notificationsEnabled;

    if (!nextUsername || !nextEmail) {
      return res.status(400).json({ message: 'Username and email are required' });
    }

    const existingUsername = await User.findOne({
      username: nextUsername,
      _id: { $ne: user._id },
    });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username is already in use' });
    }

    const existingEmail = await User.findOne({
      email: nextEmail,
      _id: { $ne: user._id },
    });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    user.username = nextUsername;
    user.email = nextEmail;
    user.preferences = {
      ...user.preferences,
      ...(typeof notificationsEnabled === 'boolean' ? { notificationsEnabled } : {}),
    };

    await user.save();

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: buildUserPayload(user),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: 'Unable to update profile right now' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0]?.msg || 'Invalid password input' });
    }

    const currentPassword = String(req.body.currentPassword || '');
    const newPassword = String(req.body.newPassword || '');
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: 'New password must be 6 or more characters' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ message: 'Unable to update password right now' });
  }
};

export const updateGoals = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0]?.msg || 'Invalid goals input' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.goals = {
      dailyCalories: Number(req.body.dailyCalories),
      dailyProtein: Number(req.body.dailyProtein),
      weeklyWorkouts: Number(req.body.weeklyWorkouts),
    };
    await user.save();

    return res.status(200).json({ message: 'Goals updated', user: buildUserPayload(user) });
  } catch (error) {
    console.error('Update goals error:', error);
    return res.status(500).json({ message: 'Unable to update goals right now' });
  }
};

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

/**
 * POST /api/auth/forgot-password: emails a one-hour reset link. The answer is the
 * same whether or not the email has an account, so it cannot be used to probe accounts.
 */
export const forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0]?.msg || 'Invalid email input' });
    }

    const email = String(req.body.email || '').trim().toLowerCase();

    if (!isMailConfigured()) {
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

    const user = await User.findOne({ email });
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = hashResetToken(resetToken);
      user.resetPasswordExpires = Date.now() + RESET_TOKEN_TTL_MS;
      await user.save();

      await sendMail({
        to: email,
        subject: 'NutriFlow Password Reset',
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: sans-serif; color: #0A0A0A;">
            <h1 style="font-size: 24px;">Reset your NutriFlow password</h1>
            <p>You asked to reset the password for your NutriFlow account.</p>
            <p>
              <a href="${frontendUrl}/reset-password/${resetToken}"
                 style="display: inline-block; background-color: #0A0A0A; color: #FFFFFF; padding: 10px 20px;
                        text-decoration: none; border-radius: 6px; margin: 16px 0;">
                Choose a new password
              </a>
            </p>
            <p style="color: #525252;">This link expires in 1 hour. If you didn't ask for it, you can ignore this email.</p>
          </div>
        `,
      });
    }

    return res.json({ message: 'If an account exists for that email, a password reset link has been sent.' });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ message: 'Error sending reset email' });
  }
};

/** POST or PUT /api/auth/reset-password/:token: sets a new password with a valid, unexpired token. */
export const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0]?.msg || 'Invalid password input' });
    }

    const user = await User.findOne({
      resetPasswordToken: hashResetToken(String(req.params.token || '')),
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = await bcrypt.hash(String(req.body.password || ''), 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ message: 'Password successfully reset' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Error resetting password' });
  }
};

// Every collection that holds a user's records. Export and deletion both use this list,
// so a new collection is exported and deleted with the account by adding it here.
const OWNED_RECORDS = {
  meals: Diet,
  workouts: Workout,
  checkIns: CheckIn,
  plans: Plan,
  conversations: Conversation,
  chatMessages: ChatMessage,
};

/** GET /api/auth/me/export: everything stored for the account, as one JSON file. */
export const exportAccount = async (req, res) => {
  try {
    const records = {};
    for (const [name, Model] of Object.entries(OWNED_RECORDS)) {
      records[name] = await Model.find({ user: req.user._id }).select('-user -__v').lean();
    }
    res.setHeader('Content-Disposition', `attachment; filename="nutriflow-data-${new Date().toISOString().slice(0, 10)}.json"`);
    return res.json({
      exportedAt: new Date().toISOString(),
      account: { ...buildUserPayload(req.user), createdAt: req.user._id.getTimestamp().toISOString() },
      ...records,
    });
  } catch (error) {
    console.error('Export account error:', error);
    return res.status(500).json({ message: 'Unable to export your data right now' });
  }
};

/** DELETE /api/auth/me: deletes the account and every record it owns, after the password is confirmed. */
export const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(String(req.body.password || ''), user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password is incorrect' });
    }

    await Promise.all(Object.values(OWNED_RECORDS).map((Model) => Model.deleteMany({ user: user._id })));
    await user.deleteOne();

    return res.json({ message: 'Your account and all of its data were deleted' });
  } catch (error) {
    console.error('Delete account error:', error);
    return res.status(500).json({ message: 'Unable to delete your account right now' });
  }
};
