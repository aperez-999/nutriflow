import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
    getWorkouts, 
    createWorkout, 
    updateWorkout, 
    deleteWorkout 
} from '../controllers/workoutController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes
router.route('/')
    .get(getWorkouts)
    .post(createWorkout);

router.route('/:id')
    .put(updateWorkout)
    .delete(deleteWorkout);

export default router;