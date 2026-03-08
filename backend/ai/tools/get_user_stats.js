/**
 * get_user_stats — AI layer tool.
 *
 * Gathers user context for the AI agents: recent workouts, recent diet entries,
 * and the user's display name. Uses existing Diet and Workout models.
 * Can be used by the orchestrator or agents when a userId is available
 * (e.g. from an authenticated request) to enrich context from the database.
 *
 * Returns: { recentWorkouts, recentDiets, userName }
 */

import Diet from '../../models/Diet.js';
import Workout from '../../models/Workout.js';
import User from '../../models/User.js';

/** Default limit for recent diet and workout entries. */
const DEFAULT_LIMIT = 10;

/**
 * Fetches recent diets and workouts for a user and their display name.
 * @param {string} userId - MongoDB User _id (required).
 * @returns {Promise<{ recentWorkouts: Array, recentDiets: Array, userName: string }>}
 */
export async function get_user_stats(userId) {
  if (!userId) {
    return {
      recentWorkouts: [],
      recentDiets: [],
      userName: 'User',
    };
  }

  const [user, recentDiets, recentWorkouts] = await Promise.all([
    User.findById(userId).select('username').lean(),
    Diet.find({ user: userId })
      .sort({ date: -1 })
      .limit(DEFAULT_LIMIT)
      .lean(),
    Workout.find({ user: userId })
      .sort({ date: -1 })
      .limit(DEFAULT_LIMIT)
      .lean(),
  ]);

  return {
    recentWorkouts: recentWorkouts || [],
    recentDiets: recentDiets || [],
    userName: user?.username || 'User',
  };
}
