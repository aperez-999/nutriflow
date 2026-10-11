import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getExercises } from '../controllers/exerciseLibraryController.js';

const router = express.Router();

router.get('/', protect, getExercises);

export default router;
