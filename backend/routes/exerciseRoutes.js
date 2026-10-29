import express from 'express';
import { searchWorkouts } from '../controllers/workoutController.js';
import { foodLookupLimiter } from '../middleware/rateLimits.js';

const router = express.Router();

router.get('/search', foodLookupLimiter, searchWorkouts);

export default router;