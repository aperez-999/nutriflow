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
import WeighIn from '../models/WeighIn.js';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { escapeHtml, isMailConfigured, sendMail } from '../utils/mailer.js';
import { PASSWORD_MIN, PASSWORD_RULE, clearSessionCookie, startSession } from '../utils/session.js';
import { verifyGoogleIdToken } from '../utils/googleAuth.js';

const DEFAULT_MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

function buildUserPayload(user) {
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    emailVerified: Boolean(user.emailVerified),
    // Whether the account has a password (Google accounts start without one) and Google linked.
    hasPassword: Boolean(user.password),
    google: Boolean(user.googleId),
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
      goalKg: user.body?.goalKg ?? null,
    },
    // Clients fetch the photo itself from /api/auth/me/avatar, and refetch when this changes.
    avatarUpdatedAt: user.avatar?.updatedAt ? user.avatar.updatedAt.toISOString() : null,
    meals: user.meals?.length ? user.meals : DEFAULT_MEALS,
    about: {
      goal: user.about?.goal ?? null,
      diet: user.about?.diet ?? [],
      injuries: user.about?.injuries ?? '',
      note: user.about?.note ?? '',
    },
  };
}

// Names are unique, so two people called Alex need to tell themselves apart.
const NAME_TAKEN = 'That name is taken. Try adding an initial or a nickname.';

const frontendUrl = () => (process.env.FRONTEND_URL || '').replace(/\/$/, '');
const VERIFY_TOKEN_TTL_MS = 3 * 24 * 60 * 60 * 1000;
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

/**
 * Emails a link that confirms the address. Best effort: an account works without it, so a
 * mail failure is logged, not shown. Saves the user (with the new token) either way.
 */
