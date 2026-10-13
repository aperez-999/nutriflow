import express from 'express';
import { identifyUser } from '../middleware/authMiddleware.js';
import { aiChatLimiter } from '../middleware/rateLimits.js';
import { chatWithCoach } from '../controllers/aiController.js';

const router = express.Router();

router.post('/chat', aiChatLimiter, identifyUser, chatWithCoach);

export default router;
