import express from 'express';
import { protect, identifyUser } from '../middleware/authMiddleware.js';
import { aiChatLimiter } from '../middleware/rateLimits.js';
import { saveHistory, getHistory, clearHistory } from '../controllers/chatController.js';
import { chatWithCoach } from '../controllers/aiController.js';

const router = express.Router();

// POST /api/chat is the original address of the AI chat, kept for older clients.
router.post('/', aiChatLimiter, identifyUser, chatWithCoach);

router.post('/history', protect, saveHistory);
router.get('/history', protect, getHistory);
router.delete('/history', protect, clearHistory);

export default router;