async function sendVerificationEmail(user) {
  if (!isMailConfigured() || !frontendUrl()) {
    await user.save();
    return false;
  }
  const token = crypto.randomBytes(32).toString('hex');
  user.verifyEmailToken = hashToken(token);
  user.verifyEmailExpires = Date.now() + VERIFY_TOKEN_TTL_MS;
  await user.save();
  try {
    await sendMail({
      to: user.email,
      subject: 'Confirm your NutriFlow email',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: sans-serif; color: #0A0A0A;">
          <h1 style="font-size: 24px;">Confirm your email, ${escapeHtml(user.username)}</h1>
          <p>One tap confirms this is your address, so you can always get back into your account.</p>
          <p>
            <a href="${frontendUrl()}/verify-email/${token}"
               style="display: inline-block; background-color: #0A0A0A; color: #FFFFFF; padding: 10px 20px;
                      text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Confirm my email
            </a>
          </p>
          <p style="color: #525252;">This link expires in 3 days. If you didn't make a NutriFlow account, you can ignore this email.</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Verification email error:', error.message);
    return false;
  }
}

/**
 * A short security notice ("your password was changed"), so someone who didn't do it finds out.
 * Best effort, and only for accounts that keep account emails on.
 */
async function sendAccountNotice(user, subject, sentence) {
  if (!isMailConfigured() || user.preferences?.notificationsEnabled === false) return;
  try {
    await sendMail({
      to: user.email,
      subject,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: sans-serif; color: #0A0A0A;">
          <h1 style="font-size: 24px;">${escapeHtml(subject)}</h1>
          <p>Hi ${escapeHtml(user.username)}, ${escapeHtml(sentence)}</p>
          <p style="color: #525252;">If this was you, there's nothing to do. If it wasn't, reset your password now${
            frontendUrl() ? ` at <a href="${frontendUrl()}/forgot-password">${frontendUrl()}/forgot-password</a>` : ''
          }; that signs out everyone else.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Account notice error:', error.message);
  }
}

/** Signed up from a friend's link: whose it was, so they can see their friends joined. */
async function inviterFrom(value) {
  const invite = typeof value === 'string' ? value.trim().toUpperCase() : '';
  if (!/^[A-Z2-9]{6,10}$/.test(invite)) return undefined;
  const inviter = await User.findOne({ inviteCode: invite }).select('_id').lean();
  return inviter?._id;
}

/** A free name to suggest from a Google name: "Alex", else "Alex2", "Alex3"... */
export async function freeUsername(name, isTaken = async (candidate) => Boolean(await User.exists({ username: candidate }))) {
  const base = String(name || '').replace(/[^\p{L}\p{N} ._-]/gu, '').trim().slice(0, 24) || 'NutriFlow';
  for (let n = 1; n < 50; n += 1) {
    const candidate = n === 1 ? base : `${base}${n}`;
    if (!(await isTaken(candidate))) return candidate;
  }
  return `${base}${crypto.randomInt(1000, 9999)}`;
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
    newUser.referredBy = await inviterFrom(req.body.invite);

    await sendVerificationEmail(newUser);

    const token = startSession(req, res, newUser);

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

    if (!user.password) {
      return res.status(401).json({ message: 'This account signs in with Google. Use Continue with Google.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = startSession(req, res, user);

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
export const getMe = async (req, res) => {
  // Read again with the password field, so hasPassword is right.
  const user = await User.findById(req.user._id);
  return res.json({ user: buildUserPayload(user || req.user) });
};

/**
 * POST /api/auth/google { credential }: signs in with a Google ID token. A known Google account
 * signs in; an email that already has an account is linked to Google (only when Google has
 * verified the email); otherwise a new account is made, with no password.
 */
const GOOGLE_SIGNUP_PURPOSE = 'google-signup';

/** Checks a Google ID token, or answers why it can't be used. */
async function googleProfile(req, res) {
  try {
    return await verifyGoogleIdToken(req.body?.credential);
  } catch (error) {
    const notSetUp = error.message === 'Google sign-in is not configured';
    // A token for a client ID the server doesn't list: GOOGLE_CLIENT_IDS doesn't match the
    // site's VITE_GOOGLE_CLIENT_ID. Said plainly, since retrying can't fix it.
    const otherClient = /audience/i.test(error.message);
    if (!notSetUp) console.warn('Google sign-in refused:', error.message);
    res.status(notSetUp || otherClient ? 503 : 401).json({
      message: notSetUp
        ? 'Google sign-in is not set up on this server.'
        : otherClient
          ? 'Google sign-in is set up for a different client ID on this server. Check GOOGLE_CLIENT_IDS.'
          : 'Google sign-in didn’t go through. Try again.',
    });
    return null;
  }
}

/**
 * POST /api/auth/google { credential }: signs in with a Google ID token. A known Google account
 * signs in, and an account with the same email is linked to Google (only when Google has
 * verified the email). A Google account NutriFlow doesn't know isn't made here: the answer is
 * { needsSignUp, signUp: { token, email, name } }, and the person finishes signing up with
 * POST /api/auth/google/register, choosing their name first.
 */
export const googleSignIn = async (req, res) => {
  const profile = await googleProfile(req, res);
  if (!profile) return undefined;

  try {
    let user = await User.findOne({ googleId: profile.sub });
    if (!user) {
      if (!profile.emailVerified) {
        return res.status(401).json({ message: 'Google hasn’t confirmed this email yet, so it can’t be used to sign in.' });
      }
      user = await User.findOne({ email: profile.email });
      if (!user) {
        const token = jwt.sign(
          { purpose: GOOGLE_SIGNUP_PURPOSE, sub: profile.sub, email: profile.email },
          process.env.JWT_SECRET,
          { expiresIn: '15m' },
        );
        // A free name to start from: their Google first name, numbered if it's taken.
        const name = await freeUsername(profile.name || profile.email.split('@')[0]);
        return res.json({ needsSignUp: true, signUp: { token, email: profile.email, name } });
      }
      user.googleId = profile.sub;
      user.emailVerified = true;
      await user.save();
      await sendAccountNotice(user, 'Google sign-in was added to your NutriFlow account',
        'Google sign-in was just linked to your account, so it can now be opened with Google.');
    }

    const token = startSession(req, res, user);
    return res.json({ user: buildUserPayload(user), token });
  } catch (error) {
    console.error('Google sign-in error:', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

/**
 * POST /api/auth/google/register { signUpToken, username, invite? }: makes the account a Google
 * sign-in asked for, with the name the person chose. The token (15 minutes) carries the Google
 * account, so Google isn't asked twice.
 */
export const googleRegister = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0]?.msg || 'Invalid sign-up input' });
  }

  let google;
  try {
    google = jwt.verify(String(req.body.signUpToken || ''), process.env.JWT_SECRET);
    if (google.purpose !== GOOGLE_SIGNUP_PURPOSE) throw new Error('wrong purpose');
  } catch {
    return res.status(401).json({ message: 'That took too long. Continue with Google again.' });
  }

  try {
    const username = String(req.body.username || '').trim();
    const existing = await User.findOne({ $or: [{ googleId: google.sub }, { email: google.email }, { username }] });
    if (existing) {
      if (existing.username === username && existing.email !== google.email && existing.googleId !== google.sub) {
        return res.status(400).json({ message: NAME_TAKEN });
      }
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      username,
      email: google.email,
      googleId: google.sub,
      emailVerified: true,
      referredBy: await inviterFrom(req.body.invite),
    });
    await user.save();

    const token = startSession(req, res, user);
    return res.status(201).json({ result: buildUserPayload(user), token });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: error.keyPattern?.username ? NAME_TAKEN : 'User already exists' });
    }
    console.error('Google register error:', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

/** POST /api/auth/logout: ends the session cookie. Bearer-token clients just forget their token. */
export const logout = (req, res) => {
  clearSessionCookie(req, res);
  return res.json({ message: 'Signed out' });
};

/**
 * POST /api/auth/me/sessions/revoke: signs out every other device and browser. This one stays
 * signed in with the new token in the answer.
 */
export const signOutEverywhere = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();
    const token = startSession(req, res, user);
    return res.json({ message: 'Signed out everywhere else', token });
  } catch (error) {
    console.error('Sign out everywhere error:', error);
    return res.status(500).json({ message: 'Unable to sign out other devices right now' });
  }
};

/** POST /api/auth/verify-email/:token: confirms the account's email from the emailed link. */
export const verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({
      verifyEmailToken: hashToken(String(req.params.token || '')),
      verifyEmailExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: 'This link has expired or was already used. Send a new one from Settings.' });
    }
    user.emailVerified = true;
    user.verifyEmailToken = undefined;
    user.verifyEmailExpires = undefined;
    await user.save();
    return res.json({ message: 'Email confirmed', email: user.email });
  } catch (error) {
    console.error('Verify email error:', error);
    return res.status(500).json({ message: 'Unable to confirm your email right now' });
  }
};

