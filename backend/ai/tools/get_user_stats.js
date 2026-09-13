/**
 * get_user_stats — AI layer tool.
 *
 * Gathers user context for the AI agents: recent workouts, recent diet entries,
 * and the user's display name. Uses existing Diet and Workout models.
 * Can be used by the orchestrator or agents when a userId is available
 * (e.g. from an authenticated request) to enrich context from the database.
 *
 * Returns: { recentWorkouts, recentDiets, userName, latestCheckIn }
 */

import Diet from '../../models/Diet.js';
import Workout from '../../models/Workout.js';
import User from '../../models/User.js';
import CheckIn from '../../models/CheckIn.js';

/** A check-in older than this no longer describes how the user feels today. */
const CHECK_IN_FRESH_MS = 20 * 60 * 60 * 1000;

/** Default limit for recent diet and workout entries. */
const DEFAULT_LIMIT = 30;

/**
 * Fetches recent diets and workouts for a user and their display name.
 * @param {string} userId - MongoDB User _id (required).
 * @returns {Promise<{ recentWorkouts: Array, recentDiets: Array, userName: string, latestCheckIn: Object|null }>}
 */
export async function get_user_stats(userId) {
  if (!userId) {
    return {
      recentWorkouts: [],
      recentDiets: [],
      userName: 'User',
      latestCheckIn: null,
    };
  }

  const [user, recentDiets, recentWorkouts, checkIn] = await Promise.all([
    User.findById(userId).select('username').lean(),
    Diet.find({ user: userId })
      .sort({ date: -1 })
      .limit(DEFAULT_LIMIT)
      .lean(),
    Workout.find({ user: userId })
      .sort({ date: -1 })
      .limit(DEFAULT_LIMIT)
      .lean(),
    CheckIn.findOne({ user: userId }).sort({ dayKey: -1 }).lean(),
  ]);
  const isFresh = checkIn && Date.now() - new Date(checkIn.updatedAt).getTime() < CHECK_IN_FRESH_MS;

  return {
    recentWorkouts: recentWorkouts || [],
    recentDiets: recentDiets || [],
    userName: user?.username || 'User',
    latestCheckIn: isFresh ? checkIn : null,
  };
}
