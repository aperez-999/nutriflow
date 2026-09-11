import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import ChatMessage from '../models/ChatMessage.js';

const router = express.Router();
const MAX_HISTORY_MESSAGES = 100;
const MAX_MESSAGE_LENGTH = 4000;

function isValidChatMessage(message) {
  if (!message || typeof message !== 'object') {
    return false;
  }

  const content = typeof message.content === 'string' ? message.content.trim() : '';
  if (!content || content.length > MAX_MESSAGE_LENGTH) {
    return false;
  }

  const type = message.type === 'user' || message.type === 'assistant' ? message.type : null;
  const role = message.role === 'user' || message.role === 'assistant' ? message.role : null;
  return Boolean(type || role);
}

// Save messages (bulk)
router.post('/history', protect, async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length > MAX_HISTORY_MESSAGES) {
      return res.status(400).json({ message: 'messages must be an array with at most 100 entries' });
    }

    if (!messages.every(isValidChatMessage)) {
      return res.status(400).json({ message: 'messages contain invalid entries' });
    }

    const userId = req.user._id;
    // Replace strategy: clear existing history and insert the new one
    await ChatMessage.deleteMany({ user: userId });
    if (messages.length > 0) {
      const docs = messages.map((m) => ({
        user: userId,
        role: m.role === 'user' || m.type === 'user' ? 'user' : 'assistant',
        content: m.content.trim().slice(0, MAX_MESSAGE_LENGTH),
      }));
      await ChatMessage.insertMany(docs);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Save history error:', err);
    res.status(500).json({ message: 'Failed to save history' });
  }
});

// Get recent messages
router.get('/history', protect, async (req, res) => {
  try {
    const parsedLimit = parseInt(req.query.limit || '40', 10);
    const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), MAX_HISTORY_MESSAGES) : 40;
    const messages = await ChatMessage.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(limit);
    res.json(messages.reverse());
  } catch (err) {
    console.error('Get history error:', err);
    res.status(500).json({ message: 'Failed to load history' });
  }
});

// Clear history
router.delete('/history', protect, async (req, res) => {
  try {
    await ChatMessage.deleteMany({ user: req.user._id });
    res.json({ success: true });
  } catch (err) {
    console.error('Clear history error:', err);
    res.status(500).json({ message: 'Failed to clear history' });
  }
});

export default router;
