import crypto from 'node:crypto';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Diet from '../models/Diet.js';
import Workout from '../models/Workout.js';
import CheckIn from '../models/CheckIn.js';
import Plan from '../models/Plan.js';
import ChatMessage from '../models/ChatMessage.js';
import Conversation from '../models/Conversation.js';
import CoachNote from '../models/CoachNote.js';
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
      dailyCarbs: user.goals?.dailyCarbs ?? null,
      dailyFats: user.goals?.dailyFats ?? null,
      fuelFollowsVerdict: user.goals?.fuelFollowsVerdict ?? true,
      pushCarbBoost: user.goals?.pushCarbBoost ?? 20,
      recoveryCarbCut: user.goals?.recoveryCarbCut ?? 15,
    },
    body: {
      heightCm: user.body?.heightCm ?? null,
      weightKg: user.body?.weightKg ?? null,
      birthYear: user.body?.birthYear ?? null,
      sex: user.body?.sex ?? null,
    },
    // Clients fetch the photo itself from /api/auth/me/avatar, and refetch when this changes.
    avatarUpdatedAt: user.avatar?.updatedAt ? user.avatar.updatedAt.toISOString() : null,
    about: {
      goal: user.about?.goal ?? null,
      diet: user.about?.diet ?? [],
      injuries: user.about?.injuries ?? '',
      note: user.about?.note ?? '',
    },
  };
}

const SESSION_LENGTH = '7d';

// Names are unique, so two people called Alex need to tell themselves apart.
const NAME_TAKEN = 'That name is taken. Try adding an initial or a nickname.';

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
    // An email with an account keeps "User already exists", which clients turn into "log in instead".
    if (existingUser) {
      return res.status(400).json({ message: existingUser.email === email ? 'User already exists' : NAME_TAKEN });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ username, email, password: hashedPassword });
    // Signed up from a friend's link: remember whose, so they can see their friends joined.
    const invite = typeof req.body.invite === 'string' ? req.body.invite.trim().toUpperCase() : '';
    if (/^[A-Z2-9]{6,10}$/.test(invite)) {
      const inviter = await User.findOne({ inviteCode: invite }).select('_id').lean();
      if (inviter) newUser.referredBy = inviter._id;
    }

    await newUser.save();

    const token = signAuthToken(newUser._id);

    return res.status(201).json({ result: buildUserPayload(newUser), token });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: error.keyPattern?.username ? NAME_TAKEN : 'User already exists' });
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

// @desc    The signed-in account, so a client can pick up changes made elsewhere
// @route   GET /api/auth/me
export const getMe = async (req, res) => res.json({ user: buildUserPayload(req.user) });

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

    // The three core goals are always sent; the others change only when given, so a client
    // that doesn't know about them (the website's goals form) leaves them as they were.
    user.goals.dailyCalories = Number(req.body.dailyCalories);
    user.goals.dailyProtein = Number(req.body.dailyProtein);
    user.goals.weeklyWorkouts = Number(req.body.weeklyWorkouts);
    for (const field of ['dailyCarbs', 'dailyFats']) {
      if (req.body[field] === null) user.goals[field] = undefined;
      else if (req.body[field] !== undefined) user.goals[field] = Number(req.body[field]);
    }
    if (typeof req.body.fuelFollowsVerdict === 'boolean') {
      user.goals.fuelFollowsVerdict = req.body.fuelFollowsVerdict;
    }
    for (const field of ['pushCarbBoost', 'recoveryCarbCut']) {
      if (req.body[field] !== undefined) user.goals[field] = Number(req.body[field]);
    }
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

/** PUT /api/auth/me/about: what the person is training for, how they eat, and anything else the coach should know. */
export const updateAbout = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0]?.msg || 'Invalid details' });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { goal, diet, injuries, note } = req.body;
    user.about = {
      goal: goal || undefined,
      diet: [...new Set(diet || [])],
      injuries: String(injuries || '').trim() || undefined,
      note: String(note || '').trim() || undefined,
    };
    await user.save();
    return res.json({ user: buildUserPayload(user) });
  } catch (error) {
    console.error('Update about error:', error);
    return res.status(500).json({ message: 'Unable to save that right now' });
  }
};