/** POST /api/auth/me/verify-email: sends the confirmation link again. */
export const resendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.emailVerified) {
      return res.json({ message: 'Your email is already confirmed.' });
    }
    if (!isMailConfigured() || !frontendUrl()) {
      return res.status(503).json({ message: 'Email isn’t set up on this server yet.' });
    }
    const sent = await sendVerificationEmail(user);
    if (!sent) {
      return res.status(502).json({ message: 'The email didn’t send. Try again in a minute.' });
    }
    return res.json({ message: `We sent a link to ${user.email}.` });
  } catch (error) {
    console.error('Resend verification error:', error);
    return res.status(500).json({ message: 'Unable to send the email right now' });
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

    const emailChanged = user.email !== nextEmail;
    user.username = nextUsername;
    user.email = nextEmail;
    user.preferences = {
      ...user.preferences,
      ...(typeof notificationsEnabled === 'boolean' ? { notificationsEnabled } : {}),
    };

    // A new address has to be confirmed again.
    if (emailChanged) {
      user.emailVerified = false;
      await sendVerificationEmail(user);
    } else {
      await user.save();
    }

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
    if (newPassword.length < PASSWORD_MIN) {
      return res.status(400).json({ message: `New p${PASSWORD_RULE.slice(1)}` });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // A Google account sets its first password without one; any other needs the current one.
    if (user.password && !(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    // Every other session ends; this one carries on with the new token.
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    await sendAccountNotice(user, 'Your NutriFlow password was changed',
      'the password on your account was just changed, and every other device was signed out.');

    const token = startSession(req, res, user);
    return res.status(200).json({ message: 'Password updated. Other devices were signed out.', token });
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
const hashResetToken = hashToken;

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

    if (!frontendUrl()) {
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
              <a href="${frontendUrl()}/reset-password/${resetToken}"
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
    // The link came to this inbox, so the email is confirmed; every session ends.
    user.emailVerified = true;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();
    await sendAccountNotice(user, 'Your NutriFlow password was reset',
      'the password on your account was just reset from an emailed link, and every device was signed out.');

    return res.json({ message: 'Password successfully reset' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Error resetting password' });
  }
};

/** PUT /api/auth/me/about: what the person is training for, how they eat, and anything else the coach should know. */
/**
 * PUT /api/auth/me/meals { meals: ["Breakfast", "Lunch", ...] }: the day's meals, in order, 1 to
 * 6 of them. A meal renamed in place takes its logged entries with it.
 */
export const updateMeals = async (req, res) => {
  try {
    const meals = (Array.isArray(req.body?.meals) ? req.body.meals : [])
      .map((name) => String(name || '').trim().replace(/\s+/g, ' '))
      .filter(Boolean);
    const unique = new Set(meals.map((name) => name.toLowerCase()));
    if (meals.length < 1 || meals.length > 6 || meals.some((name) => name.length > 30) || unique.size !== meals.length) {
      return res.status(400).json({ message: 'Use 1 to 6 meals, each with its own name of up to 30 characters.' });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const before = user.meals?.length ? [...user.meals] : DEFAULT_MEALS;
    for (let i = 0; i < Math.min(before.length, meals.length); i += 1) {
      if (before[i] !== meals[i] && !before.includes(meals[i])) {
        await Diet.updateMany({ user: user._id, mealType: before[i] }, { $set: { mealType: meals[i] } });
      }
    }
    user.meals = meals;
    await user.save();
    return res.json({ user: buildUserPayload(user) });
  } catch (error) {
    console.error('Update meals error:', error);
    return res.status(500).json({ message: 'Unable to save your meals right now' });
  }
};

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
    // A goal weight is sent on its own from the weight timeline; leaving it out keeps it.
    const goalKg = req.body.goalKg === undefined ? user.body?.goalKg : req.body.goalKg;
    const number = (value) => (value === null || value === undefined || value === '' ? undefined : Number(value));
    const keep = (field, value) => (value === undefined ? user.body?.[field] : number(value));
    user.body = {
      heightCm: keep('heightCm', heightCm),
      weightKg: keep('weightKg', weightKg),
      birthYear: keep('birthYear', birthYear),
      sex: sex === undefined ? user.body?.sex : sex || undefined,
      goalKg: number(goalKg),
    };
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
  weighIns: WeighIn,
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

    // Without a password (a Google account), typing the account's email confirms instead.
    const typed = String(req.body.password || '');
    const isMatch = user.password
      ? await bcrypt.compare(typed, user.password)
      : typed.trim().toLowerCase() === user.email;
    if (!isMatch) {
      return res.status(400).json({ message: user.password ? 'Password is incorrect' : 'Type your account’s email to confirm' });
    }

    await Promise.all(Object.values(OWNED_RECORDS).map((Model) => Model.deleteMany({ user: user._id })));
    await user.deleteOne();
    clearSessionCookie(req, res);

    return res.json({ message: 'Your account and all of its data were deleted' });
  } catch (error) {
    console.error('Delete account error:', error);
    return res.status(500).json({ message: 'Unable to delete your account right now' });
  }
};
