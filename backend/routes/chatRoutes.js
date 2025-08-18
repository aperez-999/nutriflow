import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import ChatMessage from '../models/ChatMessage.js';

const router = express.Router();

// Save messages (bulk)
router.post('/history', protect, async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) return res.status(400).json({ message: 'messages must be an array' });

    const userId = req.user._id;
    // Replace strategy: clear existing history and insert the new one
    await ChatMessage.deleteMany({ user: userId });
    if (messages.length > 0) {
      const docs = messages.map(m => ({ user: userId, role: m.type === 'user' ? 'user' : 'assistant', content: m.content }));
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
    const limit = Math.min(parseInt(req.query.limit || '40', 10), 100);
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
