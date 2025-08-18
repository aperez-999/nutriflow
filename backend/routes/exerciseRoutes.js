import express from 'express';
import { searchWorkouts } from '../controllers/workoutController.js';

const router = express.Router();

router.get('/search', searchWorkouts);

export default router;