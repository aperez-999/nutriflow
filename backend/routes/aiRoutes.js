import express from 'express';
import { identifyUser } from '../middleware/authMiddleware.js';
import { aiBurstLimiter, dailyAllowance } from '../middleware/rateLimits.js';
import { chatWithCoach } from '../controllers/aiController.js';

const router = express.Router();

router.post('/chat', aiBurstLimiter, identifyUser, dailyAllowance('coach'), chatWithCoach);

export default router;
