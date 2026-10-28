import asyncHandler from 'express-async-handler';
import CheckIn from '../models/CheckIn.js';

const MAX_DAYS = 120;

// @desc    Get recent check-ins, newest first
// @route   GET /api/checkins?limit=30
// @access  Private
export const getCheckIns = asyncHandler(async (req, res) => {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 30, 1), MAX_DAYS);
    const checkIns = await CheckIn.find({ user: req.user._id })
        .sort({ dayKey: -1 })
        .limit(limit)
        .lean();
    res.json(checkIns);
});

// @desc    Create or replace the check-in for one day
// @route   PUT /api/checkins/:dayKey
// @access  Private
export const upsertCheckIn = asyncHandler(async (req, res) => {
    const { sleepHours, energy, soreness, waterCups = 0 } = req.body;
    const update = {
        sleepHours: Number(sleepHours),
        energy: Number(energy),
        soreness: Number(soreness),
        waterCups: Number(waterCups),
    };
    // Heart signals are only sent by a client that measured them; leaving them out keeps
    // what was measured earlier in the day.
    for (const field of ['hrvChange', 'restingHrChange']) {
        if (req.body[field] !== undefined) update[field] = Number(req.body[field]);
    }
    const checkIn = await CheckIn.findOneAndUpdate(
        { user: req.user._id, dayKey: req.params.dayKey },
        update,
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json(checkIn);
});
