import asyncHandler from 'express-async-handler';
import Exercise from '../models/Exercise.js';
import { DIFFICULTY, EQUIPMENT, EXERCISE_CATALOG, MUSCLE_GROUPS } from '../data/exerciseCatalog.js';

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Mongo filter from query params; unknown filter values are ignored rather than matching nothing. */
export const buildExerciseQuery = ({ muscleGroup, equipment, difficulty, q } = {}) => {
  const query = {};
  if (MUSCLE_GROUPS.includes(muscleGroup)) query.muscleGroup = muscleGroup;
  if (EQUIPMENT.includes(equipment)) query.equipment = equipment;
  if (DIFFICULTY.includes(difficulty)) query.difficulty = difficulty;
  const text = typeof q === 'string' ? q.trim().slice(0, 60) : '';
  if (text) query.name = { $regex: escapeRegex(text), $options: 'i' };
  return query;
};

let catalogSync = null;

/** Upserts the catalog once per process so the collection exists and matches the file. */
export const ensureExerciseCatalog = () => {
  if (!catalogSync) {
    catalogSync = Exercise.bulkWrite(
      EXERCISE_CATALOG.map((exercise) => ({
        updateOne: { filter: { slug: exercise.slug }, update: { $set: exercise }, upsert: true },
      }))
    ).catch((error) => {
      catalogSync = null; // retry on the next request
      throw error;
    });
  }
  return catalogSync;
};

// @desc    List library exercises with optional filters
// @route   GET /api/exercises?muscleGroup=&equipment=&difficulty=&q=
// @access  Private
export const getExercises = asyncHandler(async (req, res) => {
  await ensureExerciseCatalog();
  const exercises = await Exercise.find(buildExerciseQuery(req.query))
    .sort({ muscleGroup: 1, name: 1 })
    .select('-__v -createdAt -updatedAt')
    .lean();
  res.json({ exercises, filters: { muscleGroups: MUSCLE_GROUPS, equipment: EQUIPMENT, difficulty: DIFFICULTY } });
});
