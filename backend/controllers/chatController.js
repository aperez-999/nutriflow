import ChatMessage from '../models/ChatMessage.js';

const MAX_HISTORY_MESSAGES = 100;
const MAX_MESSAGE_LENGTH = 4000;

function sanitizeChatMessage(message) {
  if (!message || typeof message !== 'object') {
    return null;
  }

  const content = typeof message.content === 'string' ? message.content.trim() : '';
  if (!content) {
    return null;
  }

  const role = message.role === 'user' || message.role === 'assistant'
    ? message.role
    : message.type === 'user' || message.type === 'assistant'
      ? message.type
      : null;

  if (!role) {
    return null;
  }

  return {
    role,
    content: content.slice(0, MAX_MESSAGE_LENGTH),
  };
}

function sanitizeChatHistory(messages) {
  if (!Array.isArray(messages)) {
    return null;
  }

  return messages
    .map(sanitizeChatMessage)
    .filter(Boolean)
    .slice(0, MAX_HISTORY_MESSAGES);
}

/** POST /api/chat/history: replaces the saved conversation. */
export const saveHistory = async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length > MAX_HISTORY_MESSAGES) {
      return res.status(400).json({ message: 'messages must be an array with at most 100 entries' });
    }

    const sanitizedMessages = sanitizeChatHistory(messages);
    const invalidCount = messages.length - sanitizedMessages.length;

    const userId = req.user._id;
    // Replace strategy: clear existing history and insert the new one
    await ChatMessage.deleteMany({ user: userId });
    if (sanitizedMessages.length > 0) {
      const docs = sanitizedMessages.map((m) => ({
        user: userId,
        role: m.role,
        content: m.content,
      }));
      await ChatMessage.insertMany(docs);
    }

    if (invalidCount > 0) {
      console.warn(`Ignored ${invalidCount} invalid chat history entr${invalidCount === 1 ? 'y' : 'ies'} for user ${userId}`);
    }

    res.json({
      success: true,
      saved: sanitizedMessages.length,
      ignored: invalidCount,
    });
  } catch (err) {
    console.error('Save history error:', err);
    res.status(500).json({ message: 'Failed to save history' });
  }
};

/** GET /api/chat/history?limit=40: the latest messages, oldest first. */
export const getHistory = async (req, res) => {
  try {
    const parsedLimit = parseInt(req.query.limit || '40', 10);
    const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), MAX_HISTORY_MESSAGES) : 40;
    // insertMany gives a saved conversation one shared createdAt; _id keeps insert order on ties.
    const messages = await ChatMessage.find({ user: req.user._id }).sort({ createdAt: -1, _id: -1 }).limit(limit);
    res.json(messages.reverse());
  } catch (err) {
    console.error('Get history error:', err);
    res.status(500).json({ message: 'Failed to load history' });
  }
};

/** DELETE /api/chat/history */
export const clearHistory = async (req, res) => {
  try {
    await ChatMessage.deleteMany({ user: req.user._id });
    res.json({ success: true });
  } catch (err) {
    console.error('Clear history error:', err);
    res.status(500).json({ message: 'Failed to clear history' });
  }
};
