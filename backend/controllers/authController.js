import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

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

function signAuthToken(userId, expiresIn = '1d') {
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

    const token = signAuthToken(newUser._id, '1h');

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

    const token = signAuthToken(user._id, '1d');

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
      return res.status(401).json({ message: 'Current password is incorrect' });
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
