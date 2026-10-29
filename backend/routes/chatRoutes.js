import express from 'express';
import { protect, identifyUser } from '../middleware/authMiddleware.js';
import { aiBurstLimiter, dailyAllowance } from '../middleware/rateLimits.js';
import {
  saveHistory,
  getHistory,
  clearHistory,
  getConversations,
  saveConversation,
  deleteConversation,
} from '../controllers/chatController.js';
import { chatWithCoach } from '../controllers/aiController.js';

const router = express.Router();

// POST /api/chat is the original address of the AI chat, kept for older clients.
router.post('/', aiBurstLimiter, identifyUser, dailyAllowance('coach'), chatWithCoach);

router.get('/conversations', protect, getConversations);
router.put('/conversations/:clientId', protect, saveConversation);
router.delete('/conversations/:clientId', protect, deleteConversation);

// The single saved conversation used by older clients; new clients use /conversations.
router.post('/history', protect, saveHistory);
router.get('/history', protect, getHistory);
router.delete('/history', protect, clearHistory);

export default router;