/** PUT /api/auth/me/body: height, weight, birth year and sex, each optional (null clears it). */
export const updateBody = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0]?.msg || 'Invalid details' });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { heightCm, weightKg, birthYear, sex } = req.body;
    const number = (value) => (value === null || value === undefined || value === '' ? undefined : Number(value));
    user.body = { heightCm: number(heightCm), weightKg: number(weightKg), birthYear: number(birthYear), sex: sex || undefined };
    await user.save();
    return res.json({ user: buildUserPayload(user) });
  } catch (error) {
    console.error('Update body error:', error);
    return res.status(500).json({ message: 'Unable to save that right now' });
  }
};

const AVATAR_MAX_BYTES = 200 * 1024;

/** What an image's first bytes say it is: only JPEG and PNG are kept. */
export function imageType(bytes) {
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes.length > 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  return null;
}

/** PUT /api/auth/me/avatar { image: base64 }: a small square photo, JPEG or PNG, up to 200 KB. */
export const updateAvatar = async (req, res) => {
  try {
    const encoded = typeof req.body?.image === 'string' ? req.body.image.replace(/^data:image\/\w+;base64,/, '') : '';
    const bytes = Buffer.from(encoded, 'base64');
    const contentType = imageType(bytes);
    if (!contentType) {
      return res.status(400).json({ message: 'Use a JPEG or PNG photo.' });
    }
    if (bytes.length > AVATAR_MAX_BYTES) {
      return res.status(400).json({ message: 'That photo is too large. Try a smaller one.' });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.avatar = { data: bytes, contentType, updatedAt: new Date() };
    await user.save();
    return res.json({ user: buildUserPayload(user) });
  } catch (error) {
    console.error('Update avatar error:', error);
    return res.status(500).json({ message: 'Unable to save your photo right now' });
  }
};

/** GET /api/auth/me/avatar: the photo's bytes, or 404 without one. */
export const getAvatar = async (req, res) => {
  const user = await User.findById(req.user._id).select('+avatar.data avatar.contentType').lean();
  if (!user?.avatar?.data) {
    return res.status(404).json({ message: 'No photo' });
  }
  res.set('Content-Type', user.avatar.contentType);
  res.set('Cache-Control', 'private, max-age=86400');
  return res.send(Buffer.from(user.avatar.data.buffer ?? user.avatar.data));
};

/** DELETE /api/auth/me/avatar */
export const deleteAvatar = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  user.avatar = undefined;
  await user.save();
  return res.json({ user: buildUserPayload(user) });
};

// Letters and digits that can't be mistaken for each other when read aloud or retyped.
const INVITE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function newInviteCode() {
  const bytes = crypto.randomBytes(8);
  return Array.from(bytes, (byte) => INVITE_ALPHABET[byte % INVITE_ALPHABET.length]).join('');
}

/** GET /api/auth/me/invites: the person's invite code (made the first time) and how many joined with it. */
export const getInvites = async (req, res) => {
  try {
    let code = req.user.inviteCode;
    for (let attempt = 0; !code && attempt < 3; attempt += 1) {
      const candidate = newInviteCode();
      const saved = await User.updateOne({ _id: req.user._id, inviteCode: { $exists: false } }, { $set: { inviteCode: candidate } })
        .catch((error) => (error?.code === 11000 ? null : Promise.reject(error)));
      if (saved?.modifiedCount) code = candidate;
      else code = (await User.findById(req.user._id).select('inviteCode').lean())?.inviteCode;
    }
    const joined = await User.countDocuments({ referredBy: req.user._id });
    return res.json({ code, joined });
  } catch (error) {
    console.error('Invites error:', error);
    return res.status(500).json({ message: 'Unable to load your invite right now' });
  }
};

/** GET /api/auth/me/notes: what the coach has saved about the person, newest first. */
export const getCoachNotes = async (req, res) => {
  const notes = await CoachNote.find({ user: req.user._id }).sort({ createdAt: -1 }).select('text createdAt').lean();
  return res.json(notes);
};

/** DELETE /api/auth/me/notes/:id: the person removes something the coach saved. */
export const deleteCoachNote = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'That note is already gone' });
  }
  const { deletedCount } = await CoachNote.deleteOne({ _id: req.params.id, user: req.user._id });
  if (!deletedCount) {
    return res.status(404).json({ message: 'That note is already gone' });
  }
  return res.json({ message: 'Your coach forgot it' });
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
  coachNotes: CoachNote,
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
      account: { ...buildUserPayload(req.user), inviteCode: req.user.inviteCode ?? null, createdAt: req.user._id.getTimestamp().toISOString() },
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
