import asyncHandler from 'express-async-handler';
import WeighIn from '../models/WeighIn.js';
import Diet from '../models/Diet.js';
import { dayKeyIn, safeTimeZone } from '../ai/tools/get_coach_context.js';
import { energyBalance, WINDOW_DAYS } from '../utils/energyBalance.js';

const MAX_DAYS = 365;

// @desc    Recent weigh-ins, newest first
// @route   GET /api/weights?days=90
export const getWeighIns = asyncHandler(async (req, res) => {
  const days = Math.min(Math.max(parseInt(req.query.days, 10) || 90, 1), MAX_DAYS);
  const weighIns = await WeighIn.find({ user: req.user._id }).sort({ dayKey: -1 }).limit(days).select('dayKey kg source').lean();
  res.json(weighIns);
});

// @desc    Create or replace the weigh-in for one day
// @route   PUT /api/weights/:dayKey
export const saveWeighIn = asyncHandler(async (req, res) => {
  const weighIn = await WeighIn.findOneAndUpdate(
    { user: req.user._id, dayKey: req.params.dayKey },
    { kg: Math.round(Number(req.body.kg) * 10) / 10, source: req.body.source === 'health' ? 'health' : 'manual' },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  ).select('dayKey kg source').lean();
  res.json(weighIn);
});

// @desc    Remove one day's weigh-in
// @route   DELETE /api/weights/:dayKey
export const deleteWeighIn = asyncHandler(async (req, res) => {
  await WeighIn.deleteOne({ user: req.user._id, dayKey: req.params.dayKey });
  res.json({ message: 'Weight removed' });
});

// @desc    The weekly check-in: weight trend, what you burn, and the calories for your goal
// @route   GET /api/weights/energy?timeZone=America/New_York
export const getEnergy = asyncHandler(async (req, res) => {
  const timeZone = safeTimeZone(req.query.timeZone);
  const since = new Date(Date.now() - (WINDOW_DAYS + 1) * 86400000);
  const [weighIns, diets] = await Promise.all([
    WeighIn.find({ user: req.user._id, dayKey: { $gte: since.toISOString().slice(0, 10) } }).select('dayKey kg').lean(),
    Diet.find({ user: req.user._id, date: { $gte: since } }).select('date calories').lean(),
  ]);
  res.json(energyBalance({
    weighIns,
    diets,
    today: dayKeyIn(new Date(), timeZone),
    timeZone,
    goal: req.user.about?.goal,
    currentTarget: req.user.goals?.dailyCalories,
  }));
});
