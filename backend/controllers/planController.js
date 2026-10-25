import asyncHandler from 'express-async-handler';
import Plan from '../models/Plan.js';

const MAX_PLANS = 60;
const MAX_ITEMS = 30;
const MAX_PLAN_BYTES = 60 * 1024;

/** The shape the frontend keeps: training plans carry `workouts`, meal plans `meals`. */
export const toClientPlan = (plan) => {
  const base = { id: plan.clientId, title: plan.title, generatedAt: new Date(plan.generatedAt).toISOString() };
  return plan.kind === 'meal'
    ? { ...base, calories: plan.calories ?? null, meals: plan.items }
    : { ...base, workouts: plan.items };
};

/** Validates a saved plan from the client; returns an error message or null. */
export const validatePlanBody = ({ kind, title, items } = {}) => {
  if (!['training', 'meal'].includes(kind)) return 'kind must be "training" or "meal"';
  if (typeof title !== 'string' || !title.trim()) return 'A plan needs a title';
  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_ITEMS) return `A plan needs 1 to ${MAX_ITEMS} items`;
  if (!items.every((item) => item && typeof item === 'object' && !Array.isArray(item))) return 'Plan items must be objects';
  if (Buffer.byteLength(JSON.stringify(items)) > MAX_PLAN_BYTES) return 'This plan is too large to save';
  return null;
};

// @desc    Saved plans, newest first, split by kind
// @route   GET /api/plans
// @access  Private
export const getPlans = asyncHandler(async (req, res) => {
  const plans = await Plan.find({ user: req.user._id }).sort({ generatedAt: -1 }).limit(MAX_PLANS).lean();
  res.json({
    plans: plans.filter((plan) => plan.kind === 'training').map(toClientPlan),
    mealPlans: plans.filter((plan) => plan.kind === 'meal').map(toClientPlan),
  });
});

// @desc    Create or replace one saved plan
// @route   PUT /api/plans/:clientId
// @access  Private
export const savePlan = asyncHandler(async (req, res) => {
  const message = validatePlanBody(req.body);
  if (message) {
    res.status(400);
    throw new Error(message);
  }

  const { kind, title, calories, generatedAt, items } = req.body;
  const plan = await Plan.findOneAndUpdate(
    { user: req.user._id, clientId: req.params.clientId },
    {
      kind,
      title: title.trim().slice(0, 120),
      calories: Number.isFinite(Number(calories)) && calories !== null ? Number(calories) : null,
      generatedAt: Number.isNaN(Date.parse(generatedAt)) ? new Date() : new Date(generatedAt),
      items,
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  ).lean();

  res.json(toClientPlan(plan));
});

// @desc    Delete one saved plan
// @route   DELETE /api/plans/:clientId
// @access  Private
export const deletePlan = asyncHandler(async (req, res) => {
  await Plan.deleteOne({ user: req.user._id, clientId: req.params.clientId });
  res.json({ success: true });
});
