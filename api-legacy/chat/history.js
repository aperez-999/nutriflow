import ChatMessage from '../_models/ChatMessage.js';
import connectDB from '../_lib/db.js';
import { handleCors, protect } from '../_lib/middleware.js';

export default async function handler(req, res) {
  console.log('[API] chat/history hit', { method: req.method, url: req.url });
  // CORS
  handleCors(req, res, () => {});
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectDB();

    // Protect routes - all history endpoints require auth
    await new Promise((resolve, reject) => {
      protect(req, res, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const method = String(req.method || '').toUpperCase();

    if (method === 'POST') {
      const { messages } = req.body || {};
      if (!Array.isArray(messages)) {
        return res.status(400).json({ message: 'messages must be an array' });
      }

      await ChatMessage.deleteMany({ user: userId });
      if (messages.length > 0) {
        const docs = messages
          .filter((m) => m && typeof m.content === 'string' && m.content.trim().length > 0)
          .map((m) => ({
            user: userId,
            role: m.type === 'user' ? 'user' : 'assistant',
            content: m.content,
          }));
        if (docs.length > 0) await ChatMessage.insertMany(docs);
      }
      return res.json({ success: true });
    }

    if (method === 'GET') {
      const limit = Math.min(parseInt(req.query.limit || '40', 10), 100);
      const messages = await ChatMessage.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(limit);
      return res.json(messages.reverse());
    }

    if (method === 'DELETE') {
      await ChatMessage.deleteMany({ user: userId });
      return res.json({ success: true });
    }

    return res.status(405).json({ message: `Method ${method} not allowed` });
  } catch (error) {
    console.error('Chat history API error:', error);
    if (error.message === 'Not authorized' || error.message === 'Not authorized, no token') {
      return res.status(401).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Server error' });
  }
}
